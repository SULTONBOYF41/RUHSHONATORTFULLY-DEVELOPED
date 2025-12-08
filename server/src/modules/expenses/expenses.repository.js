const { run, get } = require('../../db/connection');

/**
 * Xarajat yaratish:
 *  - expenses jadvaliga yozadi
 *  - agar type = 'decor' bo'lsa: expense_items ga product_id bilan yozadi
 *    va har bir item bo'yicha markaziy omborga IN qiladi
 */
async function createExpense({
    expense_date,
    type,
    total_amount,
    description,
    created_by,
    items,
}) {
    await run('BEGIN TRANSACTION');

    try {
        const result = await run(
            `
      INSERT INTO expenses
        (expense_date, type, total_amount, description, created_by, created_at)
      VALUES
        (?, ?, ?, ?, ?, datetime('now'))
      `,
            [expense_date, type, total_amount, description || null, created_by || null]
        );

        const expenseId = result.lastID;

        // Faqat decor uchun itemlar bilan ishlaymiz
        if (type === 'decor' && Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const { product_id, name, quantity, total_price } = item;

                // 1) expense_items jadvaliga yozamiz
                await run(
                    `
          INSERT INTO expense_items
            (expense_id, product_id, name, quantity, total_price)
          VALUES
            (?, ?, ?, ?, ?)
          `,
                    [
                        expenseId,
                        product_id || null,
                        name || null,
                        quantity || null,
                        total_price || null,
                    ]
                );

                // 2) Agar product_id bor bo'lsa – markaziy omborga IN
                if (product_id && quantity && quantity > 0) {
                    await run(
                        `
            INSERT INTO warehouse_movements
              (product_id, branch_id, movement_type, source_type, source_id, quantity, created_at)
            VALUES
              (?, NULL, 'IN', 'expense', ?, ?, datetime('now'))
            `,
                        [product_id, expenseId, quantity]
                    );
                }
            }
        }

        const row = await get(
            `
      SELECT id, expense_date, type, total_amount, description, created_by, created_at
      FROM expenses
      WHERE id = ?
      `,
            [expenseId]
        );

        await run('COMMIT');
        return row;
    } catch (err) {
        await run('ROLLBACK');
        throw err;
    }
}

module.exports = {
    createExpense,
};
