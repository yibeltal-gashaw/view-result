const express = require("express");
const {
  getCourses,
  getHealth,
  getStudentResult,
  uploadTeacherResults,
} = require("../controllers/resultController");
const { requireTeacherToken } = require("../middleware/teacherAuth");

const router = express.Router();

router.get("/", getHealth);
router.get("/api/courses", getCourses);
router.get("/api/results/:studentId", getStudentResult);
router.post("/api/teacher/results/upload", uploadTeacherResults);

module.exports = router;
