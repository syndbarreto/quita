import { getUserRecord, updateUserRecord } from "../services/api-service.js";
import { getCurrentUser, requireAuth } from "../services/auth-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const authUser = getCurrentUser();
const form = document.querySelector("[data-edit-profile-form]");
const fullNameInput = document.querySelector("[data-full-name]");
const birthDateInput = document.querySelector("[data-birth-date]");
const emailInput = document.querySelector("[data-email]");
const emergencyNameInput = document.querySelector("[data-emergency-name]");
const emergencyPhoneInput = document.querySelector("[data-emergency-phone]");
const saveButton = document.querySelector("[data-edit-save]");
const messageElement = document.querySelector("[data-edit-message]");

function getDisplayName(user) {
  return [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map(name => name.trim())
    .filter(Boolean)
    .join(" ");
}

function splitName(fullName) {
  const nameParts = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName: nameParts[0] ?? "",
    lastName: nameParts.slice(1).join(" "),
  };
}

function setInputValue(input, value = "") {
  if (!input) {
    return;
  }

  input.value = value ?? "";
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

function selectSex(value) {
  const sexInput = form?.querySelector(`input[name="sex"][value="${value}"]`);

  if (sexInput) {
    sexInput.checked = true;
  }
}

function showMessage(message) {
  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.hidden = !message;
}

function setSavingState(isSaving) {
  if (!saveButton) {
    return;
  }

  saveButton.disabled = isSaving;
  saveButton.textContent = isSaving ? "Saving..." : "Save changes";
}

function fillProfileForm(user) {
  const emergencyContact = user?.emergencyContact ?? {};

  setInputValue(fullNameInput, getDisplayName(user));
  setInputValue(birthDateInput, user?.birthDate);
  setInputValue(emailInput, user?.email);
  setInputValue(emergencyNameInput, emergencyContact.name);
  setInputValue(emergencyPhoneInput, formatPhoneNumber(emergencyContact.phone ?? ""));
  selectSex(user?.sex);
}

function getProfilePayload() {
  const formData = new FormData(form);
  const { firstName, lastName } = splitName(formData.get("fullName")?.toString() ?? "");

  return {
    firstName,
    lastName,
    birthDate: formData.get("birthDate")?.toString() ?? "",
    email: formData.get("email")?.toString().trim() ?? "",
    sex: formData.get("sex")?.toString() ?? "",
    emergencyContact: {
      name: formData.get("emergencyName")?.toString().trim() ?? "",
      phone: formatPhoneNumber(formData.get("emergencyPhone")?.toString() ?? ""),
    },
  };
}

async function loadEditableProfile() {
  if (!authUser?.id) {
    fillProfileForm(authUser);
    return;
  }

  try {
    const user = await getUserRecord(authUser.id);
    fillProfileForm(user);
  } catch (error) {
    showMessage(error.message);
    fillProfileForm(authUser);
  }
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  showMessage("");

  if (!authUser?.id) {
    showMessage("You need to be logged in to update your profile.");
    return;
  }

  try {
    setSavingState(true);
    await updateUserRecord(authUser.id, getProfilePayload());
    window.location.href = "./profile.html";
  } catch (error) {
    showMessage(error.message);
  } finally {
    setSavingState(false);
  }
});

emergencyPhoneInput?.addEventListener("input", () => {
  emergencyPhoneInput.value = formatPhoneNumber(emergencyPhoneInput.value);
});

loadEditableProfile();
