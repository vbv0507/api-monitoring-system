const express = require("express");

const router = express.Router();

const {
  getIncidents,
  getMonitorIncidents,
  getSingleIncident,
  resolveIncident,
} = require("../controllers/incidentController");

const protect = require("../middleware/authMiddleware");

// Get all incidents for logged in user's monitors.
router.get("/", protect, getIncidents);

// Get incidents for one monitor.
router.get("/monitor/:monitorId", protect, getMonitorIncidents);

// Resolve an open incident manually.
router.put("/:id/resolve", protect, resolveIncident);

// Get one incident by id.
router.get("/:id", protect, getSingleIncident);

module.exports = router;
