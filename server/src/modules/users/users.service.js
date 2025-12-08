const bcrypt = require("bcryptjs");
const repo = require("./users.repository");

const SALT_ROUNDS = 10;

function validateUserInput(data = {}, { isUpdate = false } = {}) {
    const full_name = data.full_name ? String(data.full_name).trim() : "";
    const username = data.username ? String(data.username).trim() : "";
    const role = data.role ? String(data.role).trim() : "admin";
    const branch_id =
        data.role === "branch" && data.branch_id ? Number(data.branch_id) : null;

    if (!full_name) {
        throw new Error("To'liq ism majburiy");
    }
    if (!username) {
        throw new Error("Username majburiy");
    }

    const cleaned = {
        full_name,
        username,
        role,
        branch_id,
        is_active: true,
    };

    if (!isUpdate || data.password) {
        if (!data.password) {
            throw new Error("Parol majburiy");
        }
        cleaned.password = String(data.password);
    }

    return cleaned;
}

async function getUsers() {
    return repo.findAll();
}

async function createUser(data) {
    const cleaned = validateUserInput(data, { isUpdate: false });

    const existing = await repo.findByUsername(cleaned.username);
    if (existing) {
        throw new Error("Bu username band");
    }

    const password_hash = await bcrypt.hash(cleaned.password, SALT_ROUNDS);

    return repo.create({
        full_name: cleaned.full_name,
        username: cleaned.username,
        password_hash,
        role: cleaned.role,
        branch_id: cleaned.branch_id,
        is_active: true,
    });
}

async function updateUser(id, data) {
    const existing = await repo.findById(id);
    if (!existing) {
        throw new Error("User topilmadi");
    }

    const cleaned = validateUserInput(data, { isUpdate: true });

    let password_hash = null;
    if (cleaned.password) {
        password_hash = await bcrypt.hash(cleaned.password, SALT_ROUNDS);
    }

    return repo.update(id, {
        full_name: cleaned.full_name,
        username: cleaned.username,
        password_hash,
        role: cleaned.role,
        branch_id: cleaned.branch_id,
        is_active: true,
    });
}

async function deleteUser(id) {
    const existing = await repo.findById(id);
    if (!existing) {
        throw new Error("User topilmadi");
    }
    await repo.remove(id);
}

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
};
