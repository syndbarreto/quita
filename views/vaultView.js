import { getQuitaRecords } from "../models/ApiModel.js";
import {
  DOLL_STATES,
  QUITA_STATUS,
  WORRY_TYPES,
  getBackgroundOption,
  getDollAsset,
} from "../models/QuitaModel.js";

const emptyState = document.querySelector("[data-vault-empty]");
const gridView = document.querySelector("[data-vault-grid]");
const gridList = document.querySelector("[data-vault-grid-list]");
const listView = document.querySelector("[data-vault-list]");
const listStack = document.querySelector("[data-vault-list-stack]");
const subtitle = document.querySelector("[data-vault-subtitle]");
const viewButtons = [...document.querySelectorAll("[data-vault-view]")];
const filterButtons = [...document.querySelectorAll("[data-vault-filter]")];

let quitas = [];
let currentView = "list";
let currentFilter = "all";

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getPatternMarkup() {
  return `
    <span class="vault-pattern-shape vault-pattern-shape--burst shape-a"></span>
    <span class="vault-pattern-shape vault-pattern-shape--burst shape-b"></span>
    <span class="vault-pattern-shape vault-pattern-shape--x shape-c"></span>
    <span class="vault-pattern-shape vault-pattern-shape--x shape-d"></span>
    <span class="vault-pattern-shape vault-pattern-shape--x shape-e"></span>
    <span class="vault-pattern-shape vault-pattern-shape--burst shape-f"></span>
    <span class="vault-pattern-shape vault-pattern-shape--burst shape-g"></span>
  `;
}

function getQuitaDollAsset(quita) {
  return getDollAsset(quita.dollId, quita.dollState || DOLL_STATES.WORRIED);
}

function renderGridCard(quita) {
  const background = getBackgroundOption(quita.gridBackground);

  return `
    <article class="vault-grid-card background-option--${background.id}">
      ${getPatternMarkup()}
      <img class="vault-grid-doll" src="${getQuitaDollAsset(quita)}" alt="${escapeHtml(quita.name)} Quita" />
      <div class="vault-card-shade" aria-hidden="true"></div>
      <div class="vault-grid-copy">
        <h2>${escapeHtml(quita.name)}</h2>
        <p>${formatDate(quita.createdAt)}</p>
      </div>
    </article>
  `;
}

function renderListCard(quita) {
  const worryType = quita.worryType || WORRY_TYPES.SEED;
  const dollAlt = `${quita.name} Quita`;

  return `
    <article class="vault-list-card vault-list-card--${worryType}">
      <div class="vault-card-actions">
        <button class="vault-card-action" type="button" aria-label="Open Quita chat">
          <img class="vault-card-action-icon vault-card-action-icon--chatbot" src="./assets/chatbot-icon.svg" alt="" aria-hidden="true" />
        </button>
        <button class="vault-card-action" type="button" aria-label="Open calming tools">
          <img class="vault-card-action-icon vault-card-action-icon--calming" src="./assets/calming-tools-icon.svg" alt="" aria-hidden="true" />
        </button>
        <button class="vault-card-action" type="button" aria-label="Move to Bliss">
          <img class="vault-card-action-icon vault-card-action-icon--bliss" src="./assets/bliss-icon.svg" alt="" aria-hidden="true" />
        </button>
        <button class="vault-card-action" type="button" aria-label="Delete Quita">
          <img class="vault-card-action-icon vault-card-action-icon--delete" src="./assets/bin-icon.svg" alt="" aria-hidden="true" />
        </button>
      </div>
      <div class="vault-list-copy">
        <p>Hi, I'm</p>
        <h2>${escapeHtml(quita.name)}</h2>
        <time datetime="${escapeHtml(quita.createdAt)}">${formatDate(quita.createdAt)}</time>
      </div>
      <img class="vault-list-doll" src="${getQuitaDollAsset(quita)}" alt="${escapeHtml(dollAlt)}" />
    </article>
  `;
}

function getVisibleQuitas() {
  if (currentFilter === "all") {
    return quitas;
  }

  return quitas.filter((quita) => quita.worryType === currentFilter);
}

function setView(nextView) {
  currentView = nextView;

  viewButtons.forEach((button) => {
    const isSelected = button.dataset.vaultView === currentView;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  render();
}

function setFilter(nextFilter) {
  currentFilter = nextFilter;

  filterButtons.forEach((button) => {
    const isSelected = button.dataset.vaultFilter === currentFilter;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  render();
}

function render() {
  const hasQuitas = quitas.length > 0;
  const visibleQuitas = getVisibleQuitas();

  emptyState.hidden = hasQuitas;
  gridView.hidden = !hasQuitas || currentView !== "grid";
  listView.hidden = !hasQuitas || currentView !== "list";
  subtitle.textContent = hasQuitas ? "Held with care" : "Nothing here yet";

  if (!hasQuitas) {
    return;
  }

  gridList.innerHTML = quitas.map(renderGridCard).join("");
  listStack.innerHTML = visibleQuitas.length
    ? visibleQuitas.map(renderListCard).join("")
    : `<p class="vault-filter-empty">No Quitas in this group yet.</p>`;
}

async function loadVault() {
  try {
    const records = await getQuitaRecords();

    quitas = records
      .filter((quita) => quita.status !== QUITA_STATUS.BLISS)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    render();
  } catch (error) {
    window.location.href = "./signupLogin.html?view=login";
  }
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-vault-view]");
  const filterButton = event.target.closest("[data-vault-filter]");

  if (viewButton) {
    setView(viewButton.dataset.vaultView);
  }

  if (filterButton) {
    setFilter(filterButton.dataset.vaultFilter);
  }
});

loadVault();
