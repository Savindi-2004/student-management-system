const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const { updateModule, deleteModule } = require("../controllers/moduleController");

router.put("/:id", requireRole("admin"), updateModule);
router.delete("/:id", requireRole("admin"), deleteModule);

module.exports = router;