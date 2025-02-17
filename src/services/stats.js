class StatsService {
    constructor() {
        this.stats = new Map();
        this.totalHashrate = 0;
        this.validShares = 0;
    }

    updateMinerStats(minerId, stats) {
        this.stats.set(minerId, {
            ...stats,
            lastUpdate: Date.now()
        });
        this.calculateTotalHashrate();
    }

    calculateTotalHashrate() {
        this.totalHashrate = Array.from(this.stats.values())
            .reduce((sum, stat) => sum + (stat.hashRate || 0), 0);
    }

    getStats() {
        return {
            miners: this.stats.size,
            totalHashrate: this.totalHashrate,
            validShares: this.validShares,
            minerStats: Array.from(this.stats.entries()).map(([id, stats]) => ({
                id,
                ...stats
            }))
        };
    }

    removeMiner(minerId) {
        this.stats.delete(minerId);
        this.calculateTotalHashrate();
    }

    recordShare(minerId) {
        this.validShares++;
        const minerStats = this.stats.get(minerId);
        if (minerStats) {
            minerStats.shares = (minerStats.shares || 0) + 1;
            this.stats.set(minerId, minerStats);
        }
    }
}

module.exports = StatsService;