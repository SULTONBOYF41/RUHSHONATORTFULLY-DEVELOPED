const service = require('./auth.service');

async function login(req, res) {
    try {
        const result = await service.login(req.body);
        res.json(result);
    } catch (err) {
        console.error('login error:', err);
        res.status(400).json({ message: err.message || 'Login xatosi' });
    }
}

module.exports = {
    login,
};
