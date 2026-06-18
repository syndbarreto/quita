import { requireAuth } from "../services/auth-service.js";
import { getQuitaRecord } from "../services/api-service.js";
import { streamMessage, sendMessage } from "../services/chat-service.js";
import ChatHistory from "../models/ChatHistory.js";
import {
  buildSystemPrompt,
  STREAM,
  MAX_HISTORY_TURNS,
  INITIAL_GREETING,
} from "../config/chat-config.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const params = new URLSearchParams(window.location.search);
const quitaId = params.get("quitaId");

const backButton = document.querySelector("[data-chat-back]");
const subtitleEl = document.querySelector("[data-chat-subtitle]");
const messagesEl = document.querySelector("[data-chat-messages]");
const inputEl = document.querySelector("[data-chat-input]");
const sendButton = document.querySelector("[data-chat-send]");

let history = null;
let currentBotEl = null;

function createBubble(role, text = "") {
  const bubble = document.createElement("div");

  bubble.className = `chat-bubble chat-bubble--${role}`;
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return bubble;
}

function showTypingBubble() {
  currentBotEl = document.createElement("div");
  currentBotEl.className = "chat-bubble chat-bubble--bot";

  const dot1 = document.createElement("span");
  const dot2 = document.createElement("span");
  const dot3 = document.createElement("span");
  const typing = document.createElement("span");

  typing.className = "chat-typing";
  [dot1, dot2, dot3].forEach((d) => typing.appendChild(d));
  currentBotEl.appendChild(typing);
  messagesEl.appendChild(currentBotEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendBotChunk(delta) {
  if (!currentBotEl) return;
  currentBotEl.textContent += delta;
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function finalizeBotResponse(text) {
  if (!currentBotEl) return;
  currentBotEl.textContent = text;
  messagesEl.scrollTop = messagesEl.scrollHeight;
  currentBotEl = null;
}

function showBotError(message) {
  const el = currentBotEl ?? document.createElement("div");

  el.className = "chat-bubble chat-bubble--bot chat-bubble--error";
  el.textContent = `Something went wrong. Please try again.`;

  if (!currentBotEl) {
    messagesEl.appendChild(el);
  }

  currentBotEl = null;
  console.error(message);
}

function setSendingState(disabled) {
  sendButton.disabled = disabled;
  inputEl.disabled = disabled;
}

async function handleSend() {
  const text = inputEl.value.trim();

  if (!text || sendButton.disabled) return;

  inputEl.value = "";
  inputEl.style.height = "auto";

  history.addUser(text);
  createBubble("user", text);
  setSendingState(true);

  if (STREAM) {
    currentBotEl = createBubble("bot", "");
  } else {
    showTypingBubble();
  }

  try {
    const context = history.getContextWindow(MAX_HISTORY_TURNS);
    let reply;

    if (STREAM) {
      reply = await streamMessage(context, appendBotChunk);
    } else {
      reply = await sendMessage(context);
    }

    finalizeBotResponse(reply);
    history.addAssistant(reply);
  } catch (err) {
    showBotError(err.message);
  } finally {
    setSendingState(false);
    inputEl.focus();
  }
}

async function init() {
  if (!quitaId) {
    window.history.back();
    return;
  }

  try {
    const cached = sessionStorage.getItem("quita.chatQuita");
    const quita = cached ? JSON.parse(cached) : await getQuitaRecord(quitaId);
    sessionStorage.removeItem("quita.chatQuita");

    const systemPrompt = buildSystemPrompt(quita.name, quita.worryText);
    history = new ChatHistory(systemPrompt);
    subtitleEl.textContent = quita.name;
    createBubble("bot", INITIAL_GREETING);
  } catch (err) {
    console.error("[chat init error]", err);
    window.history.back();
    return;
  }

  sendButton.addEventListener("click", handleSend);

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  });

  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = `${inputEl.scrollHeight}px`;
  });

  backButton.addEventListener("click", () => {
    window.history.back();
  });
}

init();
