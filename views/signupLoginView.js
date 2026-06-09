import { loginUser, registerUser } from "../services/auth-service.js";

const views = [...document.querySelectorAll("[data-step]")];
const authForms = [...document.querySelectorAll("[data-auth-form]")];
const dateInputs = [...document.querySelectorAll("[data-date-input]")];

function showView(viewName) {
  views.forEach((view) => {
    view.hidden = view.dataset.step !== viewName;
  });
}

function getFormPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setAuthMessage(type, message = "") {
  const messageElement = document.querySelector(`[data-auth-message="${type}"]`);

  if (messageElement) {
    messageElement.textContent = message;
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const authType = form.dataset.authForm;
  const submitButton = form.querySelector(".submit-button");

  setAuthMessage(authType);
  submitButton.disabled = true;

  try {
    const payload = getFormPayload(form);

    if (authType === "signup") {
      await registerUser(payload);
      window.location.href = "./onboarding.html";
      return;
    }

    await loginUser(payload);
    window.location.href = "./home.html";
  } catch (error) {
    setAuthMessage(authType, error.message);
  } finally {
    submitButton.disabled = false;
  }
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-go-to-step]");

  if (!trigger) {
    return;
  }

  event.preventDefault(); // Previne que tags <a> recarreguem a página
  showView(trigger.dataset.goToStep);
});

// Verifica se na URL há indicação de qual vista abrir (ex: ?view=login)
const urlParams = new URLSearchParams(window.location.search);
const initialView = urlParams.get("view") || "signup";

showView(initialView);

authForms.forEach((form) => {
  form.addEventListener("submit", handleAuthSubmit);
});

dateInputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.type = "date";
  });

  input.addEventListener("blur", () => {
    if (!input.value) {
      input.type = "text";
    }
  });
});
