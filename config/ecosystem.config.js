module.exports = {
    apps: [{
        name: 'bitaxe-pool',
        script: 'server.js',
        instances: 1,
        exec_mode: 'fork',
        watch: false,
        autorestart: true,
        max_memory_restart: '2G',

        env: {
            NODE_ENV: 'production',
            PORT: 6969,
            STRATUM_PORT: 3333
        },

        env_production: {
            NODE_ENV: 'production',
            PORT: 6969,
            STRATUM_PORT: 3333
        },

        error_file: 'logs/pool-error.log',
        out_file: 'logs/pool-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
        merge_logs: true
    }]
};