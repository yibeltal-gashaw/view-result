const defaultYearOptions = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5"];
const defaultSubjectOptions = ["Fundamentals of Software Security"];

function parseEnvOptions(value, fallback) {
  const options = [
    ...new Set(
      (value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];

  return options.length > 0 ? options : fallback;
}

export const yearOptions = parseEnvOptions(
  import.meta.env.VITE_YEAR_OPTIONS,
  defaultYearOptions,
);

export const subjectOptions = parseEnvOptions(
  import.meta.env.VITE_SUBJECT_OPTIONS,
  defaultSubjectOptions,
);

export const scoreItems = [
  { key: "midExam", label: "Mid Exam" },
  { key: "quiz", label: "Quiz" },
  { key: "lab", label: "Lab" },
  { key: "project", label: "Project" },
  { key: "finalExam", label: "Final Exam" },
];
