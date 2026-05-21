const axios = require('axios');

const Monitor = require('../models/Monitor');

async function checkMonitor(monitor) {

    const start = Date.now();

    try {

        await axios({
            method: monitor.method,
            url: monitor.url,
            timeout: 5000
        });

        const responseTime = Date.now() - start;

        monitor.status = 'UP';
        monitor.responseTime = responseTime;
        monitor.lastChecked = new Date();

        await monitor.save();

        console.log(`${monitor.url} is UP`);

    } catch (error) {

        monitor.status = 'DOWN';
        monitor.failureCount += 1;
        monitor.lastChecked = new Date();

        await monitor.save();

        console.log(`${monitor.url} is DOWN`);

    }

}

module.exports = checkMonitor;