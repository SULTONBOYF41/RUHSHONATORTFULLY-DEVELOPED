// server/src/modules/production/production.routes.js

const express = require("express");
const router = express.Router();
const controller = require("./production.controller");

// GET /api/production?date=YYYY-MM-DD
router.get("/", controller.getBatches);

// GET /api/production/:id
router.get("/:id", controller.getBatch);

// POST /api/production
router.post("/", controller.createBatch);

// PUT /api/production/:id
router.put("/:id", controller.updateBatch);

// DELETE /api/production/:id
router.delete("/:id", controller.deleteBatch);

module.exports = router;
