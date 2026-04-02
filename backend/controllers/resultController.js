const {
  findStudent,
  formatStudentResult,
  listCourses,
} = require("../services/resultService");
const { createUser, loginUser } = require("../services/authService");
const { uploadCourseResults } = require("../services/uploadService");
const { getAnalyticsData } = require("../services/analyticsService");
const {
  listCourseResults,
  updateCourseResult,
} = require("../services/teacherCourseResultsService");
const { prisma } = require("../config/database");
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

async function getAnalytics(req, res) {
  try {
    const analyticsData = await getAnalyticsData();
    return res.json({ analyticsData });
  } catch (error) {
    console.error("Analytics API error:", error);
    return res.status(500).json({
      message: "Unable to load analytics right now.",
    });
  }
}

async function getTeacherCourseResults(req, res) {
  try {
    const requestedCourse =
      req.user.course

    if (!requestedCourse) {
      return res.status(400).json({
        message: "Course is required.",
      });
    }

    const results = await listCourseResults({ course: requestedCourse });
    return res.json({ course: requestedCourse, results });
  } catch (error) {
    console.error("Teacher course results API error:", error);
    return res.status(500).json({
      message: "Unable to load course results right now.",
    });
  }
}

async function patchTeacherCourseResult(req, res) {
  try {
    const resultId = req.params.resultId;
    const numericId = Number(resultId);

    if (!Number.isFinite(numericId)) {
      return res.status(400).json({ message: "Invalid result id." });
    }

    const existing = await prisma.result.findUnique({
      where: { id: numericId },
      select: { id: true, course: true },
    });

    if (!existing) {
      return res.status(404).json({ message: "Result not found." });
    }

    const teacherCourse = normalizeOptionalText(req.user?.course).toLowerCase();
    if (
      req.user?.role !== "ADMIN" &&
      (!teacherCourse || existing.course !== teacherCourse)
    ) {
      return res.status(403).json({
        message: "You do not have access to update this result.",
      });
    }

    const outcome = await updateCourseResult({
      resultId,
      updates: req.body || {},
    });

    return res.status(outcome.status).json(outcome.body);
  } catch (error) {
    console.error("Teacher course update API error:", error);
    return res.status(500).json({
      message: "Unable to update the result right now.",
    });
  }
}

async function login(req, res) {
  try {
    const result = await loginUser(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Login API error:", error);
    return res.status(500).json({
      message: "Unable to login right now.",
    });
  }
}

async function createTeacherAccount(req, res) {
  try {
    const result = await createUser(req.user, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Create user API error:", error);
    return res.status(500).json({
      message: "Unable to create user account right now.",
    });
  }
}

module.exports = {
  createTeacherAccount,
  getCourses,
  getHealth,
  getAnalytics,
  getTeacherCourseResults,
  patchTeacherCourseResult,
  getStudentResult,
  login,
  uploadTeacherResults,
};
