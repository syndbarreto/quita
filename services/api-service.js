import { getAuthToken, getCurrentUser, logoutUser } from "./auth-service.js";

const API_BASE_URL = "http://localhost:3000";

function createUrl(path) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(createUrl(path), {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      logoutUser();
      const error = new Error("Your session expired. Please log in again.");

      error.status = response.status;
      throw error;
    }

    const error = new Error(data?.message || "Request failed. Please try again.");

    error.status = response.status;
    throw error;
  }

  return data;
}

export async function createOwnedRecord(collection, payload) {
  const user = getCurrentUser();
  const token = getAuthToken();
  const serializedPayload =
    typeof payload?.toJSON === "function" ? payload.toJSON() : payload;

  if (!user?.id || !token) {
    logoutUser();
    throw new Error("You need to be logged in to save this data.");
  }

  return apiRequest(`/${collection}`, {
    method: "POST",
    body: {
      ...serializedPayload,
      userId: user.id,
    },
  });
}

export function getOwnedRecords(collection) {
  return apiRequest(`/${collection}`);
}

export function createQuitaRecord(quita) {
  return createOwnedRecord("quitas", quita);
}

export function getQuitaRecords() {
  return getOwnedRecords("quitas");
}

export function getQuitaRecord(id) {
  return apiRequest(`/quitas/${id}`);
}

export function updateQuitaRecord(id, payload) {
  return apiRequest(`/quitas/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function deleteQuitaRecord(id) {
  return apiRequest(`/quitas/${id}`, {
    method: "DELETE",
  });
}

export function getUserRecord(id) {
  return apiRequest(`/users/${id}`);
}

export function updateUserRecord(id, payload) {
  return apiRequest(`/users/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function getToolRecords() {
  return apiRequest("/tools");
}
