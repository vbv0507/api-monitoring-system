const axios = require("axios");
const { getIO } = require("../socket");

const Monitor = require("../models/Monitor");
const Log = require("../models/MonitorLog");

const sendEmail = require("./sendEmail");

function emitMonitorStatus(monitor) {
  const userId = String(monitor.user && monitor.user._id ? monitor.user._id : monitor.user);

  getIO().to(userId).emit("monitor-status", {
    _id: monitor._id,
    url: monitor.url,
    method: monitor.method,
    interval: monitor.interval,
    status: monitor.status,
    statusCode: monitor.statusCode,
    responseTime: monitor.responseTime,
    failureCount: monitor.failureCount,
    totalChecks: monitor.totalChecks,
    successfulChecks: monitor.successfulChecks,
    lastChecked: monitor.lastChecked,
  });
}

async function checkMonitor(monitor) {

  const start = Date.now();

  // STORE PREVIOUS STATUS
  const previousStatus = monitor.status;

  try {

    // API REQUEST
    const response = await axios({
      method: monitor.method,
      url: monitor.url,
      timeout: 5000,
      validateStatus: () => true,
    });

    // TOTAL CHECKS
    monitor.totalChecks += 1;

    // STATUS CHECK
    if (response.status >= 400) {

      monitor.status = "DOWN";

      monitor.failureCount += 1;

      // SEND EMAIL ONLY WHEN STATUS CHANGES
      if (previousStatus !== "DOWN") {

        await monitor.populate("user");

        await sendEmail({
          to: monitor.user.email,
          subject: "🚨 API DOWN ALERT",
          text: `${monitor.url} is currently DOWN.\nStatus Code: ${response.status}`,
        });

      }

    } else {

      monitor.status = "UP";

      // SUCCESSFUL CHECKS
      monitor.successfulChecks += 1;

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

    emitMonitorStatus(monitor);

    console.log(
      `${monitor.url} ${monitor.status} (${response.status})`
    );

  } catch (error) {

    // TOTAL CHECKS
    monitor.totalChecks += 1;

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

    emitMonitorStatus(monitor);

    // SEND EMAIL ONLY WHEN STATUS CHANGES
    if (previousStatus !== "DOWN") {

      await monitor.populate("user");

      await sendEmail({
        to: monitor.user.email,
        subject: "🚨 API DOWN ALERT",
        text: `${monitor.url} is currently DOWN.`,
      });

    }

    console.log(`${monitor.url} is DOWN`);
  }
}

module.exports = checkMonitor;
