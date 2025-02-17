# Use Node.js v18 as base image
FROM node:18-alpine

# Install required packages
RUN apk add --no-cache \
    bitcoin \
    bitcoin-cli \
    curl \
    python3 \
    make \
    g++ \
    git

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Create required directories
RUN mkdir -p logs
RUN mkdir -p .bitcoin

# Create bitcoin.conf
RUN echo "server=1\n\
rpcuser=${BTC_RPC_USER:-bitcoinrpc}\n\
rpcpassword=${BTC_RPC_PASS:-changeme}\n\
rpcallowip=0.0.0.0/0\n\
rpcport=8332\n\
txindex=1" > .bitcoin/bitcoin.conf

# Expose ports
EXPOSE 3333 6969 8332

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:6969/api/pool/stats || exit 1

# Create volume for persistent data
VOLUME ["/usr/src/app/logs", "/usr/src/app/.bitcoin"]

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["docker-entrypoint.sh"]