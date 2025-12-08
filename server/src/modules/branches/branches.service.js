const repo = require('./branches.repository');

/**
 * Yangi / yangilangan filial inputini tekshirish
 */
function validateBranchInput(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Filial ma’lumotlari kiritilmadi.');
    }

    if (!data.name || !String(data.name).trim()) {
        throw new Error('Filial nomi majburiy.');
    }

    if (
        data.use_central_stock != null &&
        ![0, 1, '0', '1', true, false].includes(data.use_central_stock)
    ) {
        throw new Error('use_central_stock noto‘g‘ri qiymat qabul qildi.');
    }
}

/**
 * Barcha filiallar
 */
async function getBranches() {
    const branches = await repo.getAllBranches();
    return branches;
}

/**
 * Yangi filial yaratish
 */
async function createBranch(data) {
    validateBranchInput(data);

    const payload = {
        name: String(data.name).trim(),
        is_active:
            data.is_active != null
                ? Number(data.is_active) ? 1 : 0
                : 1,
        use_central_stock:
            data.use_central_stock != null
                ? Number(data.use_central_stock) ? 1 : 0
                : 0,
    };

    const created = await repo.createBranch(payload);
    return created;
}

/**
 * Filialni yangilash
 */
async function updateBranch(id, data) {
    validateBranchInput({
        ...data,
        name: data.name ?? '', // nomini tekshiramiz
    });

    const payload = {
        name: String(data.name).trim(),
        // is_active opsional
        ...(data.is_active != null && {
            is_active: Number(data.is_active) ? 1 : 0,
        }),
        ...(data.use_central_stock != null && {
            use_central_stock: Number(data.use_central_stock) ? 1 : 0,
        }),
    };

    const updated = await repo.updateBranch(id, payload);
    return updated;
}

/**
 * Filialni o'chirish (soft delete)
 */
async function deleteBranch(id) {
    const result = await repo.deleteBranch(id);
    return result;
}

module.exports = {
    getBranches,
    createBranch,
    updateBranch,
    deleteBranch,
};
