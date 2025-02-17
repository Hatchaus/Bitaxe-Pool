/**
 * BitaXe Mining Pool Configuration Example
 * Rename this file to config.js and modify as needed
 */

module.exports = {
    // Pool Configuration
    pool: {
        name: 'BitaXe Mining Pool',
        address: 'YOUR_BTC_ADDRESS_HERE',
        donationAddress: 'bc1qy7qfcz9kt2lj3m72my89wp4j52cc9w79cys9hx',
        fee: 1.0, // Pool fee percentage
        
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
            refreshInterval: 5000, // Stats refresh interval in ms
            rateLimitRequests: 100,
            rateLimitWindowMs: 900000 // 15 minutes
        }
    },

    // Bitcoin Core Configuration
    bitcoin: {
        host: 'localhost',
        port: 8332,
        username: 'your_rpc_username',
        password: 'your_rpc_password',
        
        // Bitcoin Core Options
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
        },
        console: {
            enabled: true,
            colorize: true
        }
    },

    // Performance Configuration
    performance: {
        // Node.js options
        maxMemory: 4096,        // Maximum memory in MB
        gcInterval: 300000,     // Garbage collection interval
        
        // Connection limits
        maxConnections: 1000,
        maxMinersPerIP: 10,
        
        // Share processing
        shareProcessingThreads: 2,
        batchShareProcessing: true,
        batchSize: 100
    },

    // Security Configuration
    security: {
        // IP restrictions
        allowedIPs: ['127.0.0.1'],
        allowLocal: true,
        
        // SSL/TLS (optional)
        ssl: {
            enabled: false,
            key: '/path/to/privkey.pem',
            cert: '/path/to/fullchain.pem'
        },
        
        // Authentication for admin panel
        adminAuth: {
            enabled: false,
            username: 'admin',
            password: 'change_this_password'
        }
    },

    // Email Notifications (optional)
    notifications: {
        email: {
            enabled: false,
            smtp: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: true,
                auth: {
                    user: 'your-email@gmail.com',
                    pass: 'your-app-password'
                }
            },
            alerts: {
                blockFound: true,
                minerOffline: true,
                highTemperature: true,
                lowHashrate: true
            },
            recipients: ['your-email@example.com']
        }
    },

    // Advanced Options
    advanced: {
        // Development options
        debug: false,
        testnet: false,
        
        // Custom share validation
        customShareValidation: false,
        validationScript: './custom/validate.js',
        
        // Experimental features
        experimental: {
            enabled: false,
            features: []
        }
    }
};
