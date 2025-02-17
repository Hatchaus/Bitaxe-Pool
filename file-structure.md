```
bitaxe-pool/
├── config/
│   ├── config.example.js     # Example configuration file
│   ├── config.production.js  # Production configuration
│   └── config.development.js # Development configuration
│
├── public/                   # Web interface files
│   ├── css/
│   │   └── style.css        # Dashboard styles
│   ├── js/
│   │   └── dashboard.js     # Dashboard JavaScript
│   ├── img/
│   │   └── favicon.ico      # Site favicon
│   └── index.html           # Main dashboard page
│
├── src/                     # Source code
│   ├── lib/
│   │   ├── bitcoin.js      # Bitcoin Core interface
│   │   ├── stratum.js      # Stratum protocol implementation
│   │   └── utils.js        # Utility functions
│   │
│   ├── services/
│   │   ├── pool.js         # Pool management
│   │   ├── stats.js        # Statistics tracking
│   │   └── bitaxe.js       # BitaXe API interface
│   │
│   └── routes/
│       └── api.js          # API endpoints
│
├── scripts/
│   ├── install.sh          # Installation script
│   ├── update.sh           # Update script
│   ├── check_system.sh     # System check script
│   └── monitor.sh          # Monitoring script
│
├── logs/                    # Log files directory
│   ├── pool.log            # Pool operation logs
│   ├── stratum.log         # Stratum protocol logs
│   └── error.log           # Error logs
│
├── docs/                    # Documentation
│   ├── API.md              # API documentation
│   ├── INSTALL.md          # Installation guide
│   └── CONFIGURATION.md    # Configuration guide
│
├── tests/                   # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
│
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── LICENSE                 # License file
├── package.json            # Node.js package file
├── package-lock.json       # Package lock file
├── README.md              # Project documentation
└── server.js              # Main application file
```

