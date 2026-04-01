const { prisma } = require("../config/database");
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
  const preparedRows = [];

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

    preparedRows.push(preparedRow);
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

  const uniqueStudentIds = [...new Set(preparedRows.map((item) => item.studentDocument.studentId))];
  const existingStudents = await prisma.student.findMany({
    where: {
      studentId: {
        in: uniqueStudentIds,
      },
    },
    select: {
      studentId: true,
    },
  });
  const existingResults = await prisma.result.findMany({
    where: {
      OR: preparedRows.map((item) => ({
        studentId: item.resultDocument.studentId,
        year: item.resultDocument.year,
        course: item.resultDocument.course,
      })),
    },
    select: {
      studentId: true,
      year: true,
      course: true,
    },
  });

  const existingStudentIds = new Set(existingStudents.map((item) => item.studentId));
  const existingResultKeys = new Set(
    existingResults.map((item) => buildResultKey(item)),
  );

  await prisma.$transaction(
    preparedRows.flatMap((item) => [
      prisma.student.upsert({
        where: {
          studentId: item.studentDocument.studentId,
        },
        create: item.studentDocument,
        update: item.studentDocument,
      }),
      prisma.result.upsert({
        where: {
          studentId_year_course: {
            studentId: item.resultDocument.studentId,
            year: item.resultDocument.year,
            course: item.resultDocument.course,
          },
        },
        create: item.resultDocument,
        update: item.resultDocument,
      }),
    ]),
  );

  return {
    status: 200,
    body: {
      message: "Course results uploaded successfully.",
      students: summarizeUpsertCounts({
        total: preparedRows.length,
        existingKeys: existingStudentIds,
        keys: preparedRows.map((item) => item.studentDocument.studentId),
      }),
      results: summarizeUpsertCounts({
        total: preparedRows.length,
        existingKeys: existingResultKeys,
        keys: preparedRows.map((item) => buildResultKey(item.resultDocument)),
      }),
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
      grade: grade || calculateGrade(total),
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

function buildResultKey(result) {
  return `${result.studentId}::${result.year}::${result.course}`;
}

function summarizeUpsertCounts({ existingKeys, keys }) {
  let matchedCount = 0;
  let upsertedCount = 0;

  keys.forEach((key) => {
    if (existingKeys.has(key)) {
      matchedCount += 1;
    } else {
      upsertedCount += 1;
    }
  });

  return {
    matchedCount,
    modifiedCount: matchedCount,
    upsertedCount,
    insertedCount: upsertedCount,
  };
}

module.exports = {
  uploadCourseResults,
};
