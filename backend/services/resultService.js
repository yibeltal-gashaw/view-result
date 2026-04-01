const Student = require("../model/student.model");
const Result = require("../model/result.model");
const {
  COURSE_FIELDS,
  COURSE_MAP,
  DEFAULT_COURSE_NAME,
  YEAR_FIELDS,
  YEAR_MAP,
} = require("../config/resultOptions");
const {
  getCourseAssessments,
  LEGACY_ASSESSMENTS,
  normalizeAssessmentIdentifier,
} = require("../config/assessmentOptions");
const { getStudentField, resolveMappedValue } = require("../utils/resultFilters");
const { normalizeOptionalText, normalizeStudentId } = require("../utils/text");

async function findStudent(studentId, options = {}) {
  const normalizedStudentId = normalizeStudentId(studentId);
  const normalizedCourse = String(options.course || "").trim().toLowerCase();
  const normalizedYear = Number(options.year);

  let result;

  if (normalizedCourse && Number.isFinite(normalizedYear)) {
    result = await Result.findOne({
      studentId: normalizedStudentId,
      course: normalizedCourse,
      year: normalizedYear,
    }).lean();
  } else {
    result = await Result.findOne({
      studentId: normalizedStudentId,
    })
      .sort({ year: -1, updatedAt: -1 })
      .lean();
  }

  if (!result) {
    return null;
  }

  const student = await Student.findOne({
    studentId: normalizedStudentId,
  }).lean();

  return {
    student: student || buildFallbackStudent(normalizedStudentId),
    result,
  };
}

function formatStudentResult(record, options = {}) {
  const { student = {}, result = {} } = record || {};
  const requestedYear = resolveMappedValue(options.year, YEAR_MAP);
  const requestedCourse = resolveMappedValue(options.course, COURSE_MAP);
  const storedYear = getStudentField(result, YEAR_FIELDS, requestedYear);
  const storedCourse = getStudentField(
    result,
    COURSE_FIELDS,
    requestedCourse || DEFAULT_COURSE_NAME,
  );
  const year = resolveMappedValue(storedYear, YEAR_MAP);
  const course = resolveMappedValue(storedCourse, COURSE_MAP);
  const courseCode =
    normalizeOptionalText(options.course) || normalizeOptionalText(result.course);
  const assessmentItems = buildAssessmentItems(result, courseCode);
  const breakdown = assessmentItems.reduce((current, item) => {
    current[item.key] = item.value;
    return current;
  }, {});
  const firstName = student.firstName || "";
  const fatherName = student.fatherName || "";
  const sex = student.sex || "";

  return {
    studentId: student.studentId || result.studentId,
    firstName,
    fatherName,
    fullName: `${firstName} ${fatherName}`.trim(),
    sex,
    course,
    year,
    grade: result.grade,
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
  if (!assessments) {
    return {};
  }

  const entries =
    assessments instanceof Map
      ? Array.from(assessments.entries())
      : Object.entries(assessments);

  return entries.reduce((current, [key, value]) => {
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
};
