import { getCurrentUser, requireAuth } from "../services/auth-service.js";
import { getUserRecord, updateUserRecord } from "../services/api-service.js";
import { getCalmingTools } from "../services/tools-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const DEFAULT_CATEGORY = "all";
const DEFAULT_TOOL_IMAGE = "https://placehold.co/72x72";
const EMPTY_TOOL_IMAGE = "../assets/fixar.svg";
const LIKE_ICON = "../assets/like.svg";
const LIKE_ACTIVE_ICON = "../assets/like-active.svg";

const calmingToolPage = document.getElementById("calmingToolPage");
const searchView = document.getElementById("searchView");
const categoryView = document.getElementById("categoryView");
const savedToolsView = document.getElementById("savedToolsView");
const toolDetailView = document.getElementById("toolDetailView");
const groundingExerciseView = document.getElementById("groundingExerciseView");
const addToolsScroll = document.getElementById("addToolsScroll");
const searchResultsList = document.getElementById("searchResultsList");
const categoryResultsList = document.getElementById("categoryResultsList");
const favsResultsList = document.getElementById("favsResultsList");
const toolDetailContent = document.getElementById("toolDetailContent");
const groundingExerciseContent = document.getElementById("groundingExerciseContent");
const detailFavoriteButton = document.querySelector("[data-detail-favorite]");
const categoryTitle = document.querySelector("[data-category-title]");
const categoryImage = document.querySelector("[data-category-image]");

const authUser = getCurrentUser();
let currentUser = null;
let tools = [];
let favoriteToolIds = new Set();
let previousPage = "home";
let selectedToolId = null;
let selectedCategory = DEFAULT_CATEGORY;
let activeExercise = null;
let activeExerciseStep = 0;

const GROUNDING_EXERCISE_TOOL_ID = 12;
const GROUNDING_EXERCISE_TOOL_NAME = "5-4-3-2-1 method";
const BODY_SCAN_TOOL_ID = 13;
const BODY_SCAN_TOOL_NAME = "body scan";
const ORGANIZE_MIND_TOOL_ID = 14;
const ORGANIZE_MIND_TOOL_NAME = "organize your mind";

const EXERCISES = {
  grounding: {
    toolId: GROUNDING_EXERCISE_TOOL_ID,
    toolName: GROUNDING_EXERCISE_TOOL_NAME,
    category: "grounding",
    method: "5-4-3-2-1",
    theme: "grounding",
    doneIcon: "../assets/star-done.svg",
    doneTitle: "Nicely done",
    doneMessage: "You came back to yourself, one breath at a time.",
    steps: [
      {
        label: "STEP 1 OF 5 · SEE",
        count: "5",
        title: "Find 5 things you can see around you",
      },
      {
        label: "STEP 2 OF 5 · FEEL",
        count: "4",
        title: "Notice 4 things you can feel",
      },
      {
        label: "STEP 3 OF 5 · LISTEN",
        count: "3",
        title: "Listen for 3 sounds",
      },
      {
        label: "STEP 4 OF 5 · SMELL",
        count: "2",
        title: "Find 2 things you can smell",
      },
      {
        label: "STEP 5 OF 5 · TASTE",
        count: "1",
        title: "Notice 1 thing you can taste",
      },
    ],
  },
  bodyScan: {
    toolId: BODY_SCAN_TOOL_ID,
    toolName: BODY_SCAN_TOOL_NAME,
    category: "grounding",
    method: "Body Scan",
    theme: "body-scan",
    doneIcon: "../assets/star-done-body-scan.svg",
    doneTitle: "Nicely done",
    doneMessage: "Your body is your home. By noticing its weight, its rhythm, and its sensations, you've anchored yourself back to the present. Carry this stillness with you.",
    steps: [
      {
        label: "STEP 1 OF 5 · FEEL",
        count: "1",
        title: "Preparation",
        prompts: [
          "Find a comfortable position, either sitting or standing.",
          "Close your eyes or soften your gaze to begin noticing how your body feels from head to toe.",
        ],
      },
      {
        label: "STEP 2 OF 5 · FEEL",
        count: "2",
        title: "Head and Shoulders",
        prompts: [
          "Notice the sensation of your hair resting on your forehead or your shoulders.",
          "Feel the weight of your shirt as it rests against your shoulders.",
        ],
      },
      {
        label: "STEP 3 OF 5 · FEEL",
        count: "3",
        title: "Chest and Arms",
        prompts: [
          "Pay attention to your arms at your sides; notice if they feel loose or stiff.",
          "Tune into your heartbeat, simply observing if it feels rapid or steady.",
        ],
      },
      {
        label: "STEP 4 OF 5 · FEEL",
        count: "4",
        title: "Core and Legs",
        prompts: [
          "Check in with your stomach and notice if it feels full or if you feel hungry.",
          "Shift your focus to your legs; observe if they are crossed or if your feet are resting on the floor.",
        ],
      },
      {
        label: "STEP 5 OF 5 · FEEL",
        count: "5",
        title: "Movement and Grounding",
        prompts: [
          "Gently curl your fingers and wiggle your toes to bring movement back to your extremities.",
          "Notice if you are barefoot or wearing shoes, and pay attention to how the floor feels against your feet.",
        ],
      },
    ],
  },
  organizeMind: {
    toolId: ORGANIZE_MIND_TOOL_ID,
    toolName: ORGANIZE_MIND_TOOL_NAME,
    category: "grounding",
    method: "Organize your mind",
    theme: "organize-mind",
    doneIcon: "../assets/star-done-body-scan.svg",
    doneTitle: "Nicely done",
    doneMessage: "By categorizing the world around you, you quiet the chaos within. Your mind is now clearer, focused, and back in your control.",
    steps: [
      {
        label: "STEP 1 OF 3 · SELECT",
        count: "1",
        title: "Select your topics",
        prompts: [
          "Choose one or two broad categories that interest you (e.g.: musical instruments, ice cream flavors, or baseball teams).",
        ],
      },
      {
        label: "STEP 2 OF 3 · FOCUS",
        count: "2",
        title: "Focus and list",
        prompts: [
          "Take a minute or so to focus entirely on these categories.",
        ],
      },
      {
        label: "STEP 3 OF 3 · CATALOGUE",
        count: "3",
        title: "Mental cataloging",
        prompts: [
          "Mentally list as many specific items as you can for each chosen category.",
        ],
      },
    ],
  },
};

const CATEGORY_DETAILS = {
  breathing: {
    title: "Breathing",
    image: "../assets/info-breathing.svg",
    alt: "Breathing category",
  },
  quotes: {
    title: "Quotes",
    image: "../assets/info-quotes.svg",
    alt: "Quotes category",
  },
  grounding: {
    title: "Grounding",
    image: "../assets/info-grounding.svg",
    alt: "Grounding category",
  },
  sounds: {
    title: "Sounds",
    image: "../assets/info-sounds.svg",
    alt: "Sounds category",
  },
};

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

function getToolById(toolId) {
  return tools.find(tool => getToolId(tool) === Number(toolId)) ?? null;
}

function getExerciseForTool(tool) {
  return Object.values(EXERCISES).find(exercise =>
    getToolId(tool) === exercise.toolId
    || (
      normalizeSearchValue(tool.name ?? "") === exercise.toolName
      && normalizeSearchValue(tool.category ?? "") === exercise.category
    )
  ) ?? null;
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

function updateFavoriteButton(button, tool) {
  if (!button || !tool) {
    return;
  }

  const toolId = getToolId(tool);
  const isFavorite = favoriteToolIds.has(toolId);

  button.textContent = "";
  button.dataset.toolId = String(toolId);
  button.setAttribute("aria-label", isFavorite ? "Remove favorite" : "Add favorite");
  button.classList.toggle("active", isFavorite);
  button.appendChild(createElement("img", "", {
    src: isFavorite ? LIKE_ACTIVE_ICON : LIKE_ICON,
    alt: "",
    "aria-hidden": "true",
  }));
}

function createToolResultCard(tool, { showFavoriteButton = false } = {}) {
  const card = createElement("article", "result-card", {
    "data-tool-id": String(getToolId(tool)),
    "data-name": normalizeSearchValue(tool.name ?? ""),
    "data-category": normalizeSearchValue(tool.category ?? ""),
    role: "button",
    tabindex: "0",
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
    "data-tool-id": String(getToolId(tool)),
    "aria-label": `Open ${tool.name}`,
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
  renderResultList(searchResultsList, tools, filters.searchView, {
    showFavoriteButton: true,
  });
}

function renderFavoriteResults() {
  renderResultList(favsResultsList, tools, filters.savedToolsView, {
    showFavoriteButton: true,
  });
}

function renderCategoryResults(category) {
  const state = {
    category,
    query: "",
  };

  renderResultList(categoryResultsList, tools, state, {
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
  categoryView.hidden = nextPage !== "category";
  savedToolsView.hidden = nextPage !== "saved";
  toolDetailView.hidden = nextPage !== "detail";
  groundingExerciseView.hidden = nextPage !== "grounding-exercise";

  searchView.classList.toggle("is-active", nextPage === "search");
  categoryView.classList.toggle("is-active", nextPage === "category");
  savedToolsView.classList.toggle("is-active", nextPage === "saved");
  toolDetailView.classList.toggle("is-active", nextPage === "detail");
  groundingExerciseView.classList.toggle("is-active", nextPage === "grounding-exercise");
  document.body.classList.toggle("calming-exercise-active", nextPage === "grounding-exercise");
}

function updateFilterChips(view) {
  const state = getViewState(view);

  view.querySelectorAll(".filter-chip").forEach(filterChip => {
    filterChip.classList.toggle(
      "active",
      filterChip.dataset.filterCategory === state.category,
    );
  });
}

function setViewFilter(view, category = DEFAULT_CATEGORY, query = "") {
  const state = getViewState(view);
  const input = view.querySelector(".search-input-wrapper");

  state.category = category;
  state.query = query;
  updateFilterChips(view);

  if (input) {
    input.value = query;
  }

  if (view.id === "savedToolsView") {
    renderFavoriteResults();
  } else {
    renderSearchResults();
  }
}

function openCategory(category) {
  const details = CATEGORY_DETAILS[category] ?? CATEGORY_DETAILS.breathing;

  selectedCategory = category;
  categoryTitle.textContent = details.title;
  categoryImage.src = details.image;
  categoryImage.alt = details.alt;
  renderCategoryResults(category);
  setCurrentPage("category");
}

function setActiveFilter(chip) {
  const view = chip.closest(".search-view");
  const category = chip.dataset.filterCategory ?? DEFAULT_CATEGORY;

  setViewFilter(view, category, getViewState(view).query);
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

function renderToolDetail(tool) {
  clearChildren(toolDetailContent);
  updateFavoriteButton(detailFavoriteButton, tool);

  const image = createToolImage(tool);

  image.classList.add("tool-detail-image");
  toolDetailContent.appendChild(image);
  const category = appendTextElement(toolDetailContent, "p", "tool-detail-category", tool.category ?? "Tool");

  category.textContent = (tool.category ?? "Tool").toUpperCase();
  appendTextElement(toolDetailContent, "h1", "tool-detail-title", tool.name ?? "");

  if (tool.description) {
    appendTextElement(toolDetailContent, "p", "tool-detail-description", tool.description);
  }
}

function getCurrentExercise() {
  return activeExercise ?? EXERCISES.grounding;
}

function createExerciseHeader(exercise) {
  const header = createElement("header", "grounding-exercise-header");
  const backButton = createElement("button", "grounding-exercise-back", {
    type: "button",
    "data-close-grounding-exercise": "",
    "aria-label": `Back to ${CATEGORY_DETAILS[exercise.category]?.title ?? "category"}`,
  });
  const arrow = createElement("img", "", {
    src: "../assets/arrow.svg",
    alt: "",
    "aria-hidden": "true",
  });
  const title = createElement("p", "grounding-exercise-method");

  title.textContent = exercise.method;
  backButton.appendChild(arrow);
  header.append(backButton, title);

  return header;
}

function createExerciseProgress(exercise) {
  const progress = createElement("div", "grounding-exercise-progress", {
    "aria-label": `Step ${Math.min(activeExerciseStep + 1, exercise.steps.length)} of ${exercise.steps.length}`,
    "data-step-count": String(exercise.steps.length),
  });

  exercise.steps.forEach((step, index) => {
    const bar = createElement("span", index === activeExerciseStep
      ? ["grounding-exercise-progress-bar", "is-active"]
      : "grounding-exercise-progress-bar");

    bar.setAttribute("aria-label", step.label);
    progress.appendChild(bar);
  });

  return progress;
}

function renderGroundingExercise() {
  const exercise = getCurrentExercise();

  clearChildren(groundingExerciseContent);
  groundingExerciseView.dataset.exerciseTheme = exercise.theme;
  groundingExerciseContent.append(createExerciseHeader(exercise), createExerciseProgress(exercise));

  if (activeExerciseStep >= exercise.steps.length) {
    const doneIcon = createElement("div", "grounding-exercise-done-icon");
    const doneImage = createElement("img", "", {
      src: exercise.doneIcon || "../assets/star-done.svg",
      alt: "",
      "aria-hidden": "true",
    });
    const title = createElement("h1", "grounding-exercise-title");
    const message = createElement("p", "grounding-exercise-message");
    const againButton = createElement("button", "grounding-exercise-action", {
      type: "button",
      "data-grounding-exercise-again": "",
    });
    const backLink = createElement("button", "grounding-exercise-category-link", {
      type: "button",
      "data-close-grounding-exercise": "",
    });

    doneIcon.appendChild(doneImage);
    title.textContent = exercise.doneTitle;
    message.textContent = exercise.doneMessage;
    againButton.textContent = "Do it again";
    backLink.textContent = "Back to category";
    groundingExerciseContent.append(doneIcon, title, message, againButton, backLink);
    return;
  }

  const step = exercise.steps[activeExerciseStep];
  const label = createElement("p", "grounding-exercise-label");
  const count = createElement("p", "grounding-exercise-count");
  const title = createElement("h1", "grounding-exercise-title");
  const prompts = createElement("ul", "grounding-exercise-prompts");
  const nextButton = createElement("button", "grounding-exercise-next", {
    type: "button",
    "data-grounding-exercise-next": "",
  });

  label.textContent = step.label;
  count.textContent = step.count;
  title.textContent = step.title;
  (step.prompts ?? []).forEach(prompt => {
    appendTextElement(prompts, "li", "grounding-exercise-prompt", prompt);
  });
  nextButton.textContent = "Next step";
  groundingExerciseContent.append(label, count, title);

  if (step.prompts?.length) {
    groundingExerciseContent.appendChild(prompts);
  }

  groundingExerciseContent.appendChild(nextButton);
}

function openGroundingExercise(exercise, originPage) {
  previousPage = originPage;
  activeExercise = exercise;
  selectedCategory = exercise.category;
  activeExerciseStep = 0;
  renderGroundingExercise();
  setCurrentPage("grounding-exercise");
}

function closeGroundingExercise() {
  openCategory(getCurrentExercise().category);
}

function openTool(toolId, originPage) {
  const tool = getToolById(toolId);

  if (!tool) {
    return;
  }

  const exercise = getExerciseForTool(tool);

  if (exercise) {
    openGroundingExercise(exercise, originPage);
    return;
  }

  openToolDetail(toolId, originPage);
}

function openToolDetail(toolId, originPage) {
  const tool = getToolById(toolId);

  if (!tool) {
    return;
  }

  selectedToolId = getToolId(tool);
  previousPage = originPage;
  renderToolDetail(tool);
  setCurrentPage("detail");
}

function closeToolDetail() {
  setCurrentPage(previousPage);
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
  const closeCategoryBtn = event.target.closest("[data-close-category]");
  const openSavedBtn = event.target.closest("[data-open-saved]");
  const closeSavedBtn = event.target.closest("[data-close-saved]");
  const closeDetailBtn = event.target.closest("[data-close-detail]");
  const closeGroundingExerciseBtn = event.target.closest("[data-close-grounding-exercise]");
  const groundingExerciseNextBtn = event.target.closest("[data-grounding-exercise-next]");
  const groundingExerciseAgainBtn = event.target.closest("[data-grounding-exercise-again]");
  const categoryCard = event.target.closest("[data-open-category]");
  const filterChip = event.target.closest(".filter-chip");
  const favoriteBtn = event.target.closest(".favorite-btn");
  const resultCard = event.target.closest(".result-card");
  const savedToolButton = event.target.closest(".add-tool-btn[data-tool-id]");

  if (openSearchBtn) {
    setViewFilter(searchView);
    setCurrentPage("search");
    return;
  }

  if (closeSearchBtn) {
    setCurrentPage("home");
    return;
  }

  if (closeCategoryBtn) {
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

  if (closeDetailBtn) {
    closeToolDetail();
    return;
  }

  if (closeGroundingExerciseBtn) {
    closeGroundingExercise();
    return;
  }

  if (groundingExerciseNextBtn) {
    activeExerciseStep += 1;
    renderGroundingExercise();
    return;
  }

  if (groundingExerciseAgainBtn) {
    activeExerciseStep = 0;
    renderGroundingExercise();
    return;
  }

  if (categoryCard) {
    openCategory(categoryCard.dataset.openCategory);
    return;
  }

  if (filterChip) {
    setActiveFilter(filterChip);
    return;
  }

  if (favoriteBtn) {
    toggleFavorite(Number(favoriteBtn.dataset.toolId));

    if (!toolDetailView.hidden && selectedToolId) {
      updateFavoriteButton(detailFavoriteButton, getToolById(selectedToolId));
    }

    if (!categoryView.hidden) {
      renderCategoryResults(selectedCategory);
    }

    return;
  }

  if (resultCard) {
    const originPage = resultCard.closest("#savedToolsView")
      ? "saved"
      : resultCard.closest("#categoryView")
        ? "category"
        : "search";

    openTool(resultCard.dataset.toolId, originPage);
    return;
  }

  if (savedToolButton) {
    openTool(savedToolButton.dataset.toolId, "home");
  }
});

document.addEventListener("keydown", event => {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  const resultCard = event.target.closest(".result-card");

  if (!resultCard) {
    return;
  }

  event.preventDefault();
  openTool(
    resultCard.dataset.toolId,
    resultCard.closest("#savedToolsView")
      ? "saved"
      : resultCard.closest("#categoryView")
        ? "category"
        : "search"
  );
});

document.addEventListener("input", event => {
  if (event.target.matches(".search-input-wrapper")) {
    setSearchQuery(event.target);
  }
});

init();
