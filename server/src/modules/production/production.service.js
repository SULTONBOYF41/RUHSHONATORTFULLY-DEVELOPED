// server/src/modules/production/production.service.js

const repo = require("./production.repository");

function validateBatchInput(data = {}) {
    const { batch_date, shift, note, created_by, items } = data;

    if (!batch_date) {
        throw new Error("batch_date majburiy (YYYY-MM-DD)");
    }

    const cleaned = {
        batch_date,
        shift: shift || null,
        note: note || null,
        created_by: created_by ? Number(created_by) : null,
        items: [],
    };

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
            "Kamida bitta to'g'ri mahsulot kiritish kerak (product_id va quantity > 0)"
        );
    }

    cleaned.items = cleanedItems;
    return cleaned;
}

async function createBatch(data) {
    const valid = validateBatchInput(data);
    return repo.createBatch(valid);
}

async function getBatches(query) {
    const date = query?.date || null;
    return repo.findBatches({ date });
}

async function getBatchById(id) {
    const batch = await repo.findBatchById(id);
    if (!batch) {
        throw new Error("Partiya topilmadi");
    }
    return batch;
}

async function updateBatch(id, data) {
    const exists = await repo.findBatchById(id);
    if (!exists) {
        throw new Error("Partiya topilmadi");
    }
    const valid = validateBatchInput(data);
    return repo.updateBatch(id, valid);
}

async function deleteBatch(id) {
    const exists = await repo.findBatchById(id);
    if (!exists) {
        throw new Error("Partiya topilmadi");
    }
    await repo.deleteBatch(id);
}

module.exports = {
    createBatch,
    getBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
};
