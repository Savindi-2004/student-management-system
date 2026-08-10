const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const {
  getStudentAttendance,
  getAdminAttendanceSummary,
  getTeacherAttendance,
  markStudentAttendance,
  markTeacherAttendance,
  selfMarkAttendance,
  getMyAttendanceSummary,
  getMyAttendance,
} = require("../controllers/attendanceController");

// ---- Student (specific routes first) ----
router.post("/self-mark", requireRole("student"), selfMarkAttendance);
router.get("/me/summary", requireRole("student"), getMyAttendanceSummary);
router.get("/me", requireRole("student"), getMyAttendance);

// ---- Admin ----
router.get("/students/summary", requireRole("admin"), getAdminAttendanceSummary);
router.get("/students", requireRole("admin"), getStudentAttendance);
router.post("/students", requireRole("admin"), markStudentAttendance);
router.get("/teachers", requireRole("admin"), getTeacherAttendance);
router.post("/teachers", requireRole("admin"), markTeacherAttendance);

module.exports = router;
