const Monitor = require("../models/Monitor");
const Log = require("../models/MonitorLog");
async function createMonitor(req, res) {
  try {
    const { url, method, interval } = req.body;
    const monitor = await Monitor.create({
      url,
      method,
      interval,
      user: req.user._id,
    });
    res.status(201).json({ success: true, monitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
async function getMonitors(req, res) {
  try {
    const monitor = await Monitor.find({ user: req.user._id });
    res.status(200).json({ success: true, monitor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
async function deleteMonitor(req, res) {
  try {
    const monitor = await Monitor.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!monitor) {
      return res
        .status(404)
        .json({ success: false, message: "Monitor not found" });
    }

    await Log.deleteMany({ monitor: monitor._id });

    res.status(200).json({
      success: true,
      message: "Monitor and logs deleted",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
async function updateMonitor(req, res) {
  try {
    const { url, method, interval } = req.body;
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!monitor) {
      return res
        .status(404)
        .json({ success: false, message: "Monitor not found" });
    }
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid URL" });
    }

    monitor.url = url;
    monitor.method = method;
    monitor.interval = interval;

    await monitor.save();

    return res.status(200).json({ success: true, monitor });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getMonitorLogs(req, res) {
  try {
    // CHECK MONITOR OWNERSHIP
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    // FETCH LOGS
    const logs = await Log.find({
      monitor: req.params.id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getSingleMonitor(req, res) {
  try {
    // FIND MONITOR + OWNERSHIP CHECK
    const monitor = await Monitor.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    // CHECK IF MONITOR EXISTS
    if (!monitor) {
      return res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
    }

    // SUCCESS RESPONSE
    return res.status(200).json({
      success: true,
      monitor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createMonitor,
  getMonitors,
  deleteMonitor,
  updateMonitor,
  getMonitorLogs,
  getSingleMonitor
};
