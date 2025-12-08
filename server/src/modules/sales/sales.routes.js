const express = require('express');
const router = express.Router();
const controller = require('./sales.controller');

// Sotuv yaratish
// POST /api/sales
router.post('/', controller.createSale);

module.exports = router;
