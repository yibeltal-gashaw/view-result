const { prisma } = require("../config/database");
const {
  COURSE_MAP,
  DEFAULT_COURSE_NAME,
  YEAR_MAP,
} = require("../config/resultOptions");
const {
  getCourseAssessments,
  LEGACY_ASSESSMENTS,
  normalizeAssessmentIdentifier,
} = require("../config/assessmentOptions");
const { calculateGrade } = require("../utils/grade");
const { normalizeOptionalText, normalizeStudentId } = require("../utils/text");

async function findStudent(studentId, options = {}) {
  const normalizedStudentId = normalizeStudentId(studentId);
  const normalizedCourse = String(options.course || "").trim().toLowerCase();
  const normalizedYear = Number(options.year);

  let result;

  if (normalizedCourse && Number.isFinite(normalizedYear)) {
    result = await prisma.result.findUnique({
      where: {
        studentId_year_course: {
          studentId: normalizedStudentId,
          year: normalizedYear,
          course: normalizedCourse,
        },
      },
      include: {
        student: true,
      },
    });
  } else {
    result = await prisma.result.findFirst({
      where: {
        studentId: normalizedStudentId,
      },
      orderBy: [{ year: "desc" }, { updatedAt: "desc" }],
      include: {
        student: true,
      },
    });
  }

  if (!result) {
    return null;
  }

  return {
    student: result.student || buildFallbackStudent(normalizedStudentId),
    result,
  };
}

async function listCourses() {
  const courses = await prisma.result.findMany({
    where: {
      course: {
        not: "",
      },
    },
    distinct: ["course"],
    select: {
      course: true,
    },
    orderBy: {
      course: "asc",
    },
  });

  return courses.map(({ course }) => ({
    value: course,
    label: COURSE_MAP[course] || humanizeAssessmentLabel(course),
  }));
}

function formatStudentResult(record, options = {}) {
  const { student = {}, result = {} } = record || {};
  const yearCode = normalizeOptionalText(result.year || options.year);
  const courseCode =
    normalizeOptionalText(result.course || options.course).toLowerCase();
  const year = YEAR_MAP[yearCode] || YEAR_MAP[String(result.year)] || yearCode;
  const course = COURSE_MAP[courseCode] || courseCode || DEFAULT_COURSE_NAME;
  const assessmentItems = buildAssessmentItems(result, courseCode);
  const breakdown = assessmentItems.reduce((current, item) => {
    current[item.key] = item.value;
    return current;
  }, {});
  const firstName = student.firstName || "";
  const fatherName = student.fatherName || "";
  const sex = student.sex || "";
  const grade = normalizeOptionalText(result.grade) || calculateGrade(result.total);

  return {
    studentId: student.studentId || result.studentId,
    firstName,
    fatherName,
    fullName: `${firstName} ${fatherName}`.trim(),
    sex,
    course,
    year,
    grade,
    total: result.total,
    breakdown,
    assessmentItems,
    avatar: sex === "M" ? "male" : "female",
  };
}

function buildAssessmentItems(result, courseCode) {
  const configuredAssessments = getCourseAssessments(courseCode);
  const storedAssessments = normalizeAssessmentMap(result.assessments);

  if (configuredAssessments.length > 0) {
    const configuredItems = configuredAssessments.map((assessment) => ({
      key: assessment.key,
      label: assessment.label,
      value: resolveStoredAssessmentValue(storedAssessments, assessment),
    }));
    const configuredKeys = new Set(
      configuredAssessments.flatMap((assessment) =>
        [assessment.key, assessment.field, ...(assessment.aliases || [])].map(
          normalizeAssessmentIdentifier,
        ),
      ),
    );
    const extraItems = Object.entries(storedAssessments)
      .filter(([key]) => !configuredKeys.has(normalizeAssessmentIdentifier(key)))
      .map(([key, value]) => ({
        key,
        label: humanizeAssessmentLabel(key),
        value,
      }));

    return [...configuredItems, ...extraItems].filter((item) => item.value !== null);
  }

  if (Object.keys(storedAssessments).length > 0) {
    return Object.entries(storedAssessments).map(([key, value]) => ({
      key,
      label: humanizeAssessmentLabel(key),
      value,
    }));
  }

  return LEGACY_ASSESSMENTS.map((assessment) => ({
    key: assessment.key,
    label: assessment.label,
    value: null,
  }));
}

function normalizeAssessmentMap(assessments) {
  if (!assessments || typeof assessments !== "object") {
    return {};
  }

  return Object.entries(assessments).reduce((current, [key, value]) => {
    const normalizedValue = normalizeAssessmentValue(value);

    if (normalizedValue !== null) {
      current[key] = normalizedValue;
    }

    return current;
  }, {});
}

function normalizeAssessmentValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const normalizedValue = Number(String(value).trim());
  return Number.isFinite(normalizedValue) ? normalizedValue : null;
}

function resolveStoredAssessmentValue(storedAssessments, assessment) {
  const candidateKeys = new Set(
    [assessment.key, assessment.field, ...(assessment.aliases || [])].map(
      normalizeAssessmentIdentifier,
    ),
  );

  for (const [storedKey, storedValue] of Object.entries(storedAssessments)) {
    if (candidateKeys.has(normalizeAssessmentIdentifier(storedKey))) {
      return storedValue;
    }
  }

  return null;
}

function humanizeAssessmentLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function buildFallbackStudent(studentId) {
  return {
    studentId,
    firstName: "",
    fatherName: "",
    sex: "",
  };
}

module.exports = {
  findStudent,
  formatStudentResult,
  listCourses,
};
