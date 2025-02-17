const PoolService = require('../../src/services/pool');
const assert = require('assert');
const net = require('net');

describe('Pool Integration', () => {
    let pool;
    let client;

    before(async () => {
        pool = new PoolService({
            stratumPort: 3333,
            webPort: 6969
        });
        await pool.start();
    });

    after(async () => {
        if (client) client.destroy();
        await pool.stop();
    });

    it('should accept stratum connections', (done) => {
        client = new net.Socket();
        client.connect(3333, '127.0.0.1', () => {
            assert(client.connecting === false);
            done();
        });
    });

    it('should handle mining.subscribe', (done) => {
        const subscribe = {
            id: 1,
            method: 'mining.subscribe',
            params: []
        };
        
        client.write(JSON.stringify(subscribe) + '\n');
        client.once('data', (data) => {
            const response = JSON.parse(data);
            assert(response.id === 1);
            assert(Array.isArray(response.result));
            done();
        });
    });

    it('should track pool statistics', () => {
        const stats = pool.getStats();
        assert(typeof stats === 'object');
        assert(typeof stats.miners === 'number');
        assert(typeof stats.totalHashrate === 'number');
    });
});