const express = require('express');
const router = express.Router();

const controller = require('./history.controller');
const { requireAuth } = require('../../middleware/auth');

// GET /api/history/activities?...
router.get('/activities', requireAuth, controller.getActivities);

module.exports = router;
