import { getUserRecord, updateUserRecord } from "../services/api-service.js";
import { getCurrentUser, isAuthenticated, logoutUser } from "../services/auth-service.js";

const guestWall = document.querySelector("[data-guest-wall]");

if (!isAuthenticated()) {
  if (guestWall) guestWall.hidden = false;
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted && !isAuthenticated()) {
    window.location.replace("./authentication.html");
  }
});

const authUser = getCurrentUser();
const initialsElement = document.querySelector("[data-profile-initials]");
const profileNameElement = document.querySelector("[data-profile-name]");
const fullNameElement = document.querySelector("[data-profile-full-name]");
const birthDateElement = document.querySelector("[data-profile-birth-date]");
const sexElement = document.querySelector("[data-profile-sex]");
const emailElement = document.querySelector("[data-profile-email]");
const emergencyNameElement = document.querySelector("[data-emergency-name]");
const emergencyPhoneElement = document.querySelector("[data-emergency-phone]");
const emergencyCard = document.querySelector("[data-emergency-card]");
const adminButton = document.querySelector("[data-profile-admin]");
const logoutButton = document.querySelector("[data-profile-logout]");
const emergencyOpenButton = document.querySelector("[data-emergency-open]");
const emergencyOverlay = document.querySelector("[data-emergency-overlay]");
const emergencyCloseButton = document.querySelector("[data-emergency-close]");
const emergencyForm = document.querySelector("[data-emergency-form]");
const emergencyInputName = document.querySelector("[data-emergency-input-name]");
const emergencyInputPhone = document.querySelector("[data-emergency-input-phone]");
const emergencyRemoveButton = document.querySelector("[data-emergency-remove]");
const emergencySaveButton = document.querySelector("[data-emergency-save]");

let currentUser = null;

function getDisplayName(user) {
  return [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map(name => name.trim())
    .filter(Boolean)
    .join(" ");
}

function getInitials(user) {
  const names = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map(name => name.trim())
    .filter(Boolean);

  if (names.length) {
    return names.map(name => name[0]).join("").slice(0, 2).toUpperCase();
  }

  return user?.email?.slice(0, 2).toUpperCase() || "Q";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not set yet";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Not set yet";
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function setText(element, value, fallback = "Not set yet") {
  if (!element) {
    return;
  }

  element.textContent = value || fallback;
}

function formatPhoneNumber(value = "") {
  const digits = value.replace(/\D/g, "").slice(0, 13);

  if (!digits) {
    return "";
  }

  if (digits.startsWith("351")) {
    const country = digits.slice(0, 3);
    const first = digits.slice(3, 6);
    const second = digits.slice(6, 9);
    const third = digits.slice(9, 12);

    return [`(${country})`, first, second, third].filter(Boolean).join(" ");
  }

  if (digits.startsWith("55") && digits.length > 10) {
    const country = digits.slice(0, 2);
    const area = digits.slice(2, 4);
    const prefix = digits.slice(4, 9);
    const line = digits.slice(9, 13);
    const localNumber = line ? `${prefix}-${line}` : prefix;

    return [`(${country})`, area, localNumber].filter(Boolean).join(" ");
  }

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length > 6) {
    return `(${area}) ${prefix}-${line}`;
  }

  if (digits.length > 3) {
    return `(${area}) ${prefix}`;
  }

  return `(${area}`;
}

function renderProfile(user) {
  currentUser = user;
  const displayName = getDisplayName(user);
  const emergencyContact = user?.emergencyContact ?? {};

  if (adminButton) {
    adminButton.hidden = user?.role !== "admin";
  }

  setText(initialsElement, getInitials(user), "Q");
  setText(profileNameElement, displayName, "Quita friend");
  setText(fullNameElement, displayName);
  setText(birthDateElement, formatDate(user?.birthDate));
  setText(sexElement, user?.sex);
  setText(emailElement, user?.email);
  setText(emergencyNameElement, emergencyContact.name);
  setText(emergencyPhoneElement, emergencyContact.phone, "Add a trusted contact");
  emergencyCard?.classList.toggle("is-saved", Boolean(emergencyContact.name || emergencyContact.phone));
}

function setEmergencyInputValues(contact = {}) {
  if (emergencyInputName) {
    emergencyInputName.value = contact.name ?? "";
  }

  if (emergencyInputPhone) {
    emergencyInputPhone.value = formatPhoneNumber(contact.phone ?? "");
  }
}

function openEmergencyOverlay() {
  setEmergencyInputValues(currentUser?.emergencyContact);
  emergencyOverlay?.removeAttribute("hidden");
  emergencyOverlay?.classList.add("is-open");
  emergencyInputName?.focus();
}

function closeEmergencyOverlay() {
  emergencyOverlay?.classList.remove("is-open");
  emergencyOverlay?.setAttribute("hidden", "");
}

function setEmergencySavingState(isSaving) {
  if (emergencySaveButton) {
    emergencySaveButton.disabled = isSaving;
    emergencySaveButton.textContent = isSaving ? "Saving..." : "Save contact";
  }

  if (emergencyRemoveButton) {
    emergencyRemoveButton.disabled = isSaving;
  }
}

async function saveEmergencyContact(contact) {
  if (!authUser?.id) {
    return;
  }

  setEmergencySavingState(true);

  try {
    const updatedUser = await updateUserRecord(authUser.id, {
      emergencyContact: contact,
    });

    renderProfile(updatedUser);
    closeEmergencyOverlay();
  } finally {
    setEmergencySavingState(false);
  }
}

async function loadProfile() {
  if (!authUser?.id) {
    renderProfile(authUser);
    return;
  }

  try {
    const user = await getUserRecord(authUser.id);
    renderProfile(user);
  } catch {
    // never show admin button from JWT fallback — role must come from API
    renderProfile({ ...authUser, role: "user" });
  }
}

logoutButton?.addEventListener("click", () => {
  logoutUser();
  window.location.replace("./authentication.html");
});

emergencyOpenButton?.addEventListener("click", openEmergencyOverlay);
emergencyCloseButton?.addEventListener("click", closeEmergencyOverlay);

emergencyOverlay?.addEventListener("click", event => {
  if (event.target === emergencyOverlay) {
    closeEmergencyOverlay();
  }
});

emergencyForm?.addEventListener("submit", event => {
  event.preventDefault();
  const formData = new FormData(emergencyForm);

  saveEmergencyContact({
    name: formData.get("emergencyName")?.toString().trim() ?? "",
    phone: formatPhoneNumber(formData.get("emergencyPhone")?.toString() ?? ""),
  });
});

emergencyInputPhone?.addEventListener("input", () => {
  emergencyInputPhone.value = formatPhoneNumber(emergencyInputPhone.value);
});

emergencyRemoveButton?.addEventListener("click", () => {
  saveEmergencyContact({
    name: "",
    phone: "",
  });
});

loadProfile();
