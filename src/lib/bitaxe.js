const fetch = require('node-fetch');
const EventEmitter = require('events');

class BitaXeHandler extends EventEmitter {
    constructor(options = {}) {
        super();
        this.timeout = options.timeout || 5000;
        this.retries = options.retries || 3;
        this.pollInterval = options.pollInterval || 5000;
        this.miners = new Map();
        this.lastStats = new Map();
    }

    async fetchBitaxeStats(ip) {
        try {
            const response = await fetch(`http://${ip}/api/system/info`, {
                timeout: this.timeout
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return {
                power: parseFloat(data.power) || 0,
                voltage: parseFloat(data.voltage) || 0,
                current: parseFloat(data.current) || 0,
                temp: parseFloat(data.temp) || 0,
                vrTemp: parseFloat(data.vrTemp) || 0,
                hashRate: parseFloat(data.hashRate) || 0,
                bestDiff: data.bestDiff || "0",
                bestSessionDiff: data.bestSessionDiff || "0",
                stratumDiff: parseInt(data.stratumDiff) || 8192,
                frequency: parseInt(data.frequency) || 0,
                sharesAccepted: parseInt(data.sharesAccepted) || 0,
                sharesRejected: parseInt(data.sharesRejected) || 0,
                fanspeed: parseInt(data.fanspeed) || 0,
                fanrpm: parseInt(data.fanrpm) || 0
            };
        } catch (error) {
            console.error(`Error fetching BitaXe stats for IP ${ip}:`, error.message);
            return null;
        }
    }
}

module.exports = BitaXeHandler;