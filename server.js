const express = require('express');
const net = require('net');
const path = require('path');
const { exec } = require('child_process');
const fetch = require('node-fetch');

// Initialize Express
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Configuration
const MINING_REWARD_ADDRESS = 'YOUR_BTC_ADDRESS_HERE';
const STRATUM_PORT = 3333;
const WEB_PORT = 6969;

// Start servers
app.listen(WEB_PORT, () => console.log(`Web interface running on port ${WEB_PORT}`));