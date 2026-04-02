const express = require("express");
const {
  createTeacherAccount,
  getCourses,
  getHealth,
  getAnalytics,
  getStudentResult,
  login,
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

module.exports = router;
