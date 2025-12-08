const express = require('express');
const router = express.Router();

const controller = require('./branches.controller');
// agar auth middleware bor bo'lsa, shu yerdan ulab qo'yasan
// const { requireAuth, requireRole } = require('../../middleware/auth');

// GET /api/branches
router.get('/', /* requireAuth, requireRole('admin'), */ controller.getBranches);

// POST /api/branches
router.post('/', /* requireAuth, requireRole('admin'), */ controller.createBranch);

// PUT /api/branches/:id
router.put('/:id', /* requireAuth, requireRole('admin'), */ controller.updateBranch);

// DELETE /api/branches/:id
router.delete('/:id', /* requireAuth, requireRole('admin'), */ controller.deleteBranch);

module.exports = router;
