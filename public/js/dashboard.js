document.addEventListener('DOMContentLoaded', function() {
    let hashrateChart;
    const hashrateData = {
        labels: [],
        datasets: [{
            label: 'Pool Hashrate',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    function formatHashrate(hashrate) {
        if (typeof hashrate !== 'number' || isNaN(hashrate)) return '0 H/s';
        
        const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s', 'EH/s'];
        let unitIndex = 0;
        
        while (hashrate >= 1000 && unitIndex < units.length - 1) {
            hashrate /= 1000;
            unitIndex++;
        }
        
        return `${hashrate.toFixed(2)} ${units[unitIndex]}`;
    }

    function formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`;
        return `${Math.floor(seconds/86400)}d ago`;
    }

    function updateMinerTable(miners) {
        const tbody = document.getElementById('minerStats');
        tbody.innerHTML = '';
        
        miners.forEach(miner => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${miner.workerId}</td>
                <td>${formatHashrate(miner.bitaxeStats.hashRate * 1e6)}</td>
                <td>${miner.bitaxeStats.sharesAccepted} accepted</td>
                <td>${miner.bitaxeStats.temp}°C / ${miner.bitaxeStats.vrTemp}°C</td>
                <td>${miner.bitaxeStats.frequency} MHz</td>
                <td>${miner.bitaxeStats.fanspeed}% (${miner.bitaxeStats.fanrpm} RPM)</td>
                <td>${formatTimeAgo(miner.lastShare)}</td>
            `;
            tbody.appendChild(row);
        });
    }

    function initChart() {
        const ctx = document.getElementById('hashrateChart').getContext('2d');
        hashrateChart = new Chart(ctx, {
            type: 'line',
            data: hashrateData,
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function updateStats() {
        fetch('/api/pool/stats')
            .then(response => response.json())
            .then(data => {
                document.getElementById('totalHashrate').textContent = formatHashrate(data.totalHashrate);
                document.getElementById('minerCount').textContent = data.miners;
                document.getElementById('validShares').textContent = data.validShares;
                document.getElementById('poolAddress').textContent = data.rewardAddress;

                const syncProgress = document.getElementById('syncProgress');
                syncProgress.style.width = `${data.btcSync}%`;
                syncProgress.textContent = `${data.btcSync}%`;
                
                document.getElementById('blockInfo').textContent = 
                    `Blocks: ${data.btcBlocks.toLocaleString()} / Headers: ${data.btcHeaders.toLocaleString()}`;

                updateMinerTable(data.minerStats);

                // Update chart
                const now = new Date().toLocaleTimeString();
                hashrateData.labels.push(now);
                hashrateData.datasets[0].data.push(data.totalHashrate);

                if (hashrateData.labels.length > 20) {
                    hashrateData.labels.shift();
                    hashrateData.datasets[0].data.shift();
                }

                hashrateChart.update();
            })
            .catch(error => console.error('Error fetching stats:', error));
    }

    // Initialize
    initChart();
    updateStats();
    // Update every 30 seconds
    setInterval(updateStats, 30000);
});