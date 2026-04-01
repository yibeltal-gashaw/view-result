const Student = require("../model/student.model");
const Result = require("../model/result.model");
const { RESERVED_RESULT_FIELDS } = require("../config/assessmentOptions");
const { normalizeOptionalText, normalizeStudentId } = require("../utils/text");
const { calculateGrade } = require("../utils/grade");

const REQUIRED_UPLOAD_FIELDS = ["Student ID", "total"];

async function uploadCourseResults(payload = {}) {
  const rows = Array.isArray(payload.rows) ? payload.rows : [];
  const defaultCourse = normalizeOptionalText(payload.course).toLowerCase();
  const defaultYear = normalizeYear(payload.year);

  if (rows.length === 0) {
    return {
      status: 400,
      body: {
        message: "Please provide at least one result row.",
      },
    };
  }

  const validationErrors = [];
  const studentOperations = [];
  const resultOperations = [];

  rows.forEach((rawRow, index) => {
    const preparedRow = prepareUploadRow(rawRow, {
      defaultCourse,
      defaultYear,
      rowIndex: index,
    });

    if (preparedRow.error) {
      validationErrors.push(preparedRow.error);
      return;
    }

    studentOperations.push({
      updateOne: {
        filter: {
          studentId: preparedRow.studentDocument.studentId,
        },
        update: {
          $set: preparedRow.studentDocument,
        },
        upsert: true,
      },
    });

    resultOperations.push({
      updateOne: {
        filter: {
          studentId: preparedRow.resultDocument.studentId,
          course: preparedRow.resultDocument.course,
          year: preparedRow.resultDocument.year,
        },
        update: {
          $set: preparedRow.resultDocument,
        },
        upsert: true,
      },
    });
  });

  if (validationErrors.length > 0) {
    return {
      status: 400,
      body: {
        message: "Some rows are invalid.",
        errors: validationErrors,
      },
    };
  }

  const [studentWriteResult, resultWriteResult] = await Promise.all([
    studentOperations.length > 0
      ? Student.bulkWrite(studentOperations, { ordered: false })
      : null,
    resultOperations.length > 0
      ? Result.bulkWrite(resultOperations, { ordered: false })
      : null,
  ]);

  return {
    status: 200,
    body: {
      message: "Course results uploaded successfully.",
      students: summarizeBulkResult(studentWriteResult),
      results: summarizeBulkResult(resultWriteResult),
    },
  };
}

function prepareUploadRow(rawRow, options) {
  if (!rawRow || typeof rawRow !== "object" || Array.isArray(rawRow)) {
    return {
      error: buildRowError(options.rowIndex, "Each row must be an object."),
    };
  }

  const missingFields = REQUIRED_UPLOAD_FIELDS.filter(
    (fieldName) => normalizeOptionalText(rawRow[fieldName]) === "",
  );

  if (missingFields.length > 0) {
    return {
      error: buildRowError(
        options.rowIndex,
        `Missing required field(s): ${missingFields.join(", ")}`,
      ),
    };
  }

  const studentId = normalizeStudentId(rawRow["Student ID"]);
  const year = normalizeYear(rawRow.year ?? rawRow.Year ?? options.defaultYear);
  const course = normalizeOptionalText(
    rawRow.course ?? rawRow.Course ?? options.defaultCourse,
  ).toLowerCase();
  const total = normalizeNumber(rawRow.total);
  const grade = normalizeOptionalText(rawRow.grade);

  if (!studentId || studentId.length < 5) {
    return {
      error: buildRowError(options.rowIndex, "Student ID is invalid."),
    };
  }

  if (year === null) {
    return {
      error: buildRowError(options.rowIndex, "Year is missing or invalid."),
    };
  }

  if (!course) {
    return {
      error: buildRowError(options.rowIndex, "Course is missing."),
    };
  }

  // if (total === null) {
  //   return {
  //     error: buildRowError(options.rowIndex, "Total must be numeric."),
  //   };
  // }

  const resolvedGrade = grade || calculateGrade(total);

  return {
    studentDocument: {
      studentId,
      firstName: normalizeOptionalText(rawRow["First Name"]),
      fatherName: normalizeOptionalText(rawRow["Father Name"]),
      sex: normalizeOptionalText(rawRow.Sex).toUpperCase(),
    },
    resultDocument: {
      studentId,
      year,
      course,
      total,
      grade: resolvedGrade,
      assessments: extractAssessments(rawRow),
    },
  };
}

function extractAssessments(row) {
  return Object.entries(row).reduce((current, [fieldName, value]) => {
    if (RESERVED_RESULT_FIELDS.has(fieldName)) {
      return current;
    }

    const normalizedValue = normalizeNumber(value);

    if (normalizedValue !== null) {
      current[fieldName] = normalizedValue;
    }

    return current;
  }, {});
}

function normalizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const numericValue = Number(String(value).trim());
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeYear(value) {
  const numericYear = normalizeNumber(value);
  return numericYear === null ? null : numericYear;
}

function buildRowError(index, message) {
  return {
    row: index + 1,
    message,
  };
}

function summarizeBulkResult(result) {
  if (!result) {
    return {
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      insertedCount: 0,
    };
  }

  return {
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
    upsertedCount: result.upsertedCount || 0,
    insertedCount: result.insertedCount || 0,
  };
}

module.exports = {
  uploadCourseResults,
};
