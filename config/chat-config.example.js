// Copy this file to chat-config.js and fill in your values before running the app.
// chat-config.js is listed in .gitignore and must never be committed.

// API key for the LLM provider (e.g. OpenAI-compatible endpoint)
export const API_KEY = "your-api-key-here";

// Full URL of the chat completions endpoint
export const ENDPOINT = "https://api.example.com/v1/chat/completions";

// Model identifier to use
export const MODEL = "gpt-4o-mini";

// Extra parameters forwarded to the API (temperature, max_tokens, etc.)
export const PARAMS = {
  temperature: 0.7,
  max_tokens: 512,
};

// Set to true to use streaming (SSE), false for a single response
export const STREAM = true;

// Maximum number of conversation turns kept in context
export const MAX_HISTORY_TURNS = 20;

// Builds the system prompt sent to the model at the start of each session
export function buildSystemPrompt(quitaName, worryText) {
  return `Reflect — assistente de auto-reflexão da app Quita. Preocupação: "${quitaName}"${worryText ? ` — "${worryText}"` : ""}.`;
}

// First message shown by the bot when the chat opens
export const INITIAL_GREETING = "Olá. Como te sentes em relação a isso hoje?";
