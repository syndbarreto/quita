const API_BASE_URL = "http://localhost:3000";
const AUTH_STORAGE_KEY = "quita.auth";

function decodeTokenPayload(token) {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = atob(normalizedPayload);

    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
}

function createSession(data) {
  const token = data.accessToken;
  const payload = token ? decodeTokenPayload(token) : null;
  const user = data.user ?? {
    id: payload?.sub ?? null,
    email: payload?.email ?? null,
  };

  return {
    accessToken: token,
    user,
  };
}

function saveSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

  return session;
}

async function requestAuth(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Authentication failed. Please try again.");
  }

  return saveSession(createSession(data));
}

export function getAuthSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function getAuthToken() {
  return getAuthSession()?.accessToken ?? null;
}

export function getCurrentUser() {
  return getAuthSession()?.user ?? null;
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export async function registerUser({ firstName, lastName, birthDate, email, password }) {
  return requestAuth("/register", {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    birthDate,
    email: email.trim(),
    password,
  });
}

export async function loginUser({ email, password }) {
  return requestAuth("/login", {
    email: email.trim(),
    password,
  });
}
