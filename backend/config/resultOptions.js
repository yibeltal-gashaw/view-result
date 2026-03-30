const COURSE_MAP = {
  fss: "Fundamentals of Software Security",
};

const YEAR_MAP = {
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
  4: "Year 4",
  5: "Year 5",
};

const YEAR_FIELDS = ["Year", "year"];
const COURSE_FIELDS = ["Course", "course"];
const DEFAULT_COURSE_NAME = COURSE_MAP.fss;

module.exports = {
  COURSE_FIELDS,
  COURSE_MAP,
  DEFAULT_COURSE_NAME,
  YEAR_FIELDS,
  YEAR_MAP,
};
