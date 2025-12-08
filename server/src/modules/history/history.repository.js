const { all } = require('../../db/connection');

/**
 * Umumiy tarix:
 *   - Sotuvlar
 *   - Ishlab chiqarish
 *   - Transferlar
 *
 * Qaytadigan ustunlar:
 *  - id
 *  - type: 'sale' | 'production' | 'transfer'
 *  - activity_date
 *  - branch_name
 *  - description
 *  - amount (agar mavjud bo'lsa, aks holda null)
 *  - status (faqat transferlar uchun)
 *
 * Filterlar:
 *  - type: 'all' | 'sale' | 'production' | 'transfer'
 *  - dateFrom, dateTo: 'YYYY-MM-DD'
 *  - branchId:
 *      * sale: s.branch_id = ?
 *      * transfer:
 *          - 'central' => from_branch_id IS NULL OR to_branch_id IS NULL
 *          - <id> => from_branch_id = ? OR to_branch_id = ?
 *      * production: hozircha branch bo'yicha filter yo'q
 */
async function getActivities({ limit, offset, type, dateFrom, dateTo, branchId }) {
  const parts = [];
  let params = [];

  // 1) Sotuvlar
  if (type === 'all' || type === 'sale') {
    const conds = [];
    const p = [];

    if (dateFrom) {
      conds.push('s.sale_date >= ?');
      p.push(dateFrom);
    }
    if (dateTo) {
      conds.push('s.sale_date <= ?');
      p.push(dateTo);
    }

    // Filial bo'yicha filter (faqat sotuvlar uchun)
    if (branchId && branchId !== 'all' && branchId !== 'central') {
      conds.push('s.branch_id = ?');
      p.push(branchId);
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    parts.push(`
      SELECT
        s.id AS id,
        'sale' AS type,
        s.sale_date AS activity_date,
        b.name AS branch_name,
        printf('Sotuv: %s', IFNULL(b.name, 'Filial')) AS description,
        s.total_amount AS amount,
        NULL AS status
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      ${where}
    `);

    params = params.concat(p);
  }

  // 2) Ishlab chiqarish (production_batches) – hozircha branch_id yo'q, shuning uchun filial bo'yicha filter qilmaymiz
  if (type === 'all' || type === 'production') {
    const conds = [];
    const p = [];

    if (dateFrom) {
      conds.push('pb.batch_date >= ?');
      p.push(dateFrom);
    }
    if (dateTo) {
      conds.push('pb.batch_date <= ?');
      p.push(dateTo);
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    parts.push(`
      SELECT
        pb.id AS id,
        'production' AS type,
        pb.batch_date AS activity_date,
        NULL AS branch_name,
        printf('Ishlab chiqarish partiyasi #%d', pb.id) AS description,
        NULL AS amount,
        NULL AS status
      FROM production_batches pb
      ${where}
    `);

    params = params.concat(p);
  }

  // 3) Transferlar
  if (type === 'all' || type === 'transfer') {
    const conds = [];
    const p = [];

    if (dateFrom) {
      conds.push('DATE(t.created_at) >= ?');
      p.push(dateFrom);
    }
    if (dateTo) {
      conds.push('DATE(t.created_at) <= ?');
      p.push(dateTo);
    }

    // Filial bo'yicha filter:
    if (branchId && branchId !== 'all') {
      if (branchId === 'central') {
        // Markaziy ombor qatnashgan transferlar
        conds.push('(t.from_branch_id IS NULL OR t.to_branch_id IS NULL)');
      } else {
        // Ma'lum filial qatnashgan transferlar
        conds.push('(t.from_branch_id = ? OR t.to_branch_id = ?)');
        p.push(branchId, branchId);
      }
    }

    const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';

    parts.push(`
      SELECT
        t.id AS id,
        'transfer' AS type,
        DATE(t.created_at) AS activity_date,
        printf('%s → %s', IFNULL(b_from.name, 'Markaziy ombor'), IFNULL(b_to.name, 'Markaziy ombor')) AS branch_name,
        printf('Transfer #%d', t.id) AS description,
        NULL AS amount,
        t.status AS status
      FROM transfers t
      LEFT JOIN branches b_from ON b_from.id = t.from_branch_id
      LEFT JOIN branches b_to ON b_to.id = t.to_branch_id
      ${where}
    `);

    params = params.concat(p);
  }

  if (!parts.length) {
    return [];
  }

  const sql = `
    ${parts.join('\nUNION ALL\n')}
    ORDER BY activity_date DESC, id DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const rows = await all(sql, params);
  return rows;
}

module.exports = {
  getActivities,
};
