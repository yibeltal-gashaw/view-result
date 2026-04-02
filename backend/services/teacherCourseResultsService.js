const { prisma } = require("../config/database");
const { calculateGrade } = require("../utils/grade");
const { normalizeOptionalText } = require("../utils/text");

function normalizeCourse(value) {
  return normalizeOptionalText(value).toLowerCase();
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const numericValue = Number(String(value).trim());
  return Number.isFinite(numericValue) ? numericValue : null;
}

async function listCourseResults({ course }) {
  const normalizedCourse = normalizeCourse(course);

  if (!normalizedCourse) {
    return [];
  }
  const results = await prisma.result.findMany({
    where: {
      course: normalizedCourse,
    },
    orderBy: [{ year: "asc" }, { studentId: "asc" }],
    include: {
      student: true,
    },
  });
  console.log("Results found:", results);
  return results.map((row) => ({
    id: row.id,
    studentId: row.studentId,
    fullName: `${row.student?.firstName || ""} ${row.student?.fatherName || ""}`.trim(),
    sex: row.student?.sex || "",
    year: row.year,
    course: row.course,
    total: row.total,
    grade: row.grade || calculateGrade(row.total),
    assessments: row.assessments || {},
    updatedAt: row.updatedAt,
  }));
}

async function updateCourseResult({ resultId, updates = {} }) {
  const id = Number(resultId);
  if (!Number.isFinite(id)) {
    return {
      status: 400,
      body: { message: "Invalid result id." },
    };
  }

  const nextTotal =
    updates.total === undefined ? undefined : normalizeNumber(updates.total);
  if (updates.total !== undefined && nextTotal === null) {
    return {
      status: 400,
      body: { message: "Total must be numeric." },
    };
  }

  const nextGrade =
    updates.grade === undefined ? undefined : normalizeOptionalText(updates.grade);
  const nextAssessments =
    updates.assessments === undefined ? undefined : updates.assessments;

  if (
    nextAssessments !== undefined &&
    (nextAssessments === null ||
      typeof nextAssessments !== "object" ||
      Array.isArray(nextAssessments))
  ) {
    return {
      status: 400,
      body: { message: "Assessments must be an object." },
    };
  }

  const existing = await prisma.result.findUnique({
    where: { id },
    select: { id: true, course: true, total: true, grade: true },
  });

  if (!existing) {
    return {
      status: 404,
      body: { message: "Result not found." },
    };
  }

  const totalForGrade =
    nextTotal !== undefined ? nextTotal : existing.total;
  const computedGrade =
    nextGrade !== undefined ? nextGrade : calculateGrade(totalForGrade);

  const updated = await prisma.result.update({
    where: { id },
    data: {
      ...(nextTotal !== undefined ? { total: nextTotal } : {}),
      ...(nextAssessments !== undefined ? { assessments: nextAssessments } : {}),
      grade: computedGrade || "",
    },
    include: { student: true },
  });

  return {
    status: 200,
    body: {
      message: "Result updated.",
      result: {
        id: updated.id,
        studentId: updated.studentId,
        firstName: updated.student?.firstName || "",
        fatherName: updated.student?.fatherName || "",
        fullName: `${updated.student?.firstName || ""} ${updated.student?.fatherName || ""}`.trim(),
        sex: updated.student?.sex || "",
        year: updated.year,
        course: updated.course,
        total: updated.total,
        grade: updated.grade || calculateGrade(updated.total),
        assessments: updated.assessments || {},
        updatedAt: updated.updatedAt,
      },
    },
  };
}

module.exports = {
  listCourseResults,
  updateCourseResult,
};

