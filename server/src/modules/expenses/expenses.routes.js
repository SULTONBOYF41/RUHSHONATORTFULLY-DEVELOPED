const express = require('express');
const router = express.Router();

const controller = require('./expenses.controller');

// GET /api/expenses?type=ingredients|decor|utility|all
router.get('/', controller.getExpenses);

// POST /api/expenses
router.post('/', controller.createExpense);

// PUT /api/expenses/:id  (hozircha service.updateExpense ishlaydi,
// agar repo'da updateExpense implement qilinmagan bo'lsa, 501 / xato qaytishi mumkin)
router.put('/:id', controller.updateExpense);

// DELETE /api/expenses/:id
router.delete('/:id', controller.deleteExpense);

module.exports = router;
