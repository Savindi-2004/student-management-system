const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/studentController");

// --- Student's own profile (must come before /:id routes) ---
router.get("/me/profile", requireRole("student"), getMyProfile);
router.put("/me/profile", requireRole("student"), updateMyProfile);

// --- Admin CRUD ---
router.get("/", requireRole("admin"), getAllStudents);
router.get("/:id", requireRole("admin"), getStudentById);
router.post("/", requireRole("admin"), createStudent);
router.put("/:id", requireRole("admin"), updateStudent);
router.delete("/:id", requireRole("admin"), deleteStudent);

module.exports = router;
