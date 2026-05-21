const express = require('express');

const router = express.Router();

const {
   createMonitor,
   getMonitors,
   deleteMonitor
} = require('../controllers/monitorController.js');

const protect = require('../middleware/authMiddleware');

router.post('/createMonitor', protect, createMonitor);

router.get('/getMonitor', protect, getMonitors);

router.delete('/deleteMonitor/:id', protect, deleteMonitor);

module.exports = router;