# Installation Guide

## Ubuntu/Debian

1. Install dependencies:
```bash
# Update system
sudo apt update
sudo apt upgrade

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Bitcoin Core
sudo apt install bitcoin bitcoind

# Verify installations
node --version
bitcoin-cli --version
```

2. Configure Bitcoin Core:
```bash
# Create bitcoin directory
mkdir ~/.bitcoin

# Create config file
cat > ~/.bitcoin/bitcoin.conf << EOL
server=1
daemon=1
txindex=1
rpcuser=your_username
rpcpassword=your_secure_password
EOL

# Set correct permissions
chmod 600 ~/.bitcoin/bitcoin.conf

# Start Bitcoin Core
bitcoind -daemon
```

3. Install BitaXe Pool:
```bash
# Clone repository
git clone https://github.com/yourusername/bitaxe-pool
cd bitaxe-pool

# Install dependencies
npm install

# Configure service
sudo tee /etc/systemd/system/btcpool.service << EOL
[Unit]
Description=Bitcoin Mining Pool
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PWD
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Start service
sudo systemctl daemon-reload
sudo systemctl enable btcpool
sudo systemctl start btcpool
```

## Windows

1. Install Prerequisites:
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Download and install Bitcoin Core from [bitcoin.org](https://bitcoin.org/)

2. Configure Bitcoin Core:
- Create file: `%APPDATA%\Bitcoin\bitcoin.conf`
- Add configuration:
```ini
server=1
rpcuser=your_username
rpcpassword=your_secure_password
txindex=1
```

3. Install BitaXe Pool:
```powershell
# Clone repository
git clone https://github.com/yourusername/bitaxe-pool
cd bitaxe-pool

# Install dependencies
npm install

# Create startup script (start.bat)
echo @echo off > start.bat
echo cd %~dp0 >> start.bat
echo npm start >> start.bat

# Create task scheduler job
schtasks /create /tn "BitaXe Pool" /tr "%cd%\start.bat" /sc onstart /ru SYSTEM
```

## Docker

1. Create Dockerfile:
```dockerfile
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache bitcoin bitcoin-cli

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Expose ports
EXPOSE 3333 6969

# Start command
CMD ["npm", "start"]
```

2. Create docker-compose.yml:
```yaml
version: '3'
services:
  bitcoind:
    image: ruimarinho/bitcoin-core:latest
    command:
      - -server=1
      - -rpcuser=your_username
      - -rpcpassword=your_secure_password
      - -txindex=1
    volumes:
      - bitcoin_data:/home/bitcoin/.bitcoin
    ports:
      - "8332:8332"

  pool:
    build: .
    ports:
      - "3333:3333"
      - "6969:6969"
    depends_on:
      - bitcoind
    environment:
      - BITCOIN_RPC_HOST=bitcoind
      - BITCOIN_RPC_PORT=8332
      - BITCOIN_RPC_USER=your_username
      - BITCOIN_RPC_PASS=your_secure_password

volumes:
  bitcoin_data:
```

3. Run with Docker Compose:
```bash
docker-compose up -d
```

## Raspberry Pi

1. Install dependencies:
```bash
# Update system
sudo apt update
sudo apt upgrade

# Install Node.js
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install Bitcoin Core (this will take a while on Pi)
sudo apt install bitcoin bitcoind
```

2. Configure for Pi performance:
```bash
# Increase swap size
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon

# Configure Bitcoin Core for lower resource usage
echo "dbcache=100
maxmempool=50
maxconnections=12" >> ~/.bitcoin/bitcoin.conf
```

3. Follow Ubuntu installation steps above.

## Troubleshooting

Common issues and solutions:

1. Port Access Issues:
```bash
# Allow required ports through firewall
sudo ufw allow 3333/tcp
sudo ufw allow 6969/tcp
```

2. Permission Issues:
```bash
# Fix directory permissions
sudo chown -R $USER:$USER ~/bitaxe-pool
chmod -R 755 ~/bitaxe-pool
```

3. Bitcoin Core Connection Issues:
```bash
# Test RPC connection
bitcoin-cli getblockchaininfo

# Check Bitcoin Core logs
tail -f ~/.bitcoin/debug.log
```

4. Node.js Memory Issues:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS=--max_old_space_size=4096
```

## Security Recommendations

1. Use a firewall:
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 3333/tcp
sudo ufw allow 6969/tcp
```

2. Set up SSL (optional):
```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Update server.js to use SSL
# Add SSL configuration to server code
```

3. Regular updates:
```bash
# Create update script
cat > update.sh << EOL
#!/bin/bash
git pull
npm install
sudo systemctl restart btcpool
EOL
chmod +x update.sh
```