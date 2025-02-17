## Detailed Requirements

### Hardware Requirements
- **CPU**: 2+ cores recommended
- **RAM**: Minimum 4GB, 8GB+ recommended
- **Storage**: 
  - 500GB+ for full Bitcoin node
  - 1GB for pool software
  - SSD recommended for better performance
- **Network**: Stable internet connection with minimum 5Mbps upload/download

### Software Requirements
- **Operating System**:
  - Ubuntu 20.04 LTS or newer (recommended)
  - Debian 11 or newer
  - Other Linux distributions (may require additional configuration)
- **Node.js**: Version 18.x or newer
- **Bitcoin Core**: Version 24.0 or newer
- **Additional Packages**:
  - build-essential
  - git
  - npm

### Network Requirements
- **Ports needed**:
  - 3333 (TCP) for stratum mining
  - 6969 (TCP) for web dashboard
  - 8333 (TCP) for Bitcoin Core
- **Firewall rules must allow these ports**

## Detailed Installation Guide

### 1. System Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y build-essential git curl software-properties-common
```

### 2. Install Node.js
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show 8.x.x or newer
```

### 3. Install Bitcoin Core
```bash
# Add Bitcoin repository
sudo add-apt-repository ppa:bitcoin/bitcoin
sudo apt update

# Install Bitcoin Core
sudo apt install -y bitcoind

# Create Bitcoin directory and configuration
mkdir ~/.bitcoin
nano ~/.bitcoin/bitcoin.conf
```

Add this content to bitcoin.conf:
```ini
server=1
daemon=1
txindex=1
rpcuser=your_username
rpcpassword=your_secure_password
dbcache=4096
maxmempool=100
maxconnections=25
blocksonly=1
```

### 4. Set Up Mining Pool
```bash
# Clone repository
git clone https://github.com/yourusername/bitaxe-pool
cd bitaxe-pool

# Install dependencies
npm install

# Configure pool
cp config.example.js config.js
nano config.js  # Edit configuration

# Create required directories
mkdir logs
mkdir public
```

### 5. Configure System Service
```bash
# Create service file
sudo nano /etc/systemd/system/btcpool.service
```

Add this content:
```ini
[Unit]
Description=BitaXe Mining Pool
After=network.target bitcoind.service

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/bitaxe-pool
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 6. Start Services
```bash
# Start Bitcoin Core
bitcoind -daemon

# Enable and start pool service
sudo systemctl daemon-reload
sudo systemctl enable btcpool
sudo systemctl start btcpool
```

### 7. Configure Firewall
```bash
# Allow required ports
sudo ufw allow 3333/tcp
sudo ufw allow 6969/tcp
sudo ufw allow 8333/tcp

# Enable firewall
sudo ufw enable
```

### 8. Verify Installation
```bash
# Check Bitcoin Core
bitcoin-cli getblockchaininfo

# Check pool service
sudo systemctl status btcpool

# Check ports
netstat -tuln | grep -E '3333|6969|8333'
```

## System Maintenance

### Regular Updates
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Update pool software
cd ~/bitaxe-pool
git pull
npm install

# Restart services
sudo systemctl restart btcpool
```

### Log Management
```bash
# View pool logs
journalctl -u btcpool -f

# View Bitcoin Core logs
tail -f ~/.bitcoin/debug.log
```

### Backup Important Files
- bitcoin.conf
- pool configuration
- wallet files

## Optimization Tips

### System Performance
1. Increase system limits:
```bash
# Add to /etc/security/limits.conf
* soft nofile 65535
* hard nofile 65535
```

2. Optimize kernel parameters:
```bash
# Add to /etc/sysctl.conf
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
```

### Node.js Performance
```bash
# Add to start script
export NODE_OPTIONS="--max-old-space-size=4096"
```
