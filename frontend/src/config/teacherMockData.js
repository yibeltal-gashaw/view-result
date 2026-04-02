export const SAMPLE_HEADERS = [
  "Student ID",
  "First Name",
  "Father Name",
  "Sex",
  "year",
  "course",
  "mid exam",
  "quiz",
  "lab",
  "project",
  "final exam",
  "total",
  "grade",
];

export const SAMPLE_ROW = [
  "MAU1602154",
  "Abel",
  "Kebede",
  "M",
  "3",
  "fss",
  "18",
  "9",
  "14",
  "16",
  "38",
  "95",
  "A",
];
export const REQUIRED_HEADERS = ["Student ID", "total"];
export const RESERVED_HEADERS = new Set([
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
]);