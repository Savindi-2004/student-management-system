-- Student Management System - Database Schema
-- Import this file in phpMyAdmin (or run via MySQL CLI)

CREATE DATABASE IF NOT EXISTS student_management_system;
USE student_management_system;

-- Table: users
-- Stores login credentials for both Admin and Student accounts
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'student') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: students
-- Stores academic/profile details, linked to a users record
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    student_reg_no VARCHAR(20) NOT NULL UNIQUE,
    dob DATE,
    address VARCHAR(255),
    contact_no VARCHAR(15),
    course VARCHAR(100),
    enrollment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: courses
-- Master list of degree programs / courses offered
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    faculty VARCHAR(100),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Table: modules
-- Individual subjects/modules that make up a course 
CREATE TABLE IF NOT EXISTS modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    module_code VARCHAR(20),
    module_name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    credits INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Table: teachers
-- Teacher records managed by the admin (no login account of their own)
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_reg_no VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    contact_no VARCHAR(15),
    faculty VARCHAR(100),
    course VARCHAR(150),
    qualification VARCHAR(150),
    joined_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: timetable
-- Weekly lecture schedule per course, managed by the admin
CREATE TABLE IF NOT EXISTS timetable (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    teacher_id INT,
    day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Table: student_attendance
-- Subject-wise attendance. A record can be tied to a specific timetable
-- lecture slot (self-marked by the student) or entered directly by the
-- admin (marked_by = 'admin').
CREATE TABLE IF NOT EXISTS student_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    timetable_id INT NULL,
    course_id INT,
    subject_name VARCHAR(150),
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL DEFAULT 'Present',
    marked_by ENUM('student', 'admin') NOT NULL DEFAULT 'admin',
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (timetable_id) REFERENCES timetable(id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Table: teacher_attendance
CREATE TABLE IF NOT EXISTS teacher_attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late') NOT NULL DEFAULT 'Present',
    remarks VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
);

-- Table: exams
CREATE TABLE IF NOT EXISTS exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_name VARCHAR(150) NOT NULL,
    course_id INT NOT NULL,
    module_id INT,
    exam_type ENUM('Class Test', 'Mid-Exam', 'Final Exam', 'Assignment') NOT NULL DEFAULT 'Class Test',
    exam_date DATE,
    exam_time TIME,
    duration_minutes INT,
    venue VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE SET NULL
);

-- Table: exam_results
-- Grade boundaries used when a mark is entered: A >= 75, B >= 60, C >= 50, else F.
-- "status" (Pass/Fail) is auto-derived from marks and used for the pass-rate stat.
-- "attendance" is set separately by the admin when entering marks (Present/Absent
-- for that exam sitting) and is what students see in their Results table.
CREATE TABLE IF NOT EXISTS exam_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    student_id INT NOT NULL,
    marks DECIMAL(5,2) NOT NULL,
    grade CHAR(1) NOT NULL,
    status ENUM('Pass', 'Fail') NOT NULL,
    attendance ENUM('Present', 'Absent') NOT NULL DEFAULT 'Present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE KEY unique_result (exam_id, student_id)
);

-- Table: payments
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT,
    fee_type ENUM('Course Fee', 'Registration Fee', 'Exam Fee', 'Monthly Installment') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('Cash', 'Bank Transfer', 'Card Payment', 'Online Gateway') NOT NULL,
    transaction_ref VARCHAR(100),
    payment_date DATE NOT NULL,
    status ENUM('Paid', 'Partial', 'Overdue') NOT NULL DEFAULT 'Paid',
    reminder_sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Note: The default admin account is created separately by running
-- "npm run seed" (see backend/sql/seedAdmin.js) after you set up the
-- database and install dependencies. This hashes the password properly
-- instead of storing plain text in this file.
