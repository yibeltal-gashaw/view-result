import { buildApiUrl, getApiBaseUrl } from "./apiBaseUrl";

export function getResultEndpoint(studentId, year, course) {
  const apiBaseUrl = getApiBaseUrl();
  const endpoint = new URL(
    buildApiUrl(`/api/results/${encodeURIComponent(studentId)}`),
    window.location.origin,
  );

  if (year) {
    endpoint.searchParams.set("year", year);
  }

  if (course) {
    endpoint.searchParams.set("course", course);
  }

  const queryString = endpoint.searchParams.toString();
  const basePath = apiBaseUrl
    ? buildApiUrl(`/api/results/${encodeURIComponent(studentId)}`)
    : endpoint.pathname;

  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function getCoursesEndpoint() {
  return buildApiUrl("/api/courses");
}

export async function fetchCourses() {
  const response = await fetch(getCoursesEndpoint(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await readApiResponse(response);

  return Array.isArray(data?.courses) ? data.courses : [];
}

export async function readApiResponse(response) {
  const rawText = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const looksLikeJson =
    contentType.includes("application/json") ||
    rawText.trim().startsWith("{") ||
    rawText.trim().startsWith("[");

  let data = null;

  if (looksLikeJson && rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(data?.message || "Unable to load result.");
  }

  if (!data) {
    throw new Error(
      getApiBaseUrl()
        ? "The result service returned an invalid response."
        : "The mini app is not connected to the backend. Set VITE_API_BASE_URL to your API server.",
    );
  }

  return data;
}
