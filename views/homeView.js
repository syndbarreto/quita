import { getUserRecord } from "../services/api-service.js";
import { getCurrentUser, isAuthenticated } from "../services/auth-service.js";
import { getNotifications, markAllRead } from "../services/notification-service.js";

const greetingTitle = document.querySelector("[data-user-greeting]");
const bell = document.querySelector("[data-notification-bell]");
const badge = document.querySelector("[data-notification-badge]");
const panel = document.querySelector("[data-notification-panel]");
const list = document.querySelector("[data-notification-list]");
const emptyMsg = document.querySelector("[data-notification-empty]");
const authUser = getCurrentUser();

let cachedNotifications = [];

function getFirstName(user) {
  return user?.firstName?.trim() || "";
}

function renderGreeting(firstName = "") {
  if (!greetingTitle) {
    return;
  }

  greetingTitle.textContent = firstName ? `Hi ${firstName}` : "Hi there";
}

function updateBadge(notifications) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!badge) return;

  if (unreadCount > 0) {
    badge.textContent = unreadCount > 9 ? "9+" : String(unreadCount);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function renderNotificationItem(notification) {
  const item = document.createElement("li");
  item.className = notification.read
    ? "notification-item notification-item--read"
    : "notification-item";

  const title = document.createElement("p");
  title.className = "notification-item-title";
  title.textContent = notification.title;

  const time = document.createElement("time");
  time.className = "notification-item-time";
  time.dateTime = notification.createdAt;
  time.textContent = formatRelativeTime(notification.createdAt);

  item.append(title, time);

  return item;
}

function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function renderPanel(notifications) {
  if (!list || !emptyMsg) return;

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  list.replaceChildren(...sorted.map(renderNotificationItem));
  emptyMsg.hidden = sorted.length > 0;
}

async function openPanel() {
  if (!panel) return;

  panel.hidden = false;
  bell?.setAttribute("aria-expanded", "true");

  renderPanel(cachedNotifications);

  if (cachedNotifications.some((n) => !n.read)) {
    await markAllRead(cachedNotifications);
    cachedNotifications = cachedNotifications.map((n) => ({ ...n, read: true }));
    updateBadge(cachedNotifications);
  }
}

function closePanel() {
  if (!panel) return;

  panel.hidden = true;
  bell?.setAttribute("aria-expanded", "false");
}

bell?.addEventListener("click", () => {
  if (panel?.hidden === false) {
    closePanel();
  } else {
    openPanel();
  }
});

document.addEventListener("click", (event) => {
  if (
    panel &&
    !panel.hidden &&
    !panel.contains(event.target) &&
    !bell?.contains(event.target)
  ) {
    closePanel();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && panel && !panel.hidden) {
    closePanel();
    bell?.focus();
  }
});

async function loadHomeUser() {
  if (!authUser?.id) {
    renderGreeting();
    return;
  }

  try {
    const user = await getUserRecord(authUser.id);
    renderGreeting(getFirstName(user));
  } catch {
    renderGreeting();
  }
}

async function loadNotifications() {
  if (!authUser?.id) return;

  try {
    cachedNotifications = (await getNotifications()) || [];
    updateBadge(cachedNotifications);
  } catch {
    // notificações não são críticas — falha silenciosa
  }
}

loadHomeUser();
loadNotifications();

// Guest wall — block Vault / Bliss / Profile for unauthenticated users
if (!isAuthenticated()) {
  const guestWall = document.querySelector("[data-guest-wall]");

  function showGuestWall() {
    if (guestWall) guestWall.hidden = false;
  }

  function hideGuestWall() {
    if (guestWall) guestWall.hidden = true;
  }

  const guardedSelectors = [
    ".app-bottom-nav__item--vault",
    ".app-bottom-nav__item--bliss",
    ".app-bottom-nav__item--profile",
    ".action-button--secondary",
    ".action-button--primary",
    ".doll-wrapper",
  ];

  guardedSelectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      showGuestWall();
    });
  });

  guestWall?.querySelector(".guest-wall-backdrop")?.addEventListener("click", hideGuestWall);
}
