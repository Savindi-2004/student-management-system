const express = require("express");
const router = express.Router();
const { getPublicCourses } = require("../controllers/courseController");

router.get("/courses", getPublicCourses);

module.exports = router;
