const fetch = require('node-fetch');
const EventEmitter = require('events');

class BitaXeHandler extends EventEmitter {
    constructor(options = {}) {
        super();
        this.timeout = options.timeout || 5000;
        this.retries = options.retries || 3;
        this.pollInterval = options.pollInterval || 5000;
        this.miners = new Map();
        this.lastStats = new Map();
    }

    /**
     * Add a BitaXe miner to monitor
     * @param {string} ip - IP address of the BitaXe
     * @param {string} workerId - Worker identifier
     */
    addMiner(ip, workerId) {
        this.miners.set(workerId, {
            ip,
            workerId,
            lastSeen: Date.now(),
            failureCount: 0
        });
        this.startPolling(workerId);
    }

    /**
     * Remove a BitaXe from monitoring
     * @param {string} workerId - Worker identifier
     */
    removeMiner(workerId) {
        this.miners.delete(workerId);
        this.lastStats.delete(workerId);
        this.emit('minerRemoved', workerId);
    }

    /**
     * Start polling a specific miner
     * @private
     * @param {string} workerId - Worker identifier
     */
    startPolling(workerId) {
        const poll = async () => {
            const miner = this.miners.get(workerId);
            if (!miner) return;

            try {
                const stats = await this.fetchMinerStats(miner.ip);
                miner.failureCount = 0;
                miner.lastSeen = Date.now();
                this.lastStats.set(workerId, stats);
                this.emit('statsUpdate', workerId, stats);
            } catch (error) {
                miner.failureCount++;
                this.emit('error', { workerId, error: error.message });
                
                if (miner.failureCount > this.retries) {
                    this.emit('minerTimeout', workerId);
                }
            }

            // Schedule next poll if miner still exists
            if (this.miners.has(workerId)) {
                setTimeout(() => poll(), this.pollInterval);
            }
        };

        poll();
    }

    /**
     * Fetch stats from a BitaXe miner
     * @private
     * @param {string} ip - IP address of the BitaXe
     * @returns {Promise<Object>} - Parsed stats from the miner
     */
    async fetchMinerStats(ip) {
        const response = await fetch(`http://${ip}/api/system/info`, {
            timeout: this.timeout
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
            coreVoltageActual: parseInt(data.coreVoltageActual) || 0,
            timestamp: Date.now()
        };
    }

    /**
     * Get latest stats for a miner
     * @param {string} workerId - Worker identifier
     * @returns {Object|null} - Latest stats or null if not available
     */
    getLatestStats(workerId) {
        return this.lastStats.get(workerId) || null;
    }

    /**
     * Get all current miners and their stats
     * @returns {Array} - Array of miner stats
     */
    getAllMinersStats() {
        return Array.from(this.miners.entries()).map(([workerId, miner]) => ({
            workerId,
            ip: miner.ip,
            lastSeen: miner.lastSeen,
            stats: this.getLatestStats(workerId),
            isOnline: miner.failureCount <= this.retries
        }));
    }

    /**
     * Check if a miner is currently active
     * @param {string} workerId - Worker identifier
     * @returns {boolean} - True if miner is active
     */
    isMinerActive(workerId) {
        const miner = this.miners.get(workerId);
        if (!miner) return false;
        return miner.failureCount <= this.retries;
    }

    /**
     * Get health status for a miner
     * @param {string} workerId - Worker identifier
     * @returns {Object} - Health status object
     */
    getMinerHealth(workerId) {
        const stats = this.getLatestStats(workerId);
        if (!stats) return { status: 'unknown' };

        const health = {
            status: 'healthy',
            issues: []
        };

        // Check temperature
        if (stats.temp > 85) {
            health.issues.push('High chip temperature');
            health.status = 'warning';
        }
        if (stats.vrTemp > 85) {
            health.issues.push('High VR temperature');
            health.status = 'warning';
        }

        // Check fan
        if (stats.fanrpm < 2000 && stats.temp > 70) {
            health.issues.push('Low fan speed with high temperature');
            health.status = 'warning';
        }

        // Check hashrate
        if (stats.hashRate < 100) {
            health.issues.push('Low hashrate');
            health.status = 'warning';
        }

        // Check power
        if (stats.power < 10) {
            health.issues.push('Unusually low power consumption');
            health.status = 'warning';
        }

        return health;
    }
}

module.exports = BitaXeHandler;