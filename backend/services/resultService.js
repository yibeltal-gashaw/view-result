const Student = require("../model/student.model");
const {
  COURSE_FIELDS,
  COURSE_MAP,
  DEFAULT_COURSE_NAME,
  YEAR_FIELDS,
  YEAR_MAP,
} = require("../config/resultOptions");
const { getStudentField, resolveMappedValue } = require("../utils/resultFilters");

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
    breakdown: {
      midExam: student["mid exam"],
      quiz: student["quiz"],
      lab: student["lab"],
      project: student["project"],
      finalExam: student["final exam"],
    },
    avatar: student["Sex"] === "M" ? "male" : "female",
  };
}

module.exports = {
  findStudent,
  formatStudentResult,
};
