const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../config/env');
const repo = require('./auth.repository');

async function login({ username, password }) {
    if (!username || !password) {
        throw new Error('username va password majburiy');
    }

    const user = await repo.getUserWithPasswordByUsername(username);
    if (!user) {
        throw new Error('Foydalanuvchi topilmadi yoki parol noto‘g‘ri');
    }

    if (!user.is_active) {
        throw new Error('Foydalanuvchi bloklangan');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
        throw new Error('Foydalanuvchi topilmadi yoki parol noto‘g‘ri');
    }

    const payload = {
        id: user.id,
        role: user.role,
        branchId: user.branch_id || null,
    };

    const token = jwt.sign(payload, jwtSecret, {
        expiresIn: '12h',
    });

    // frontend uchun qaytariladigan ma'lumot
    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            username: user.username,
            role: user.role,
            branch_id: user.branch_id,
        },
    };
}

module.exports = {
    login,
};
