import { getCurrentUser } from "../services/auth-service.js";
import { getUserRecord, updateUserRecord } from "../services/api-service.js";
import { getCalmingTools } from "../services/tools-service.js";

const DEFAULT_CATEGORY = "all";
const DEFAULT_TOOL_IMAGE = "https://placehold.co/72x72";
const EMPTY_TOOL_IMAGE = "./assets/fixar.svg";
const LIKE_ICON = "./assets/like.svg";
const LIKE_ACTIVE_ICON = "./assets/like-active.svg";

const calmingToolPage = document.getElementById("calmingToolPage");
const searchView = document.getElementById("searchView");
const savedToolsView = document.getElementById("savedToolsView");
const addToolsScroll = document.getElementById("addToolsScroll");
const searchResultsList = document.getElementById("searchResultsList");
const favsResultsList = document.getElementById("favsResultsList");

const authUser = getCurrentUser();
let currentUser = null;
let tools = [];
let favoriteToolIds = new Set();

const filters = {
  searchView: {
    category: DEFAULT_CATEGORY,
    query: "",
  },
  savedToolsView: {
    category: DEFAULT_CATEGORY,
    query: "",
  },
};

function createElement(tagName, classNames = [], attributes = {}) {
  const element = document.createElement(tagName);
  const normalizedClassNames = Array.isArray(classNames) ? classNames : [classNames];

  normalizedClassNames.filter(Boolean).forEach(className => element.classList.add(className));

  Object.entries(attributes).forEach(([name, value]) => {
    if (value !== null && value !== undefined) {
      element.setAttribute(name, value);
    }
  });

  return element;
}

function appendTextElement(parent, tagName, className, text) {
  const element = createElement(tagName, className);
  element.textContent = text;
  parent.appendChild(element);

  return element;
}

function getToolId(tool) {
  return Number(tool.id);
}

function getFavoriteTools() {
  return [...favoriteToolIds]
    .map(id => tools.find(tool => getToolId(tool) === id))
    .filter(Boolean);
}

function getViewState(view) {
  return filters[view.id] ?? filters.searchView;
}

function normalizeSearchValue(value) {
  return value.toLowerCase().trim();
}

function matchesFilters(tool, state) {
  const name = normalizeSearchValue(tool.name ?? "");
  const category = normalizeSearchValue(tool.category ?? "");
  const description = normalizeSearchValue(tool.description ?? "");
  const query = normalizeSearchValue(state.query);
  const selectedCategory = normalizeSearchValue(state.category);
  const matchesQuery = !query || name.includes(query) || category.includes(query) || description.includes(query);
  const matchesCategory = selectedCategory === DEFAULT_CATEGORY || category === selectedCategory;

  return matchesQuery && matchesCategory;
}

function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createToolImage(tool) {
  return createElement("img", "result-image", {
    src: tool.imageUrl || DEFAULT_TOOL_IMAGE,
    alt: tool.name,
  });
}

function createFavoriteButton(tool) {
  const toolId = getToolId(tool);
  const isFavorite = favoriteToolIds.has(toolId);
  const button = createElement("button", "favorite-btn", {
    type: "button",
    "aria-label": isFavorite ? "Remove favorite" : "Add favorite",
    "data-tool-id": String(toolId),
  });
  const icon = createElement("img", "", {
    src: isFavorite ? LIKE_ACTIVE_ICON : LIKE_ICON,
    alt: "",
  });

  icon.setAttribute("aria-hidden", "true");
  button.classList.toggle("active", isFavorite);
  button.appendChild(icon);

  return button;
}

function createToolResultCard(tool, { showFavoriteButton = false } = {}) {
  const card = createElement("article", "result-card", {
    "data-tool-id": String(getToolId(tool)),
    "data-name": normalizeSearchValue(tool.name ?? ""),
    "data-category": normalizeSearchValue(tool.category ?? ""),
  });
  const info = createElement("div", "result-info");
  const text = createElement("div", "result-text");

  info.appendChild(createToolImage(tool));
  appendTextElement(text, "h3", "result-title", tool.name ?? "");
  appendTextElement(text, "p", "result-author", tool.description ?? "");
  info.appendChild(text);
  card.appendChild(info);

  if (showFavoriteButton) {
    card.appendChild(createFavoriteButton(tool));
  }

  return card;
}

function createSavedToolButton(tool) {
  const button = createElement("button", "add-tool-btn", {
    type: "button",
    "data-open-saved": "",
  });
  const image = createElement("img", "add-tool-image--saved", {
    src: tool.imageUrl || DEFAULT_TOOL_IMAGE,
    alt: tool.name,
  });

  button.appendChild(image);

  return button;
}

function createEmptyToolButton() {
  const button = createElement("button", "add-tool-btn", {
    type: "button",
    "data-open-saved": "",
    "aria-label": "Add calming tool",
  });
  const image = createElement("img", "add-tool-image--empty", {
    src: EMPTY_TOOL_IMAGE,
    alt: "",
  });

  image.setAttribute("aria-hidden", "true");
  button.appendChild(image);

  return button;
}

function renderSavedToolStrip() {
  const favoriteTools = getFavoriteTools();
  const emptySlotsCount = Math.max(5 - favoriteTools.length, 1);

  clearChildren(addToolsScroll);
  favoriteTools.forEach(tool => addToolsScroll.appendChild(createSavedToolButton(tool)));

  for (let index = 0; index < emptySlotsCount; index += 1) {
    addToolsScroll.appendChild(createEmptyToolButton());
  }
}

function renderResultList(container, sourceTools, state, options = {}) {
  clearChildren(container);

  sourceTools
    .filter(tool => matchesFilters(tool, state))
    .forEach(tool => container.appendChild(createToolResultCard(tool, options)));
}

function renderSearchResults() {
  renderResultList(searchResultsList, tools, filters.searchView);
}

function renderFavoriteResults() {
  renderResultList(favsResultsList, tools, filters.savedToolsView, {
    showFavoriteButton: true,
  });
}

function renderAll() {
  renderSavedToolStrip();
  renderSearchResults();
  renderFavoriteResults();
}

function setCurrentPage(nextPage) {
  calmingToolPage.hidden = nextPage !== "home";
  searchView.hidden = nextPage !== "search";
  savedToolsView.hidden = nextPage !== "saved";

  searchView.classList.toggle("is-active", nextPage === "search");
  savedToolsView.classList.toggle("is-active", nextPage === "saved");
}

function setActiveFilter(chip) {
  const view = chip.closest(".search-view");
  const state = getViewState(view);

  state.category = chip.dataset.filterCategory ?? DEFAULT_CATEGORY;
  view.querySelectorAll(".filter-chip").forEach(filterChip => {
    filterChip.classList.toggle("active", filterChip === chip);
  });

  if (view.id === "savedToolsView") {
    renderFavoriteResults();
  } else {
    renderSearchResults();
  }
}

function setSearchQuery(input) {
  const view = input.closest(".search-view");
  const state = getViewState(view);

  state.query = input.value;

  if (view.id === "savedToolsView") {
    renderFavoriteResults();
  } else {
    renderSearchResults();
  }
}

async function persistFavoriteTools() {
  if (!currentUser?.id) {
    return;
  }

  const favTools = [...favoriteToolIds];

  currentUser = {
    ...currentUser,
    favTools,
  };

  await updateUserRecord(currentUser.id, { favTools });
}

async function toggleFavorite(toolId) {
  if (!toolId || !currentUser?.id) {
    return;
  }

  if (favoriteToolIds.has(toolId)) {
    favoriteToolIds.delete(toolId);
  } else {
    favoriteToolIds.add(toolId);
  }

  renderAll();

  try {
    await persistFavoriteTools();
  } catch (error) {
    console.error("Error updating favorite tools:", error);
  }
}

async function loadCurrentUser() {
  if (!authUser?.id) {
    return null;
  }

  try {
    return await getUserRecord(authUser.id);
  } catch (error) {
    console.error("Error loading user:", error);
    return null;
  }
}

async function init() {
  currentUser = await loadCurrentUser();
  favoriteToolIds = new Set((currentUser?.favTools ?? []).map(Number));

  try {
    tools = await getCalmingTools();
    renderAll();
  } catch (error) {
    console.error("Error loading tools:", error);
  }
}

document.addEventListener("click", event => {
  const openSearchBtn = event.target.closest("[data-open-search]");
  const closeSearchBtn = event.target.closest("[data-close-search]");
  const openSavedBtn = event.target.closest("[data-open-saved]");
  const closeSavedBtn = event.target.closest("[data-close-saved]");
  const filterChip = event.target.closest(".filter-chip");
  const favoriteBtn = event.target.closest(".favorite-btn");

  if (openSearchBtn) {
    setCurrentPage("search");
    return;
  }

  if (closeSearchBtn) {
    setCurrentPage("home");
    return;
  }

  if (openSavedBtn) {
    setCurrentPage("saved");
    return;
  }

  if (closeSavedBtn) {
    setCurrentPage("home");
    return;
  }

  if (filterChip) {
    setActiveFilter(filterChip);
    return;
  }

  if (favoriteBtn) {
    toggleFavorite(Number(favoriteBtn.dataset.toolId));
  }
});

document.addEventListener("input", event => {
  if (event.target.matches(".search-input-wrapper")) {
    setSearchQuery(event.target);
  }
});

init();
