const { normalizeOptionalText } = require("./text");

function resolveMappedValue(value, valueMap) {
  const normalizedValue = normalizeOptionalText(value);

  return valueMap[normalizedValue] || normalizedValue;
}

function getCandidateValues(value, valueMap) {
  const normalizedValue = normalizeOptionalText(value);

  if (!normalizedValue) {
    return [];
  }

  const mappedValue = valueMap[normalizedValue];

  return mappedValue && mappedValue !== normalizedValue
    ? [normalizedValue, mappedValue]
    : [normalizedValue];
}

function getStudentField(student, fieldNames, fallback = "") {
  for (const fieldName of fieldNames) {
    const value = normalizeOptionalText(student[fieldName]);

    if (value) {
      return value;
    }
  }

  return fallback;
}

function buildFieldMatch(fieldNames, value) {
  const values = Array.isArray(value) ? value : [value];

  return {
    $or: fieldNames.flatMap((fieldName) =>
      values.map((candidateValue) => ({ [fieldName]: candidateValue })),
    ),
  };
}

module.exports = {
  buildFieldMatch,
  getCandidateValues,
  getStudentField,
  resolveMappedValue,
};
