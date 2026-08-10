const pool = require("../config/db");

// GET /api/courses - list all courses with enrolment counts
async function getAllCourses(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM students s WHERE s.course = c.course_name) AS enrolled_count
       FROM courses c
       ORDER BY c.id DESC`
    );
    res.json({ courses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch courses." });
  }
}

// GET /api/courses/stats - total courses + total active enrolments
async function getCourseStats(req, res) {
  try {
    const [[{ totalCourses }]] = await pool.query("SELECT COUNT(*) AS totalCourses FROM courses");
    const [[{ activeEnrolments }]] = await pool.query(
      "SELECT COUNT(*) AS activeEnrolments FROM students WHERE course IS NOT NULL AND course <> ''"
    );
    res.json({ totalCourses, activeEnrolments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch course stats." });
  }
}

// POST /api/courses
async function createCourse(req, res) {
  try {
    const { courseCode, courseName, faculty, description } = req.body;
    if (!courseCode || !courseName) {
      return res.status(400).json({ message: "Course code and name are required." });
    }
    const [existing] = await pool.query("SELECT id FROM courses WHERE course_code = ?", [courseCode]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "A course with this code already exists." });
    }
    const [result] = await pool.query(
      "INSERT INTO courses (course_code, course_name, faculty, description) VALUES (?, ?, ?, ?)",
      [courseCode, courseName, faculty || null, description || null]
    );
    res.status(201).json({ message: "Course created successfully.", courseId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create course." });
  }
}

// PUT /api/courses/:id
async function updateCourse(req, res) {
  try {
    const { courseName, faculty, description } = req.body;
    const [rows] = await pool.query("SELECT id FROM courses WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Course not found." });

    await pool.query(
      "UPDATE courses SET course_name = ?, faculty = ?, description = ? WHERE id = ?",
      [courseName, faculty || null, description || null, req.params.id]
    );
    res.json({ message: "Course updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update course." });
  }
}

// DELETE /api/courses/:id
async function deleteCourse(req, res) {
  try {
    const [rows] = await pool.query("SELECT id FROM courses WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Course not found." });
    await pool.query("DELETE FROM courses WHERE id = ?", [req.params.id]);
    res.json({ message: "Course deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete course." });
  }
}

// GET /api/courses/public - unauthenticated list (id + name only), used by the
// registration page so students pick a real course instead of typing free text.
async function getPublicCourses(req, res) {
  try {
    const [rows] = await pool.query("SELECT id, course_name FROM courses ORDER BY course_name ASC");
    res.json({ courses: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch courses." });
  }
}

module.exports = { getAllCourses, getCourseStats, createCourse, updateCourse, deleteCourse, getPublicCourses };
