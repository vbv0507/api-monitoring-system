const cron = require("node-cron");

const Monitor = require("../models/Monitor");

const checkMonitor = require("../services/checkMonitor");

function isMonitorDue(monitor, now) {
  if (!monitor.lastChecked) {
    return true;
  }

  const interval = Number(monitor.interval || 60000);
  const nextCheckTime = new Date(monitor.lastChecked).getTime() + interval;

  return nextCheckTime <= now.getTime();
}

cron.schedule("*/10 * * * * *", async () => {
  try {
    const now = new Date();
    const monitors = await Monitor.find();
    const dueMonitors = monitors.filter((monitor) => isMonitorDue(monitor, now));

    if (!dueMonitors.length) {
      return;
    }

    console.log(`Running ${dueMonitors.length} due monitor check(s)...`);

    for (const monitor of dueMonitors) {
      await checkMonitor(monitor);
    }
  } catch (error) {
    console.log("Monitor cron error:", error.message);
  }
});
