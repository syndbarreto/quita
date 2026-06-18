import { requireAuth } from "../services/auth-service.js";
import { createOwnedRecord } from "../services/api-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const emotionChips = [...document.querySelectorAll(".emotion-chip")];
const feelingInput = document.querySelector("#feeling-input");
const doneButton = document.querySelector(".checkin-done");
const historyOverlay = document.querySelector("[data-history-overlay]");
const historyCloseButton = document.querySelector("[data-history-close]");

function openHistoryOverlay() {
  if (!historyOverlay) {
    return;
  }

  historyOverlay.hidden = false;

  requestAnimationFrame(() => {
    historyOverlay.classList.add("is-open");
  });
}

function closeHistoryOverlay() {
  if (!historyOverlay) {
    return;
  }

  historyOverlay.classList.remove("is-open");

  window.setTimeout(() => {
    historyOverlay.hidden = true;
  }, 220);
}

function selectEmotion(selectedChip) {
  emotionChips.forEach((chip) => {
    const isSelected = chip === selectedChip;

    chip.classList.toggle("is-selected", isSelected);
    chip.setAttribute("aria-pressed", String(isSelected));
  });

  if (feelingInput) {
    feelingInput.value = selectedChip.textContent.trim();
  }
}

async function saveCheckin() {
  const feeling = feelingInput?.value.trim();

  if (!feeling) {
    return;
  }

  doneButton.disabled = true;

  try {
    await createOwnedRecord("emotionalCheckins", {
      feeling,
      createdAt: new Date().toISOString(),
    });

    openHistoryOverlay();
  } finally {
    doneButton.disabled = false;
  }
}

emotionChips.forEach((chip) => {
  chip.setAttribute(
    "aria-pressed",
    String(chip.classList.contains("is-selected")),
  );
});

document.addEventListener("click", (event) => {
  const chip = event.target.closest(".emotion-chip");

  if (chip) {
    selectEmotion(chip);
  }
});

doneButton?.addEventListener("click", saveCheckin);
historyCloseButton?.addEventListener("click", closeHistoryOverlay);

historyOverlay?.addEventListener("click", (event) => {
  if (event.target === historyOverlay) {
    closeHistoryOverlay();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && historyOverlay && !historyOverlay.hidden) {
    closeHistoryOverlay();
  }
});
