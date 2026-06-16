import { getQuitaRecord, updateQuitaRecord } from "../services/api-service.js";
import { requireAuth } from "../services/auth-service.js";
import { getCalmingToolsByIds } from "../services/tools-service.js";
import {
  DOLL_STATES,
  WORRY_TYPES,
  getDollAsset,
  normalizeWorryType,
} from "../models/constants.js";
import { Quita } from "../models/Quita.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const page = document.querySelector("[data-quita-detail-page]");
const hero = document.querySelector("[data-quita-detail-hero]");
const descriptionSection = document.querySelector("[data-quita-description-section]");
const description = document.querySelector("[data-quita-description]");
const chipRow = document.querySelector("[data-quita-choice-chips]");
const timeline = document.querySelector("[data-quita-timeline]");
const toolsList = document.querySelector("[data-quita-tools]");
const restLink = document.querySelector("[data-quita-rest-link]");
const progressOverlay = document.querySelector("[data-progress-overlay]");
const progressTitleInput = document.querySelector("[data-progress-title]");
const progressTextarea = document.querySelector("[data-progress-textarea]");
const progressSaveButton = document.querySelector("[data-progress-save]");
const params = new URLSearchParams(window.location.search);
const quitaId = params.get("quitaId");
let selectedQuita = null;

const RECOMMENDED_TOOLS_BY_TYPE = {
  [WORRY_TYPES.KNOT]: [12, 3, 11],
  [WORRY_TYPES.SEED]: [6, 1, 9],
  [WORRY_TYPES.BURDEN]: [13, 2, 10],
};

function createElement(tagName, classNames = [], attributes = {}) {
  const element = document.createElement(tagName);
  const normalizedClassNames = Array.isArray(classNames) ? classNames : [classNames];

  normalizedClassNames.filter(Boolean).forEach((className) => element.classList.add(className));

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

function getOrdinalSuffix(day) {
  if (day > 3 && day < 21) {
    return "th";
  }

  const lastDigit = day % 10;

  if (lastDigit === 1) {
    return "st";
  }

  if (lastDigit === 2) {
    return "nd";
  }

  if (lastDigit === 3) {
    return "rd";
  }

  return "th";
}

function getDate(value) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function formatBornDate(value) {
  const date = getDate(value);
  const month = new Intl.DateTimeFormat("en", { month: "long" }).format(date);
  const day = date.getDate();

  return `${month} ${day}${getOrdinalSuffix(day)}`;
}

function formatTimelineDate(value) {
  const date = getDate(value);

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function getChoiceLabel(choice) {
  if (!choice) {
    return "";
  }

  if (typeof choice === "string") {
    return choice;
  }

  return choice.value || choice.label || "";
}

function getJournalText(journal) {
  return journal.text || journal.content || journal.reflection || journal.description || "";
}

function getDollStateByJournalCount(journalCount) {
  if (journalCount <= 0) {
    return DOLL_STATES.WORRIED;
  }

  if (journalCount === 1) {
    return DOLL_STATES.CALM;
  }

  return DOLL_STATES.HAPPY;
}

function createHero(quita) {
  const figure = createElement("div", "quita-detail-hero-figure");
  const star = createElement("span", "quita-detail-hero-star", {
    "aria-hidden": "true",
  });
  const doll = createElement("img", "quita-detail-doll", {
    src: getDollAsset(quita.dollId, quita.dollState || DOLL_STATES.WORRIED),
    alt: `${quita.name} Quita`,
  });

  figure.replaceChildren(star, doll);
  hero.replaceChildren(figure);
  appendText(hero, "h1", "quita-detail-name", quita.name);
  appendText(hero, "p", "quita-detail-born", `Born on ${formatBornDate(quita.createdAt)}`);
}

function renderDescription(quita) {
  const labels = [quita.people, quita.location, quita.activity]
    .map(getChoiceLabel)
    .filter(Boolean);
  const descriptionText = quita.worryText || quita.smallStep || "";

  if (!descriptionText && !labels.length) {
    descriptionSection.hidden = true;
    return;
  }

  description.textContent = descriptionText || "This Quita is being held with care.";
  chipRow.replaceChildren(
    ...labels.map((label) => {
      const chip = createElement("span", "quita-detail-chip");

      chip.textContent = label;

      return chip;
    })
  );
  descriptionSection.hidden = false;
}

function getTimelineEntries(quita) {
  const entries = [
    {
      date: quita.createdAt,
      title: "Quita was born",
      text: quita.worryText || "This worry was placed safely in the vault.",
    },
  ];

  if (quita.smallStep) {
    entries.push({
      date: quita.createdAt,
      title: "First step",
      text: quita.smallStep,
    });
  }

  quita.journals.forEach((journal) => {
    const text = getJournalText(journal);

    if (!text) {
      return;
    }

    entries.push({
      date: journal.createdAt || journal.date || quita.createdAt,
      title: journal.title || "Progress note",
      text,
    });
  });

  return entries;
}

function renderTimeline(quita) {
  const entries = getTimelineEntries(quita);
  const addProgressButton = createElement("button", "quita-detail-add-progress", {
    type: "button",
  });

  addProgressButton.textContent = "Add new progress";
  addProgressButton.addEventListener("click", openProgressSheet);

  timeline.replaceChildren(
    ...entries.map((entry) => {
      const item = createElement("article", "quita-detail-timeline-item");

      appendText(item, "span", "quita-detail-timeline-date", formatTimelineDate(entry.date));
      item.appendChild(createElement("span", "quita-detail-timeline-dot", { "aria-hidden": "true" }));
      appendText(item, "h3", "", entry.title);
      appendText(item, "p", "", entry.text);

      return item;
    }),
    addProgressButton
  );
}

function updateRestLink(quita) {
  restLink.href = `./release-reflection.html?quitaId=${encodeURIComponent(quita.id)}`;
}

function getProgressText() {
  return progressTextarea.value.trim();
}

function getProgressTitle() {
  return progressTitleInput.value.trim();
}

function updateProgressButtonState() {
  progressSaveButton.disabled = !getProgressTitle() || !getProgressText();
}

function openProgressSheet() {
  progressTitleInput.value = "";
  progressTextarea.value = "";
  updateProgressButtonState();
  progressOverlay.hidden = false;
  progressOverlay.classList.add("is-open");
  progressTitleInput.focus();
}

function closeProgressSheet() {
  progressOverlay.classList.remove("is-open");
  progressOverlay.hidden = true;
}

async function saveProgress() {
  const title = getProgressTitle();
  const text = getProgressText();

  if (!title || !text || !selectedQuita) {
    return;
  }

  progressSaveButton.disabled = true;

  try {
    const updatedJournals = [
      ...selectedQuita.journals,
      {
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        title,
        text,
        createdAt: new Date().toISOString(),
      },
    ];
    const dollState = getDollStateByJournalCount(updatedJournals.length);
    const updatedRecord = await updateQuitaRecord(selectedQuita.id, {
      journals: updatedJournals,
      dollState,
    });

    selectedQuita = Quita.fromServerRecord(updatedRecord);
    createHero(selectedQuita);
    renderTimeline(selectedQuita);
    updateHeroOnScroll();
    closeProgressSheet();
  } catch (error) {
    updateProgressButtonState();
  }
}

function renderTool(tool) {
  const item = createElement("article", "quita-detail-tool");
  const text = createElement("div", "quita-detail-tool-copy");
  const image = createElement("img", "", {
    src: tool.imageUrl,
    alt: tool.name,
  });

  appendText(text, "h3", "", tool.name);

  if (tool.description) {
    appendText(text, "p", "", tool.description);
  }

  item.append(text, image);

  return item;
}

async function renderRecommendedTools(worryType) {
  const ids = RECOMMENDED_TOOLS_BY_TYPE[worryType] || RECOMMENDED_TOOLS_BY_TYPE[WORRY_TYPES.SEED];
  const tools = await getCalmingToolsByIds(ids);

  toolsList.replaceChildren(...tools.map(renderTool));
}

function updateHeroOnScroll() {
  const progress = Math.min(window.scrollY / 210, 1);
  const scale = 1 - progress * 0.42;
  const opacity = 1 - progress * 0.95;
  const shift = `${progress * -84}px`;

  page.style.setProperty("--detail-hero-scale", scale.toFixed(3));
  page.style.setProperty("--detail-hero-opacity", opacity.toFixed(3));
  page.style.setProperty("--detail-hero-shift", shift);
}

async function loadDetail() {
  if (!quitaId) {
    window.location.href = "./vault.html?view=list";
    return;
  }

  console.log("[quita-detail] loading quitaId:", quitaId);

  try {
    const record = await getQuitaRecord(quitaId);

    if (!record?.id) {
      throw new Error("Quita not found.");
    }

    const quita = Quita.fromServerRecord(record);
    const worryType = normalizeWorryType(quita.worryType);

    selectedQuita = quita;
    page.classList.add(`quita-detail-page--${worryType}`);
    createHero(quita);
    renderDescription(quita);
    renderTimeline(quita);
    updateRestLink(quita);
    await renderRecommendedTools(worryType);
    updateHeroOnScroll();
  } catch (error) {
    console.error("[quita-detail] loadDetail failed:", error);
    window.location.href = "./vault.html?view=list";
  }
}

window.addEventListener("scroll", updateHeroOnScroll, { passive: true });
progressTitleInput.addEventListener("input", updateProgressButtonState);
progressTextarea.addEventListener("input", updateProgressButtonState);
progressSaveButton.addEventListener("click", saveProgress);
progressOverlay.addEventListener("click", (event) => {
  if (event.target.closest("[data-progress-close]")) {
    closeProgressSheet();
  }
});

loadDetail();
