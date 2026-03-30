const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

export function getResultEndpoint(studentId, year, subject) {
  const endpoint = new URL(
    `${API_BASE_URL}/api/results/${encodeURIComponent(studentId)}`,
    window.location.origin,
  );

  if (year) {
    endpoint.searchParams.set("year", year);
  }

  if (subject) {
    endpoint.searchParams.set("subject", subject);
  }

  const queryString = endpoint.searchParams.toString();
  const basePath = API_BASE_URL
    ? `${API_BASE_URL}/api/results/${encodeURIComponent(studentId)}`
    : endpoint.pathname;

  return queryString ? `${basePath}?${queryString}` : basePath;
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
      API_BASE_URL
        ? "The result service returned an invalid response."
        : "The mini app is not connected to the backend. Set VITE_API_BASE_URL to your API server.",
    );
  }

  return data;
}
