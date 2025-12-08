// server/src/modules/transfers/transfers.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./transfers.controller");

// to'g'ri tartib:

// 1) incoming
router.get("/incoming/branch/:branchId", controller.getIncomingForBranch);

// 2) list
router.get("/", controller.getAllTransfers);

// 3) detail
router.get("/:id", controller.getTransfer);

// ...


// Admin – yangi transfer yaratish (markaziy ombordan filialga)
router.post("/", controller.createTransfer);

// Branch – itemni qabul qilish
router.post("/:id/items/:itemId/accept", controller.acceptItem);

// Branch – itemni bekor qilish
router.post("/:id/items/:itemId/reject", controller.rejectItem);

module.exports = router;
