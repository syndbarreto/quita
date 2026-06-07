import { getQuitaRecords } from "../models/ApiModel.js";
import {
  DOLL_STATES,
  QUITA_STATUS,
  WORRY_TYPES,
  getBackgroundOption,
  getDollAsset,
} from "../models/QuitaModel.js";

const emptyState = document.querySelector("[data-vault-empty]");
const vaultPage = document.querySelector(".vault-page");
const gridView = document.querySelector("[data-vault-grid]");
const gridList = document.querySelector("[data-vault-grid-list]");
const listView = document.querySelector("[data-vault-list]");
const listStack = document.querySelector("[data-vault-list-stack]");
const viewButtons = [...document.querySelectorAll("[data-vault-view]")];
const filterButtons = [...document.querySelectorAll("[data-vault-filter]")];

let quitas = [];
let currentView = "grid";
let currentFilter = "all";
let gridDragState = null;
let gridOffset = { x: 0, y: 0 };
let activeGridCard = null;

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
  const dollAlt = `${quita.name} Quita`;

  return `
    <article class="vault-grid-card background-option--${background.id}">
      ${getPatternMarkup()}
      <img class="vault-grid-doll" src="${getQuitaDollAsset(quita)}" alt="${escapeHtml(dollAlt)}" />
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
          <span class="vault-card-action-icon vault-card-action-icon--chatbot" aria-hidden="true"></span>
        </button>
        <button class="vault-card-action" type="button" aria-label="Open calming tools">
          <span class="vault-card-action-icon vault-card-action-icon--calming" aria-hidden="true"></span>
        </button>
        <button class="vault-card-action" type="button" aria-label="Move to Bliss">
          <span class="vault-card-action-icon vault-card-action-icon--bliss" aria-hidden="true"></span>
        </button>
        <button class="vault-card-action" type="button" aria-label="Delete Quita">
          <span class="vault-card-action-icon vault-card-action-icon--delete" aria-hidden="true"></span>
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

function getEffectiveGridCols() {
  return Math.min(3, quitas.length);
}

function getGridCards() {
  return [...gridList.querySelectorAll(".vault-grid-card")];
}

function getNearestGridCard() {
  const cards = getGridCards();

  if (!cards.length || gridView.hidden) {
    return null;
  }

  const gridRect = gridView.getBoundingClientRect();
  const gridCenterX = gridRect.left + gridRect.width / 2;
  const gridCenterY = gridRect.top + gridRect.height / 2;

  return cards.reduce((nearest, card) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;
    const distance = Math.hypot(cardCenterX - gridCenterX, cardCenterY - gridCenterY);

    if (!nearest || distance < nearest.distance) {
      return { card, distance };
    }

    return nearest;
  }, null)?.card ?? null;
}

function setGridTrackPosition(nextOffset, shouldAnimate = false) {
  gridOffset = nextOffset;
  gridList.classList.toggle("is-snapping", shouldAnimate);
  gridList.style.transform = `translate3d(${gridOffset.x}px, ${gridOffset.y}px, 0)`;
}

function updateCenteredGridCard() {
  const centeredCard = getNearestGridCard();

  if (centeredCard === activeGridCard) {
    return;
  }

  activeGridCard = centeredCard;
  getGridCards().forEach((card) => {
    card.classList.toggle("is-centered", card === activeGridCard);
  });
}

function getGridStageCenter() {
  const rect = gridView.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

function getGridGroupBounds(cards = getGridCards()) {
  if (!cards.length) {
    return null;
  }

  const rects = cards.map((card) => card.getBoundingClientRect());
  const left = Math.min(...rects.map((rect) => rect.left));
  const right = Math.max(...rects.map((rect) => rect.right));
  const top = Math.min(...rects.map((rect) => rect.top));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));

  return {
    centerX: left + (right - left) / 2,
    centerY: top + (bottom - top) / 2,
  };
}

function snapGridToCard(card = getNearestGridCard(), shouldAnimate = true) {
  if (!card) {
    return;
  }

  const gridCenter = getGridStageCenter();
  const cardRect = card.getBoundingClientRect();
  const cardCenter = {
    x: cardRect.left + cardRect.width / 2,
    y: cardRect.top + cardRect.height / 2,
  };

  setGridTrackPosition(
    {
      x: gridOffset.x + gridCenter.x - cardCenter.x,
      y: gridOffset.y + gridCenter.y - cardCenter.y,
    },
    shouldAnimate
  );
  updateCenteredGridCard();
}

function centerSmallGridSet(cards) {
  const gridCenter = getGridStageCenter();
  const groupBounds = getGridGroupBounds(cards);

  if (!groupBounds) {
    return;
  }

  setGridTrackPosition(
    {
      x: gridOffset.x + gridCenter.x - groupBounds.centerX,
      y: gridOffset.y + gridCenter.y - groupBounds.centerY,
    },
    false
  );
  updateCenteredGridCard();
}

function resetGridPosition() {
  requestAnimationFrame(() => {
    const cards = getGridCards();

    if (!cards.length || gridView.hidden) {
      return;
    }

    setGridTrackPosition({ x: 0, y: 0 }, false);

    if (cards.length <= 2) {
      centerSmallGridSet(cards);
      return;
    }

    snapGridToCard(cards[1] ?? cards[0], false);
  });
}

function configureGridColumns() {
  const effectiveCols = getEffectiveGridCols();

  if (!effectiveCols) {
    return;
  }

  gridList.style.setProperty("--effective-cols", effectiveCols);
}

function setView(nextView) {
  currentView = nextView;
  vaultPage.classList.toggle("is-grid", currentView === "grid");
  vaultPage.classList.toggle("is-list", currentView === "list");

  viewButtons.forEach((button) => {
    const isSelected = button.dataset.vaultView === currentView;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  render();

  if (currentView === "grid") {
    resetGridPosition();
  }
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

  if (!hasQuitas) {
    return;
  }

  gridList.innerHTML = quitas.map(renderGridCard).join("");
  configureGridColumns();
  listStack.innerHTML = visibleQuitas.length
    ? visibleQuitas.map(renderListCard).join("")
    : `<p class="vault-filter-empty">No Quitas in this group yet.</p>`;

  if (currentView === "grid") {
    resetGridPosition();
  }
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

gridView.addEventListener("pointerdown", (event) => {
  if (gridView.hidden) {
    return;
  }

  gridDragState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: gridOffset.x,
    offsetY: gridOffset.y,
  };

  gridList.classList.remove("is-snapping");
  gridView.setPointerCapture(event.pointerId);
  gridView.classList.add("is-dragging");
});

gridView.addEventListener("pointermove", (event) => {
  if (!gridDragState || event.pointerId !== gridDragState.pointerId) {
    return;
  }

  event.preventDefault();
  const dragFactor = quitas.length === 1 ? 0.18 : 1;

  setGridTrackPosition(
    {
      x: gridDragState.offsetX + (event.clientX - gridDragState.startX) * dragFactor,
      y: gridDragState.offsetY + (event.clientY - gridDragState.startY) * dragFactor,
    },
    false
  );
  updateCenteredGridCard();
});

function finishGridDrag(event) {
  if (!gridDragState || event.pointerId !== gridDragState.pointerId) {
    return;
  }

  gridDragState = null;
  gridView.classList.remove("is-dragging");

  if (gridView.hasPointerCapture(event.pointerId)) {
    gridView.releasePointerCapture(event.pointerId);
  }

  snapGridToCard();
}

gridView.addEventListener("pointerup", finishGridDrag);
gridView.addEventListener("pointercancel", finishGridDrag);

loadVault();
