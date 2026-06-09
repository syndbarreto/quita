import { getQuitaRecord, updateQuitaRecord } from "../services/api-service.js";
import { QUITA_STATUS } from "../models/constants.js";

const form = document.querySelector("[data-release-form]");
const textarea = document.querySelector("[data-release-textarea]");
const doneButton = document.querySelector("[data-release-done]");

const params = new URLSearchParams(window.location.search);
const quitaId = params.get("quitaId");

let selectedQuita = null;

function getReflectionText() {
  return textarea.value.trim();
}

function updateButtonState() {
  doneButton.disabled = getReflectionText().length === 0;
}

async function loadQuita() {
  if (!quitaId) {
    window.location.href = "./vault.html";
    return;
  }

  try {
    selectedQuita = await getQuitaRecord(quitaId);
  } catch (error) {
    window.location.href = "./vault.html";
  }
}

textarea.addEventListener("input", updateButtonState);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const reflectionText = getReflectionText();

  if (!selectedQuita || !reflectionText) {
    updateButtonState();
    return;
  }

  doneButton.disabled = true;

  try {
    await updateQuitaRecord(selectedQuita.id, {
      releaseReflection: {
        text: reflectionText,
        createdAt: new Date().toISOString(),
      },
      releasedAt: new Date().toISOString(),
      status: QUITA_STATUS.BLISS,
    });

    window.location.href = "./vault.html";
  } catch (error) {
    doneButton.disabled = false;
  }
});

updateButtonState();
loadQuita();
