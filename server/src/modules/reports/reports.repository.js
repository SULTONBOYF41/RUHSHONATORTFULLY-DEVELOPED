// server/src/modules/reports/reports.repository.js
const { get, all } = require('../../db/connection');

async function getOverview(date) {
  // 1) Filiallar (oddiy branchlar)
  const branchesRow = await get(
    `
      SELECT COUNT(*) AS total
      FROM branches
      WHERE is_active = 1
        AND (UPPER(branch_type) = 'BRANCH' OR branch_type IS NULL)
    `,
    []
  );

  // 2) Ulgurji do'konlar (OUTLET)
  const outletsRow = await get(
    `
      SELECT COUNT(*) AS total
      FROM branches
      WHERE is_active = 1
        AND UPPER(branch_type) = 'OUTLET'
    `,
    []
  );

  // 3) Foydalanuvchilar
  const usersRow = await get(
    `SELECT COUNT(*) AS total FROM users WHERE is_active = 1`,
    []
  );

  // 4) Mahsulotlar
  const productsRow = await get(
    `SELECT COUNT(*) AS total FROM products`,
    []
  );

  // 5) Kunlik savdo (jami va cheklar soni)
  const salesRow = await get(
    `
      SELECT 
        IFNULL(SUM(total_amount), 0) AS total_amount,
        COUNT(*) AS sale_count
      FROM sales
      WHERE sale_date = ?
    `,
    [date]
  );

  // 6) Eng ko‘p sotilgan mahsulotlar (shu kun)
  const topProducts = await all(
    `
      SELECT
        p.id   AS product_id,
        p.name AS product_name,
        b.name AS branch_name,
        SUM(si.quantity)        AS sold_quantity,
        IFNULL(SUM(si.total_price), 0) AS total_amount
      FROM sale_items si
      JOIN sales    s ON s.id = si.sale_id
      JOIN products p ON p.id = si.product_id
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.sale_date = ?
      GROUP BY p.id, p.name, b.name
      ORDER BY sold_quantity DESC
      LIMIT 10
    `,
    [date]
  );

  // 7) Oylik savdo (shu sananing oyi bo‘yicha)
  const monthlySales = await all(
    `
      SELECT
        sale_date,
        IFNULL(SUM(total_amount), 0) AS total_amount,
        COUNT(*) AS sale_count
      FROM sales
      WHERE strftime('%Y-%m', sale_date) = strftime('%Y-%m', ?)
      GROUP BY sale_date
      ORDER BY sale_date ASC
    `,
    [date]
  );

  // 8) Kunlik xarajatlar (jami)
  const expenseTotalRow = await get(
    `
      SELECT
        IFNULL(SUM(ei.total_price), 0) AS total_amount
      FROM expenses e
      JOIN expense_items ei ON ei.expense_id = e.id
      WHERE e.expense_date = ?
    `,
    [date]
  );

  // 9) Xarajat turlari bo‘yicha
  const expensesByType = await all(
    `
      SELECT
        e.type AS expense_type,
        IFNULL(SUM(ei.total_price), 0) AS total_amount
      FROM expenses e
      JOIN expense_items ei ON ei.expense_id = e.id
      WHERE e.expense_date = ?
      GROUP BY e.type
    `,
    [date]
  );

  // 10) Ishlab chiqarish bo‘yicha ma'lumot
  const productionRow = await get(
    `
      SELECT
        COUNT(DISTINCT pb.id) AS batch_count,
        IFNULL(SUM(pi.quantity), 0) AS total_quantity
      FROM production_batches pb
      LEFT JOIN production_items pi ON pi.batch_id = pb.id
      WHERE pb.batch_date = ?
    `,
    [date]
  );

  // 11) Filiallar bo‘yicha savdo (shu kun)
  const salesByBranch = await all(
    `
      SELECT
        b.id   AS branch_id,
        b.name AS branch_name,
        IFNULL(SUM(s.total_amount), 0) AS total_amount,
        COUNT(s.id) AS sale_count
      FROM sales s
      LEFT JOIN branches b ON b.id = s.branch_id
      WHERE s.sale_date = ?
      GROUP BY b.id, b.name
      ORDER BY total_amount DESC
    `,
    [date]
  );

  const todaySalesAmount = salesRow?.total_amount || 0;
  const todaySalesCount = salesRow?.sale_count || 0;
  const totalExpenses = expenseTotalRow?.total_amount || 0;
  const profit = todaySalesAmount - totalExpenses;

  return {
    stats: {
      totalBranches: branchesRow?.total || 0,
      totalOutlets: outletsRow?.total || 0,   // 👈 endi shu ishlaydi
      totalUsers: usersRow?.total || 0,
      totalProducts: productsRow?.total || 0,
      todaySalesAmount,
      todaySalesCount,
      totalExpenses,
      profit,
      productionBatchCount: productionRow?.batch_count || 0,
      productionQuantity: productionRow?.total_quantity || 0,
    },
    topProducts,
    monthlySales,
    salesByBranch,
    expensesByType,
  };
}

module.exports = {
  getOverview,
};
