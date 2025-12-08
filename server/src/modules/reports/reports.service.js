const repo = require('./reports.repository');

async function getOverview(date) {
    // Bitta funksiya hamma ma'lumotni qaytaradi
    const overview = await repo.getOverview(date);
    return overview;
}

module.exports = {
    getOverview,
};
