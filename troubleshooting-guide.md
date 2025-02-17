# Troubleshooting Guide

## Common Issues and Solutions

### 1. Connection Issues

#### Bitcoin Core Not Connecting
```bash
# Check if Bitcoin Core is running
bitcoin-cli getblockchaininfo

# If error, check logs
tail -f ~/.bitcoin/debug.log

# Verify RPC credentials
bitcoin-cli -rpcuser=your_username -rpcpassword=your_password getblockchaininfo
```

#### Miners Can't Connect
1. Check if stratum server is running:
```bash
netstat -tuln | grep 3333
```

2. Test connection:
```bash
telnet your-server-ip 3333
```

3. Check firewall:
```bash
sudo ufw status
```

### 2. Performance Issues

#### High CPU Usage
1. Check system resources:
```bash
top -c
htop  # if installed
```

2. Check Node.js memory usage:
```bash
ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%mem | head
```

#### Slow Dashboard Updates
1. Check API response time:
```bash
curl -w "\nTotal time: %{time_total}s\n" http://localhost:6969/api/pool/stats
```

2. Monitor system load:
```bash
watch -n1 "uptime"
```

### 3. Bitcoin Core Issues

#### Sync Problems
```bash
# Check sync status
bitcoin-cli getblockchaininfo | grep verificationprogress

# Check network connections
bitcoin-cli getnetworkinfo

# Clear blockchain data and resync if needed
bitcoin-cli stop
rm -rf ~/.bitcoin/blocks ~/.bitcoin/chainstate
bitcoind -daemon
```

#### Memory Issues
```bash
# Check memory usage
free -h

# Reduce cache if needed
bitcoin-cli stop
echo "dbcache=100" >> ~/.bitcoin/bitcoin.conf
bitcoind -daemon
```

### 4. BitaXe Communication Issues

#### API Not Responding
1. Test BitaXe API:
```bash
curl -v http://bitaxe-ip/api/system/info
```

2. Check network connectivity:
```bash
ping bitaxe-ip
traceroute bitaxe-ip
```

#### Invalid Shares
1. Check share difficulty:
```bash
grep "share difficulty" ~/mining-pool/logs/pool.log
```

2. Verify miner settings:
```bash
curl http://bitaxe-ip/api/system/info | grep stratumDiff
```

### 5. Database and Storage Issues

#### Disk Space
```bash
# Check disk usage
df -h

# Find large files
du -sh * | sort -hr | head -n 10

# Clean old logs
find /var/log -type f -name "*.log" -mtime +7 -exec rm {} \;
```

#### Log Files Growing Too Large
```bash
# Check log sizes
ls -lh ~/mining-pool/logs/

# Rotate logs
logrotate -f /etc/logrotate.d/mining-pool
```

## Validation Scripts

1. System Check Script (`check_system.sh`):
```bash
#!/bin/bash

echo "=== System Health Check ==="

# Check CPU
echo -n "CPU Load: "
uptime | awk -F'load average:' '{ print $2 }'

# Check Memory
echo -n "Memory Usage: "
free -h | grep "Mem:" | awk '{print $3 "/" $2}'

# Check Disk
echo -n "Disk Usage: "
df -h / | tail -1 | awk '{print $5}'

# Check Services
echo "=== Service Status ==="
services=("bitcoind" "btcpool")
for service in "${services[@]}"; do
    echo -n "$service: "
    systemctl is-active $service
done

# Check Ports
echo "=== Port Status ==="
ports=(3333 6969 8332)
for port in "${ports[@]}"; do
    echo -n "Port $port: "
    nc -zv localhost $port 2>&1 | grep -q "succeeded" && echo "OPEN" || echo "CLOSED"
done

# Check Bitcoin Core
echo "=== Bitcoin Core Status ==="
bitcoin-cli getblockchaininfo 2>/dev/null || echo "Bitcoin Core not responding"
```

2. Configuration Validation Script (`validate_config.js`):
```javascript
const fs = require('fs');
const path = require('path');

function validateConfig() {
    const errors = [];
    const warnings = [];

    // Check Bitcoin Core config
    try {
        const btcConfig = fs.readFileSync(path.join(process.env.HOME, '.bitcoin/bitcoin.conf'), 'utf8');
        
        if (!btcConfig.includes('rpcuser=')) errors.push('Missing RPC user');
        if (!btcConfig.includes('rpcpassword=')) errors.push('Missing RPC password');
        if (!btcConfig.includes('server=1')) warnings.push('Bitcoin Core server mode not enabled');
        
    } catch (error) {
        errors.push('Cannot read Bitcoin Core config');
    }

    // Check pool config
    try {
        const poolConfig = require('./config.js');
        
        if (!poolConfig.pool.address) errors.push('Missing pool reward address');
        if (!poolConfig.bitcoin.username) errors.push('Missing Bitcoin RPC username');
        if (!poolConfig.bitcoin.password) errors.push('Missing Bitcoin RPC password');
        
        // Validate ports
        if (poolConfig.pool.stratumPort === poolConfig.pool.webPort) {
            errors.push('Stratum and web ports cannot be the same');
        }
        
    } catch (error) {
        errors.push('Cannot read pool config');
    }

    // Check system requirements
    const totalMem = require('os').totalmem();
    if (totalMem < 4 * 1024 * 1024 * 1024) { // 4GB
        warnings.push('Low system memory, performance may be affected');
    }

    return { errors, warnings };
}

// Run validation
const { errors, warnings } = validateConfig();

if (errors.length > 0) {
    console.error('=== Configuration Errors ===');
    errors.forEach(error => console.error(`❌ ${error}`));
}

if (warnings.length > 0) {
    console.warn('=== Configuration Warnings ===');
    warnings.forEach(warning => console.warn(`⚠️ ${warning}`));
}

if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Configuration validation passed');
}

process.exit(errors.length > 0 ? 1 : 0);
```

3. BitaXe Health Check Script (`check_bitaxes.js`):
```javascript
const fetch = require('node-fetch');

async function checkBitaxe(ip) {
    try {
        const response = await fetch(`http://${ip}/api/system/info`, {
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Check vital stats
        const issues = [];
        if (data.temp > 85) issues.push('High temperature');
        if (data.fanspeed < 20) issues.push('Low fan speed');
        if (data.hashRate < 100) issues.push('Low hashrate');
        
        return {
            status: 'ok',
            issues,
            data
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message
        };
    }
}

// Usage example
async function checkAllBitaxes(miners) {
    for (const miner of miners) {
        console.log(`Checking ${miner.name} (${miner.ip})...`);
        const result = await checkBitaxe(miner.ip);
        
        if (result.status === 'ok') {
            console.log(`✅ ${miner.name}: OK`);
            if (result.issues.length > 0) {
                console.warn(`⚠️ Issues found: ${result.issues.join(', ')}`);
            }
        } else {
            console.error(`❌ ${miner.name}: ${result.error}`);
        }
    }
}
```

To use these scripts:
1. Save them to your mining pool directory
2. Make them executable:
```bash
chmod +x check_system.sh
```

3. Add to crontab for regular checking:
```bash
# Add to crontab -e
*/5 * * * * /path/to/check_system.sh >> /var/log/pool-monitor.log 2>&1
```

