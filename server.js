// BitaXe Mining Pool Server
const express = require('express');
const net = require('net');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');

// Initialize Express
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Configuration - Change these values
const MINING_REWARD_ADDRESS = 'YOUR_BTC_ADDRESS_HERE'; // Your BTC address for block rewards
const DONATION_ADDRESS = 'bc1qy7qfcz9kt2lj3m72my89wp4j52cc9w79cys9hx'; // Original developer donation address
const STRATUM_PORT = 3333; // Port for miners to connect
const WEB_PORT = 6969;     // Port for web dashboard

// Mining pool stats
let poolStats = {
    miners: 0,
    totalHashrate: 0,
    validShares: 0,
    currentHeight: 0,
    btcSync: 0,
    btcBlocks: 0,
    btcHeaders: 0,
    rewardAddress: MINING_REWARD_ADDRESS,
    minerStats: [],
    networkDifficulty: 0
};

// Miner tracking
const miners = new Map();

/**
 * Fetches stats from a BitaXe miner's API
 * @param {string} ip - IP address of the BitaXe
 * @returns {Promise<Object>} - BitaXe stats
 */
async function fetchBitaxeStats(ip) {
    try {
        console.log(`Fetching stats from BitaXe at ${ip}...`);
        const response = await fetch(`http://${ip}/api/system/info`, {
            timeout: 3000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            power: parseFloat(data.power) || 0,
            voltage: parseFloat(data.voltage) || 0,
            current: parseFloat(data.current) || 0,
            temp: parseFloat(data.temp) || 0,
            vrTemp: parseFloat(data.vrTemp) || 0,
            hashRate: parseFloat(data.hashRate) || 0,
            bestDiff: data.bestDiff || "0",
            bestSessionDiff: data.bestSessionDiff || "0",
            stratumDiff: parseInt(data.stratumDiff) || 8192,
            frequency: parseInt(data.frequency) || 0,
            sharesAccepted: parseInt(data.sharesAccepted) || 0,
            sharesRejected: parseInt(data.sharesRejected) || 0,
            fanspeed: parseInt(data.fanspeed) || 0,
            fanrpm: parseInt(data.fanrpm) || 0,
            coreVoltage: parseInt(data.coreVoltage) || 0,
            coreVoltageActual: parseInt(data.coreVoltageActual) || 0
        };
    } catch (error) {
        console.error(`Error fetching BitaXe stats for IP ${ip}:`, error.message);
        return null;
    }
}

/**
 * Updates stats for a single miner
 * @param {Object} miner - Miner object from the miners Map
 */
async function updateMinerStats(miner) {
    if (!miner.ip) {
        console.log(`No IP address for miner ${miner.workerId}`);
        return;
    }

    const stats = await fetchBitaxeStats(miner.ip);
    if (stats) {
        miner.bitaxeStats = stats;
        console.log(`Updated stats for ${miner.workerId}: ${stats.hashRate} MH/s`);
    }
}

/**
 * Updates Bitcoin Core node status
 */
async function updateBitcoinStatus() {
    try {
        exec('bitcoin-cli getblockchaininfo', (error, stdout, stderr) => {
            if (error) {
                console.error('Error getting Bitcoin status:', error);
                poolStats.btcSync = 0;
                return;
            }
            
            try {
                const info = JSON.parse(stdout);
                poolStats.btcSync = (info.verificationprogress * 100).toFixed(2);
                poolStats.btcBlocks = info.blocks;
                poolStats.btcHeaders = info.headers;
                poolStats.networkDifficulty = info.difficulty;
            } catch (parseError) {
                console.error('Error parsing Bitcoin status:', parseError);
            }
        });
    } catch (error) {
        console.error('Failed to update Bitcoin status:', error);
    }
}

// API endpoints
app.get('/api/pool/stats', async (req, res) => {
    const updatePromises = Array.from(miners.values()).map(updateMinerStats);
    await Promise.all(updatePromises);

    const minerStatsList = Array.from(miners.values()).map(miner => ({
        workerId: miner.workerId,
        hashrates: miner.hashrates,
        shares: {
            valid: miner.validShares,
            rejected: miner.rejectedShares,
            lastSubmitted: miner.lastShare
        },
        bitaxeStats: miner.bitaxeStats
    }));
    
    const totalMHs = minerStatsList.reduce((sum, miner) => sum + (miner.bitaxeStats.hashRate || 0), 0);
    poolStats.totalHashrate = totalMHs * 1e6;
    poolStats.minerStats = minerStatsList;
    poolStats.miners = miners.size;
    
    res.json(poolStats);
});

// Stratum protocol handlers
function handleSubscribe(socket, message) {
    const response = {
        id: message.id,
        result: [
            [["mining.set_difficulty", "1"], ["mining.notify", "1"]],
            "08000002",
            4
        ],
        error: null
    };
    socket.write(JSON.stringify(response) + '\n');
    sendMiningNotify(socket);
}

function handleAuthorize(socket, message) {
    const [username] = message.params;
    socket.workerId = username;

    // Extract IP from username (format: bitX.192.168.1.100)
    const ipMatch = username.split('.').slice(-4).join('.');
    const minerIP = ipMatch.match(/\d+\.\d+\.\d+\.\d+/) ? ipMatch : null;
    
    console.log(`New miner ${username} with IP ${minerIP}`);

    if (!miners.has(username)) {
        const miner = {
            workerId: username,
            ip: minerIP,
            shares: [],
            validShares: 0,
            rejectedShares: 0,
            lastShare: Date.now(),
            hashrates: {
                current: 0,
                tenMin: 0,
                oneHour: 0,
                twentyFourHour: 0
            },
            bitaxeStats: {
                power: 0,
                voltage: 0,
                current: 0,
                temp: 0,
                vrTemp: 0,
                hashRate: 0,
                bestDiff: "0",
                bestSessionDiff: "0",
                stratumDiff: 8192,
                frequency: 0,
                sharesAccepted: 0,
                sharesRejected: 0,
                fanspeed: 0,
                fanrpm: 0
            }
        };
        miners.set(username, miner);
        
        if (minerIP) {
            updateMinerStats(miner);
        }
    }

    const response = {
        id: message.id,
        result: true,
        error: null
    };
    socket.write(JSON.stringify(response) + '\n');
}

function sendMiningNotify(socket) {
    const notification = {
        id: null,
        method: "mining.notify",
        params: [
            Date.now().toString(16),
            "0000000000000000000000000000000000000000000000000000000000000000",
            "01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff",
            "ffffffff",
            [],
            "00000001",
            "1d00ffff",
            (Math.floor(Date.now() / 1000)).toString(16),
            true
        ]
    };
    socket.write(JSON.stringify(notification) + '\n');
}

// Start Stratum server
const stratumServer = net.createServer((socket) => {
    console.log('New BitaXe miner connected');
    
    socket.on('data', (data) => {
        try {
            const messages = data.toString().trim().split('\n');
            messages.forEach(messageStr => {
                if (!messageStr) return;
                
                const message = JSON.parse(messageStr);
                console.log('Received message:', message.method);
                
                switch(message.method) {
                    case 'mining.subscribe':
                        handleSubscribe(socket, message);
                        break;
                    case 'mining.authorize':
                        handleAuthorize(socket, message);
                        break;
                    case 'mining.submit':
                        const miner = miners.get(socket.workerId);
                        if (miner) {
                            miner.validShares++;
                            poolStats.validShares++;
                            miner.lastShare = Date.now();
                            
                            const response = {
                                id: message.id,
                                result: true,
                                error: null
                            };
                            socket.write(JSON.stringify(response) + '\n');
                        }
                        break;
                }
            });
        } catch (error) {
            console.error('Error processing miner data:', error);
        }
    });
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
    
    socket.on('close', () => {
        if (socket.workerId) {
            console.log('BitaXe miner disconnected:', socket.workerId);
            miners.delete(socket.workerId);
        }
    });
});

// Update Bitcoin Core status regularly
setInterval(updateBitcoinStatus, 5000);

// Start servers
app.listen(WEB_PORT, () => console.log(`Web interface running on port ${WEB_PORT}`));
stratumServer.listen(STRATUM_PORT, () => console.log(`Stratum server running on port ${STRATUM_PORT}`));

// Error handling
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));