const net = require('net');
const EventEmitter = require('events');

class StratumServer extends EventEmitter {
    constructor(options = {}) {
        super();
        this.port = options.port || 3333;
        this.defaultDifficulty = options.difficulty || 8192;
        this.clients = new Map();
    }

    start() {
        this.server = net.createServer((socket) => {
            const client = {
                socket,
                difficulty: this.defaultDifficulty,
                authorized: false
            };

            socket.on('data', (data) => this.handleData(client, data));
            socket.on('error', (error) => this.handleError(client, error));
            socket.on('close', () => this.handleDisconnect(client));
        });

        this.server.listen(this.port, () => {
            console.log(`Stratum server running on port ${this.port}`);
        });
    }

    handleData(client, data) {
        const messages = data.toString().split('\n');
        messages.forEach(message => {
            if (!message.trim()) return;
            try {
                const jsonMessage = JSON.parse(message);
                this.handleMessage(client, jsonMessage);
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        });
    }
}

module.exports = StratumServer;