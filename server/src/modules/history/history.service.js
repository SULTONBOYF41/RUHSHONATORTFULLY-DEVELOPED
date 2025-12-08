const repo = require('./history.repository');

async function getActivities({ limit, offset, type, dateFrom, dateTo, branchId }) {
    const items = await repo.getActivities({
        limit,
        offset,
        type,
        dateFrom,
        dateTo,
        branchId,
    });
    return items;
}

module.exports = {
    getActivities,
};
