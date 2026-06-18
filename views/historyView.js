import { requireAuth } from "../services/auth-service.js";
import { getOwnedRecords } from "../services/api-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const historyList = document.querySelector(".history-list");
const filterChips = [...document.querySelectorAll("[data-filter]")];
let currentFilter = "all";
let allCheckins = [];

function formatRelativeTime(isoString) {
  const created = new Date(isoString);
  const now = new Date();
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${diffWeeks}w ago`;
}

function getGroup(isoString) {
  const created = new Date(isoString);
  const now = new Date();
  const diffDays = Math.floor((now - created) / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays < 7) return "This week";
  return "Earlier";
}

function renderCheckin(checkin) {
  const item = document.createElement("article");
  item.className = `timeline-item ${checkin.feeling.toLowerCase()}`;

  const dot = document.createElement("span");
  dot.className = "timeline-dot";

  const content = document.createElement("div");
  content.className = "timeline-content";

  const meta = document.createElement("div");
  meta.className = "timeline-meta";

  const pill = document.createElement("span");
  pill.className = "mood-pill";
  pill.textContent = checkin.feeling;

  const time = document.createElement("time");
  time.dateTime = checkin.createdAt;
  time.textContent = formatRelativeTime(checkin.createdAt);

  meta.append(pill, time);
  content.append(meta);
  item.append(dot, content);

  return item;
}

function renderEmpty() {
  const empty = document.createElement("p");
  empty.className = "history-empty";
  empty.textContent = "No check-ins yet. Come back after your first one.";
  historyList.append(empty);
}

function renderList(checkins) {
  historyList.replaceChildren();

  if (!checkins || checkins.length === 0) {
    renderEmpty();
    return;
  }

  const GROUP_ORDER = ["Today", "This week", "Earlier"];
  const groups = {};

  checkins.forEach((checkin) => {
    const group = getGroup(checkin.createdAt);
    if (!groups[group]) groups[group] = [];
    groups[group].push(checkin);
  });

  GROUP_ORDER.forEach((groupName) => {
    if (!groups[groupName]) return;

    const label = document.createElement("p");
    label.className = "section-label";
    label.textContent = groupName;
    historyList.append(label);

    groups[groupName].forEach((checkin) => {
      historyList.append(renderCheckin(checkin));
    });
  });
}

function applyFilter(filter) {
  currentFilter = filter;

  filterChips.forEach((chip) => {
    chip.setAttribute("aria-pressed", String(chip.dataset.filter === filter));
  });

  const filtered = filter === "all"
    ? allCheckins
    : allCheckins.filter((c) => c.feeling.toLowerCase() === filter);

  renderList(filtered);
}

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
});

async function renderHistory() {
  if (!historyList) return;

  const checkins = await getOwnedRecords("emotionalCheckins");

  allCheckins = checkins
    ? [...checkins].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  applyFilter(currentFilter);
}

renderHistory();
