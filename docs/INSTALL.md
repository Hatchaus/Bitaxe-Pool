# Installation Guide for BitaXe Mining Pool

## Requirements
- Node.js v18 or higher
- Bitcoin Core
- One or more BitaXe miners
- Ubuntu Server (recommended) or Windows Server

## Standard Installation

### 1. Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bitcoin Core
sudo apt install bitcoin bitcoind

# Create bitcoin directory
mkdir ~/.bitcoin

# Create config file
nano ~/.bitcoin/bitcoin.conf

server=1
daemon=1
txindex=1
rpcuser=your_username
rpcpassword=your_secure_password

# Clone repository
git clone https://github.com/Hatchaus/Bitaxe-Pool.git
cd Bitaxe-Pool

# Install dependencies
npm install

# Configure pool
cp config/config.example.js config/config.js
cp .env.example .env

nano config/config.js

# Start Bitcoin Core
bitcoind -daemon

# Start pool
npm start


Docker Installation
1. Install Docker and Docker Compose

Docker Installation
1. Install Docker and Docker Compose

# Clone repository
git clone https://github.com/Hatchaus/Bitaxe-Pool.git
cd Bitaxe-Pool

# Configure environment
cp .env.example .env
nano .env

# Start services
docker-compose up -d

BitaXe Configuration
Configure each BitaXe to connect to your pool:

Access BitaXe web interface
Set pool configuration:

URL: stratum+tcp://your-server-ip:3333
Username: bitX.{IP_ADDRESS} (e.g., bit1.192.168.1.100)
Password: x



Verification

Access dashboard: http://your-server-ip:6969
Check logs: tail -f logs/pool.log
Monitor Bitcoin sync: bitcoin-cli getblockchaininfo

Support Development
BTC: bc1qy7qfcz9kt2lj3m72my89wp4j52cc9w79cys9hx

2. Create `docs/API.md`:
```markdown
# API Documentation

## Endpoints

### Get Pool Statistics
```http
GET /api/pool/stats

Returns pool statistics including:

Total hashrate
Active miners
Share counts
Bitcoin node status

Example Response:

{
  "miners": 2,
  "totalHashrate": 3500000000,
  "validShares": 156,
  "btcSync": 99.98,
  "btcBlocks": 824596,
  "btcHeaders": 824596,
  "minerStats": [
    {
      "workerId": "bit1.192.168.1.100",
      "hashRate": 1800000000,
      "shares": 78,
      "temperature": 55,
      "frequency": 920
    }
  ]
}


GET /api/miners/:minerId

Returns detailed statistics for a specific miner.
Example Response:

{
  "workerId": "bit1.192.168.1.100",
  "hashRate": 1800000000,
  "shares": {
    "valid": 78,
    "rejected": 0
  },
  "temperature": 55,
  "vrTemp": 75,
  "frequency": 920,
  "fanSpeed": 56,
  "fanRPM": 4157
}

GET /api/node/status

Returns Bitcoin node synchronization status.
Example Response:

{
  "blocks": 824596,
  "headers": 824596,
  "verificationProgress": 0.9998,
  "networkDifficulty": 72496892343.58
}

3. Create `docs/CONFIGURATION.md`:
```markdown
# Configuration Guide

## Environment Variables
Create `.env` file from `.env.example`:

```ini
# Bitcoin Core
BTC_RPC_USER=your_username
BTC_RPC_PASS=your_secure_password
BTC_RPC_HOST=localhost
BTC_RPC_PORT=8332

# Pool Configuration
POOL_NAME=BitaXe Pool
REWARD_ADDRESS=your_btc_address


Pool Configuration
Edit config/config.js:
Basic Settings
javascriptCopymodule.exports = {
  pool: {
    name: 'BitaXe Pool',
    address: 'YOUR_BTC_ADDRESS',
    stratum: {
      port: 3333,
      diff: 8192
    },
    web: {
      port: 6969
    }
  }
}
Advanced Settings
javascriptCopymodule.exports = {
  bitaxe: {
    stats: {
      pollInterval: 5000,
      timeout: 3000,
      retries: 3
    },
    alerts: {
      maxTemp: 85,
      minFanSpeed: 20
    }
  },
  logging: {
    level: 'info',
    file: {
      enabled: true,
      directory: './logs'
    }
  }
}
Bitcoin Core Configuration
Example bitcoin.conf:
iniCopy# Network
server=1
daemon=1
txindex=1

# RPC
rpcuser=your_username
rpcpassword=your_secure_password
rpcallowip=127.0.0.1

# Performance
dbcache=4096
maxmempool=100
maxconnections=25