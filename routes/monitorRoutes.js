const express = require('express');

const router = express.Router();

const {
   createMonitor,
   getMonitors,
   deleteMonitor,
   updateMonitor,
   getMonitorLogs,
   getSingleMonitor,
} = require('../controllers/monitorController.js');

const protect = require('../middleware/authMiddleware');

router.get('/getMonitor', protect, getMonitors);

router.post('/createMonitor', protect, createMonitor);

router.delete('/deleteMonitor/:id', protect, deleteMonitor);

router.put('/updateMonitor/:id',protect,updateMonitor);

router.get('/:id/logs', protect, getMonitorLogs);

router.get('/:id', protect, getSingleMonitor);
module.exports = router;
