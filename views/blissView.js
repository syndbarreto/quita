import { getQuitaRecords } from "../services/api-service.js";
import { requireAuth } from "../services/auth-service.js";
import { DOLL_STATES, getDollAsset } from "../models/constants.js";
import { QuitaCollection } from "../models/QuitaCollection.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const countElement = document.querySelector("[data-bliss-count]");
const emptyState = document.querySelector("[data-bliss-empty]");
const carousel = document.querySelector("[data-bliss-carousel]");
const infoOverlay = document.querySelector("[data-bliss-info-overlay]");
const infoDoll = document.querySelector("[data-bliss-info-doll]");
const infoKicker = document.querySelector("[data-bliss-info-kicker]");
const infoName = document.querySelector("[data-bliss-info-name]");
const infoWorry = document.querySelector("[data-bliss-info-worry]");
const infoReflection = document.querySelector("[data-bliss-info-reflection]");

let blissItems = [];

function getDaysSince(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / dayMs));
}

function formatLetGoTime(dateValue) {
  const days = getDaysSince(dateValue);

  if (days === null) {
    return "LET GO";
  }

  if (days === 0) {
    return "LET GO · TODAY";
  }

  if (days === 1) {
    return "LET GO · 1 DAY AGO";
  }

  return `LET GO · ${days} DAYS AGO`;
}

function createBlissDollCard(quita) {
  const card = document.createElement("button");
  card.type = "button";
  card.classList.add("bliss-doll-card");
  card.dataset.blissQuitaId = quita.id;
  card.setAttribute("aria-label", `Open details for ${quita.name}`);

  const image = document.createElement("img");
  image.src = getDollAsset(quita.dollId, DOLL_STATES.HAPPY);
  image.alt = `${quita.name} resting in Bliss`;

  card.append(image);

  return card;
}

function getBlissItemById(quitaId) {
  return blissItems.find((quita) => String(quita.id) === String(quitaId)) ?? null;
}

function getReleaseReflectionText(quita) {
  if (typeof quita.releaseReflection === "string") {
    return quita.releaseReflection;
  }

  return quita.releaseReflection?.text ?? "This Quita was released with care.";
}

function openBlissInfo(quita) {
  if (!infoOverlay || !quita) {
    return;
  }

  if (infoDoll) {
    infoDoll.src = getDollAsset(quita.dollId, DOLL_STATES.HAPPY);
    infoDoll.alt = `${quita.name} resting in Bliss`;
  }

  if (infoKicker) {
    infoKicker.textContent = formatLetGoTime(quita.releasedAt);
  }

  if (infoName) {
    infoName.textContent = quita.name;
  }

  if (infoWorry) {
    infoWorry.textContent = quita.worryText || quita.smallStep || "This worry was released into Bliss.";
  }

  if (infoReflection) {
    infoReflection.textContent = getReleaseReflectionText(quita);
  }

  infoOverlay.hidden = false;
  document.body.classList.add("bliss-info-open");
}

function closeBlissInfo() {
  if (!infoOverlay) {
    return;
  }

  infoOverlay.hidden = true;
  document.body.classList.remove("bliss-info-open");
}

function renderBlissItems(items = []) {
  blissItems = items;

  if (countElement) {
    countElement.textContent = `${items.length} LET GO`;
  }

  if (emptyState) {
    emptyState.hidden = items.length > 0;
  }

  if (!carousel) {
    return;
  }

  carousel.hidden = items.length === 0;
  carousel.replaceChildren(...items.map(createBlissDollCard));
  carousel.scrollTo({ left: 0, behavior: "auto" });
}

async function loadBliss() {
  try {
    const records = await getQuitaRecords();
    const items = new QuitaCollection(records).newestBlissItems;

    renderBlissItems(items);
  } catch {
    renderBlissItems([]);
  }
}

document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-bliss-quita-id]");
  const closeButton = event.target.closest("[data-bliss-info-close]");

  if (closeButton) {
    closeBlissInfo();
    return;
  }

  if (!card) {
    return;
  }

  openBlissInfo(getBlissItemById(card.dataset.blissQuitaId));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && infoOverlay && !infoOverlay.hidden) {
    closeBlissInfo();
  }
});

loadBliss();
