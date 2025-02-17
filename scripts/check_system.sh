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