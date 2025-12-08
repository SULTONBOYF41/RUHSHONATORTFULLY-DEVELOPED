const service = require('./expenses.service');

// GET /api/expenses?type=ingredients|decor|utility|all
async function getExpenses(req, res) {
    try {
        const { type = 'all' } = req.query;
        const items = await service.getExpensesByType(type);
        res.json(items);
    } catch (err) {
        console.error('getExpenses error:', err);
        res
            .status(400)
            .json({ message: err.message || 'Xarajatlarni olishda xatolik' });
    }
}

// POST /api/expenses
async function createExpense(req, res) {
    try {
        const payload = req.body;
        const expense = await service.createExpense(payload);
        res.status(201).json(expense);
    } catch (err) {
        console.error('createExpense error:', err);
        res
            .status(400)
            .json({ message: err.message || 'Xarajatni yaratishda xatolik' });
    }
}

// PUT /api/expenses/:id
async function updateExpense(req, res) {
    try {
        const { id } = req.params;
        const payload = req.body;

        const updated = await service.updateExpense(id, payload);
        res.json(updated);
    } catch (err) {
        console.error('updateExpense error:', err);
        // Agar service ichida "hali implement qilinmagan" desak ham shu yerga tushadi
        res
            .status(400)
            .json({ message: err.message || 'Xarajatni yangilashda xatolik' });
    }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res) {
    try {
        const { id } = req.params;

        const result = await service.deleteExpense(id);
        res.json(result);
    } catch (err) {
        console.error('deleteExpense error:', err);
        res
            .status(400)
            .json({ message: err.message || 'Xarajatni o‘chirishda xatolik' });
    }
}

module.exports = {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
};
