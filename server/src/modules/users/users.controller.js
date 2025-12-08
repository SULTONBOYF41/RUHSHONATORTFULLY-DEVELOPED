const service = require("./users.service");

async function getUsers(req, res) {
    try {
        const users = await service.getUsers();
        res.json(users);
    } catch (err) {
        console.error("getUsers error:", err);
        res.status(500).json({ message: "Userlarni olishda xatolik" });
    }
}

async function createUser(req, res) {
    try {
        const user = await service.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error("createUser error:", err);
        res.status(400).json({ message: err.message || "User qo'shishda xatolik" });
    }
}

async function updateUser(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Noto'g'ri ID" });
        }
        const user = await service.updateUser(id, req.body);
        res.json(user);
    } catch (err) {
        console.error("updateUser error:", err);
        if (err.message === "User topilmadi") {
            return res.status(404).json({ message: err.message });
        }
        res.status(400).json({ message: err.message || "Userni yangilashda xatolik" });
    }
}

async function deleteUser(req, res) {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({ message: "Noto'g'ri ID" });
        }
        await service.deleteUser(id);
        res.status(204).end();
    } catch (err) {
        console.error("deleteUser error:", err);
        if (err.message === "User topilmadi") {
            return res.status(404).json({ message: err.message });
        }
        res.status(400).json({ message: err.message || "Userni o'chirishda xatolik" });
    }
}

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
};
