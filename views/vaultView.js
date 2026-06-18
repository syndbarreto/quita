import { deleteQuitaRecord, getQuitaRecords } from "../services/api-service.js";
import { isAuthenticated } from "../services/auth-service.js";
import { getCalmingToolsByIds } from "../services/tools-service.js";
import {
  DOLL_STATES,
  QUITA_STATUS,
  WORRY_TYPES,
  getBackgroundOption,
  getDollAsset,
  normalizeWorryType,
} from "../models/constants.js";
import {
  DEFAULT_HOTLINE_COUNTRY,
  getHotlineCountries,
  getHotlineCountry,
} from "../models/mentalHealthHotlines.js";
import { QuitaCollection } from "../models/QuitaCollection.js";

const guestWall = document.querySelector("[data-guest-wall]");

if (!isAuthenticated()) {
  if (guestWall) guestWall.hidden = false;
}

window.addEventListener("pageshow", (e) => {
  if (e.persisted && !isAuthenticated()) {
    window.location.replace("./authentication.html");
  }
});

const emptyState = document.querySelector("[data-vault-empty]");
const vaultPage = document.querySelector(".vault-page");
const gridView = document.querySelector("[data-vault-grid]");
const gridList = document.querySelector("[data-vault-grid-list]");
const listView = document.querySelector("[data-vault-list]");
const listStack = document.querySelector("[data-vault-list-stack]");
const viewButtons = [...document.querySelectorAll("[data-vault-view]")];
const filterButtons = [...document.querySelectorAll("[data-vault-filter]")];
const toolsOverlay = document.querySelector("[data-vault-tools-overlay]");
const toolsContent = document.querySelector("[data-vault-tools-content]");
const confirmOverlay = document.querySelector("[data-vault-confirm-overlay]");
const confirmTitle = document.querySelector("[data-vault-confirm-title]");
const confirmYesButton = document.querySelector("[data-vault-confirm-yes]");
const hotlinesOverlay = document.querySelector("[data-vault-hotlines-overlay]");
const hotlinesOpenLink = document.querySelector("[data-vault-hotlines-open]");
const hotlinesSubtitle = document.querySelector("[data-vault-hotlines-subtitle]");
const hotlinesList = document.querySelector("[data-vault-hotlines-list]");
const hotlinesCountryFlag = document.querySelector("[data-vault-country-flag]");
const hotlinesCountryToggle = document.querySelector("[data-vault-country-toggle]");
const hotlinesCountryMenu = document.querySelector("[data-vault-country-menu]");
const vaultParams = new URLSearchParams(window.location.search);

const VAULT_TOOLS_BY_TYPE = {
  [WORRY_TYPES.KNOT]: {
    accent: "knot",
    ids: [12, 3, 11],
    titleParts: [
      "Tools for when you're feeling tied in ",
      { text: "knot", highlight: true },
    ],
  },
  [WORRY_TYPES.SEED]: {
    accent: "seed",
    ids: [6, 1, 9],
    titleParts: [
      "Tools for when something is just ",
      { text: "beginning", highlight: true },
    ],
  },
  [WORRY_TYPES.BURDEN]: {
    accent: "burden",
    ids: [13, 2, 10],
    titleParts: [
      "Tools for when you're feeling ",
      { text: "weighed down", highlight: true },
    ],
  },
};

const CONFIRMATION_CONTENT = {
  delete: {
    accent: "delete",
    titleParts: [
      "Are you sure you want to ",
      { text: "delete", highlight: true },
      " this Quita?",
    ],
  },
  release: {
    accent: "release",
    titleParts: [
      "Are you sure you want to ",
      { text: "release", highlight: true },
      " this Quita?",
    ],
  },
};

let quitas = [];

let currentView = vaultParams.get("view") === "list" ? "list" : "grid";
let currentFilter = "all";
let isVaultLoaded = false;
let gridDragState = null;
let gridOffset = { x: 0, y: 0 };
let activeGridCard = null;
let pendingConfirmation = null;
let shouldIgnoreNextGridClick = false;
let selectedHotlinesCountry = DEFAULT_HOTLINE_COUNTRY;

function createElement(tagName, classNames = [], attributes = {}) {
  const element = document.createElement(tagName);
  const normalizedClassNames = Array.isArray(classNames)
    ? classNames
    : [classNames];

  normalizedClassNames
    .filter(Boolean)
    .forEach((className) => element.classList.add(className));

  Object.entries(attributes).forEach(([name, value]) => {
    if (value !== null && value !== undefined) {
      element.setAttribute(name, value);
    }
  });

  return element;
}

function appendText(parent, tagName, className, text) {
  const element = createElement(tagName, className);

  element.textContent = text;
  parent.appendChild(element);

  return element;
}

function appendHighlightedText(parent, parts) {
  parent.replaceChildren();

  parts.forEach((part) => {
    if (typeof part === "string") {
      parent.appendChild(document.createTextNode(part));
      return;
    }

    const span = createElement("span");

    span.textContent = part.text;
    parent.appendChild(span);
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

function appendPatternShapes(card) {
  [
    ["vault-pattern-shape--burst", "shape-a"],
    ["vault-pattern-shape--burst", "shape-b"],
    ["vault-pattern-shape--x", "shape-c"],
    ["vault-pattern-shape--x", "shape-d"],
    ["vault-pattern-shape--x", "shape-e"],
    ["vault-pattern-shape--burst", "shape-f"],
    ["vault-pattern-shape--burst", "shape-g"],
  ].forEach((classNames) => {
    card.appendChild(
      createElement("span", ["vault-pattern-shape", ...classNames]),
    );
  });
}

function getQuitaDollAsset(quita) {
  return getDollAsset(quita.dollId, quita.dollState || DOLL_STATES.WORRIED);
}

function renderGridCard(quita) {
  const background = getBackgroundOption(quita.gridBackground);
  const dollAlt = `${quita.name} Quita`;
  const card = createElement(
    "article",
    ["vault-grid-card", `background-option--${background.id}`],
    {
      "data-quita-detail-id": quita.id,
      role: "link",
      tabindex: "0",
    },
  );
  const doll = createElement("img", "vault-grid-doll", {
    src: getQuitaDollAsset(quita),
    alt: dollAlt,
  });
  const shade = createElement("div", "vault-card-shade", {
    "aria-hidden": "true",
  });
  const copy = createElement("div", "vault-grid-copy");

  appendPatternShapes(card);
  appendText(copy, "h2", "", quita.name);
  appendText(copy, "p", "", formatDate(quita.createdAt));
  card.append(doll, shade, copy);

  return card;
}

function createCardAction({ label, iconClass, attributes = {} }) {
  const button = createElement("button", "vault-card-action", {
    type: "button",
    "aria-label": label,
    ...attributes,
  });
  const icon = createElement("span", ["vault-card-action-icon", iconClass], {
    "aria-hidden": "true",
  });

  button.appendChild(icon);

  return button;
}

function renderListCard(quita) {
  const worryType = normalizeWorryType(quita.worryType);
  const dollAlt = `${quita.name} Quita`;
  const card = createElement(
    "article",
    ["vault-list-card", `vault-list-card--${worryType}`],
    {
      "data-quita-detail-id": quita.id,
      role: "link",
      tabindex: "0",
    },
  );
  const actions = createElement("div", "vault-card-actions");
  const copy = createElement("div", "vault-list-copy");
  const time = createElement("time", "", {
    datetime: quita.createdAt,
  });
  const doll = createElement("img", "vault-list-doll", {
    src: getQuitaDollAsset(quita),
    alt: dollAlt,
  });

  actions.append(
    createCardAction({
      label: "Open Quita chat",
      iconClass: "vault-card-action-icon--chatbot",
      attributes: {
        "data-vault-open-chat": "",
        "data-quita-id": quita.id,
      },
    }),
    createCardAction({
      label: "Open calming tools",
      iconClass: "vault-card-action-icon--calming",
      attributes: {
        "data-vault-open-tools": "",
        "data-quita-id": quita.id,
      },
    }),
    createCardAction({
      label: "Release Quita",
      iconClass: "vault-card-action-icon--bliss",
      attributes: {
        "data-vault-confirm-action": "release",
        "data-quita-id": quita.id,
      },
    }),
    createCardAction({
      label: "Delete Quita",
      iconClass: "vault-card-action-icon--delete",
      attributes: {
        "data-vault-confirm-action": "delete",
        "data-quita-id": quita.id,
      },
    }),
  );

  time.textContent = formatDate(quita.createdAt);
  appendText(copy, "p", "", "Hi, I'm");
  appendText(copy, "h2", "", quita.name);
  copy.appendChild(time);
  card.append(actions, copy, doll);

  return card;
}

function openQuitaDetail(quitaId) {
  if (!quitaId) {
    return;
  }

  window.location.href = `./quita-detail.html?quitaId=${encodeURIComponent(quitaId)}`;
}

function renderToolItem(tool) {
  const item = createElement("article", "vault-tools-item");
  const image = createElement("img", "vault-tools-image", {
    src: tool.imageUrl,
    alt: tool.name,
  });
  const text = createElement("div", "vault-tools-text");

  appendText(text, "h3", "", tool.name);

  if (tool.description) {
    appendText(text, "p", "", tool.description);
  }

  item.append(image, text);

  return item;
}

async function openToolsOverlay(quitaId) {
  if (currentView !== "list") {
    return;
  }

  const quita = quitas.find((item) => String(item.id) === String(quitaId));

  if (!quita) {
    return;
  }

  const worryType = quita.worryType || WORRY_TYPES.SEED;
  const config =
    VAULT_TOOLS_BY_TYPE[worryType] || VAULT_TOOLS_BY_TYPE[WORRY_TYPES.SEED];
  const tools = await getCalmingToolsByIds(config.ids);

  const copy = createElement("div", [
    "vault-tools-copy",
    `vault-tools-copy--${config.accent}`,
  ]);
  const title = createElement("h2", "", {
    id: "vault-tools-title",
  });
  const list = createElement("div", "vault-tools-list");

  appendHighlightedText(title, config.titleParts);
  appendText(
    copy,
    "p",
    "",
    "A curated selection of tools designed to meet you where you are.",
  );
  copy.prepend(title);
  tools.forEach((tool) => list.appendChild(renderToolItem(tool)));
  toolsContent.replaceChildren(copy, list);

  toolsOverlay.hidden = false;
  vaultPage.classList.add("is-tools-open");
}

function closeToolsOverlay() {
  toolsOverlay.hidden = true;
  vaultPage.classList.remove("is-tools-open");
}

function createHotlineCard(item) {
  const card = createElement("article", "vault-hotline-card");
  const copy = createElement("div", "vault-hotline-copy");
  const image = createElement("img", "vault-hotline-doll", {
    src: item.asset,
    alt: "",
    "aria-hidden": "true",
  });

  appendText(copy, "p", "vault-hotline-name", item.name);
  appendText(copy, "strong", "vault-hotline-value", item.value);

  if (item.detail) {
    appendText(copy, "span", "vault-hotline-detail", item.detail);
  }

  card.append(copy, image);

  return card;
}

function renderHotlinesCountryMenu() {
  const countries = getHotlineCountries();

  hotlinesCountryMenu.replaceChildren(
    ...countries.map((country) => {
      const button = createElement("button", "vault-country-option", {
        type: "button",
        "data-vault-country": country.id,
      });

      appendText(button, "span", "", country.label);
      appendText(button, "span", "", country.flag);

      return button;
    }),
  );
}

function renderHotlinesCountry() {
  const country = getHotlineCountry(selectedHotlinesCountry);

  hotlinesSubtitle.textContent = country.subtitle;
  hotlinesCountryFlag.textContent = country.flag;
  hotlinesList.replaceChildren();

  country.sections.forEach((section) => {
    const sectionElement = createElement("section", "vault-hotline-section");
    const title = appendText(
      sectionElement,
      "h3",
      "vault-hotline-section-title",
      section.title,
    );

    title.id = `vault-hotline-${section.title.toLowerCase().replaceAll(" ", "-")}`;

    section.items.forEach((item) => {
      sectionElement.appendChild(createHotlineCard(item));
    });

    hotlinesList.appendChild(sectionElement);
  });
}

function openHotlinesOverlay() {
  if (
    !hotlinesOverlay ||
    !hotlinesCountryMenu ||
    !hotlinesCountryToggle ||
    !hotlinesSubtitle ||
    !hotlinesList ||
    !hotlinesCountryFlag
  ) {
    return;
  }

  closeToolsOverlay();
  renderHotlinesCountryMenu();
  renderHotlinesCountry();
  hotlinesCountryMenu.hidden = true;
  hotlinesCountryToggle.setAttribute("aria-expanded", "false");
  hotlinesCountryToggle.classList.remove("is-open");
  hotlinesOverlay.hidden = false;
  vaultPage.classList.add("is-hotlines-open");
}

function closeHotlinesOverlay() {
  hotlinesOverlay.hidden = true;
  hotlinesCountryMenu.hidden = true;
  hotlinesCountryToggle.setAttribute("aria-expanded", "false");
  hotlinesCountryToggle.classList.remove("is-open");
  vaultPage.classList.remove("is-hotlines-open");
}

function handleHotlinesOpen(event) {
  event.preventDefault();
  event.stopPropagation();
  openHotlinesOverlay();
}

function openConfirmationOverlay(action, quitaId) {
  if (currentView !== "list") {
    return;
  }

  const quita = quitas.find((item) => String(item.id) === String(quitaId));
  const content = CONFIRMATION_CONTENT[action];

  if (!quita || !content) {
    return;
  }

  pendingConfirmation = {
    action,
    quitaId: quita.id,
  };

  appendHighlightedText(confirmTitle, content.titleParts);
  confirmOverlay.classList.toggle("is-delete", action === "delete");
  confirmOverlay.classList.toggle("is-release", action === "release");
  confirmYesButton.disabled = false;
  confirmOverlay.hidden = false;
  vaultPage.classList.add("is-confirm-open");
}

function closeConfirmationOverlay() {
  confirmOverlay.hidden = true;
  vaultPage.classList.remove("is-confirm-open");
  pendingConfirmation = null;
  confirmYesButton.disabled = false;
}

async function runConfirmedAction() {
  if (!pendingConfirmation) {
    return;
  }

  const { action, quitaId } = pendingConfirmation;
  confirmYesButton.disabled = true;

  try {
    if (action === "delete") {
      await deleteQuitaRecord(quitaId);
    }

    if (action === "release") {
      window.location.href = `./release-reflection.html?quitaId=${encodeURIComponent(quitaId)}`;
      return;
    }

    quitas = quitas.filter((quita) => String(quita.id) !== String(quitaId));
    closeConfirmationOverlay();
    render();
  } catch (error) {
    confirmYesButton.disabled = false;
  }
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

  return (
    cards.reduce((nearest, card) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const cardCenterY = cardRect.top + cardRect.height / 2;
      const distance = Math.hypot(
        cardCenterX - gridCenterX,
        cardCenterY - gridCenterY,
      );

      if (!nearest || distance < nearest.distance) {
        return { card, distance };
      }

      return nearest;
    }, null)?.card ?? null
  );
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
    shouldAnimate,
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
    false,
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

  if (currentView !== "list") {
    closeToolsOverlay();
    closeConfirmationOverlay();
  }

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
  if (!isVaultLoaded) {
    vaultPage.classList.remove("is-empty");
    emptyState.hidden = true;
    gridView.hidden = true;
    listView.hidden = true;
    return;
  }

  const hasQuitas = quitas.length > 0;
  const visibleQuitas = getVisibleQuitas();

  vaultPage.classList.toggle("is-empty", !hasQuitas);
  emptyState.hidden = hasQuitas;
  gridView.hidden = !hasQuitas || currentView !== "grid";
  listView.hidden = !hasQuitas || currentView !== "list";

  if (!hasQuitas) {
    return;
  }

  gridList.replaceChildren(...quitas.map(renderGridCard));
  configureGridColumns();

  if (visibleQuitas.length) {
    listStack.replaceChildren(...visibleQuitas.map(renderListCard));
  } else {
    const emptyFilterMessage = createElement("p", "vault-filter-empty");

    emptyFilterMessage.textContent = "No Quitas in this group yet.";
    listStack.replaceChildren(emptyFilterMessage);
  }

  if (currentView === "grid") {
    resetGridPosition();
  }
}

async function loadVault() {
  try {
    const records = await getQuitaRecords();

    quitas = new QuitaCollection(records).newestVaultItems;
    isVaultLoaded = true;
    vaultPage.classList.remove("is-loading");

    render();
  } catch (error) {
    if (error.status === 403) {
      quitas = new QuitaCollection([]).newestVaultItems;
      isVaultLoaded = true;
      vaultPage.classList.remove("is-loading");
      render();
      return;
    }

    window.location.href = "./signupLogin.html?view=login";
  }
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-vault-view]");
  const filterButton = event.target.closest("[data-vault-filter]");
  const chatButton = event.target.closest("[data-vault-open-chat]");
  const toolsButton = event.target.closest("[data-vault-open-tools]");
  const closeToolsButton = event.target.closest("[data-vault-tools-close]");
  const hotlinesOpenButton = event.target.closest("[data-vault-hotlines-open]");
  const hotlinesCloseButton = event.target.closest("[data-vault-hotlines-close]");
  const countryToggleButton = event.target.closest("[data-vault-country-toggle]");
  const countryButton = event.target.closest("[data-vault-country]");
  const confirmActionButton = event.target.closest(
    "[data-vault-confirm-action]",
  );
  const confirmNoButton = event.target.closest("[data-vault-confirm-no]");
  const confirmYesButtonTarget = event.target.closest(
    "[data-vault-confirm-yes]",
  );
  const detailCard = event.target.closest("[data-quita-detail-id]");

  if (viewButton) {
    setView(viewButton.dataset.vaultView);
  }

  if (filterButton) {
    setFilter(filterButton.dataset.vaultFilter);
  }

  if (chatButton) {
    const quitaId = chatButton.dataset.quitaId;
    const quitaData = quitas.find((q) => String(q.id) === String(quitaId));
    if (quitaData) {
      sessionStorage.setItem("quita.chatQuita", JSON.stringify({ id: quitaData.id, name: quitaData.name, worryText: quitaData.worryText }));
    }
    window.location.href = `./quita-chat.html?quitaId=${encodeURIComponent(quitaId)}`;
  }

  if (toolsButton) {
    openToolsOverlay(toolsButton.dataset.quitaId);
  }

  if (closeToolsButton) {
    closeToolsOverlay();
  }

  if (hotlinesOpenButton) {
    handleHotlinesOpen(event);
    return;
  }

  if (hotlinesCloseButton) {
    closeHotlinesOverlay();
  }

  if (countryToggleButton) {
    const shouldOpen = hotlinesCountryMenu.hidden;

    hotlinesCountryMenu.hidden = !shouldOpen;
    hotlinesCountryToggle.setAttribute("aria-expanded", String(shouldOpen));
    hotlinesCountryToggle.classList.toggle("is-open", shouldOpen);
  }

  if (countryButton) {
    selectedHotlinesCountry = countryButton.dataset.vaultCountry;
    hotlinesCountryMenu.hidden = true;
    hotlinesCountryToggle.setAttribute("aria-expanded", "false");
    hotlinesCountryToggle.classList.remove("is-open");
    renderHotlinesCountry();
  }

  if (confirmActionButton) {
    openConfirmationOverlay(
      confirmActionButton.dataset.vaultConfirmAction,
      confirmActionButton.dataset.quitaId,
    );
  }

  if (confirmNoButton) {
    closeConfirmationOverlay();
  }

  if (confirmYesButtonTarget) {
    runConfirmedAction();
  }

  if (detailCard && !event.target.closest(".vault-card-action")) {
    if (currentView === "grid" && shouldIgnoreNextGridClick) {
      shouldIgnoreNextGridClick = false;
      return;
    }

    openQuitaDetail(detailCard.dataset.quitaDetailId);
  }
});

hotlinesOpenLink?.addEventListener("click", handleHotlinesOpen);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !hotlinesOverlay.hidden) {
    closeHotlinesOverlay();
    return;
  }

  const detailCard = event.target.closest("[data-quita-detail-id]");

  if (
    !detailCard ||
    event.target.closest(".vault-card-action") ||
    !["Enter", " "].includes(event.key)
  ) {
    return;
  }

  event.preventDefault();
  openQuitaDetail(detailCard.dataset.quitaDetailId);
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
  const distance = Math.hypot(
    event.clientX - gridDragState.startX,
    event.clientY - gridDragState.startY,
  );

  if (distance > 6) {
    shouldIgnoreNextGridClick = true;
  }

  setGridTrackPosition(
    {
      x:
        gridDragState.offsetX +
        (event.clientX - gridDragState.startX) * dragFactor,
      y:
        gridDragState.offsetY +
        (event.clientY - gridDragState.startY) * dragFactor,
    },
    false,
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

  if (shouldIgnoreNextGridClick) {
    window.setTimeout(() => {
      shouldIgnoreNextGridClick = false;
    }, 120);
  }
}

gridView.addEventListener("pointerup", finishGridDrag);
gridView.addEventListener("pointercancel", finishGridDrag);

setView(currentView);
loadVault();
