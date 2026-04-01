function createAssessment(key, label, field, aliases = []) {
  return {
    key,
    label,
    field,
    aliases,
  };
}

const LEGACY_ASSESSMENTS = [
  createAssessment("midExam", "Mid Exam", "mid exam"),
  createAssessment("quiz", "Quiz", "quiz"),
  createAssessment("lab", "Lab", "lab"),
  createAssessment("project", "Project", "project"),
  createAssessment("finalExam", "Final Exam", "final exam"),
];

const COURSE_ASSESSMENTS = {
  fss: LEGACY_ASSESSMENTS,
};

const RESERVED_RESULT_FIELDS = new Set([
  "_id",
  "__v",
  "Student ID",
  "First Name",
  "Father Name",
  "Sex",
  "year",
  "Year",
  "course",
  "Course",
  "total",
  "grade",
  "assessments",
]);

function getCourseAssessments(courseCode) {
  return COURSE_ASSESSMENTS[String(courseCode || "").trim().toLowerCase()] || [];
}

function normalizeAssessmentIdentifier(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");
}

module.exports = {
  COURSE_ASSESSMENTS,
  LEGACY_ASSESSMENTS,
  RESERVED_RESULT_FIELDS,
  createAssessment,
  getCourseAssessments,
  normalizeAssessmentIdentifier,
};
