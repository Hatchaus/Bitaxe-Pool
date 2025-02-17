const EventEmitter = require('events');
const BitaXeHandler = require('../lib/bitaxe');
const StratumServer = require('../lib/stratum');

class PoolService extends EventEmitter {
    constructor(options = {}) {
        super();
        this.stratum = new StratumServer({
            port: options.stratumPort || 3333,
            difficulty: options.difficulty || 8192
        });
        this.bitaxeHandler = new BitaXeHandler(options);
        this.stats = {
            miners: 0,
            totalHashrate: 0,
            validShares: 0,
            btcSync: 0,
            btcBlocks: 0,
            btcHeaders: 0
        };
    }

    start() {
        this.stratum.start();
        this.setupEventHandlers();
        this.startStatsUpdates();
    }

    setupEventHandlers() {
        this.stratum.on('share.submit', this.handleShareSubmission.bind(this));
        this.bitaxeHandler.on('statsUpdate', this.handleStatsUpdate.bind(this));
    }

    startStatsUpdates() {
        setInterval(() => {
            this.updatePoolStats();
        }, 5000);
    }

    updatePoolStats() {
        const minerStats = Array.from(this.bitaxeHandler.getAllMinersStats());
        this.stats.miners = minerStats.length;
        this.stats.totalHashrate = minerStats.reduce((sum, miner) => 
            sum + (miner.stats?.hashRate || 0), 0);
        this.emit('stats.updated', this.stats);
    }

    handleShareSubmission(share) {
        this.stats.validShares++;
        this.emit('share.accepted', share);
    }

    handleStatsUpdate(minerId, stats) {
        this.emit('miner.updated', minerId, stats);
    }

    getStats() {
        return {
            ...this.stats,
            minerStats: this.bitaxeHandler.getAllMinersStats()
        };
    }
}

module.exports = PoolService;