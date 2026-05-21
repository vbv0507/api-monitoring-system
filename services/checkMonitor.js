const axios = require("axios");

const Monitor = require("../models/Monitor");
const Log = require("../models/MonitorLog");

async function checkMonitor(monitor) {

  const start = Date.now();

  try {

    // API REQUEST
    const response = await axios({
      method: monitor.method,
      url: monitor.url,
      timeout: 5000,
      validateStatus: () => true,
    });

    // STATUS CHECK
    if (response.status >= 400) {

      monitor.status = "DOWN";
      monitor.failureCount += 1;

    } else {

      monitor.status = "UP";

      // RESET FAILURES
      monitor.failureCount = 0;
    }

    // RESPONSE TIME
    const responseTime = Date.now() - start;

    // UPDATE MONITOR
    monitor.responseTime = responseTime;
    monitor.lastChecked = new Date();
    monitor.statusCode = response.status;

    await monitor.save();

    // SAVE LOG
    await Log.create({
      monitor: monitor._id,
      status: monitor.status,
      statusCode: monitor.statusCode,
      responseTime: monitor.responseTime,
    });

    console.log(
      `${monitor.url} ${monitor.status} (${response.status})`
    );

  } catch (error) {

    monitor.status = "DOWN";

    monitor.failureCount += 1;

    monitor.lastChecked = new Date();

    monitor.statusCode = 0;

    await monitor.save();

    // SAVE FAILURE LOG
    await Log.create({
      monitor: monitor._id,
      status: monitor.status,
      statusCode: monitor.statusCode,
      responseTime: 0,
    });

    console.log(`${monitor.url} is DOWN`);
  }
}

module.exports = checkMonitor;