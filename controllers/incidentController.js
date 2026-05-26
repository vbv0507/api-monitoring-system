const Incident = require("../models/Incident");
const Monitor = require("../models/Monitor");

async function getIncidents(req, res) {
  try {
    // First get only monitors that belong to the logged in user.
    const monitors = await Monitor.find({ user: req.user._id }).select("_id");
    const monitorIds = monitors.map((monitor) => monitor._id);

    // Then get incidents for those monitors only.
    const incidents = await Incident.find({ monitor: { $in: monitorIds } })
      .populate("monitor", "url method status")
      .sort({ startedAt: -1 });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getMonitorIncidents(req, res) {
  try {
    // Check that this monitor belongs to the logged in user.
    const monitor = await Monitor.findOne({
      _id: req.params.monitorId,
      user: req.user._id,
    });

    if (!monitor) {
      return res
        .status(404)
        .json({ success: false, message: "Monitor not found" });
    }

    const incidents = await Incident.find({ monitor: monitor._id }).sort({
      startedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: incidents.length,
      incidents,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function getSingleIncident(req, res) {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "monitor",
      "url method status user",
    );

    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    }

    // User can see only incidents from their own monitors.
    if (String(incident.monitor.user) !== String(req.user._id)) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    }

    return res.status(200).json({ success: true, incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

async function resolveIncident(req, res) {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "monitor",
      "user",
    );

    if (!incident) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    }

    // Do not allow resolving another user's incident.
    if (String(incident.monitor.user) !== String(req.user._id)) {
      return res
        .status(404)
        .json({ success: false, message: "Incident not found" });
    }

    if (incident.status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        message: "Incident already resolved",
      });
    }

    incident.status = "RESOLVED";
    incident.resolvedAt = new Date();
    incident.duration = incident.resolvedAt - incident.startedAt;

    await incident.save();

    return res.status(200).json({ success: true, incident });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getIncidents,
  getMonitorIncidents,
  getSingleIncident,
  resolveIncident,
};
