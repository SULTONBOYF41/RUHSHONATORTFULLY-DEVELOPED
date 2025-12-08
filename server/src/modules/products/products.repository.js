const { run, all, get } = require('../../db/connection');

async function findAll() {
  const query = `
    SELECT id, name, unit, category, price, created_at, updated_at
    FROM products
    ORDER BY id ASC
  `;
  return all(query);
}

async function findDecorations() {
  const query = `
    SELECT id, name, unit, category, price, created_at, updated_at
    FROM products
    WHERE category = 'DECORATION'
    ORDER BY name ASC
  `;
  return all(query);
}

async function findById(id) {
  const query = `
    SELECT id, name, unit, category, price, created_at, updated_at
    FROM products
    WHERE id = ?
  `;
  return get(query, [id]);
}

async function create({ name, unit, category, price }) {
  const query = `
    INSERT INTO products (name, unit, category, price, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `;
  const result = await run(query, [name, unit, category || 'PRODUCT', price || 0]);
  const insertedId = result.lastID;
  return findById(insertedId);
}

async function update(id, { name, unit, category, price }) {
  const query = `
    UPDATE products
    SET
      name = ?,
      unit = ?,
      category = ?,
      price = ?,
      updated_at = datetime('now')
    WHERE id = ?
  `;
  await run(query, [name, unit, category || 'PRODUCT', price || 0, id]);
  return findById(id);
}

async function remove(id) {
  // Hozircha hard delete – kerak bo'lsa keyin soft-delete qo'shamiz
  const query = `DELETE FROM products WHERE id = ?`;
  await run(query, [id]);
}

module.exports = {
  findAll,
  findDecorations,
  findById,
  create,
  update,
  remove,
};
