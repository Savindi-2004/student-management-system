const pool = require("../config/db");

// GET /api/teachers - list all (search handled client-side like students)
async function getAllTeachers(req, res) {
  try {
    const [rows] = await pool.query("SELECT * FROM teachers ORDER BY id DESC");
    res.json({ teachers: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch teachers." });
  }
}

// POST /api/teachers
async function createTeacher(req, res) {
  try {
    const { teacherRegNo, name, email, contactNo, faculty, course, qualification, joinedDate } = req.body;
    if (!teacherRegNo || !name) {
      return res.status(400).json({ message: "Registration number and name are required." });
    }
    const [existing] = await pool.query("SELECT id FROM teachers WHERE teacher_reg_no = ?", [teacherRegNo]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "A teacher with this registration number already exists." });
    }
    const [result] = await pool.query(
      `INSERT INTO teachers (teacher_reg_no, name, email, contact_no, faculty, course, qualification, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [teacherRegNo, name, email || null, contactNo || null, faculty || null, course || null, qualification || null, joinedDate || null]
    );
    res.status(201).json({ message: "Teacher added successfully.", teacherId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add teacher." });
  }
}

// PUT /api/teachers/:id
async function updateTeacher(req, res) {
  try {
    const { name, email, contactNo, faculty, course, qualification, joinedDate } = req.body;
    const [rows] = await pool.query("SELECT id FROM teachers WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Teacher not found." });

    await pool.query(
      `UPDATE teachers SET name = ?, email = ?, contact_no = ?, faculty = ?, course = ?, qualification = ?, joined_date = ?
       WHERE id = ?`,
      [name, email || null, contactNo || null, faculty || null, course || null, qualification || null, joinedDate || null, req.params.id]
    );
    res.json({ message: "Teacher updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update teacher." });
  }
}

// DELETE /api/teachers/:id
async function deleteTeacher(req, res) {
  try {
    const [rows] = await pool.query("SELECT id FROM teachers WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Teacher not found." });
    await pool.query("DELETE FROM teachers WHERE id = ?", [req.params.id]);
    res.json({ message: "Teacher deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete teacher." });
  }
}

module.exports = { getAllTeachers, createTeacher, updateTeacher, deleteTeacher };
