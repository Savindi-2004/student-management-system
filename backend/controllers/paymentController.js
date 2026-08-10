const pool = require("../config/db");

// GET /api/payments?search=&status=  - payment records table
async function getAllPayments(req, res) {
  try {
    const { search, status } = req.query;
    let sql = `SELECT p.*, s.student_reg_no, u.name AS student_name, c.course_name
               FROM payments p
               JOIN students s ON p.student_id = s.id
               JOIN users u ON s.user_id = u.id
               LEFT JOIN courses c ON p.course_id = c.id
               WHERE 1=1`;
    const params = [];
    if (status) { sql += " AND p.status = ?"; params.push(status); }
    if (search) {
      sql += " AND (u.name LIKE ? OR s.student_reg_no LIKE ?)";
      const like = `%${search}%`;
      params.push(like, like);
    }
    sql += " ORDER BY p.payment_date DESC, p.id DESC";

    const [rows] = await pool.query(sql, params);
    res.json({ payments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch payments." });
  }
}

// GET /api/payments/stats - total earnings (used on the dashboard overview)
async function getPaymentStats(req, res) {
  try {
    const [[{ totalEarnings }]] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS totalEarnings FROM payments"
    );
    res.json({ totalEarnings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch payment stats." });
  }
}

// POST /api/payments
async function createPayment(req, res) {
  try {
    const { studentId, courseId, feeType, amount, paymentMethod, transactionRef, paymentDate, status } = req.body;
    if (!studentId || !feeType || !amount || !paymentMethod || !paymentDate) {
      return res.status(400).json({ message: "Student, fee type, amount, method and date are required." });
    }
    const [result] = await pool.query(
      `INSERT INTO payments (student_id, course_id, fee_type, amount, payment_method, transaction_ref, payment_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [studentId, courseId || null, feeType, amount, paymentMethod, transactionRef || null, paymentDate, status || "Paid"]
    );
    res.status(201).json({ message: "Payment recorded successfully.", paymentId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not record payment." });
  }
}

// PUT /api/payments/:id
async function updatePayment(req, res) {
  try {
    const { feeType, amount, paymentMethod, transactionRef, paymentDate, status } = req.body;
    const [rows] = await pool.query("SELECT id FROM payments WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Payment record not found." });

    await pool.query(
      `UPDATE payments SET fee_type = ?, amount = ?, payment_method = ?, transaction_ref = ?, payment_date = ?, status = ?
       WHERE id = ?`,
      [feeType, amount, paymentMethod, transactionRef || null, paymentDate, status, req.params.id]
    );
    res.json({ message: "Payment updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update payment." });
  }
}

// DELETE /api/payments/:id
async function deletePayment(req, res) {
  try {
    const [rows] = await pool.query("SELECT id FROM payments WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Payment record not found." });
    await pool.query("DELETE FROM payments WHERE id = ?", [req.params.id]);
    res.json({ message: "Payment deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete payment." });
  }
}

// POST /api/payments/:id/remind
// NOTE: No SMS/Email provider is configured in this project, so this endpoint
// just logs that a reminder was triggered and stamps reminder_sent_at.
// To send a real SMS/Email, wire this up to a provider such as Twilio or
// Nodemailer using your own API credentials.
async function sendReminder(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.name AS student_name, u.email FROM payments p
       JOIN students s ON p.student_id = s.id JOIN users u ON s.user_id = u.id
       WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Payment record not found." });

    await pool.query("UPDATE payments SET reminder_sent_at = NOW() WHERE id = ?", [req.params.id]);
    console.log(`[reminder] Would notify ${rows[0].student_name} (${rows[0].email}) about a ${rows[0].status} payment.`);

    res.json({ message: "Reminder logged (no SMS/Email provider connected yet)." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not send reminder." });
  }
}

// GET /api/payments/me - student: their own payment history
async function getMyPayments(req, res) {
  try {
    const [studentRows] = await pool.query("SELECT id FROM students WHERE user_id = ?", [req.session.user.id]);
    if (studentRows.length === 0) return res.json({ payments: [] });
    const studentId = studentRows[0].id;

    const [rows] = await pool.query(
      `SELECT p.*, c.course_name FROM payments p
       LEFT JOIN courses c ON p.course_id = c.id
       WHERE p.student_id = ?
       ORDER BY p.payment_date DESC, p.id DESC`,
      [studentId]
    );
    res.json({ payments: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch your payments." });
  }
}

module.exports = { getAllPayments, getPaymentStats, createPayment, updatePayment, deletePayment, sendReminder, getMyPayments };
