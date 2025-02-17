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
            const nodeStatus = await pool.getBitcoinNodeStatus();
            res.json(nodeStatus);
        } catch (error) {
            res.status(500).json({ error: 'Could not get node status' });
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

    // Get all miners
    router.get('/miners', (req, res) => {
        const miners = pool.getAllMiners();
        res.json(miners);
    });

    return router;
};