const express = require("express");
const router = express.Router();
const controller = require("./users.controller");

// GET /api/users
router.get("/", controller.getUsers);

// POST /api/users
router.post("/", controller.createUser);

// PUT /api/users/:id
router.put("/:id", controller.updateUser);

// DELETE /api/users/:id
router.delete("/:id", controller.deleteUser);

module.exports = router;
