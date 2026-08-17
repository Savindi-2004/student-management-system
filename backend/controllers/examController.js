const pool = require("../config/db");

// Grade boundaries: A >= 75, B >= 60, C >= 50, else F. Pass if marks >= 50.
function calculateGrade(marks) {
  const m = Number(marks);
  let grade;
  if (m >= 75) grade = "A";
  else if (m >= 60) grade = "B";
  else if (m >= 50) grade = "C";
  else grade = "F";
  const status = m >= 50 ? "Pass" : "Fail";
  return { grade, status };
}

// GET /api/exams - list exams with course + module name
async function getAllExams(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, c.course_name, c.course_code, m.module_name
       FROM exams e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN modules m ON e.module_id = m.id
       ORDER BY e.exam_date DESC, e.id DESC`
    );
    res.json({ exams: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch exams." });
  }
}

// POST /api/exams - create a new scheduled exam
async function createExam(req, res) {
  try {
    const { examName, courseId, moduleId, examType, examDate, examTime, durationMinutes, venue } = req.body;
    if (!examName || !courseId || !examType) {
      return res.status(400).json({ message: "Exam name, course and exam type are required." });
    }
    const [result] = await pool.query(
      `INSERT INTO exams (exam_name, course_id, module_id, exam_type, exam_date, exam_time, duration_minutes, venue)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [examName, courseId, moduleId || null, examType, examDate || null, examTime || null, durationMinutes || null, venue || null]
    );
    res.status(201).json({ message: "Exam scheduled successfully.", examId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not schedule exam." });
  }
}

// PUT /api/exams/:id
async function updateExam(req, res) {
  try {
    const { examName, moduleId, examType, examDate, examTime, durationMinutes, venue } = req.body;
    const [rows] = await pool.query("SELECT id FROM exams WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Exam not found." });

    await pool.query(
      `UPDATE exams SET exam_name = ?, module_id = ?, exam_type = ?, exam_date = ?, exam_time = ?, duration_minutes = ?, venue = ?
       WHERE id = ?`,
      [examName, moduleId || null, examType, examDate || null, examTime || null, durationMinutes || null, venue || null, req.params.id]
    );
    res.json({ message: "Exam updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update exam." });
  }
}

// DELETE /api/exams/:id
async function deleteExam(req, res) {
  try {
    const [rows] = await pool.query("SELECT id FROM exams WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Exam not found." });
    await pool.query("DELETE FROM exams WHERE id = ?", [req.params.id]);
    res.json({ message: "Exam deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete exam." });
  }
}

// GET /api/exams/:id/students - students enrolled in the exam's course, with any existing mark
async function getStudentsForExam(req, res) {
  try {
    const [examRows] = await pool.query("SELECT e.*, c.course_name FROM exams e JOIN courses c ON e.course_id = c.id WHERE e.id = ?", [req.params.id]);
    if (examRows.length === 0) return res.status(404).json({ message: "Exam not found." });
    const courseName = examRows[0].course_name;

    const [rows] = await pool.query(
      `SELECT s.id AS student_id, s.student_reg_no, u.name AS student_name,
              r.id AS result_id, r.marks, r.grade, r.status, r.attendance
       FROM students s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN exam_results r ON r.student_id = s.id AND r.exam_id = ?
       WHERE s.course = ?
       ORDER BY u.name ASC`,
      [req.params.id, courseName]
    );
    res.json({ exam: examRows[0], students: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch students for this exam." });
  }
}

// POST /api/exams/:id/marks - upsert a single student's mark + attendance (auto-grades)
async function submitMark(req, res) {
  try {
    const { studentId, marks, attendance } = req.body;
    if (!studentId || marks === undefined || marks === null || marks === "") {
      return res.status(400).json({ message: "Student and marks are required." });
    }
    if (Number(marks) < 0 || Number(marks) > 100) {
      return res.status(400).json({ message: "Marks must be between 0 and 100." });
    }
    const { grade, status } = calculateGrade(marks);
    const attendanceValue = attendance === "Absent" ? "Absent" : "Present";

    await pool.query(
      `INSERT INTO exam_results (exam_id, student_id, marks, grade, status, attendance)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE marks = VALUES(marks), grade = VALUES(grade), status = VALUES(status), attendance = VALUES(attendance)`,
      [req.params.id, studentId, marks, grade, status, attendanceValue]
    );
    res.json({ message: "Mark saved.", grade, status, attendance: attendanceValue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not save mark." });
  }
}

// PUT /api/exams/results/:resultId/attendance - admin edits just the attendance flag
async function updateResultAttendance(req, res) {
  try {
    const { attendance } = req.body;
    if (attendance !== "Present" && attendance !== "Absent") {
      return res.status(400).json({ message: "Attendance must be Present or Absent." });
    }
    const [rows] = await pool.query("SELECT id FROM exam_results WHERE id = ?", [req.params.resultId]);
    if (rows.length === 0) return res.status(404).json({ message: "Result not found." });

    await pool.query("UPDATE exam_results SET attendance = ? WHERE id = ?", [attendance, req.params.resultId]);
    res.json({ message: "Attendance updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update attendance." });
  }
}

// GET /api/exams/results?examId=&courseId=&search=  - results directory with filters
async function getResults(req, res) {
  try {
    const { examId, courseId, search } = req.query;
    let sql = `SELECT r.id, r.marks, r.grade, r.status, r.attendance, r.created_at,
                      e.id AS exam_id, e.exam_name, e.exam_type, e.exam_date,
                      c.id AS course_id, c.course_name, m.module_name,
                      s.id AS student_id, s.student_reg_no, u.name AS student_name
               FROM exam_results r
               JOIN exams e ON r.exam_id = e.id
               JOIN courses c ON e.course_id = c.id
               LEFT JOIN modules m ON e.module_id = m.id
               JOIN students s ON r.student_id = s.id
               JOIN users u ON s.user_id = u.id
               WHERE 1=1`;
    const params = [];
    if (examId) { sql += " AND e.id = ?"; params.push(examId); }
    if (courseId) { sql += " AND c.id = ?"; params.push(courseId); }
    if (search) {
      sql += " AND (u.name LIKE ? OR s.student_reg_no LIKE ? OR e.exam_name LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like, like);
    }
    sql += " ORDER BY r.created_at DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch results." });
  }
}

// GET /api/exams/summary - performance summary cards
async function getSummary(req, res) {
  try {
    const [[{ totalExams }]] = await pool.query("SELECT COUNT(*) AS totalExams FROM exams");
    const [[{ totalResults, totalPass }]] = await pool.query(
      `SELECT COUNT(*) AS totalResults, SUM(status = 'Pass') AS totalPass FROM exam_results`
    );
    const passRate = totalResults > 0 ? Math.round((totalPass / totalResults) * 100) : 0;
    const [[{ topRankers }]] = await pool.query(
      "SELECT COUNT(*) AS topRankers FROM exam_results WHERE marks >= 90"
    );
    res.json({ totalExams, passRate, topRankers, totalResults });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch exam summary." });
  }
}

// GET /api/exams/mine - student: exams scheduled for their own course only
async function getMyExams(req, res) {
  try {
    const [studentRows] = await pool.query("SELECT course FROM students WHERE user_id = ?", [req.session.user.id]);
    if (studentRows.length === 0) return res.json({ exams: [] });
    const courseName = studentRows[0].course;

   const [rows] = await pool.query(
      `SELECT e.*, c.course_name, m.module_name FROM exams e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN modules m ON e.module_id = m.id
       WHERE c.course_name = ?
       ORDER BY e.exam_date ASC, e.id ASC`,
      [courseName]
    );
    res.json({ exams: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your exams." });
  }
}

// GET /api/exams/my-results - student: their own results table (Exam, Marks, Grade, Attendance)
async function getMyResults(req, res) {
  try {
    const [studentRows] = await pool.query("SELECT id FROM students WHERE user_id = ?", [req.session.user.id]);
    if (studentRows.length === 0) return res.json({ results: [] });
    const studentId = studentRows[0].id;

    const [rows] = await pool.query(
      `SELECT r.marks, r.grade, r.attendance, e.exam_name, e.exam_type, e.exam_date, c.course_name
       FROM exam_results r
       JOIN exams e ON r.exam_id = e.id
       JOIN courses c ON e.course_id = c.id
       WHERE r.student_id = ?
       ORDER BY e.exam_date DESC`,
      [studentId]
    );
    res.json({ results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your results." });
  }
}

module.exports = {
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
};
