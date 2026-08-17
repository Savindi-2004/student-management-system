const express = require("express");
const router = express.Router();
const { requireRole } = require("../middleware/authMiddleware");
const {
  getAllCourses,
  getCourseStats,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { getModulesForCourse, createModule } = require("../controllers/moduleController");

router.get("/stats", requireRole("admin"), getCourseStats);
router.get("/", requireRole("admin"), getAllCourses);
router.post("/", requireRole("admin"), createCourse);
router.put("/:id", requireRole("admin"), updateCourse);
router.delete("/:id", requireRole("admin"), deleteCourse);

router.get("/:courseId/modules", requireRole("admin"), getModulesForCourse);
router.post("/:courseId/modules", requireRole("admin"), createModule);

module.exports = router;