# Quita

> 🇵🇹 [Versão em Português](README.pt.md)

Quita is a mental wellness app where users assign their worries to dolls, track emotional progress through journaling, and release resolved worries to Bliss. Built with vanilla JavaScript (ES Modules), json-server-auth, and a multi-page architecture.

---

## Requirements

- Node.js 18+
- Python 3 (to serve the frontend)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the chatbot

Copy the example config and fill in your API credentials:

```bash
cp config/chat-config.example.js config/chat-config.js
```

Open `config/chat-config.js` and replace the placeholder values:

```js
export const API_KEY = "your-api-key-here";
export const ENDPOINT  = "https://api.example.com/v1/chat/completions";
export const MODEL = "gpt-4o-mini";
```

> The chatbot page will still load without this step — it will only fail when a message is sent.

---

## Running the app

Open **two terminals** in the project root and run one command in each:

**Terminal 1 — API server (port 3000)**
```bash
npm run api
```

**Terminal 2 — Frontend (port 4173)**
```bash
npm run app
```

Then open your browser at:

```
http://localhost:4173
```

---

## Test credentials

| Role | Email | Password |
|---|---|---|
| Regular user | `user@quita.com` | `user1234` |
| Admin | `admin@quita.com` | `admin1234` |

---

## Features

- **Quita creation** — assign a worry to a doll via a guided quiz (Seed / Knot / Burden)
- **Doll metamorphosis** — doll evolves from Worried → Calm → Happy as journals are added
- **Emotional check-in** — daily mood logging with history
- **Notifications** — bell icon on Home with unread badge; triggered by key app events
- **Calming Tools** — breathing, grounding, sounds, and quotes with favourites
- **Vault** — personal archive of active Quitas (grid and list view)
- **Bliss** — released Quitas with reflection text
- **Chatbot** — LLM-powered reflection assistant with SSE streaming
- **Admin panel** — manage users (activate/deactivate) and edit tools

---

## Project structure

```
pages/        HTML pages
views/        JS view per page (DOM + events)
models/       Quita entity and collection
services/     API, auth, tools, notifications, chat
css/          Global styles and per-page styles
assets/       Images, fonts, icons
config/       Chat config (excluded from repo — see setup)
db.json       Mock database (json-server)
routes.json   Access guards per collection
```

---

## Architecture notes

- **MPA** — each HTML page loads its own view as `type="module"`
- **No innerHTML** — all DOM built with `createElement` / `textContent`
- **No fetch in views** — all network calls go through `services/`
- **Auth** — JWT token stored in `localStorage`; `userId` injected automatically by `createOwnedRecord`
- **Guards** — `600` (owner only) on quitas, journals, emotionalCheckins, notifications; `664` (public read) on tools
