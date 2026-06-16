import { getUserRecord } from "../services/api-service.js";
import { getCurrentUser, isAuthenticated } from "../services/auth-service.js";

const greetingTitle = document.querySelector("[data-user-greeting]");
const authUser = getCurrentUser();

function getFirstName(user) {
  return user?.firstName?.trim() || "";
}

function renderGreeting(firstName = "") {
  if (!greetingTitle) {
    return;
  }

  greetingTitle.textContent = firstName ? `Hi ${firstName}` : "Hi there";
}

async function loadHomeUser() {
  if (!authUser?.id) {
    renderGreeting();
    return;
  }

  try {
    const user = await getUserRecord(authUser.id);
    renderGreeting(getFirstName(user));
  } catch (error) {
    renderGreeting();
  }
}

loadHomeUser();
