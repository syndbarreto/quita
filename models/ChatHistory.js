import ChatMessage from "./ChatMessage.js";

export default class ChatHistory {
  #items = [];

  constructor(systemPrompt) {
    if (systemPrompt) {
      this.add(new ChatMessage("system", systemPrompt));
    }
  }

  add(message) {
    if (!(message instanceof ChatMessage)) return;
    this.#items.push(message);
  }

  addUser(content) {
    this.add(new ChatMessage("user", content));
  }

  addAssistant(content) {
    this.add(new ChatMessage("assistant", content));
  }

  get size() {
    return this.#items.length;
  }

  get all() {
    return [...this.#items];
  }

  getContextWindow(maxTurns) {
    if (this.#items.length === 0) return [];
    const system = this.#items[0];
    const turns = this.#items.slice(1);
    const recent = turns.slice(-(maxTurns * 2));
    return [system, ...recent].map((m) => m.toApiFormat());
  }

  clear() {
    const system = this.#items[0];
    this.#items = system ? [system] : [];
  }
}
