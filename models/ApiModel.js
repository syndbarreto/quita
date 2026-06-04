import { getAuthToken, getCurrentUser } from "./AuthModel.js";

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
    throw new Error(data?.message || "Request failed. Please try again.");
  }

  return data;
}

export async function createOwnedRecord(collection, payload) {
  const user = getCurrentUser();

  if (!user?.id) {
    throw new Error("You need to be logged in to save this data.");
  }

  return apiRequest(`/${collection}`, {
    method: "POST",
    body: {
      ...payload,
      userId: user.id,
    },
  });
}

export function createQuitaRecord(quita) {
  return createOwnedRecord("quitas", quita);
}
