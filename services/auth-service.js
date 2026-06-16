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

function saveToken(token) {
  localStorage.setItem(AUTH_STORAGE_KEY, token);

  return {
    accessToken: token,
    user: getCurrentUser(),
  };
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

  return saveToken(data.accessToken);
}

export function getAuthToken() {
  const session = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session)?.accessToken ?? session;
  } catch {
    return session;
  }
}

export function getCurrentUser() {
  const token = getAuthToken();
  const payload = token ? decodeTokenPayload(token) : null;

  return payload
    ? {
        id: Number(payload.sub),
        email: payload.email ?? null,
      }
    : null;
}

export function isAuthenticated() {
  return Boolean(getCurrentUser());
}

export function requireAuth() {
  if (!isAuthenticated()) {
    logoutUser();
    window.location.href = "./signupLogin.html?view=login";
    return false;
  }

  return true;
}

export async function requireAdmin() {
  if (!isAuthenticated()) {
    logoutUser();
    window.location.href = "./signupLogin.html?view=login";
    return false;
  }

  const user = getCurrentUser();
  
// Dynamic import evita dependência circular (api-service importa getAuthToken daqui)
  const { getUserRecord } = await import("./api-service.js");

  try {
    const data = await getUserRecord(user.id);
    if (data.role !== "admin") {
    window.location.href = "./home.html";
    return false;
  }

  } catch {
    window.location.href = "./home.html";
    return false;
  }

  return true;
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
    favTools: [],
  });
}

export async function loginUser({ email, password }) {
  return requestAuth("/login", {
    email: email.trim(),
    password,
  });
}
