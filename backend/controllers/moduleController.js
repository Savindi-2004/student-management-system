const pool = require("../config/db");

async function getModulesForCourse(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM modules WHERE course_id = ? ORDER BY id ASC",
      [req.params.courseId]
    );
    res.json({ modules: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch modules." });
  }
}

async function createModule(req, res) {
  try {
    const { moduleCode, moduleName, description, credits } = req.body;
    if (!moduleName) {
      return res.status(400).json({ message: "Module name is required." });
    }
    const [result] = await pool.query(
      "INSERT INTO modules (course_id, module_code, module_name, description, credits) VALUES (?, ?, ?, ?, ?)",
      [req.params.courseId, moduleCode || null, moduleName, description || null, credits || null]
    );
    res.status(201).json({ message: "Module added.", moduleId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not add module." });
  }
}

async function updateModule(req, res) {
  try {
    const { moduleCode, moduleName, description, credits } = req.body;
    const [rows] = await pool.query("SELECT id FROM modules WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Module not found." });

    await pool.query(
      "UPDATE modules SET module_code = ?, module_name = ?, description = ?, credits = ? WHERE id = ?",
      [moduleCode || null, moduleName, description || null, credits || null, req.params.id]
    );
    res.json({ message: "Module updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update module." });
  }
}

async function deleteModule(req, res) {
  try {
    const [rows] = await pool.query("SELECT id FROM modules WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: "Module not found." });
    await pool.query("DELETE FROM modules WHERE id = ?", [req.params.id]);
    res.json({ message: "Module removed." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not remove module." });
  }
}

module.exports = { getModulesForCourse, createModule, updateModule, deleteModule };