const express = require('express');
const router = express.Router();

const controller = require('./auth.controller');
const bcrypt = require('bcrypt');
const { run } = require('../../db/connection');

/**
 * LOGIN
 * POST /api/auth/login
 */
router.post('/login', controller.login);

/**
 * TEMPORARY: ADMIN YARATISH
 * POST /api/auth/create-admin
 * - SUPER ADMIN: username=admin, password=admin123
 * - Admin ichkariga kirgandan keyin BU ROUTENI O‘CHIRIB TASHLAYSAN
 */
router.post('/create-admin', async (req, res) => {
    try {
        // Parol: admin123
        const hash = await bcrypt.hash('admin123', 10);

        await run(
            `
      INSERT INTO users (full_name, username, password_hash, role, branch_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
            ['Super Admin', 'admin', hash, 'admin', null, 1]
        );

        res.json({
            message: 'Admin user yaratildi',
            username: 'admin',
            password: 'admin123',
        });
    } catch (err) {
        console.error('create-admin error:', err);
        res.status(500).json({ error: 'Admin yaratishda xatolik' });
    }
});

module.exports = router;
