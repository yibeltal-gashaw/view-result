import { buildApiUrl } from "./apiBaseUrl";

const TEACHER_AUTH_STORAGE_KEY = "teacher_auth_session";

export function getTeacherLoginEndpoint() {
  return buildApiUrl("/api/auth/login");
}

export function getTeacherUploadEndpoint() {
  return buildApiUrl("/api/teacher/results/upload");
}

export function getAdminUsersEndpoint() {
  return buildApiUrl("/api/admin/users");
}

export async function loginTeacher({ email, password }) {
  const response = await fetch(getTeacherLoginEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildApiError(data, "Unable to login.");
  }

  persistTeacherSession(data);
  return data;
}

export async function uploadTeacherResults({ token, payload }) {
  const response = await fetch(getTeacherUploadEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildApiError(data, "Unable to upload course results.");
  }

  return data;
}

export async function createTeacherAccount({ token, payload }) {
  const response = await fetch(getAdminUsersEndpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildApiError(data, "Unable to create teacher account.");
  }

  return data;
}

export async function fetchAdminUsers({ token }) {
  const response = await fetch(getAdminUsersEndpoint(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildApiError(data, "Unable to load users.");
  }

  return Array.isArray(data?.users) ? data.users : [];
}

export async function updateAdminUserRole({ token, userId, role, courses }) {
  const endpoint = `${getAdminUsersEndpoint()}/${encodeURIComponent(userId)}/role`;
  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role, courses }),
  });

  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw buildApiError(data, "Unable to update user role.");
  }

  return data?.user || null;
}

export function persistTeacherSession(session) {
  window.localStorage.setItem(
    TEACHER_AUTH_STORAGE_KEY,
    JSON.stringify({
      token: session?.token || "",
      user: session?.user || null,
    }),
  );
}

export function readTeacherSession() {
  const rawValue = window.localStorage.getItem(TEACHER_AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue?.token ? parsedValue : null;
  } catch {
    return null;
  }
}

export function clearTeacherSession() {
  window.localStorage.removeItem(TEACHER_AUTH_STORAGE_KEY);
}

function buildApiError(data, fallbackMessage) {
  const error = new Error(data?.message || fallbackMessage);
  error.errors = Array.isArray(data?.errors) ? data.errors : [];
  error.status = data?.status;
  error.payload = data;
  return error;
}

async function readJsonResponse(response) {
  const rawText = await response.text();

  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}
