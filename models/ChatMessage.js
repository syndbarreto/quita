export default class ChatMessage {
  static ROLES = ["system", "user", "assistant"];

  #role;
  #content;

  constructor(role, content) {
    this.id = crypto.randomUUID();
    this.timestamp = new Date().toISOString();
    this.role = role;
    this.content = content;
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
    if (obj.id) m.id = obj.id;
    if (obj.timestamp) m.timestamp = obj.timestamp;
    return m;
  }
}
