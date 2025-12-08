const service = require('./history.service');

async function getActivities(req, res) {
    try {
        // Auth middlewaredan keladi. Bo'lmasa, bo'sh object.
        const user = req.user || {};
        const role = user.role || null;

        const limit = parseInt(req.query.limit, 10) || 50;
        const offset = parseInt(req.query.offset, 10) || 0;

        let type = req.query.type || 'all';        // 'all' | 'sale' | 'production' | 'transfer'
        const dateFrom = req.query.date_from || null;
        const dateTo = req.query.date_to || null;
        let branchId = req.query.branch_id || null; // 'all' | 'central' | <id>

        /**
         * ROLE MANTIQI:
         *  - admin: query orqali kelgan filterlar ishlaydi
         *  - production: faqat ishlab chiqarish tarixi (hamma branch bo'yicha)
         *  - branch (filial/sales): faqat o'z filialining sotuvlari
         */

        if (role === 'production') {
            type = 'production';
            branchId = null; // hozircha ishlab chiqarishda branch bo'yicha filter yo'q
        } else if (role === 'branch') {
            type = 'sale';
            branchId = user.branch_id || null; // faqat o'z filialining sotuvlari
        }
        // admin bo'lsa hech narsa o'zgartirmaymiz – u type/branch filterlardan foydalanadi

        const activities = await service.getActivities({
            limit,
            offset,
            type,
            dateFrom,
            dateTo,
            branchId,
        });

        res.json(activities);
    } catch (err) {
        console.error('getActivities error:', err);
        res.status(500).json({ message: 'Tarixni olishda xatolik' });
    }
}

module.exports = {
    getActivities,
};
