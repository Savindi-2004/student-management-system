const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const {
  getAllTimetable,
  createSlot,
  updateSlot,
  deleteSlot,
  getMyTimetable,
  getTodaySlots,
  getUpcomingSlots,
} = require("../controllers/timetableController");

// Student-facing (specific routes first)
router.get("/mine", requireRole("student"), getMyTimetable);
router.get("/today", requireRole("student"), getTodaySlots);
router.get("/upcoming", requireRole("student"), getUpcomingSlots);

// Admin CRUD
router.get("/", requireRole("admin"), getAllTimetable);
router.post("/", requireRole("admin"), createSlot);
router.put("/:id", requireRole("admin"), updateSlot);
router.delete("/:id", requireRole("admin"), deleteSlot);

module.exports = router;
