const {
  findStudent,
  formatStudentResult,
  listCourses,
} = require("../services/resultService");
const {
  createUser,
  listUsers,
  loginUser,
  updateUserRole,
} = require("../services/authService");
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
    const assignedCourses = normalizeCourseList(
      req.user?.courses?.length ? req.user.courses : req.user?.course,
    );
    const requestedCourse = normalizeOptionalText(req.query.course).toLowerCase();
    const coursesToQuery =
      req.user?.role === "ADMIN"
        ? normalizeCourseList(requestedCourse || assignedCourses)
        : assignedCourses;

    if (coursesToQuery.length === 0) {
      return res.status(400).json({
        message: "At least one course is required.",
      });
    }

    const results = await listCourseResults({ courses: coursesToQuery });
    return res.json({ courses: coursesToQuery, results });
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

    const teacherCourses = normalizeCourseList(
      req.user?.courses?.length ? req.user.courses : req.user?.course,
    );
    if (
      req.user?.role !== "ADMIN" &&
      (teacherCourses.length === 0 || !teacherCourses.includes(existing.course))
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

function normalizeCourseList(value) {
  const rawValues = Array.isArray(value) ? value : [value];
  const normalized = rawValues
    .flatMap((item) => String(item || "").split(","))
    .map((item) => normalizeOptionalText(item).toLowerCase())
    .filter(Boolean);

  return [...new Set(normalized)];
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

async function getAdminUsers(req, res) {
  try {
    const result = await listUsers(req.user);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("List users API error:", error);
    return res.status(500).json({
      message: "Unable to load users right now.",
    });
  }
}

async function patchAdminUserRole(req, res) {
  try {
    const result = await updateUserRole(req.user, req.params.userId, req.body || {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Update user role API error:", error);
    return res.status(500).json({
      message: "Unable to update user role right now.",
    });
  }
}

module.exports = {
  createTeacherAccount,
  getAdminUsers,
  patchAdminUserRole,
  getCourses,
  getHealth,
  getAnalytics,
  getTeacherCourseResults,
  patchTeacherCourseResult,
  getStudentResult,
  login,
  uploadTeacherResults,
};
