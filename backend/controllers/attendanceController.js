const bcrypt = require("bcrypt");
const pool = require("../config/db");
const { getStudentCourseId } = require("./timetableController");

// ===================== ADMIN =====================

// GET /api/attendance/students?courseId=&subject=&studentId=&from=&to=
async function getStudentAttendance(req, res) {
  try {
    const { studentId, courseId, subject, from, to } = req.query;
    let sql = `SELECT a.id, a.attendance_date, a.status, a.subject_name, a.marked_by, a.remarks,
                      s.id AS student_id, s.student_reg_no, u.name AS student_name,
                      c.id AS course_id, c.course_name
               FROM student_attendance a
               JOIN students s ON a.student_id = s.id
               JOIN users u ON s.user_id = u.id
               LEFT JOIN courses c ON a.course_id = c.id
               WHERE 1=1`;
    const params = [];
    if (studentId) { sql += " AND s.id = ?"; params.push(studentId); }
    if (courseId) { sql += " AND c.id = ?"; params.push(courseId); }
    if (subject) { sql += " AND a.subject_name = ?"; params.push(subject); }
    if (from) { sql += " AND a.attendance_date >= ?"; params.push(from); }
    if (to) { sql += " AND a.attendance_date <= ?"; params.push(to); }
    sql += " ORDER BY a.attendance_date DESC, a.id DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ records: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch student attendance." });
  }
}

// GET /api/attendance/students/summary?courseId=  - overall %, subject-wise %, present/absent counts
async function getAdminAttendanceSummary(req, res) {
  try {
    const { courseId } = req.query;
    const params = [];
    let where = "WHERE 1=1";
    if (courseId) { where += " AND a.course_id = ?"; params.push(courseId); }

    const [[overall]] = await pool.query(
      `SELECT COUNT(*) AS total, SUM(status = 'Present') AS present, SUM(status = 'Absent') AS absent, SUM(status = 'Late') AS late
       FROM student_attendance a ${where}`,
      params
    );
    const overallPct = overall.total > 0 ? Math.round((Number(overall.present) / overall.total) * 100) : 0;

    const [subjectRows] = await pool.query(
      `SELECT a.subject_name, COUNT(*) AS total, SUM(status = 'Present') AS present
       FROM student_attendance a ${where} AND a.subject_name IS NOT NULL
       GROUP BY a.subject_name
       ORDER BY a.subject_name`,
      params
    );
    const subjectWise = subjectRows.map((r) => ({
      subject: r.subject_name,
      percentage: r.total > 0 ? Math.round((Number(r.present) / r.total) * 100) : 0,
      total: r.total,
    }));

    res.json({
      overallPercentage: overallPct,
      present: Number(overall.present) || 0,
      absent: Number(overall.absent) || 0,
      late: Number(overall.late) || 0,
      subjectWise,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch attendance summary." });
  }
}

// GET /api/attendance/teachers?teacherId=&from=&to=
async function getTeacherAttendance(req, res) {
  try {
    const { teacherId, from, to } = req.query;
    let sql = `SELECT a.id, a.attendance_date, a.status, a.remarks,
                      t.id AS teacher_id, t.teacher_reg_no, t.name AS teacher_name
               FROM teacher_attendance a
               JOIN teachers t ON a.teacher_id = t.id
               WHERE 1=1`;
    const params = [];
    if (teacherId) { sql += " AND t.id = ?"; params.push(teacherId); }
    if (from) { sql += " AND a.attendance_date >= ?"; params.push(from); }
    if (to) { sql += " AND a.attendance_date <= ?"; params.push(to); }
    sql += " ORDER BY a.attendance_date DESC, a.id DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ records: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch teacher attendance." });
  }
}

// POST /api/attendance/students - admin marks attendance directly
async function markStudentAttendance(req, res) {
  try {
    const { studentId, courseId, subjectName, date, status, remarks } = req.body;
    if (!studentId || !date || !status) {
      return res.status(400).json({ message: "Student, date and status are required." });
    }
    await pool.query(
      `INSERT INTO student_attendance (student_id, course_id, subject_name, attendance_date, status, marked_by, remarks)
       VALUES (?, ?, ?, ?, ?, 'admin', ?)`,
      [studentId, courseId || null, subjectName || null, date, status, remarks || null]
    );
    res.status(201).json({ message: "Attendance recorded." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not record attendance." });
  }
}

// POST /api/attendance/teachers
async function markTeacherAttendance(req, res) {
  try {
    const { teacherId, date, status, remarks } = req.body;
    if (!teacherId || !date || !status) {
      return res.status(400).json({ message: "Teacher, date and status are required." });
    }
    await pool.query(
      "INSERT INTO teacher_attendance (teacher_id, attendance_date, status, remarks) VALUES (?, ?, ?, ?)",
      [teacherId, date, status, remarks || null]
    );
    res.status(201).json({ message: "Attendance recorded." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not record attendance." });
  }
}

// ===================== STUDENT =====================

// POST /api/attendance/self-mark - student confirms their password, then marks
// themselves Present for today's lecture (a specific timetable slot).
async function selfMarkAttendance(req, res) {
  try {
    const { timetableId, password } = req.body;
    if (!timetableId || !password) {
      return res.status(400).json({ message: "Lecture and password are required." });
    }

    // Re-confirm identity: check the password against the logged-in user's account
    const [userRows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.session.user.id]);
    if (userRows.length === 0) return res.status(401).json({ message: "Session expired, please log in again." });
    const passwordMatches = await bcrypt.compare(password, userRows[0].password);
    if (!passwordMatches) return res.status(401).json({ message: "Incorrect password." });

    const info = await getStudentCourseId(req.session.user.id);
    if (!info) return res.status(400).json({ message: "No course on your profile yet." });

    const [slotRows] = await pool.query("SELECT * FROM timetable WHERE id = ? AND course_id = ?", [timetableId, info.course_id]);
    if (slotRows.length === 0) return res.status(404).json({ message: "This lecture is not on your timetable." });

    const today = new Date().toISOString().split("T")[0];
    const [existing] = await pool.query(
      "SELECT id FROM student_attendance WHERE student_id = ? AND timetable_id = ? AND attendance_date = ?",
      [info.student_id, timetableId, today]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "You've already marked attendance for this lecture today." });
    }

    await pool.query(
      `INSERT INTO student_attendance (student_id, timetable_id, course_id, subject_name, attendance_date, status, marked_by)
       VALUES (?, ?, ?, ?, ?, 'Present', 'student')`,
      [info.student_id, timetableId, info.course_id, slotRows[0].subject_name, today]
    );
    res.status(201).json({ message: "Attendance marked. See you in class!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not mark attendance." });
  }
}

// GET /api/attendance/me/summary - own overall %, subject-wise %, present/absent counts
async function getMyAttendanceSummary(req, res) {
  try {
    const info = await getStudentCourseId(req.session.user.id);
    if (!info) return res.json({ overallPercentage: 0, present: 0, absent: 0, late: 0, subjectWise: [] });

    const [[overall]] = await pool.query(
      `SELECT COUNT(*) AS total, SUM(status = 'Present') AS present, SUM(status = 'Absent') AS absent, SUM(status = 'Late') AS late
       FROM student_attendance WHERE student_id = ?`,
      [info.student_id]
    );
    const overallPct = overall.total > 0 ? Math.round((Number(overall.present) / overall.total) * 100) : 0;

    const [subjectRows] = await pool.query(
      `SELECT subject_name, COUNT(*) AS total, SUM(status = 'Present') AS present
       FROM student_attendance WHERE student_id = ? AND subject_name IS NOT NULL
       GROUP BY subject_name ORDER BY subject_name`,
      [info.student_id]
    );
    const subjectWise = subjectRows.map((r) => ({
      subject: r.subject_name,
      percentage: r.total > 0 ? Math.round((Number(r.present) / r.total) * 100) : 0,
      total: r.total,
    }));

    res.json({
      overallPercentage: overallPct,
      present: Number(overall.present) || 0,
      absent: Number(overall.absent) || 0,
      late: Number(overall.late) || 0,
      subjectWise,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your attendance summary." });
  }
}

// GET /api/attendance/me - own attendance history
async function getMyAttendance(req, res) {
  try {
    const info = await getStudentCourseId(req.session.user.id);
    if (!info) return res.json({ records: [] });

    const [rows] = await pool.query(
      `SELECT id, attendance_date, status, subject_name, marked_by
       FROM student_attendance WHERE student_id = ?
       ORDER BY attendance_date DESC, id DESC`,
      [info.student_id]
    );
    res.json({ records: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your attendance." });
  }
}

module.exports = {
  getStudentAttendance,
  getAdminAttendanceSummary,
  getTeacherAttendance,
  markStudentAttendance,
  markTeacherAttendance,
  selfMarkAttendance,
  getMyAttendanceSummary,
  getMyAttendance,
};
