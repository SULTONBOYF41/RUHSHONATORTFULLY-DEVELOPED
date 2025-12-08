const service = require('./reports.service');

async function getOverview(req, res) {
    try {
        let { date } = req.query;

        // Sana berilmasa – bugungi sanani olamiz (YYYY-MM-DD)
        if (!date) {
            const now = new Date();
            date = now.toISOString().slice(0, 10);
        }

        const data = await service.getOverview(date);
        res.json({ date, ...data });
    } catch (err) {
        console.error('getOverview error:', err);
        res.status(500).json({ message: 'Hisobotni olishda xatolik' });
    }
}

module.exports = {
    getOverview,
};
