import { requireAdmin } from "../services/auth-service.js";
import { getAllUsers, setUserActive, getToolRecords, updateToolRecord } from "../services/api-service.js";

const usersContainer = document.querySelector("[data-admin-users]");
const toolsContainer = document.querySelector("[data-admin-tools]");
const toast = document.querySelector("[data-admin-toast]");

let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("is-visible");

  if (toastTimer) clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.hidden = true;
  }, 2500);
}

function renderUserRow(user) {
  const row = document.createElement("div");
  const info = document.createElement("div");
  const name = document.createElement("p");
  const email = document.createElement("span");
  const toggle = document.createElement("button");

  row.className = "admin-row";
  row.dataset.adminUserId = user.id;

  info.className = "admin-row-info";

  name.className = "admin-row-name";
  name.textContent = `${user.firstName} ${user.lastName}`;

  if (user.role === "admin") {
    const badge = document.createElement("span");
    badge.className = "admin-badge";
    badge.textContent = "admin";
    name.appendChild(badge);
  }

  email.className = "admin-row-email";
  email.textContent = user.email;

  toggle.className = "admin-toggle";
  toggle.type = "button";
  toggle.dataset.adminToggleUser = user.id;
  toggle.dataset.adminActive = user.active ? "true" : "false";
  toggle.setAttribute("aria-label", user.active ? "Deactivate user" : "Activate user");
  toggle.textContent = user.active ? "Active" : "Inactive";
  toggle.classList.toggle("is-active", Boolean(user.active));
  toggle.disabled = user.role === "admin";

  info.append(name, email);
  row.append(info, toggle);

  return row;
}

function renderToolRow(tool) {
  const row = document.createElement("div");
  const info = document.createElement("div");
  const nameInput = document.createElement("input");
  const descInput = document.createElement("input");
  const saveButton = document.createElement("button");

  row.className = "admin-row admin-row--tool";
  row.dataset.adminToolId = tool.id;

  info.className = "admin-row-info";

  nameInput.className = "admin-input";
  nameInput.type = "text";
  nameInput.value = tool.name;
  nameInput.dataset.adminToolName = tool.id;
  nameInput.setAttribute("aria-label", "Tool name");

  descInput.className = "admin-input admin-input--secondary";
  descInput.type = "text";
  descInput.value = tool.description ?? "";
  descInput.placeholder = "No description";
  descInput.dataset.adminToolDesc = tool.id;
  descInput.setAttribute("aria-label", "Tool description");

  saveButton.className = "admin-save";
  saveButton.type = "button";
  saveButton.dataset.adminSaveTool = tool.id;
  saveButton.textContent = "Save";

  info.append(nameInput, descInput);
  row.append(info, saveButton);

  return row;
}

async function handleToggleUser(userId, currentActive) {
  const nextActive = !currentActive;

  try {
    await setUserActive(userId, nextActive);

    const toggle = document.querySelector(`[data-admin-toggle-user="${userId}"]`);

    toggle.dataset.adminActive = nextActive ? "true" : "false";
    toggle.textContent = nextActive ? "Active" : "Inactive";
    toggle.classList.toggle("is-active", nextActive);
    toggle.setAttribute("aria-label", nextActive ? "Deactivate user" : "Activate user");

    showToast(nextActive ? "User activated." : "User deactivated.");
  } catch {
    showToast("Failed to update user. Please try again.");
  }
}

async function handleSaveTool(toolId) {
  const nameInput = document.querySelector(`[data-admin-tool-name="${toolId}"]`);
  const descInput = document.querySelector(`[data-admin-tool-desc="${toolId}"]`);
  const saveButton = document.querySelector(`[data-admin-save-tool="${toolId}"]`);

  const name = nameInput.value.trim();
  const description = descInput.value.trim();

  if (!name) {
    showToast("Tool name cannot be empty.");
    return;
  }

  saveButton.disabled = true;

  try {
    await updateToolRecord(toolId, { name, description });
    showToast("Tool updated.");
  } catch {
    showToast("Failed to update tool. Please try again.");
  } finally {
    saveButton.disabled = false;
  }
}

async function loadUsers() {
  const users = await getAllUsers();

  usersContainer.replaceChildren(...users.map(renderUserRow));
}

async function loadTools() {
  const tools = await getToolRecords();

  toolsContainer.replaceChildren(...tools.map(renderToolRow));
}

document.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("[data-admin-toggle-user]");
  const saveButton = event.target.closest("[data-admin-save-tool]");

  if (toggleButton) {
    const userId = toggleButton.dataset.adminToggleUser;
    const currentActive = toggleButton.dataset.adminActive === "true";

    handleToggleUser(userId, currentActive);
  }

  if (saveButton) {
    handleSaveTool(saveButton.dataset.adminSaveTool);
  }
});

async function init() {
  const isAdmin = await requireAdmin();

  if (!isAdmin) return;

  await Promise.all([loadUsers(), loadTools()]);
}

init();
