const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

export function getTeacherUploadEndpoint() {
  return API_BASE_URL
    ? `${API_BASE_URL}/api/teacher/results/upload`
    : "/api/teacher/results/upload";
}

export async function uploadTeacherResults({ token, payload }) {
  const response = await fetch(getTeacherUploadEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-teacher-token": token,
    },
    body: JSON.stringify(payload),
  });

  const rawText = await response.text();
  let data = null;

  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const error = new Error(data?.message || "Unable to upload course results.");
    error.errors = Array.isArray(data?.errors) ? data.errors : [];
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  if (!data) {
    throw new Error("The upload service returned an invalid response.");
  }

  return data;
}
