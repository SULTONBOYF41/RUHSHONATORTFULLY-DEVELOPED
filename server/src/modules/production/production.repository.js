// server/src/modules/production/production.repository.js

const { run, get, all } = require("../../db/connection");

/**
 * Bir partiyani id bo'yicha olish (+ items)
 */
async function findBatchById(id) {
    const batch = await get(
        `
    SELECT
      pb.id,
      pb.batch_date,
      pb.shift,
      pb.created_by,
      pb.note,
      pb.created_at
    FROM production_batches pb
    WHERE pb.id = ?
    `,
        [id]
    );

    if (!batch) return null;

    const items = await all(
        `
    SELECT
      pi.id,
      pi.batch_id,
      pi.product_id,
      pi.quantity,
      p.name AS product_name,
      p.unit AS product_unit
    FROM production_items pi
    JOIN products p ON p.id = pi.product_id
    WHERE pi.batch_id = ?
    ORDER BY pi.id ASC
    `,
        [id]
    );

    return { ...batch, items };
}

/**
 * Yangi ishlab chiqarish partiyasi yaratish
 *  - production_batches ga yozadi
 *  - production_items ga yozadi
 *  - warehouse_movements ga IN yozadi (markaziy ombor)
 */
async function createBatch({ batch_date, shift, created_by, note, items }) {
    await run("BEGIN TRANSACTION");

    try {
        const result = await run(
            `
      INSERT INTO production_batches (batch_date, shift, created_by, note, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      `,
            [batch_date, shift || null, created_by || null, note || null]
        );

        const batchId = result.lastID;

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const productId = Number(item.product_id);
                const qty = Number(item.quantity);

                if (!productId || !qty || qty <= 0) continue;

                // production_items
                await run(
                    `
          INSERT INTO production_items (batch_id, product_id, quantity)
          VALUES (?, ?, ?)
          `,
                    [batchId, productId, qty]
                );

                // warehouse_movements: markaziy omborga IN
                await run(
                    `
          INSERT INTO warehouse_movements
            (product_id, branch_id, movement_type, source_type, source_id, quantity, created_at)
          VALUES
            (?, NULL, 'IN', 'production', ?, ?, datetime('now'))
          `,
                    [productId, batchId, qty]
                );
            }
        }

        await run("COMMIT");
        return findBatchById(batchId);
    } catch (err) {
        await run("ROLLBACK");
        throw err;
    }
}

/**
 * Partiyalar ro'yxati (ixtiyoriy sana bo'yicha filter)
 */
async function findBatches({ date } = {}) {
    let where = "";
    const params = [];

    if (date) {
        where = "WHERE pb.batch_date = ?";
        params.push(date);
    }

    const batches = await all(
        `
    SELECT
      pb.id,
      pb.batch_date,
      pb.shift,
      pb.created_by,
      pb.note,
      pb.created_at
    FROM production_batches pb
    ${where}
    ORDER BY pb.batch_date DESC, pb.id DESC
    `,
        params
    );

    // har bir batchga items ulab beramiz
    const result = [];
    for (const b of batches) {
        const items = await all(
            `
      SELECT
        pi.id,
        pi.batch_id,
        pi.product_id,
        pi.quantity,
        p.name AS product_name,
        p.unit AS product_unit
      FROM production_items pi
      JOIN products p ON p.id = pi.product_id
      WHERE pi.batch_id = ?
      ORDER BY pi.id ASC
      `,
            [b.id]
        );
        result.push({ ...b, items });
    }

    return result;
}

/**
 * Partiyani yangilash:
 *  - production_batches update
 *  - eski production_items va warehouse_movements (source_type='production') ni o'chirib tashlaydi
 *  - yangilarini qaytadan yozadi
 */
async function updateBatch(id, { batch_date, shift, created_by, note, items }) {
    await run("BEGIN TRANSACTION");

    try {
        await run(
            `
      UPDATE production_batches
      SET
        batch_date = ?,
        shift = ?,
        created_by = ?,
        note = ?
      WHERE id = ?
      `,
            [batch_date, shift || null, created_by || null, note || null, id]
        );

        // Eski items
        await run(`DELETE FROM production_items WHERE batch_id = ?`, [id]);

        // Eski ombor yozuvlari
        await run(
            `
      DELETE FROM warehouse_movements
      WHERE source_type = 'production' AND source_id = ?
      `,
            [id]
        );

        if (Array.isArray(items) && items.length > 0) {
            for (const item of items) {
                const productId = Number(item.product_id);
                const qty = Number(item.quantity);

                if (!productId || !qty || qty <= 0) continue;

                await run(
                    `
          INSERT INTO production_items (batch_id, product_id, quantity)
          VALUES (?, ?, ?)
          `,
                    [id, productId, qty]
                );

                await run(
                    `
          INSERT INTO warehouse_movements
            (product_id, branch_id, movement_type, source_type, source_id, quantity, created_at)
          VALUES
            (?, NULL, 'IN', 'production', ?, ?, datetime('now'))
          `,
                    [productId, id, qty]
                );
            }
        }

        await run("COMMIT");
        return findBatchById(id);
    } catch (err) {
        await run("ROLLBACK");
        throw err;
    }
}

/**
 * Partiyani o'chirish:
 *  - production_items
 *  - warehouse_movements (source_type=production)
 *  - production_batches
 */
async function deleteBatch(id) {
    await run("BEGIN TRANSACTION");

    try {
        await run(`DELETE FROM production_items WHERE batch_id = ?`, [id]);

        await run(
            `
      DELETE FROM warehouse_movements
      WHERE source_type = 'production' AND source_id = ?
      `,
            [id]
        );

        await run(`DELETE FROM production_batches WHERE id = ?`, [id]);

        await run("COMMIT");
    } catch (err) {
        await run("ROLLBACK");
        throw err;
    }
}

module.exports = {
    findBatchById,
    findBatches,
    createBatch,
    updateBatch,
    deleteBatch,
};
