import { requireAuth } from "../services/auth-service.js";
import { getEmotionalCheckins } from "../services/api-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const listEl = document.querySelector("[data-history-list]");
const emptyEl = document.querySelector("[data-history-empty]");

function relativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function sectionLabel(isoString) {
  const diffDays = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / 86400000,
  );
  if (diffDays === 0) return "Today";
  if (diffDays < 7) return "This week";
  return "Earlier";
}

function createSectionLabel(text) {
  const p = document.createElement("p");
  p.className = "section-label";
  p.textContent = text;
  return p;
}

function createTimelineItem(checkin) {
  const slug = checkin.feeling.toLowerCase().replace(/\s+/g, "-");

  const article = document.createElement("article");
  article.className = `timeline-item ${slug}`;

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
  time.textContent = relativeTime(checkin.createdAt);

  meta.append(pill, time);
  content.append(meta);
  article.append(dot, content);

  return article;
}

function render(checkins) {
  if (!checkins.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  // Ordena do mais recente para o mais antigo
  const sorted = [...checkins].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  let currentLabel = null;

  for (const checkin of sorted) {
    const label = sectionLabel(checkin.createdAt);

    if (label !== currentLabel) {
      listEl.appendChild(createSectionLabel(label));
      currentLabel = label;
    }

    listEl.appendChild(createTimelineItem(checkin));
  }
}

async function init() {
  try {
    const checkins = await getEmotionalCheckins();
    render(checkins);
  } catch (err) {
    console.error("Failed to load history:", err);
    if (emptyEl) emptyEl.hidden = false;
  }
}

init();
