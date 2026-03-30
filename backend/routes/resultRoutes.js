const express = require("express");
const {
  getHealth,
  getStudentResult,
} = require("../controllers/resultController");

const router = express.Router();

router.get("/", getHealth);
router.get("/api/results/:studentId", getStudentResult);

module.exports = router;
