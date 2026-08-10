const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const {
  getAllPayments,
  getPaymentStats,
  createPayment,
  updatePayment,
  deletePayment,
  sendReminder,
  getMyPayments,
} = require("../controllers/paymentController");

router.get("/me", requireRole("student"), getMyPayments);

router.get("/stats", requireRole("admin"), getPaymentStats);
router.get("/", requireRole("admin"), getAllPayments);
router.post("/", requireRole("admin"), createPayment);
router.put("/:id", requireRole("admin"), updatePayment);
router.delete("/:id", requireRole("admin"), deletePayment);
router.post("/:id/remind", requireRole("admin"), sendReminder);

module.exports = router;
