const LEGACY_ASSESSMENTS = [
  { key: "midExam", label: "Mid Exam", field: "mid exam" },
  { key: "quiz", label: "Quiz", field: "quiz" },
  { key: "lab", label: "Lab", field: "lab" },
  { key: "project", label: "Project", field: "project" },
  { key: "finalExam", label: "Final Exam", field: "final exam" },
];

const COURSE_ASSESSMENTS = {
  fss: LEGACY_ASSESSMENTS,
};

function getCourseAssessments(courseCode) {
  return COURSE_ASSESSMENTS[courseCode] || LEGACY_ASSESSMENTS;
}

module.exports = {
  COURSE_ASSESSMENTS,
  LEGACY_ASSESSMENTS,
  getCourseAssessments,
};
