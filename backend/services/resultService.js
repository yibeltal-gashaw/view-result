const Student = require("../model/student.model");
const {
  COURSE_FIELDS,
  COURSE_MAP,
  DEFAULT_COURSE_NAME,
  YEAR_FIELDS,
  YEAR_MAP,
} = require("../config/resultOptions");
const { getCourseAssessments } = require("../config/assessmentOptions");
const { getStudentField, resolveMappedValue } = require("../utils/resultFilters");
const { normalizeOptionalText } = require("../utils/text");

async function findStudent(studentId, options = {}) {
  const normalizedYear = Number(options.year);
  const normalizedCourse = String(options.course || "").trim().toLowerCase();

  return Student.findOne({
    "Student ID": studentId,
    course: normalizedCourse,
    year: normalizedYear,
  }).lean();
}

function formatStudentResult(student, options = {}) {
  const requestedYear = resolveMappedValue(options.year, YEAR_MAP);
  const requestedCourse = resolveMappedValue(options.course, COURSE_MAP);
  const storedYear = getStudentField(student, YEAR_FIELDS, requestedYear);
  const storedCourse = getStudentField(
    student,
    COURSE_FIELDS,
    requestedCourse || DEFAULT_COURSE_NAME,
  );
  const year = resolveMappedValue(storedYear, YEAR_MAP);
  const course = resolveMappedValue(storedCourse, COURSE_MAP);
  const courseCode = normalizeOptionalText(options.course) || normalizeOptionalText(student.course);
  const assessmentItems = buildAssessmentItems(student, courseCode);
  const breakdown = assessmentItems.reduce((result, item) => {
    result[item.key] = item.value;
    return result;
  }, {});

  return {
    studentId: student["Student ID"],
    firstName: student["First Name"],
    fatherName: student["Father Name"],
    fullName: `${student["First Name"]} ${student["Father Name"]}`.trim(),
    sex: student["Sex"],
    course,
    year,
    grade: student["grade"],
    total: student["total"],
    breakdown,
    assessmentItems,
    avatar: student["Sex"] === "M" ? "male" : "female",
  };
}

function buildAssessmentItems(student, courseCode) {
  const storedAssessments = normalizeAssessmentMap(student.assessments);

  if (Object.keys(storedAssessments).length > 0) {
    const configuredAssessments = getCourseAssessments(courseCode);

    if (configuredAssessments.length > 0) {
      return configuredAssessments.map((assessment) => ({
        key: assessment.key,
        label: assessment.label,
        value: storedAssessments[assessment.key] ?? storedAssessments[assessment.field] ?? null,
      }));
    }

    return Object.entries(storedAssessments).map(([key, value]) => ({
      key,
      label: humanizeAssessmentLabel(key),
      value,
    }));
  }

  return getCourseAssessments(courseCode).map((assessment) => ({
    key: assessment.key,
    label: assessment.label,
    value: student[assessment.field] ?? null,
  }));
}

function normalizeAssessmentMap(assessments) {
  if (!assessments) {
    return {};
  }

  if (assessments instanceof Map) {
    return Object.fromEntries(assessments.entries());
  }

  return assessments;
}

function humanizeAssessmentLabel(key) {
  return String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

module.exports = {
  findStudent,
  formatStudentResult,
};
