const express = require('express');
const router = express.Router();

module.exports = function(pool) {
    // Get pool stats
    router.get('/stats', (req, res) => {
        const stats = pool.getStats();
        res.json(stats);
    });

    // Get Bitcoin node status
    router.get('/node/status', async (req, res) => {
        try {
            const status = await pool.getBitcoinStatus();
            res.json(status);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get node status' });
        }
    });

    // Get miner details
    router.get('/miners/:minerId', (req, res) => {
        const { minerId } = req.params;
        const minerStats = pool.getMinerStats(minerId);
        if (!minerStats) {
            return res.status(404).json({ error: 'Miner not found' });
        }
        res.json(minerStats);
    });

    return router;
};