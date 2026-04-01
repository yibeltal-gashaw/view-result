const {
  findStudent,
  formatStudentResult,
  listCourses,
} = require("../services/resultService");
const { uploadCourseResults } = require("../services/uploadService");
const { normalizeOptionalText, normalizeStudentId } = require("../utils/text");

function getHealth(req, res) {
  res.send("Telegram bot is running");
}

async function getCourses(req, res) {
  try {
    const courses = await listCourses();
    return res.json({ courses });
  } catch (error) {
    console.error("Course list API error:", error);
    return res.status(500).json({
      message: "Unable to load courses right now.",
    });
  }
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

async function uploadTeacherResults(req, res) {
  try {
    const result = await uploadCourseResults(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Teacher upload API error:", error);
    return res.status(500).json({
      message: "Unable to upload course results right now.",
    });
  }
}

module.exports = {
  getCourses,
  getHealth,
  getStudentResult,
  uploadTeacherResults,
};
