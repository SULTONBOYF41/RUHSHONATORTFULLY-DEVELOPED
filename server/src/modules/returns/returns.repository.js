const { run, get, all } = require('../../db/connection');

/**
 * Yangi qaytish (vazvrat) yozish:
 *  - returns (status = PENDING)
 *  - return_items
 *  Ombor harakatlari hali YO‘Q – faqat admin tasdiqlaganda yoziladi.
 */
async function createReturn({ branchId, date, comment, items, userId }) {
    const returnDate = date || new Date().toISOString().slice(0, 10);

    await run('BEGIN TRANSACTION');

    try {
        // 1) returns header
        const result = await run(
            `
        INSERT INTO returns (branch_id, return_date, status, comment, created_by)
        VALUES (?, ?, 'PENDING', ?, ?)
      `,
            [branchId, returnDate, comment || null, userId || null]
        );

        const returnId = result.lastID;

        // 2) return_items
        for (const item of items) {
            const qty = Number(item.quantity);

            await run(
                `
          INSERT INTO return_items (return_id, product_id, quantity, unit, reason)
          VALUES (?, ?, ?, ?, ?)
        `,
                [
                    returnId,
                    item.product_id,
                    qty,
                    item.unit || null,
                    item.reason || null,
                ]
            );
        }

        await run('COMMIT');

        const header = await get(
            `
        SELECT
          r.id,
          r.branch_id,
          b.name AS branch_name,
          r.return_date,
          r.status,
          r.comment,
          r.created_at
        FROM returns r
        LEFT JOIN branches b ON b.id = r.branch_id
        WHERE r.id = ?
      `,
            [returnId]
        );

        return header;
    } catch (err) {
        await run('ROLLBACK');
        throw err;
    }
}

/**
 * Qaytishlar ro‘yxati
 */
async function listReturns({ branchId, status, dateFrom, dateTo, limit, offset }) {
    const params = [];
    const conds = [];

    if (branchId) {
        conds.push('r.branch_id = ?');
        params.push(branchId);
    }

    if (status) {
        conds.push('r.status = ?');
        params.push(status);
    }

    if (dateFrom) {
        conds.push('r.return_date >= ?');
        params.push(dateFrom);
    }

    if (dateTo) {
        conds.push('r.return_date <= ?');
        params.push(dateTo);
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    params.push(limit, offset);

    const rows = await all(
        `
      SELECT
        r.id,
        r.return_date,
        r.branch_id,
        b.name AS branch_name,
        r.status,
        r.comment,
        IFNULL(SUM(ri.quantity), 0) AS total_quantity,
        COUNT(ri.id) AS item_count
      FROM returns r
      JOIN return_items ri ON ri.return_id = r.id
      LEFT JOIN branches b ON b.id = r.branch_id
      ${where}
      GROUP BY r.id, r.return_date, r.branch_id, b.name, r.status, r.comment
      ORDER BY r.return_date DESC, r.id DESC
      LIMIT ? OFFSET ?
    `,
        params
    );

    return rows;
}

/**
 * Bitta qaytishning to‘liq ma’lumoti (header + items)
 */
async function getReturnById(id) {
    const header = await get(
        `
      SELECT
        r.id,
        r.return_date,
        r.branch_id,
        b.name AS branch_name,
        r.status,
        r.comment,
        r.created_at
      FROM returns r
      LEFT JOIN branches b ON b.id = r.branch_id
      WHERE r.id = ?
    `,
        [id]
    );

    if (!header) return null;

    const items = await all(
        `
      SELECT
        ri.id,
        ri.product_id,
        p.name AS product_name,
        ri.quantity,
        ri.unit,
        ri.reason
      FROM return_items ri
      JOIN products p ON p.id = ri.product_id
      WHERE ri.return_id = ?
      ORDER BY ri.id ASC
    `,
        [id]
    );

    return { header, items };
}

/**
 * Admin qaytishni tasdiqlaydi:
 *  - returns.status = 'APPROVED'
 *  - warehouse_movements:
 *      * filial omboridan OUT
 *      * markaziy omborga IN (branch_id = NULL)
 */
async function approveReturn(id, adminId) {
    await run('BEGIN TRANSACTION');

    try {
        const header = await get(
            `
        SELECT
          r.id,
          r.branch_id,
          r.status
        FROM returns r
        WHERE r.id = ?
      `,
            [id]
        );

        if (!header) {
            throw new Error('Qaytish topilmadi.');
        }

        if (header.status !== 'PENDING') {
            throw new Error('Faqat PENDING holatidagi qaytish tasdiqlanadi.');
        }

        const items = await all(
            `
        SELECT
          ri.product_id,
          ri.quantity
        FROM return_items ri
        WHERE ri.return_id = ?
      `,
            [id]
        );

        if (!items || items.length === 0) {
            throw new Error('Qaytishda hech qanday mahsulot yo‘q.');
        }

        // Ombor harakatlari
        for (const it of items) {
            const qty = Number(it.quantity);

            // Filial omboridan OUT
            await run(
                `
          INSERT INTO warehouse_movements (product_id, branch_id, movement_type, source_type, source_id, quantity)
          VALUES (?, ?, 'OUT', 'RETURN', ?, ?)
        `,
                [it.product_id, header.branch_id, header.id, qty]
            );

            // Markaziy omborga IN (branch_id = NULL)
            await run(
                `
          INSERT INTO warehouse_movements (product_id, branch_id, movement_type, source_type, source_id, quantity)
          VALUES (?, NULL, 'IN', 'RETURN', ?, ?)
        `,
                [it.product_id, header.id, header.id, qty]
            );
        }

        // returns.status = APPROVED
        await run(
            `
        UPDATE returns
        SET status = 'APPROVED'
        WHERE id = ?
      `,
            [id]
        );

        await run('COMMIT');
    } catch (err) {
        await run('ROLLBACK');
        throw err;
    }
}

module.exports = {
    createReturn,
    listReturns,
    getReturnById,
    approveReturn,
};
