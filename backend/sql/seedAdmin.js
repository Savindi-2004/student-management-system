// Run this once after setting up the database:  npm run seed
// Creates a default Admin account so you can log in for the first time.
// Email: admin@sms.com   Password: admin123
// (You should log in and/or change this after seeding.)

require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function seedAdmin() {
  try {
    const email = "admin@sms.com";
    const plainPassword = "admin123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);

    if (existing.length > 0) {
      console.log("Admin account already exists. Nothing to do.");
      process.exit(0);
    }

    await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      ["System Admin", email, hashedPassword, "admin"]
    );

    console.log("Admin account created successfully!");
    console.log("   Email:    admin@sms.com");
    console.log("   Password: admin123");

    // Seed a starter set of courses, so the Courses/Exams/Payments pages
    // have something to select from right away.
    const [existingCourses] = await pool.query("SELECT id FROM courses LIMIT 1");
    if (existingCourses.length === 0) {
      const starterCourses = [
        ["CS101", "BSc (Hons) in Computer Science", "Computing", "Algorithms, systems programming, and software architecture."],
        ["SE101", "BSc (Hons) in Software Engineering", "Computing", "Full-stack development, DevOps, and agile engineering practice."],
        ["BA101", "BBA in Business Analytics", "Business", "Data-driven business decisions, financial modeling, and market strategy."],
      ];
      for (const c of starterCourses) {
        await pool.query(
          "INSERT INTO courses (course_code, course_name, faculty, description) VALUES (?, ?, ?, ?)",
          c
        );
      }
      console.log("Seeded 3 starter courses (Manage from the Courses tab).");
    }

    // Seed a couple of starter timetable slots for CS101 so the student
    // Attendance/Timetable pages have something to show right away.
    const [existingSlots] = await pool.query("SELECT id FROM timetable LIMIT 1");
    if (existingSlots.length === 0) {
      const [csRows] = await pool.query("SELECT id FROM courses WHERE course_code = 'CS101' LIMIT 1");
      if (csRows.length > 0) {
        const courseId = csRows[0].id;
        const todayName = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][new Date().getDay()];
        const starterSlots = [
          [courseId, "Data Structures", todayName, "09:00:00", "10:30:00", "Lab 1"],
          [courseId, "Web Development", todayName, "11:00:00", "12:30:00", "Room 204"],
        ];
        for (const s of starterSlots) {
          await pool.query(
            "INSERT INTO timetable (course_id, subject_name, day_of_week, start_time, end_time, venue) VALUES (?, ?, ?, ?, ?, ?)",
            s
          );
        }
        console.log(`Seeded 2 starter timetable slots for today (${todayName}) so you can test attendance marking.`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error("Failed to seed admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();
