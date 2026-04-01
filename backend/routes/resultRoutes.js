const express = require("express");
const {
  getHealth,
  getStudentResult,
  uploadTeacherResults,
} = require("../controllers/resultController");
const { requireTeacherToken } = require("../middleware/teacherAuth");

const router = express.Router();

router.get("/", getHealth);
router.get("/api/results/:studentId", getStudentResult);
router.post("/api/teacher/results/upload", uploadTeacherResults);

module.exports = router;
