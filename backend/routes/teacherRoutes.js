const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const { getAllTeachers, createTeacher, updateTeacher, deleteTeacher } = require("../controllers/teacherController");

router.get("/", requireRole("admin"), getAllTeachers);
router.post("/", requireRole("admin"), createTeacher);
router.put("/:id", requireRole("admin"), updateTeacher);
router.delete("/:id", requireRole("admin"), deleteTeacher);

module.exports = router;
