require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const courseRoutes = require("./routes/courseRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const examRoutes = require("./routes/examRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const publicRoutes = require("./routes/publicRoutes");
const { requireAuth } = require("./middleware/authMiddleware");

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// --- Serve the frontend (HTML/CSS/JS) as static files ---
app.use(express.static(path.join(__dirname, "..", "frontend")));

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/students", requireAuth, studentRoutes);
app.use("/api/teachers", requireAuth, teacherRoutes);
app.use("/api/courses", requireAuth, courseRoutes);
app.use("/api/attendance", requireAuth, attendanceRoutes);
app.use("/api/exams", requireAuth, examRoutes);
app.use("/api/payments", requireAuth, paymentRoutes);
app.use("/api/timetable", requireAuth, timetableRoutes);
app.use("/api/modules", requireAuth, moduleRoutes);

// Fallback for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
