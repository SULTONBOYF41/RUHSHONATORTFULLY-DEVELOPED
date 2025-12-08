const repo = require('./products.repository');
const { validateProduct } = require('./products.validation');

async function getAllProducts() {
    return repo.findAll();
}

async function getDecorationProducts() {
    return repo.findDecorations();
}

async function createProduct(data) {
    const validData = validateProduct(data);
    return repo.create(validData);
}

async function updateProduct(id, data) {
    const validData = validateProduct(data);
    const existing = await repo.findById(id);
    if (!existing) {
        throw new Error('Mahsulot topilmadi');
    }
    return repo.update(id, validData);
}

async function deleteProduct(id) {
    const existing = await repo.findById(id);
    if (!existing) {
        throw new Error('Mahsulot topilmadi');
    }
    await repo.remove(id);
    return;
}

module.exports = {
    getAllProducts,
    getDecorationProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};
