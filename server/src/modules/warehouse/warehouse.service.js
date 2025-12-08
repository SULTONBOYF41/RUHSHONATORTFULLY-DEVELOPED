const repo = require('./warehouse.repository');

async function getCurrentStock(branchId) {
    const stock = await repo.getCurrentStock(branchId);
    return stock;
}

module.exports = {
    getCurrentStock,
};
