// server/src/modules/transfers/transfers.service.js

const repo = require("./transfers.repository");

function validateCreateInput(data = {}) {
    const { transfer_date, to_branch_id, note, created_by, items } = data;

    if (!transfer_date) {
        throw new Error("transfer_date majburiy (YYYY-MM-DD)");
    }

    const toBranch = Number(to_branch_id);
    if (!toBranch) {
        throw new Error("Filialni / do‘konni tanlash majburiy");
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Kamida bitta mahsulot kiritish kerak");
    }

    const cleanedItems = items
        .map((i) => ({
            product_id: Number(i.product_id) || 0,
            quantity: Number(i.quantity) || 0,
        }))
        .filter((i) => i.product_id && i.quantity > 0);

    if (cleanedItems.length === 0) {
        throw new Error(
            "Kamida bitta to‘g‘ri satr kerak (product_id va quantity > 0)"
        );
    }

    return {
        transfer_date,
        to_branch_id: toBranch,
        note: note || null,
        created_by: created_by ? Number(created_by) : null,
        items: cleanedItems,
    };
}

/**
 * Yangi transfer yaratish
 *  - created_by ni user.id bilan to‘ldiramiz
 */
async function createTransfer(data, user) {
    const payload = {
        ...data,
        created_by: user?.id || data?.created_by || null,
    };

    const valid = validateCreateInput(payload);
    return repo.createTransfer(valid);
}

async function getAllTransfers() {
    return repo.findAll();
}

async function getTransferById(id) {
    const t = await repo.findById(id);
    if (!t) throw new Error("Transfer topilmadi");
    return t;
}

async function getIncomingForBranch(branchId) {
    const id = Number(branchId);
    if (!id) throw new Error("Branch ID noto'g'ri");
    return repo.findIncomingForBranch(id);
}

async function acceptItem(transferId, itemId, branchId) {
    return repo.acceptItem({
        transferId: Number(transferId),
        itemId: Number(itemId),
        branchId: Number(branchId),
    });
}

async function rejectItem(transferId, itemId, branchId) {
    return repo.rejectItem({
        transferId: Number(transferId),
        itemId: Number(itemId),
        branchId: Number(branchId),
    });
}

/**
 * Transferni tahrirlash (faqat PENDING / barcha bandlari PENDING)
 */
async function updateTransfer(id, data, user) {
    const payload = {
        ...data,
        created_by: user?.id || data?.created_by || null,
    };

    const valid = validateCreateInput(payload);
    return repo.updateTransfer({
        id: Number(id),
        ...valid,
    });
}

/**
 * Transferni bekor qilish / "o‘chirish"
 */
async function cancelTransfer(id) {
    await repo.cancelTransfer(Number(id));
}

module.exports = {
    createTransfer,
    getAllTransfers,
    getTransferById,
    getIncomingForBranch,
    acceptItem,
    rejectItem,
    updateTransfer,
    cancelTransfer,
};
