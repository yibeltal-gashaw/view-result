const defaultYearMap = {
  1: "Year 1",
  2: "Year 2",
  3: "Year 3",
  4: "Year 4",
  5: "Year 5",
};

const defaultCourseMap = {
  fss: "Fundamentals of Software Security",
  fds: "Fundamentals of Distributed Systems",
  cloud: "fundamentals of cloud computing",
  mad: "Mobile Application Development",
  srm: "Software risk management",
  spm: "Software project management"
};

function parseEnvMap(value, fallback) {
  const entries = (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf(":");

      if (separatorIndex === -1) {
        return null;
      }

      const key = item.slice(0, separatorIndex).trim();
      const label = item.slice(separatorIndex + 1).trim();

      return key && label ? [key, label] : null;
    })
    .filter(Boolean);

  return entries.length > 0 ? Object.fromEntries(entries) : fallback;
}

export const yearMap = parseEnvMap(
  import.meta.env.VITE_YEAR_MAP,
  defaultYearMap,
);

export const courseMap = parseEnvMap(
  import.meta.env.VITE_COURSE_MAP,
  defaultCourseMap,
);

export const yearOptions = Object.entries(yearMap).map(([value, label]) => ({
  value,
  label,
}));

export const courseOptions = Object.entries(courseMap).map(([value, label]) => ({
  value,
  label,
}));

export function getYearLabel(yearCode) {
  return yearMap[yearCode] || yearCode;
}

export function getCourseLabel(courseCode) {
  return courseMap[courseCode] || courseCode;
}

export const scoreItems = [
  { key: "midExam", label: "Mid Exam" },
  { key: "quiz", label: "Quiz" },
  { key: "lab", label: "Lab" },
  { key: "project", label: "Project" },
  { key: "finalExam", label: "Final Exam" },
];
