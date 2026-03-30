function normalizeStudentId(value = "") {
  return value.trim().toUpperCase();
}

function normalizeOptionalText(value = "") {
  return String(value).trim();
}

module.exports = {
  normalizeOptionalText,
  normalizeStudentId,
};
