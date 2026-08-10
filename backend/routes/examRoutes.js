const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const {
  getAllExams,
  createExam,
  updateExam,
  deleteExam,
  getStudentsForExam,
  submitMark,
  updateResultAttendance,
  getResults,
  getSummary,
  getMyExams,
  getMyResults,
} = require("../controllers/examController");

// ---- Student (specific routes first) ----
router.get("/mine", requireRole("student"), getMyExams);
router.get("/my-results", requireRole("student"), getMyResults);

// ---- Admin (specific routes first) ----
router.get("/results", requireRole("admin"), getResults);
router.put("/results/:resultId/attendance", requireRole("admin"), updateResultAttendance);
router.get("/summary", requireRole("admin"), getSummary);

router.get("/", requireRole("admin"), getAllExams);
router.post("/", requireRole("admin"), createExam);
router.put("/:id", requireRole("admin"), updateExam);
router.delete("/:id", requireRole("admin"), deleteExam);
router.get("/:id/students", requireRole("admin"), getStudentsForExam);
router.post("/:id/marks", requireRole("admin"), submitMark);

module.exports = router;
