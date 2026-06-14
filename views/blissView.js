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

function createBlissDollCard(quita) {
  const card = document.createElement("article");
  card.classList.add("bliss-doll-card");

  const image = document.createElement("img");
  image.src = getDollAsset(quita.dollId, DOLL_STATES.HAPPY);
  image.alt = `${quita.name} resting in Bliss`;

  card.append(image);

  return card;
}

function renderBlissItems(items = []) {
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

loadBliss();
