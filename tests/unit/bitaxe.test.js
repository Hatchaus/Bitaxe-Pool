const BitaXeHandler = require('../../src/lib/bitaxe');
const assert = require('assert');

describe('BitaXeHandler', () => {
    let handler;

    beforeEach(() => {
        handler = new BitaXeHandler({
            timeout: 1000,
            retries: 2,
            pollInterval: 1000
        });
    });

    it('should create new instance', () => {
        assert(handler instanceof BitaXeHandler);
        assert.strictEqual(typeof handler.fetchBitaxeStats, 'function');
    });

    it('should handle invalid IPs', async () => {
        const stats = await handler.fetchBitaxeStats('invalid-ip');
        assert.strictEqual(stats, null);
    });

    it('should track multiple miners', () => {
        handler.addMiner('192.168.1.100', 'bit1');
        handler.addMiner('192.168.1.101', 'bit2');
        assert.strictEqual(handler.miners.size, 2);
    });
});