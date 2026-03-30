const { normalizeOptionalText } = require("./text");

function resolveMappedValue(value, valueMap) {
  const normalizedValue = normalizeOptionalText(value);

  return valueMap[normalizedValue] || normalizedValue;
}

function appendNumericCandidate(values, value) {
  const normalizedValue = normalizeOptionalText(value);

  if (!normalizedValue) {
    return;
  }

  const numericValue = Number(normalizedValue);

  if (Number.isFinite(numericValue) && !values.includes(numericValue)) {
    values.push(numericValue);
  }
}

function getCandidateValues(value, valueMap) {
  const normalizedValue = normalizeOptionalText(value);

  if (!normalizedValue) {
    return [];
  }

  const mappedValue = valueMap[normalizedValue];
  const values =
    mappedValue && mappedValue !== normalizedValue
      ? [normalizedValue, mappedValue]
      : [normalizedValue];

  appendNumericCandidate(values, normalizedValue);
  appendNumericCandidate(values, mappedValue);

  return values;
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
