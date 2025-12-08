const { all, get } = require('../../db/connection');

/**
 * Filial haqida ma'lumot olish (use_central_stock ni bilish uchun)
 */
async function getBranchById(branchId) {
  if (!branchId) return null;

  const row = await get(
    `
      SELECT
        id,
        name,
        IFNULL(use_central_stock, 0) AS use_central_stock
      FROM branches
      WHERE id = ?
    `,
    [branchId]
  );

  return row || null;
}

/**
 * Hozirgi qoldiqni qaytaradi:
 *   - product_id
 *   - product_name
 *   - unit
 *   - branch_id (NULL bo‘lsa – markaziy ombor)
 *   - branch_name
 *   - quantity (hozirgi qoldiq)
 *
 * MANTIQ:
 *   - branches.use_central_stock = 1 bo‘lsa,
 *     o‘sha filialning harakatlari "Markaziy ombor" bilan BIRGA hisoblanadi.
 *   - Ya'ni, logical_branch_id = NULL bo'ladi va Markaziy ombor qatori bilan qo‘shiladi.
 *
 *   - branchId parametri:
 *       * null / undefined => hamma (markaziy + barcha alohida filiallar)
 *       * 'central'        => faqat Markaziy ombor (shu bilan birga ishlaydigan filiallar bilan birga)
 *       * <id> (raqam)     => agar bu filial use_central_stock=1 bo'lsa => Markaziy ombor qoldig‘i
 *                            aks holda => faqat o‘sha filial qoldig‘i
 */
async function getCurrentStock(branchId) {
  // Qaysi rejimda ishlayotganimizni aniqlaymiz
  let mode = 'all'; // 'all' | 'central' | 'branch' | 'none'
  let branchFilterId = null;

  if (!branchId) {
    mode = 'all';
  } else if (branchId === 'central') {
    // maxsus qiymat: admin filtrlashdan tanlagan "Markaziy ombor"
    mode = 'central';
  } else {
    // Muayyan filial id bo'yicha kelgan bo'lsa (branch user yoki admin filtri)
    const branch = await getBranchById(branchId);

    if (!branch) {
      mode = 'none'; // bunday filial yo‘q
    } else if (branch.use_central_stock) {
      // Bu filialning ombori yo'q, markaziy bilan birga ishlaydi
      mode = 'central';
    } else {
      // Oddiy filial – alohida ombor qoldig‘i
      mode = 'branch';
      branchFilterId = branch.id;
    }
  }

  if (mode === 'none') {
    return [];
  }

  // Asosiy umumiy subquery:
  // logical_branch_id / logical_branch_name – ombor turlarini birlashtirilgan ko‘rinishi
  let whereClause = '';
  const params = [];

  if (mode === 'central') {
    // faqat Markaziy ombor (va use_central_stock=1 bo'lgan filiallar bilan birga)
    whereClause = 'WHERE logical_branch_id IS NULL';
  } else if (mode === 'branch') {
    whereClause = 'WHERE logical_branch_id = ?';
    params.push(branchFilterId);
  }
  // 'all' bo'lsa whereClause bo'sh qoladi – hamma omborlar

  const sql = `
    SELECT
      x.product_id,
      x.product_name,
      x.unit,
      x.logical_branch_id AS branch_id,
      x.logical_branch_name AS branch_name,
      SUM(x.quantity_delta) AS quantity
    FROM (
      SELECT
        wm.product_id,
        p.name AS product_name,
        p.unit,
        -- logical_branch_id:
        --   * agar wm.branch_id NULL bo'lsa => Markaziy ombor
        --   * agar filial use_central_stock = 1 bo'lsa => Markaziy ombor bilan birga (NULL)
        --   * aks holda => o'z filial id
        CASE
          WHEN wm.branch_id IS NULL THEN NULL
          WHEN IFNULL(b.use_central_stock, 0) = 1 THEN NULL
          ELSE wm.branch_id
        END AS logical_branch_id,
        CASE
          WHEN wm.branch_id IS NULL THEN 'Markaziy ombor'
          WHEN IFNULL(b.use_central_stock, 0) = 1 THEN 'Markaziy ombor'
          ELSE b.name
        END AS logical_branch_name,
        CASE
          WHEN wm.movement_type = 'IN' THEN wm.quantity
          ELSE -wm.quantity
        END AS quantity_delta
      FROM warehouse_movements wm
      JOIN products p ON p.id = wm.product_id
      LEFT JOIN branches b ON b.id = wm.branch_id
    ) x
    ${whereClause}
    GROUP BY x.product_id, x.logical_branch_id
    HAVING quantity <> 0
    ORDER BY x.product_name ASC, x.logical_branch_name ASC
  `;

  const rows = await all(sql, params);

  return rows;
}

module.exports = {
  getCurrentStock,
};
