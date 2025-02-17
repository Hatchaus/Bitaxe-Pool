module.exports = {
    // Pool Configuration
    pool: {
        name: 'BitaXe Mining Pool',
        address: 'YOUR_BTC_ADDRESS_HERE',
        donationAddress: 'bc1qy7qfcz9kt2lj3m72my89wp4j52cc9w79cys9hx',
        
        // Server ports
        stratum: {
            port: 3333,
            diff: 8192,         // Starting difficulty
            vardiff: {
                enabled: true,
                minDiff: 256,
                maxDiff: 65536,
                targetTime: 15,  // Target time per share in seconds
                retargetTime: 60 // How often to adjust difficulty
            }
        },
        
        // Web interface
        web: {
            port: 6969,
            refreshInterval: 5000 // Stats refresh interval in ms
        }
    },

    // Bitcoin Core Configuration
    bitcoin: {
        host: 'localhost',
        port: 8332,
        username: 'your_rpc_username',
        password: 'your_rpc_password',
        
        options: {
            timeout: 30000,
            maxRetries: 3,
            pollInterval: 5000  // Block template update interval
        }
    },

    // BitaXe Configuration
    bitaxe: {
        stats: {
            pollInterval: 5000,  // How often to poll BitaXe stats
            timeout: 3000,       // API request timeout
            retries: 3           // Number of retries before marking offline
        },
        alerts: {
            maxTemp: 85,         // Maximum temperature before alert
            minFanSpeed: 20,     // Minimum fan speed percentage
            minHashrate: 100     // Minimum hashrate in MH/s
        }
    },

    // Logging Configuration
    logging: {
        level: 'info',          // debug, info, warn, error
        file: {
            enabled: true,
            directory: './logs',
            maxSize: '10m',
            maxFiles: 5
        }
    }
};