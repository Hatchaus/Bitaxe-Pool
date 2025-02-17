Test Categories

Unit Tests

BitaXe handler
Stratum protocol
Utilities


Integration Tests

Pool functionality
API endpoints
Bitcoin Core integration



Common Issues and Solutions
1. Connection Issues
Bitcoin Core Not Connecting
Symptoms:

"Could not connect to Bitcoin Core" errors
Missing blockchain data

Solutions:
bashCopy# Check Bitcoin Core status
bitcoin-cli getblockchaininfo

# If error, check logs
tail -f ~/.bitcoin/debug.log

# Verify RPC credentials
bitcoin-cli -rpcuser=your_username -rpcpassword=your_password getblockchaininfo
Miners Can't Connect
Symptoms:

Miners show connection timeout
No shares being submitted

Solutions:

Check if stratum server is running:

bashCopynetstat -tuln | grep 3333

Test connection:

bashCopytelnet your-server-ip 3333

Check firewall:

bashCopysudo ufw status
2. Performance Issues
High CPU Usage
Symptoms:

System slowdown
High load average

Solutions:
bashCopy# Check system resources
top -c

# Monitor specific process
htop -p $(pgrep -f "node server.js")

# Check logs for issues
tail -f logs/pool.log
Memory Issues
Symptoms:

Out of memory errors
Pool crashes

Solutions:

Increase Node.js memory limit:

bashCopyexport NODE_OPTIONS=--max-old-space-size=4096

Check memory usage:

bashCopyfree -h
ps aux | grep node
3. BitaXe Issues
Stats Not Updating
Symptoms:

Dashboard shows old/no data
Missing miner information

Solutions:

Test BitaXe API:

bashCopycurl http://bitaxe-ip/api/system/info

Check network connectivity:

bashCopyping bitaxe-ip

Verify miner configuration:

bashCopy# Check logs for connection attempts
tail -f logs/pool.log | grep "New miner"
Invalid Shares
Symptoms:

High rejection rate
No valid shares

Solutions:

Check difficulty settings
Verify miner software version
Monitor share submissions in logs

4. Using Diagnostic Tools
System Health Check
bashCopy# Run included health check script
./scripts/check_system.sh

# Monitor real-time metrics
./scripts/monitor.js
Log Analysis
bashCopy# Check pool logs
tail -f logs/pool.log

# Search for errors
grep "error" logs/pool.log

# Monitor share submissions
tail -f logs/pool.log | grep "share"
Network Diagnostics
bashCopy# Check connections
netstat -tupln | grep node

# Monitor network traffic
tcpdump -i any port 3333
Maintenance Tasks
Regular Maintenance

Update software:

bashCopygit pull
npm install

Check logs:

bashCopy# Rotate logs
logrotate -f /etc/logrotate.d/bitaxe-pool

# Clean old logs
find logs/ -name "*.log" -mtime +30 -delete

Monitor disk space:

bashCopydf -h
du -sh ~/.bitcoin/
Backup and Recovery

Backup configuration:

bashCopycp config/config.js config/config.backup.js

Backup Bitcoin Core wallet:

bashCopybitcoin-cli backupwallet ~/backup/wallet.dat