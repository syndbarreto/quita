import { requireAuth } from "../services/auth-service.js";
import { getOwnedRecords } from "../services/api-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const historyList = document.querySelector(".history-list");

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
  empty.textContent = "No check-ins yet. Come back after your first one.";
  empty.style.color = "#a998bd";
  historyList.append(empty);
}

async function renderHistory() {
  if (!historyList) {
    return;
  }

  const checkins = await getOwnedRecords("emotionalCheckins");

  historyList.replaceChildren();

  if (!checkins || checkins.length === 0) {
    renderEmpty();
    return;
  }

  const sorted = [...checkins].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const GROUP_ORDER = ["Today", "This week", "Earlier"];
  const groups = {};

  sorted.forEach((checkin) => {
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

renderHistory();
