const express = require('express');
const router = express.Router();
const controller = require('./warehouse.controller');

// GET /api/warehouse/stock
router.get('/stock', controller.getCurrentStock);

module.exports = router;
