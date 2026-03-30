import { courseMap, yearMap } from "../config/resultOptions";

export function getStudentIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("studentId") || "").trim().toUpperCase();
}

export function getYearFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const requestedYear = (params.get("year") || "").trim();

  return yearMap[requestedYear] ? requestedYear : Object.keys(yearMap)[0];
}

export function getCourseFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const requestedCourse = (params.get("course") || "").trim();

  return courseMap[requestedCourse]
    ? requestedCourse
    : Object.keys(courseMap)[0];
}

export function normalizeStudentId(value) {
  return value.trim().toUpperCase();
}

export function updateSearchParams({ studentId, year, course }) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("studentId", studentId);
  nextUrl.searchParams.set("year", year);
  nextUrl.searchParams.set("course", course);
  window.history.replaceState({}, "", nextUrl);
}
