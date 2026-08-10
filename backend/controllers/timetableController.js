const pool = require("../config/db");

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// GET /api/timetable - admin: full list with course + teacher names
async function getAllTimetable(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, c.course_name, tc.name AS teacher_name
       FROM timetable t
       JOIN courses c ON t.course_id = c.id
       LEFT JOIN teachers tc ON t.teacher_id = tc.id
       ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), t.start_time`
    );
    res.json({ timetable: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch timetable." });
  }
}

// POST /api/timetable - admin
async function createSlot(req, res) {
  try {
    const { courseId, subjectName, teacherId, dayOfWeek, startTime, endTime, venue } = req.body;
    if (!courseId || !subjectName || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ message: "Course, subject, day, and start/end time are required." });
    }
    const [result] = await pool.query(
      `INSERT INTO timetable (course_id, subject_name, teacher_id, day_of_week, start_time, end_time, venue)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [courseId, subjectName, teacherId || null, dayOfWeek, startTime, endTime, venue || null]
    );
    res.status(201).json({ message: "Lecture added to timetable.", slotId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add to timetable." });
  }
}

// PUT /api/timetable/:id - admin
async function updateSlot(req, res) {
  try {
    const { subjectName, teacherId, dayOfWeek, startTime, endTime, venue } = req.body;
    const [rows] = await pool.query("SELECT id FROM timetable WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Timetable entry not found." });

    await pool.query(
      `UPDATE timetable SET subject_name = ?, teacher_id = ?, day_of_week = ?, start_time = ?, end_time = ?, venue = ?
       WHERE id = ?`,
      [subjectName, teacherId || null, dayOfWeek, startTime, endTime, venue || null, req.params.id]
    );
    res.json({ message: "Timetable entry updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update timetable entry." });
  }
}

// DELETE /api/timetable/:id - admin
async function deleteSlot(req, res) {
  try {
    const [rows] = await pool.query("SELECT id FROM timetable WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Timetable entry not found." });
    await pool.query("DELETE FROM timetable WHERE id = ?", [req.params.id]);
    res.json({ message: "Timetable entry removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not remove timetable entry." });
  }
}

// Shared helper: resolve the logged-in student's course_id (via students.course text -> courses.id)
async function getStudentCourseId(userId) {
  const [rows] = await pool.query(
    `SELECT c.id AS course_id, s.id AS student_id
     FROM students s
     JOIN courses c ON c.course_name = s.course
     WHERE s.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

// GET /api/timetable/mine - student: full weekly timetable for their course
async function getMyTimetable(req, res) {
  try {
    const info = await getStudentCourseId(req.session.user.id);
    if (!info) return res.json({ timetable: [] });

    const [rows] = await pool.query(
      `SELECT t.*, c.course_name, tc.name AS teacher_name
       FROM timetable t
       JOIN courses c ON t.course_id = c.id
       LEFT JOIN teachers tc ON t.teacher_id = tc.id
       WHERE t.course_id = ?
       ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), t.start_time`,
      [info.course_id]
    );
    res.json({ timetable: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your timetable." });
  }
}

// GET /api/timetable/today - student: today's lectures for their course (used on Attendance tab)
async function getTodaySlots(req, res) {
  try {
    const info = await getStudentCourseId(req.session.user.id);
    if (!info) return res.json({ slots: [] });

    const todayName = DAY_NAMES[new Date().getDay()];
    const today = new Date().toISOString().split("T")[0];

    const [rows] = await pool.query(
      `SELECT t.*, c.course_name, tc.name AS teacher_name,
              a.id AS attendance_id, a.status AS marked_status
       FROM timetable t
       JOIN courses c ON t.course_id = c.id
       LEFT JOIN teachers tc ON t.teacher_id = tc.id
       LEFT JOIN student_attendance a
              ON a.timetable_id = t.id AND a.student_id = ? AND a.attendance_date = ?
       WHERE t.course_id = ? AND t.day_of_week = ?
       ORDER BY t.start_time`,
      [info.student_id, today, info.course_id, todayName]
    );
    res.json({ slots: rows, day: todayName, date: today });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch today's lectures." });
  }
}

// GET /api/timetable/upcoming - student: next day's lectures for their course
async function getUpcomingSlots(req, res) {
  try {
    const info = await getStudentCourseId(req.session.user.id);
    if (!info) return res.json({ slots: [] });

    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowName = DAY_NAMES[tomorrowDate.getDay()];

    const [rows] = await pool.query(
      `SELECT t.*, c.course_name, tc.name AS teacher_name
       FROM timetable t
       JOIN courses c ON t.course_id = c.id
       LEFT JOIN teachers tc ON t.teacher_id = tc.id
       WHERE t.course_id = ? AND t.day_of_week = ?
       ORDER BY t.start_time`,
      [info.course_id, tomorrowName]
    );
    res.json({ slots: rows, day: tomorrowName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch upcoming lectures." });
  }
}

module.exports = {
  getAllTimetable,
  createSlot,
  updateSlot,
  deleteSlot,
  getMyTimetable,
  getTodaySlots,
  getUpcomingSlots,
  getStudentCourseId,
};
