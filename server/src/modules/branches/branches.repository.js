// server/src/modules/branches/branches.repository.js

const { all, get, run } = require('../../db/connection');

/**
 * Barcha filial/do‘konlarni olish.
 */
async function getAllBranches() {
  const rows = await all(
    `
      SELECT
        id,
        name,
        IFNULL(is_active, 1) AS is_active,
        IFNULL(use_central_stock, 0) AS use_central_stock,
        branch_type
      FROM branches
      ORDER BY id ASC
    `,
    []
  );

  return rows;
}

/**
 * Bitta joyni id bo'yicha olish
 */
async function getBranchById(id) {
  const row = await get(
    `
      SELECT
        id,
        name,
        IFNULL(is_active, 1) AS is_active,
        IFNULL(use_central_stock, 0) AS use_central_stock,
        branch_type
      FROM branches
      WHERE id = ?
    `,
    [id]
  );

  return row || null;
}

/**
 * Yangi joy (filial/do‘kon) yaratish
 */
async function createBranch(data) {
  const name = (data.name || '').trim();
  const isActive =
    typeof data.is_active === 'number' ? data.is_active : 1;
  const useCentral =
    typeof data.use_central_stock === 'number'
      ? data.use_central_stock
      : 0;
  const branchType = (data.branch_type || 'BRANCH').toUpperCase();

  const result = await run(
    `
      INSERT INTO branches (name, is_active, use_central_stock, branch_type)
      VALUES (?, ?, ?, ?)
    `,
    [name, isActive, useCentral, branchType]
  );

  const created = await getBranchById(result.lastID);
  return created;
}

/**
 * Joyni yangilash
 */
async function updateBranch(id, data) {
  const existing = await getBranchById(id);
  if (!existing) {
    throw new Error('Filial/do‘kon topilmadi.');
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
  const branchType =
    data.branch_type != null
      ? String(data.branch_type).toUpperCase()
      : existing.branch_type || 'BRANCH';

  await run(
    `
      UPDATE branches
      SET
        name = ?,
        is_active = ?,
        use_central_stock = ?,
        branch_type = ?
      WHERE id = ?
    `,
    [name, isActive, useCentral, branchType, id]
  );

  const updated = await getBranchById(id);
  return updated;
}

/**
 * Soft delete
 */
async function deleteBranch(id) {
  const existing = await getBranchById(id);
  if (!existing) {
    throw new Error('Filial/do‘kon topilmadi.');
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
