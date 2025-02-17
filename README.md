# BitaXe Mining Pool Dashboard

A lightweight, real-time mining pool and monitoring solution specifically designed for BitaXe miners. This project provides both a stratum server for mining and a comprehensive web interface to monitor your BitaXes' performance, temperatures, and mining statistics.

I am just messing around with setting up my pool, seeing what I can do with it, and trying to hit the lottery simultaneously.
I'm a redneck with ADHD, and I enjoy nerding out sometimes. I am in no way an expert at this! Use at your own risk, and please make it better!

When I have time, I will assemble a betting file structure and organize everything. 

## Features

- **Real-time BitaXe Monitoring**
  - Hashrate tracking
  - Temperature monitoring (Chip & VR)
  - Fan speed and RPM
  - Share statistics
  - Power consumption metrics

- **Pool Features**
  - Built-in stratum server
  - Real-time hashrate graphs
  - Share tracking
  - Bitcoin node sync status
  - Total pool statistics

- **Web Interface**
  - Clean, responsive design
  - Real-time updates
  - Mobile-friendly layout
  - Easy to use

## Requirements

- Node.js v18+
- Bitcoin Core node
- One or more BitaXe miners
- Ubuntu Server (or similar Linux distribution)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/Hatchaus/Bitaxe-Pool
cd bitaxe-pool
```

2. Install dependencies:
```bash
npm install
```

3. Configure your mining pool:
```javascript
// Edit config.js
module.exports = {
    pool: {
        address: 'YOUR_BTC_ADDRESS',
        stratumPort: 3333,
        webPort: 6969
    }
};
```

4. Start the pool:
```bash
npm start
```

Access the dashboard at: `http://your-server-ip:6969`

## BitaXe Configuration

Configure your BitaXes to connect to the pool:
- Pool URL: your-server-ip:3333`
- Username format: `bitX.{IP_ADDRESS}` (e.g., `bit1.192.168.1.100`)
- Password: `x`

## Features in Detail

### Mining Pool
- Efficient stratum server implementation
- Real-time work updates
- Share validation and tracking
- Dynamic difficulty adjustment

### Dashboard
- Real-time statistics updates
- Temperature and performance monitoring
- Historical hashrate graphing
- Share submission tracking

### Monitoring
- Temperature alerts
- Performance tracking
- Share acceptance rates
- Fan speed monitoring

## Security

This implementation includes:
- IP-based access control
- Basic authentication
- Rate limiting
- Error handling

## Performance

Optimized for BitaXe miners:
- Low latency work delivery
- Efficient share processing
- Minimal resource usage
- Real-time updates without excessive polling

## Contributing

Contributions are welcome! Feel free to:
- Submit bug reports
- Propose new features
- Submit pull requests
- Improve documentation

## Support Development

If you find this project useful, consider supporting development:

BTC: bc1qy7qfcz9kt2lj3m72my89wp4j52cc9w79cys9hx


## Acknowledgments

Special thanks to:
- The BitaXe community
- Bitcoin Core developers
- All contributors and testers

## Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.
