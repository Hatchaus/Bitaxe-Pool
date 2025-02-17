const { exec } = require('child_process');
const fs = require('fs');

class SystemMonitor {
    constructor() {
        this.stats = {
            cpu: 0,
            memory: 0,
            disk: 0,
            miners: 0,
            hashrate: 0
        };
    }

    async checkSystem() {
        try {
            // CPU Usage
            const cpuUsage = await this.getCPUUsage();
            this.stats.cpu = cpuUsage;

            // Memory Usage
            const memUsage = await this.getMemoryUsage();
            this.stats.memory = memUsage;

            // Disk Usage
            const diskUsage = await this.getDiskUsage();
            this.stats.disk = diskUsage;

            // Log stats
            this.logStats();
        } catch (error) {
            console.error('Monitor error:', error);
        }
    }

    async getCPUUsage() {
        return new Promise((resolve, reject) => {
            exec('top -bn1 | grep "Cpu(s)"', (error, stdout) => {
                if (error) reject(error);
                const usage = parseFloat(stdout.split(',')[0].split(' ')[1]);
                resolve(usage);
            });
        });
    }

    async getMemoryUsage() {
        return new Promise((resolve, reject) => {
            exec('free | grep Mem', (error, stdout) => {
                if (error) reject(error);
                const values = stdout.split(/\s+/);
                const total = parseInt(values[1]);
                const used = parseInt(values[2]);
                resolve((used / total * 100).toFixed(2));
            });
        });
    }

    async getDiskUsage() {
        return new Promise((resolve, reject) => {
            exec('df -h / | tail -1', (error, stdout) => {
                if (error) reject(error);
                const usage = stdout.split(/\s+/)[4].replace('%', '');
                resolve(parseInt(usage));
            });
        });
    }

    logStats() {
        const logEntry = `${new Date().toISOString()} - CPU: ${this.stats.cpu}%, MEM: ${this.stats.memory}%, DISK: ${this.stats.disk}%\n`;
        fs.appendFileSync('logs/system.log', logEntry);
    }
}

const monitor = new SystemMonitor();
setInterval(() => monitor.checkSystem(), 60000);