export default class ChatMessage {
  static ROLES = ["system", "user", "assistant"];

  #role;
  #content;
  #id;
  #timestamp;

  constructor(role, content) {
    this.#id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    this.#timestamp = new Date().toISOString();
    this.role = role;
    this.content = content;
  }

  get id() {
    return this.#id;
  }

  get timestamp() {
    return this.#timestamp;
  }

  get role() {
    return this.#role;
  }

  set role(value) {
    if (!ChatMessage.ROLES.includes(value)) return;
    this.#role = value;
  }

  get content() {
    return this.#content;
  }

  set content(value) {
    if (typeof value !== "string") return;
    this.#content = value;
  }

  toApiFormat() {
    return { role: this.#role, content: this.#content };
  }

  static fromObject(obj) {
    const m = new ChatMessage(obj.role, obj.content);
   // Acesso a #privados dentro da própria classe é permitido em métodos estáticos
    if (obj.id) m.#id = obj.id;
    if (obj.timestamp) m.#timestamp = obj.timestamp;
    return m;
  }
}
