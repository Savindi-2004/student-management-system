const bcrypt = require("bcrypt");
const pool = require("../config/db");

// POST /api/auth/register  (self-registration, always creates a "student" account)
async function register(req, res) {
  try {
    const { name, email, password, studentRegNo, dob, address, contactNo, course } = req.body;

    if (!name || !email || !password || !studentRegNo) {
      return res.status(400).json({ message: "Name, email, password and registration number are required." });
    }

    const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const [existingReg] = await pool.query("SELECT id FROM students WHERE student_reg_no = ?", [studentRegNo]);
    if (existingReg.length > 0) {
      return res.status(409).json({ message: "This registration number is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'student')",
      [name, email, hashedPassword]
    );

    await pool.query(
      `INSERT INTO students (user_id, student_reg_no, dob, address, contact_no, course, enrollment_date)
       VALUES (?, ?, ?, ?, ?, ?, CURDATE())`,
      [userResult.insertId, studentRegNo, dob || null, address || null, contactNo || null, course || null]
    );

    res.status(201).json({ message: "Account created successfully. You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong while creating your account." });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };

    res.json({
      message: "Login successful.",
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong while logging in." });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out, please try again." });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully." });
  });
}

// GET /api/auth/me  -> returns the logged-in user, or null
function me(req, res) {
  res.json({ user: req.session.user || null });
}

module.exports = { register, login, logout, me };
