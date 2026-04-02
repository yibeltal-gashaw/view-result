const express = require("express");
const {
  createTeacherAccount,
  getCourses,
  getHealth,
  getAnalytics,
  getTeacherCourseResults,
  getStudentResult,
  login,
  patchTeacherCourseResult,
  uploadTeacherResults,
} = require("../controllers/resultController");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", getHealth);
router.get("/api/courses", getCourses);
router.get("/api/results/:studentId", getStudentResult);
router.get(
  "/api/admin/analytics",
  requireAuth,
  requireRole("ADMIN", "TEACHER"),
  getAnalytics,
);
router.post("/api/auth/login", login);
router.post(
  "/api/admin/users",
  requireAuth,
  requireRole("ADMIN"),
  createTeacherAccount,
);
router.post(
  "/api/teacher/results/upload",
  requireAuth,
  requireRole("ADMIN", "TEACHER"),
  uploadTeacherResults,
);
router.get(
  "/api/teacher/course-results",
  requireAuth,
  requireRole("ADMIN", "TEACHER"),
  getTeacherCourseResults,
);
router.patch(
  "/api/teacher/course-results/:resultId",
  requireAuth,
  requireRole("ADMIN", "TEACHER"),
  patchTeacherCourseResult,
);

module.exports = router;
