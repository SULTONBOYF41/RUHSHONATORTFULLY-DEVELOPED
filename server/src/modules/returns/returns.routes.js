const express = require('express');
const router = express.Router();

const controller = require('./returns.controller');
const { requireAuth, requireRole } = require('../../middleware/auth');

// GET /api/returns  – admin + branch
router.get('/', requireAuth, controller.listReturns);

// GET /api/returns/:id  – admin + branch
router.get('/:id', requireAuth, controller.getReturnById);

// POST /api/returns  – branch (va hozircha admin ham istasa)
router.post('/', requireAuth, controller.createReturn);

// POST /api/returns/:id/approve – faqat admin
router.post(
    '/:id/approve',
    requireAuth,
    requireRole('admin'),
    controller.approveReturn
);

module.exports = router;
