const bcrypt = require("bcrypt");
const pool = require("../config/db");

// GET /api/students  (admin only) - list all students
async function getAllStudents(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_reg_no, s.dob, s.address, s.contact_no, s.course,
              s.enrollment_date, u.id AS user_id, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.id DESC`
    );
    res.json({ students: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch students." });
  }
}

// GET /api/students/:id  (admin only) - single student
async function getStudentById(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_reg_no, s.dob, s.address, s.contact_no, s.course,
              s.enrollment_date, u.id AS user_id, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }
    res.json({ student: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch student." });
  }
}

// POST /api/students  (admin only) - create a new student (creates user + student rows)
async function createStudent(req, res) {
  const connection = await pool.getConnection();
  try {
    const { name, email, password, studentRegNo, dob, address, contactNo, course } = req.body;

    if (!name || !email || !password || !studentRegNo) {
      connection.release();
      return res.status(400).json({ message: "Name, email, password and registration number are required." });
    }

    const [existingUser] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      connection.release();
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.beginTransaction();

    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
      [name, email, hashedPassword]
    );

    const [studentResult] = await connection.query(
      `INSERT INTO students (user_id, student_reg_no, dob, address, contact_no, course, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
      [userResult.insertId, studentRegNo, dob || null, address || null, contactNo || null, course || null]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Student created successfully.", studentId: studentResult.insertId });
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error(err);
    res.status(500).json({ message: "Could not create student." });
  }
}

// PUT /api/students/:id  (admin only) - update a student's details
async function updateStudent(req, res) {
  try {
    const { name, email, dob, address, contactNo, course } = req.body;
    const studentId = req.params.id;

    const [rows] = await pool.query("SELECT user_id FROM students WHERE id = ?", [studentId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }
    const userId = rows[0].user_id;

    await pool.query("UPDATE users SET name = ?, email = ? WHERE id = ?", [name, email, userId]);
    await pool.query(
      "UPDATE students SET dob = ?, address = ?, contact_no = ?, course = ? WHERE id = ?",
      [dob || null, address || null, contactNo || null, course || null, studentId]
    );

    res.json({ message: "Student updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update student." });
  }
}

// DELETE /api/students/:id  (admin only)
async function deleteStudent(req, res) {
  try {
    const [rows] = await pool.query("SELECT user_id FROM students WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Student not found." });
    }
    // Deleting the user cascades to the students row (FK ON DELETE CASCADE)
    await pool.query("DELETE FROM users WHERE id = ?", [rows[0].user_id]);
    res.json({ message: "Student deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete student." });
  }
}

// GET /api/students/me/profile  (student only) - own profile
async function getMyProfile(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.student_reg_no, s.dob, s.address, s.contact_no, s.course,
              s.enrollment_date, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE u.id = ?`,
      [req.session.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Profile not found." });
    }
    res.json({ student: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your profile." });
  }
}

// PUT /api/students/me/profile  (student only) - update own contact info only
async function updateMyProfile(req, res) {
  try {
    const { address, contactNo } = req.body;
    await pool.query(
      `UPDATE students SET address = ?, contact_no = ?
       WHERE user_id = ?`,
      [address || null, contactNo || null, req.session.user.id]
    );
    res.json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update your profile." });
  }
}

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getMyProfile,
  updateMyProfile,
};
