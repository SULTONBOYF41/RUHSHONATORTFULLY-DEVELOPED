// server/src/modules/transfers/transfers.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./transfers.controller");
// const { requireAuth, requireRole } = require("../../middleware/auth"); // xohlasang qo‘shib olasan

// 1) incoming
router.get("/incoming/branch/:branchId", controller.getIncomingForBranch);

// 2) list
router.get("/", controller.getAllTransfers);

// 3) detail
router.get("/:id", controller.getTransfer);

// Yangi transfer yaratish (markaziy ombordan filial/do‘konga)
router.post("/", controller.createTransfer);

// Transferni tahrirlash (faqat PENDING)
router.put("/:id", controller.updateTransfer);

// Transferni bekor qilish (faqat PENDING)
router.delete("/:id", controller.cancelTransfer);

// Branch / outlet – itemni qabul qilish
router.post("/:id/items/:itemId/accept", controller.acceptItem);

// Branch / outlet – itemni bekor qilish
router.post("/:id/items/:itemId/reject", controller.rejectItem);

module.exports = router;
