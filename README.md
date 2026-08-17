# Student Management System

A full-stack Student Management System built for the PUSL2021 Referral Coursework.

Two roles: Admin & Student

Stack: HTML, CSS, JavaScript (frontend) · Node.js + Express (backend) ·
MySQL via phpMyAdmin/XAMPP (database)



1. Prerequisites

[XAMPP](https://www.apachefriends.org/) installed (for MySQL + phpMyAdmin)
[Node.js](https://nodejs.org/) installed (v18 or newer recommended)

 2. Set up the database

1.Start XAMPP and turn on the Apache and MySQL modules.
2.Open phpMyAdmin in the browser (usually `http://localhost/phpmyadmin`).
3.Click Import, choose the file `backend/sql/schema.sql`, and click Go.
   This creates the `student_management_system` database with two tables:
   `users` and `students`.

 3. Set up the backend

```bash
cd backend
npm install
```

Check the `.env` file (already included with sensible defaults for a default
XAMPP install — edit `DB_PASSWORD` if  MySQL root user has a password).

Create the default Admin login:

```bash
npm run seed
```

This prints the admin credentials:
```
Email:    admin@sms.com
Password: admin123
```

Start the server:

```bash
node server.js 
```

You should see:
```
Server running at http://localhost:3000
MySQL connected successfully.
```

4. Use the system

Open **http://localhost:3000** in your browser (the backend also serves the
frontend, so you don't need a separate server for the HTML/CSS/JS files).

Admin login: `admin@sms.com` / `admin123` 
Student: click "Sign Up" button in home page or "Register as a student" on login form to register,
  then log in to see your own dashboard.

5. Project structure

```
backend/
  server.js            Express app entry point
  config/db.js         MySQL connection pool
  middleware/           Session + role-based access control
  controllers/          Route logic (auth, students)
  routes/                API route definitions
  sql/schema.sql        Database schema (import via phpMyAdmin)
  sql/seedAdmin.js      Creates the default admin account

frontend/
  index.html            Home page
  login.html / register.html
  admin/                Admin dashboard + manage students (CRUD)
  student/               Student dashboard (own profile)
  css/style.css          Shared styles
  js/                     Page logic (fetch calls to the API)
```

6. API overview

| Method | Route                      | Access  | Purpose                    |
|--------|-----------------------------|---------|-----------------------------|
| POST   | /api/auth/register           | Public  | Student self-registration  |
| POST   | /api/auth/login               | Public  | Log in (admin or student)  |
| POST   | /api/auth/logout              | Any     | Log out                    |
| GET    | /api/auth/me                  | Any     | Current session user       |
| GET    | /api/students                  | Admin   | List all students          |
| POST   | /api/students                  | Admin   | Create a student           |
| PUT    | /api/students/:id               | Admin   | Update a student            |
| DELETE | /api/students/:id               | Admin   | Delete a student            |
| GET    | /api/students/me/profile        | Student | View own profile            |
| PUT    | /api/students/me/profile        | Student | Update own contact/address |

7. Notes for the report

Passwords are hashed with bcrypt before being    stored — never stored in plain text.
Access control is enforced server-side (`middleware/authMiddleware.js`),
  not just hidden in the UI — an admin route can't be reached by a logged-in
  student even by calling the API directly.
Sessions are managed with `express-session`, stored server-side and tied to
  a secure cookie.
Grade boundaries (Exams module): A ≥ 75, B ≥ 60, C ≥ 50, otherwise F. Pass
  is marks ≥ 50. These are simple assumptions and can be changed in
  `backend/controllers/examController.js` (`calculateGrade`).
Payment reminders are not sent via a real SMS/Email provider — no such
  credentials are configured. Instead, clicking "Remind" logs the action and timestamps it in the database (`reminder_sent_at`), and the student sees an in-app notification banner on their Dashboard the next time they log in
  (with a link to their Payments page). The banner automatically clears once
  the admin marks that payment as "Paid". Wiring this up to a real SMS/Email
  provider (e.g. Twilio for SMS, Nodemailer for Email) is a natural next step
  if you have your own API keys.
Student attendance can be marked two ways: by the admin directly (Attendance
  tab), or by the student themselves from their Attendance page — which
  requires re-entering their password as a lightweight identity check before
  the "Present" record is saved.
