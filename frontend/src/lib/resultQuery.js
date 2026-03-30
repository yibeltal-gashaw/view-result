import { subjectOptions, yearOptions } from "../config/resultOptions";

export function getStudentIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return (params.get("studentId") || "").trim().toUpperCase();
}

export function getYearFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const requestedYear = (params.get("year") || "").trim();

  return yearOptions.includes(requestedYear) ? requestedYear : yearOptions[0];
}

export function getSubjectFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const requestedSubject = (params.get("subject") || "").trim();

  return subjectOptions.includes(requestedSubject)
    ? requestedSubject
    : subjectOptions[0];
}

export function normalizeStudentId(value) {
  return value.trim().toUpperCase();
}

export function updateSearchParams({ studentId, year, subject }) {
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("studentId", studentId);
  nextUrl.searchParams.set("year", year);
  nextUrl.searchParams.set("subject", subject);
  window.history.replaceState({}, "", nextUrl);
}
