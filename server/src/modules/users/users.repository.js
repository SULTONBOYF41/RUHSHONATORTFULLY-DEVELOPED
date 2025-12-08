// server/src/modules/users/users.repository.js

const { run, all, get } = require("../../db/connection");

async function findAll() {
  const query = `
    SELECT 
      u.id,
      u.full_name,
      u.username,
      u.role,
      u.branch_id,
      u.is_active,
      u.created_at,
      u.updated_at,
      b.name AS branch_name,
      b.code AS branch_code
    FROM users u
    LEFT JOIN branches b ON u.branch_id = b.id
    ORDER BY u.id DESC
  `;
  return all(query);
}

async function findById(id) {
  const query = `
    SELECT 
      u.id,
      u.full_name,
      u.username,
      u.role,
      u.branch_id,
      u.is_active,
      u.created_at,
      u.updated_at,
      b.name AS branch_name,
      b.code AS branch_code
    FROM users u
    LEFT JOIN branches b ON u.branch_id = b.id
    WHERE u.id = ?
  `;
  return get(query, [id]);
}

// LOGIN uchun username bo'yicha user (password_hash bilan)
async function findByUsername(username) {
  return get(
    `
    SELECT *
    FROM users
    WHERE username = ?
  `,
    [username]
  );
}

// Eski auth modul moslashishi uchun alias
async function findWithPasswordByUsername(username) {
  // aynan findByUsername bilan bir xil ish qiladi
  return findByUsername(username);
}

async function create({
  full_name,
  username,
  password_hash,
  role,
  branch_id,
  is_active,
}) {
  const result = await run(
    `
    INSERT INTO users (full_name, username, password_hash, role, branch_id, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `,
    [full_name, username, password_hash, role, branch_id || null, is_active ? 1 : 1]
  );
  const id = result.lastID;
  return findById(id);
}

async function update(
  id,
  { full_name, username, password_hash, role, branch_id, is_active }
) {
  // password_hash bo'sh bo'lsa eski qiymat o'zgarishsiz qolishi uchun COALESCE ishlatamiz
  await run(
    `
    UPDATE users
    SET
      full_name   = ?,
      username    = ?,
      role        = ?,
      branch_id   = ?,
      is_active   = ?,
      password_hash = COALESCE(?, password_hash),
      updated_at  = datetime('now')
    WHERE id = ?
  `,
    [
      full_name,
      username,
      role,
      branch_id || null,
      is_active ? 1 : 0,
      password_hash || null,
      id,
    ]
  );

  return findById(id);
}

async function remove(id) {
  await run(`DELETE FROM users WHERE id = ?`, [id]);
}

module.exports = {
  findAll,
  findById,
  findByUsername,
  findWithPasswordByUsername, // <-- auth shu nom bilan ishlata oladi
  create,
  update,
  remove,
};
