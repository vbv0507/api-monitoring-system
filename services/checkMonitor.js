const axios = require("axios");
const { getIO } = require("../socket");

const Log = require("../models/MonitorLog");
const Incident = require("../models/Incident");

const sendEmail = require("./sendEmail");

function emitMonitorStatus(monitor) {
  const userId = String(
    monitor.user && monitor.user._id ? monitor.user._id : monitor.user,
  );

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

async function sendDownAlert(monitor, text) {
  try {
    await monitor.populate("user");

    await sendEmail({
      to: monitor.user.email,
      subject: "API DOWN ALERT",
      text,
    });
  } catch (error) {
    console.log("Down alert email error:", error.message);
  }
}

async function checkMonitor(monitor) {
  const start = Date.now();

  // STORE PREVIOUS STATUS
  const previousStatus = monitor.status;

  let shouldSendDownAlert = false;

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

      // CREATE INCIDENT ONLY ON FIRST FAILURE
      if (previousStatus !== "DOWN") {
        await Incident.create({
          monitor: monitor._id,
          startedAt: new Date(),
        });
      }

      // SEND EMAIL ONLY ONCE
      shouldSendDownAlert = previousStatus !== "DOWN" && !monitor.downAlertSent;

      monitor.downAlertSent = true;
    } else {
      monitor.status = "UP";

      // SUCCESSFUL CHECKS
      monitor.successfulChecks += 1;

      // RESET FAILURES
      monitor.failureCount = 0;

      // ALLOW FUTURE DOWN ALERTS
      monitor.downAlertSent = false;

      // RESOLVE INCIDENT
      if (previousStatus === "DOWN") {
        const activeIncident = await Incident.findOne({
          monitor: monitor._id,
          status: "OPEN",
        });

        if (activeIncident) {
          activeIncident.status = "RESOLVED";

          activeIncident.resolvedAt = new Date();

          activeIncident.duration =
            activeIncident.resolvedAt - activeIncident.startedAt;

          await activeIncident.save();
        }
      }
    }

    // RESPONSE TIME
    const responseTime = Date.now() - start;

    // UPDATE MONITOR
    monitor.responseTime = responseTime;

    monitor.lastChecked = new Date();

    monitor.statusCode = response.status;

    await monitor.save();

    // SEND ALERT
    if (shouldSendDownAlert) {
      await sendDownAlert(
        monitor,
        `${monitor.url} is currently DOWN.\nStatus Code: ${response.status}`,
      );
    }

    // SAVE LOG
    await Log.create({
      monitor: monitor._id,
      status: monitor.status,
      statusCode: monitor.statusCode,
      responseTime: monitor.responseTime,
    });

    // REALTIME UPDATE
    emitMonitorStatus(monitor);

    console.log(`${monitor.url} ${monitor.status} (${response.status})`);
  } catch (error) {
    // TOTAL CHECKS
    monitor.totalChecks += 1;

    monitor.status = "DOWN";

    monitor.failureCount += 1;

    monitor.lastChecked = new Date();

    monitor.statusCode = 0;

    // CREATE INCIDENT ONLY ON FIRST FAILURE
    if (previousStatus !== "DOWN") {
      await Incident.create({
        monitor: monitor._id,
        startedAt: new Date(),
      });
    }

    // SEND EMAIL ONLY ONCE
    shouldSendDownAlert = previousStatus !== "DOWN" && !monitor.downAlertSent;

    monitor.downAlertSent = true;

    await monitor.save();

    // SAVE FAILURE LOG
    await Log.create({
      monitor: monitor._id,
      status: monitor.status,
      statusCode: monitor.statusCode,
      responseTime: 0,
    });

    // REALTIME UPDATE
    emitMonitorStatus(monitor);

    // SEND ALERT
    if (shouldSendDownAlert) {
      await sendDownAlert(monitor, `${monitor.url} is currently DOWN.`);
    }

    console.log(`${monitor.url} is DOWN`);
  }
}

module.exports = checkMonitor;
