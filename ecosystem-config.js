module.exports = {
    apps: [{
        // Main Pool Application
        name: 'bitaxe-pool',
        script: 'server.js',
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        autorestart: true,
        max_memory_restart: '2G',

        // Environment Variables
        env: {
            NODE_ENV: 'production',
            PORT: 6969,
            STRATUM_PORT: 3333
        },

        // Production Environment
        env_production: {
            NODE_ENV: 'production',
            PORT: 6969,
            STRATUM_PORT: 3333
        },

        // Development Environment
        env_development: {
            NODE_ENV: 'development',
            PORT: 6969,
            STRATUM_PORT: 3333,
            DEBUG: 'true'
        },

        // Process Management
        min_uptime: '60s',
        max_restarts: 10,
        restart_delay: 4000,

        // Logging
        error_file: 'logs/pool-error.log',
        out_file: 'logs/pool-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true,

        // Resource Management
        node_args: '--max-old-space-size=4096',
        
        // Monitoring
        monitoring: true,
        status_interval: 30,
        kill_timeout: 3000,

        // Health Check
        exp_backoff_restart_delay: 100,
        vizion: true,

        // Custom Metrics
        metrics: {
            http: true,
            custom_probes: true
        }
    },
    {
        // BitaXe Stats Monitor
        name: 'bitaxe-monitor',
        script: './scripts/monitor.js',
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        autorestart: true,

        env: {
            NODE_ENV: 'production'
        },

        error_file: 'logs/monitor-error.log',
        out_file: 'logs/monitor-out.log',
        merge_logs: true
    },
    {
        // System Health Check
        name: 'system-health',
        script: './scripts/check_system.js',
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        cron_restart: '*/30 * * * *',
        autorestart: false,

        env: {
            NODE_ENV: 'production'
        },

        error_file: 'logs/health-error.log',
        out_file: 'logs/health-out.log',
        merge_logs: true
    
    }
};
