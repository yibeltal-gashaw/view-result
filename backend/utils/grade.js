const DEFAULT_GRADE_SCALE = [
  { min: 90, grade: "A+" },
  { min: 85, grade: "A" },
  { min: 80, grade: "A-" },
  { min: 75, grade: "B+" },
  { min: 70, grade: "B" },
  { min: 65, grade: "B-" },
  { min: 60, grade: "C+" },
  { min: 50, grade: "C" },
  { min: 45, grade: "D" },
  { min: 0, grade: "F" },
];

function calculateGrade(total) {
  const numericTotal =
    typeof total === "number" ? total : Number(String(total || "").trim());

  if (!Number.isFinite(numericTotal)) {
    return "";
  }

  const matchedBand = DEFAULT_GRADE_SCALE.find(
    (band) => numericTotal >= band.min,
  );

  return matchedBand?.grade || "";
}

module.exports = {
  calculateGrade,
  DEFAULT_GRADE_SCALE,
};
