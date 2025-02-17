#!/bin/sh
set -e

# Wait for Bitcoin Core to start
wait_for_bitcoin() {
    echo "Waiting for Bitcoin Core..."
    while ! bitcoin-cli -rpcuser=${BTC_RPC_USER:-bitcoinrpc} -rpcpassword=${BTC_RPC_PASS:-changeme} -rpcconnect=bitcoind getblockchaininfo > /dev/null 2>&1
    do
        echo "Bitcoin Core is starting..."
        sleep 5
    done
    echo "Bitcoin Core is ready!"
}

# Initialize configuration if needed
if [ ! -f "/usr/src/app/config/config.js" ]; then
    echo "Initializing configuration..."
    cp /usr/src/app/config/config.example.js /usr/src/app/config/config.js
fi

# Wait for Bitcoin Core
wait_for_bitcoin

# Start the pool
echo "Starting BitaXe Pool..."
exec npm start