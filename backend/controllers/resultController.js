const { findStudent, formatStudentResult } = require("../services/resultService");
const { normalizeOptionalText, normalizeStudentId } = require("../utils/text");

function getHealth(req, res) {
  res.send("Telegram bot is running");
}

async function getStudentResult(req, res) {
  const studentId = normalizeStudentId(req.params.studentId);
  const year = normalizeOptionalText(req.query.year);
  const course = normalizeOptionalText(req.query.course);
  console.log(`Received request for student ID: ${studentId}, year: ${year}, course: ${course}`);

  if (!studentId || studentId.length < 5) {
    return res.status(400).json({
      message: "Please provide a valid student ID.",
    });
  }

  if (!year) {
    return res.status(400).json({
      message: "Please provide a year.",
    });
  }

  if (!course) {
    return res.status(400).json({
      message: "Please provide a course.",
    });
  }

  try {
    const student = await findStudent(studentId, { year, course });

    if (!student) {
      return res.status(404).json({
        message: "Student result not found for the selected year and course.",
      });
    }

    return res.json(formatStudentResult(student, { year, course }));
  } catch (error) {
    console.error("Result API error:", error);
    return res.status(500).json({
      message: "Service unavailable. Please try again later.",
    });
  }
}

module.exports = {
  getHealth,
  getStudentResult,
};
