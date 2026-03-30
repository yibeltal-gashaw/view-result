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

const YEAR_CODE_FIELDS = ["year"];
const YEAR_LABEL_FIELDS = ["Year"];
const COURSE_CODE_FIELDS = ["course"];
const COURSE_LABEL_FIELDS = ["Course"];
const YEAR_FIELDS = [...YEAR_CODE_FIELDS, ...YEAR_LABEL_FIELDS];
const COURSE_FIELDS = [...COURSE_CODE_FIELDS, ...COURSE_LABEL_FIELDS];
const DEFAULT_COURSE_NAME = COURSE_MAP.fss;

module.exports = {
  COURSE_CODE_FIELDS,
  COURSE_FIELDS,
  COURSE_LABEL_FIELDS,
  COURSE_MAP,
  DEFAULT_COURSE_NAME,
  YEAR_CODE_FIELDS,
  YEAR_FIELDS,
  YEAR_LABEL_FIELDS,
  YEAR_MAP,
};
