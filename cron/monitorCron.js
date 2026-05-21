const cron = require('node-cron');

const Monitor = require('../models/Monitor');

const checkMonitor = require('../services/checkMonitor');

cron.schedule('* * * * *', async () => {

    console.log('Running monitor checks...');

    const monitors = await Monitor.find();

    for (const monitor of monitors) {

        await checkMonitor(monitor);

    }
});