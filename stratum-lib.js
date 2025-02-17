const net = require('net');
const EventEmitter = require('events');
const crypto = require('crypto');

class StratumServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.port = options.port || 3333;
        this.defaultDifficulty = options.difficulty || 8192;
        this.clients = new Map();
        this.server = null;
        this.extraNonce1Size = 4;
        this._init();
    }

    _init() {
        this.server = net.createServer((socket) => this._handleConnection(socket));
        this.server.listen(this.port, () => {
            console.log(`Stratum server listening on port ${this.port}`);
        });
    }

    _handleConnection(socket) {
        const clientId = this._generateClientId();
        const client = {
            id: clientId,
            socket,
            difficulty: this.defaultDifficulty,
            extraNonce1: this._generateExtraNonce1(),
            authorized: false,
            subscription: null,
            workerId: null
        };

        this.clients.set(clientId, client);
        console.log(`New connection from ${socket.remoteAddress}`);

        socket.on('data', (data) => {
            this._handleData(client, data);
        });

        socket.on('error', (error) => {
            console.error(`Socket error for client ${clientId}:`, error.message);
            this._removeClient(clientId);
        });

        socket.on('close', () => {
            console.log(`Client ${clientId} disconnected`);
            this._removeClient(clientId);
        });
    }

    _handleData(client, data) {
        const messages = data.toString().split('\n');
        
        messages.forEach(message => {
            if (!message.trim()) return;

            try {
                const jsonMessage = JSON.parse(message);
                this._processMessage(client, jsonMessage);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }

    _processMessage(client, message) {
        const method = message.method;
        const params = message.params;
        const id = message.id;

        switch (method) {
            case 'mining.subscribe':
                this._handleSubscribe(client, message);
                break;
            case 'mining.authorize':
                this._handleAuthorize(client, message);
                break;
            case 'mining.submit':
                this._handleSubmit(client, message);
                break;
            default:
                console.warn(`Unknown method: ${method}`);
                this._sendError(client, id, -1, 'Unknown method');
        }
    }

    _handleSubscribe(client, message) {
        client.subscription = {
            extraNonce1: client.extraNonce1,
            extraNonce2Size: 4
        };

        const response = {
            id: message.id,
            result: [
                [
                    ["mining.set_difficulty", client.id],
                    ["mining.notify", client.id]
                ],
                client.extraNonce1,
                4  // extraNonce2Size
            ],
            error: null
        };

        this._sendMessage(client, response);
        this._sendSetDifficulty(client);
        this.emit('client.subscribed', client);
    }

    _handleAuthorize(client, message) {
        const [username, password] = message.params;
        client.workerId = username;
        client.authorized = true;

        const response = {
            id: message.id,
            result: true,
            error: null
        };

        this._sendMessage(client, response);
        this.emit('client.authorized', client, username);
    }

    _handleSubmit(client, message) {
        const [workerId, jobId, extraNonce2, nTime, nonce] = message.params;
        
        // Emit submit event for pool to handle
        this.emit('share.submit', {
            client,
            workerId,
            jobId,
            extraNonce2,
            nTime,
            nonce
        });

        // For now, accept all shares (actual validation done by pool)
        const response = {
            id: message.id,
            result: true,
            error: null
        };

        this._sendMessage(client, response);
    }

    _sendSetDifficulty(client) {
        const message = {
            id: null,
            method: "mining.set_difficulty",
            params: [client.difficulty]
        };

        this._sendMessage(client, message);
    }

    _sendMessage(client, message) {
        if (client.socket.writable) {
            client.socket.write(JSON.stringify(message) + '\n');
        }
    }

    _removeClient(clientId) {
        const client = this.clients.get(clientId);
        if (client) {
            if (client.socket) {
                client.socket.destroy();
            }
            this.clients.delete(clientId);
            this.emit('client.disconnected', client);
        }
    }

    // Utility methods
    _generateClientId() {
        return crypto.randomBytes(4).toString('hex');
    }

    _generateExtraNonce1() {
        return crypto.randomBytes(this.extraNonce1Size).toString('hex');
    }

    // Public methods
    broadcastMiningNotify(jobId, prevHash, coinbase1, coinbase2, merkleTree, version, bits, time, cleanJobs) {
        const notification = {
            id: null,
            method: "mining.notify",
            params: [
                jobId,
                prevHash,
                coinbase1,
                coinbase2,
                merkleTree,
                version,
                bits,
                time,
                cleanJobs
            ]
        };

        this.clients.forEach(client => {
            if (client.authorized) {
                this._sendMessage(client, notification);
            }
        });
    }

    setDifficulty(clientId, difficulty) {
        const client = this.clients.get(clientId);
        if (client) {
            client.difficulty = difficulty;
            this._sendSetDifficulty(client);
        }
    }

    getConnectedClients() {
        return this.clients.size;
    }

    getAuthorizedClients() {
        return Array.from(this.clients.values()).filter(client => client.authorized).length;
    }

    getClientByWorkerId(workerId) {
        return Array.from(this.clients.values()).find(client => client.workerId === workerId);
    }

    stop() {
        if (this.server) {
            this.server.close();
            this.clients.forEach((client, clientId) => {
                this._removeClient(clientId);
            });
        }
    }
}

module.exports = StratumServer;