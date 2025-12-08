const express = require('express');
const router = express.Router();
const controller = require('./reports.controller');

// GET /api/reports/overview?date=2025-12-05
router.get('/overview', controller.getOverview);

module.exports = router;
