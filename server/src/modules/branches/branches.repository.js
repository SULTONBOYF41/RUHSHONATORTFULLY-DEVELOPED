const { all, get, run } = require('../../db/connection');

/**
 * Barcha filiallarni olish.
 * Faol / nofaol hammasini qaytaramiz, front tarafda istasang filter qilasan.
 */
async function getAllBranches() {
  const rows = await all(
    `
      SELECT
        id,
        name,
        IFNULL(is_active, 1) AS is_active,
        IFNULL(use_central_stock, 0) AS use_central_stock
      FROM branches
      ORDER BY id ASC
    `,
    []
  );

  return rows;
}

/**
 * Bitta filialni id bo'yicha olish
 */
async function getBranchById(id) {
  const row = await get(
    `
      SELECT
        id,
        name,
        IFNULL(is_active, 1) AS is_active,
        IFNULL(use_central_stock, 0) AS use_central_stock
      FROM branches
      WHERE id = ?
    `,
    [id]
  );

  return row || null;
}

/**
 * Yangi filial yaratish
 *
 * data:
 *  - name: string
 *  - is_active?: number (0/1) – default 1
 *  - use_central_stock?: number (0/1) – default 0
 */
async function createBranch(data) {
  const name = (data.name || '').trim();
  const isActive =
    typeof data.is_active === 'number' ? data.is_active : 1;
  const useCentral =
    typeof data.use_central_stock === 'number'
      ? data.use_central_stock
      : 0;

  const result = await run(
    `
      INSERT INTO branches (name, is_active, use_central_stock)
      VALUES (?, ?, ?)
    `,
    [name, isActive, useCentral]
  );

  const created = await getBranchById(result.lastID);
  return created;
}

/**
 * Filialni yangilash
 *
 * data:
 *  - name?: string
 *  - is_active?: number (0/1)
 *  - use_central_stock?: number (0/1)
 */
async function updateBranch(id, data) {
  const existing = await getBranchById(id);
  if (!existing) {
    throw new Error('Filial topilmadi.');
  }

  const name =
    data.name != null ? String(data.name).trim() : existing.name;
  const isActive =
    typeof data.is_active === 'number'
      ? data.is_active
      : existing.is_active;
  const useCentral =
    typeof data.use_central_stock === 'number'
      ? data.use_central_stock
      : existing.use_central_stock;

  await run(
    `
      UPDATE branches
      SET
        name = ?,
        is_active = ?,
        use_central_stock = ?
      WHERE id = ?
    `,
    [name, isActive, useCentral, id]
  );

  const updated = await getBranchById(id);
  return updated;
}

/**
 * Filialni "o'chirish"
 * Haqiqiy DELETE emas, faqat is_active = 0 qilamiz (soft delete)
 */
async function deleteBranch(id) {
  const existing = await getBranchById(id);
  if (!existing) {
    throw new Error('Filial topilmadi.');
  }

  await run(
    `
      UPDATE branches
      SET is_active = 0
      WHERE id = ?
    `,
    [id]
  );

  const updated = await getBranchById(id);
  return updated;
}

module.exports = {
  getAllBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};
