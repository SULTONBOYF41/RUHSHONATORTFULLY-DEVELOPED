const repo = require('./expenses.repository');

const VALID_TYPES = ['ingredients', 'decor', 'utility'];

/**
 * Kiritilgan xarajat payloadini tekshiradi.
 *
 * payload:
 *  - type: 'ingredients' | 'decor' | 'utility'
 *  - date?: 'YYYY-MM-DD' (ixtiyoriy, bo'lmasa bugungi sana bo'lishi mumkin)
 *  - branch_id?: number | null
 *  - items: [
 *      {
 *        name: string,
 *        product_id?: number | null,
 *        quantity: number,
 *        unit?: string,
 *        price: number
 *      }, ...
 *    ]
 */
function validateExpenseInput(payload) {
    if (!payload || typeof payload !== 'object') {
        throw new Error('Xarajat ma’lumotlari kiritilmadi.');
    }

    const { type, items } = payload;

    if (!type || !VALID_TYPES.includes(type)) {
        throw new Error('Xarajat turi noto‘g‘ri. Ruxsat etilgan turlar: ingredients, decor, utility.');
    }

    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Kamida bitta xarajat bandini kiriting.');
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i] || {};
        const row = i + 1;

        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
            throw new Error(`(${row}-qatorda) nom maydoni majburiy.`);
        }

        const quantity = Number(item.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new Error(`(${row}-qatorda) miqdor noto‘g‘ri.`);
        }

        const price = Number(item.price);
        if (!Number.isFinite(price) || price < 0) {
            throw new Error(`(${row}-qatorda) narx noto‘g‘ri.`);
        }

        // unit bo'sh bo'lsa ham bo'ladi, lekin string bo'lishi kerak
        if (item.unit != null && typeof item.unit !== 'string') {
            throw new Error(`(${row}-qatorda) o‘lchov birligi noto‘g‘ri.`);
        }
    }
}

/**
 * Yangi xarajat yaratish.
 * Bu yerda validatsiya qilamiz, asosiy yozish logikasi repo ichida.
 * Agar sendagi repo dekor xarajatlarni omborga yozadigan qilib qilgan bo'lsa,
 * bu service uni buzmaydi — shunchaki repo.createExpense()ni chaqiradi.
 */
async function createExpense(payload) {
    // Kiruvchi ma'lumotlarni tekshiramiz
    validateExpenseInput(payload);

    // Repo orqali DBga yozamiz (expenses + expense_items (+ kerak bo'lsa warehouse_movements))
    const expense = await repo.createExpense(payload);
    return expense;
}

/**
 * Xarajatlarni turiga qarab olish:
 *  type: 'ingredients' | 'decor' | 'utility' | 'all'
 *
 * Frontend: GET /api/expenses?type=ingredients
 */
async function getExpensesByType(type = 'all') {
    let normalizedType = type;

    if (!normalizedType || normalizedType === 'undefined') {
        normalizedType = 'all';
    }

    if (normalizedType !== 'all' && !VALID_TYPES.includes(normalizedType)) {
        throw new Error('Xarajat turi noto‘g‘ri.');
    }

    // Agar repo ichida getExpensesByType bo'lsa – undan foydalanamiz
    if (typeof repo.getExpensesByType === 'function') {
        return repo.getExpensesByType(normalizedType);
    }

    // Aks holda eski nom bilan bo'lishi mumkin (getExpenses)
    if (typeof repo.getExpenses === 'function') {
        return repo.getExpenses(normalizedType);
    }

    // Hech narsa topilmasa – bo'sh massiv qaytaramiz, xato otmasdan
    return [];
}

/**
 * Xarajatni yangilash (agar kerak bo'lsa).
 * Hozircha optional, lekin foydali bo'lishi mumkin.
 */
async function updateExpense(id, payload) {
    if (!id) {
        throw new Error('Xarajat ID ko‘rsatilmagan.');
    }

    validateExpenseInput(payload);

    if (typeof repo.updateExpense !== 'function') {
        throw new Error('updateExpense funksiyasi hali implement qilinmagan.');
    }

    const updated = await repo.updateExpense(id, payload);
    return updated;
}

/**
 * Xarajatni o‘chirish (agar kerak bo'lsa).
 */
async function deleteExpense(id) {
    if (!id) {
        throw new Error('Xarajat ID ko‘rsatilmagan.');
    }

    if (typeof repo.deleteExpense !== 'function') {
        throw new Error('deleteExpense funksiyasi hali implement qilinmagan.');
    }

    const result = await repo.deleteExpense(id);
    return result;
}

module.exports = {
    createExpense,
    getExpensesByType,
    updateExpense,
    deleteExpense,
    // Agar boshqa joylarda validateExpenseInput alohida kerak bo'lsa:
    validateExpenseInput,
};
