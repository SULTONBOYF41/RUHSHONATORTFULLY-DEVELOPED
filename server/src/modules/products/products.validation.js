// server/src/modules/products/products.validation.js

const ALLOWED_UNITS = ['kg', 'piece'];        // piece = donali
const ALLOWED_CATEGORIES = ['PRODUCT', 'DECORATION'];

function validateProduct(data = {}) {
    const { name, unit, category, price } = data;

    if (!name || typeof name !== 'string' || !name.trim()) {
        throw new Error("Mahsulot nomi majburiy");
    }

    if (!unit || typeof unit !== 'string') {
        throw new Error("Mahsulot birligini (unit) kiriting");
    }

    const normUnit = unit.toLowerCase().trim();
    // Frontenddan 'kg' yoki 'dona' kelishi mumkin, 'dona' ni piece ga o'girib olamiz
    let finalUnit;
    if (normUnit === 'kg') {
        finalUnit = 'kg';
    } else if (normUnit === 'dona' || normUnit === 'piece') {
        finalUnit = 'piece';
    } else {
        throw new Error("Mahsulot birligi noto'g'ri. Ruxsat etilgan: kg, dona");
    }

    let finalCategory = category || 'PRODUCT';
    finalCategory = finalCategory.toUpperCase();

    if (!ALLOWED_CATEGORIES.includes(finalCategory)) {
        throw new Error("Kategoriya noto'g'ri. Ruxsat etilgan: PRODUCT yoki DECORATION");
    }

    const finalPrice = Number(price) || 0;
    if (finalPrice < 0) {
        throw new Error("Narx manfiy bo'lishi mumkin emas");
    }

    return {
        name: name.trim(),
        unit: finalUnit,
        category: finalCategory,
        price: finalPrice,
    };
}

module.exports = {
    validateProduct,
    ALLOWED_UNITS,
    ALLOWED_CATEGORIES,
};
