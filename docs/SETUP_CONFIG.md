Copy# Setup and Configuration Guide for BitaXe Mining Pool

## Initial Setup

### Prerequisites
- Ubuntu Server 20.04+ or Windows Server
- Node.js v18+
- Bitcoin Core
- Git
- Basic command line knowledge

### Hardware Requirements
- CPU: 2+ cores recommended
- RAM: 4GB minimum, 8GB+ recommended
- Storage: 500GB+ for Bitcoin blockchain
- Network: Stable internet connection

## Step-by-Step Installation

### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y build-essential git curl software-properties-common
2. Install Node.js
bashCopy# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
3. Install Bitcoin Core
bashCopy# Install Bitcoin Core
sudo apt install bitcoin bitcoind

# Create bitcoin directory and config
mkdir ~/.bitcoin
nano ~/.bitcoin/bitcoin.conf
Add to bitcoin.conf:
iniCopyserver=1
daemon=1
txindex=1
rpcuser=your_username
rpcpassword=your_secure_password
4. Pool Installation
bashCopy# Clone repository
git clone https://github.com/Hatchaus/Bitaxe-Pool.git
cd Bitaxe-Pool

# Install dependencies
npm install

# Copy configuration files
cp config/config.example.js config/config.js
cp .env.example .env
Configuration
1. Basic Pool Configuration
Edit config.js:
javascriptCopymodule.exports = {
    pool: {
        name: 'Your Pool Name',
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
2. Environment Variables
Edit .env:
iniCopyBTC_RPC_USER=your_username
BTC_RPC_PASS=your_secure_password
BTC_RPC_HOST=localhost
BTC_RPC_PORT=8332
3. Firewall Configuration
bashCopy# Allow required ports
sudo ufw allow 3333/tcp
sudo ufw allow 6969/tcp
sudo ufw allow 8333/tcp
4. Service Setup
Create service file:
bashCopysudo nano /etc/systemd/system/btcpool.service
Add content:
iniCopy[Unit]
Description=BitaXe Mining Pool
After=network.target bitcoind.service

[Service]
Type=simple
User=your_username
WorkingDirectory=/path/to/Bitaxe-Pool
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
Enable and start services:
bashCopysudo systemctl daemon-reload
sudo systemctl enable btcpool
sudo systemctl start btcpool
BitaXe Miner Configuration
Configure Each BitaXe

Access BitaXe web interface
Navigate to settings
Enter pool details:

URL: stratum+tcp://your-server-ip:3333
Username: bitX.{IP_ADDRESS} (e.g., bit1.192.168.1.100)
Password: x



Performance Optimization
System Optimization
bashCopy# Add to /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# Apply changes
sudo sysctl -p
Node.js Optimization
Add to ecosystem.config.js:
javascriptCopy{
    max_memory_restart: '2G',
    node_args: '--max-old-space-size=4096'
}
Security Recommendations

Use strong passwords
Keep system updated
Enable firewall
Use SSL/TLS for web interface
Monitor system logs

Copy
2. Create `docs/TESTING_TROUBLESHOOTING.md`:
```markdown
# Testing and Troubleshooting Guide

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "BitaXe"

# Run with verbose output
npm test -- --verbose