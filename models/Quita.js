import {
  BACKGROUND_OPTIONS,
  DOLL_STATES,
  QUITA_NAME_MAX_LENGTH,
  QUITA_STATUS,
  getDollById,
  normalizeWorryType,
  pickRandomDoll,
} from "./constants.js";

function limitName(name) {
  return Array.from(name?.trim() || "")
    .slice(0, QUITA_NAME_MAX_LENGTH)
    .join("");
}

function normalizeName(name) {
  return limitName(name) || "Quita";
}

function getDollStateByProgress(journalCount = 0) {
  if (journalCount <= 0) {
    return DOLL_STATES.WORRIED;
  }

  if (journalCount === 1) {
    return DOLL_STATES.CALM;
  }

  return DOLL_STATES.HAPPY;
}

export class Quita {
  #id;
  #name;
  #worryText;
  #smallStep;
  #activity;
  #people;
  #location;
  #gridBackground;
  #worryType;
  #dollId;
  #dollState;
  #status;
  #journals;
  #createdAt;
  #releasedAt;
  #releaseReflection;
  #userId;

  static createId() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  static normalizeName(name) {
    return normalizeName(name);
  }

  static fromServerRecord(record) {
    return record instanceof Quita ? record : new Quita(record);
  }

  constructor(data = {}) {
    const journals = Array.isArray(data.journals) ? data.journals : [];
    const selectedDoll = data.dollId ? getDollById(data.dollId) : pickRandomDoll();

    this.#id = data.id || Quita.createId();
    this.#name = Quita.normalizeName(data.name);
    this.#worryText = data.worryText?.trim() || "";
    this.#smallStep = data.smallStep?.trim() || "";
    this.#activity = data.activity ?? null;
    this.#people = data.people ?? null;
    this.#location = data.location ?? null;
    this.#gridBackground = data.gridBackground || BACKGROUND_OPTIONS[0].id;
    this.#worryType = normalizeWorryType(data.worryType);
    this.#dollId = selectedDoll.id;
    this.#dollState = data.dollState || getDollStateByProgress(journals.length);
    this.#status = data.status || QUITA_STATUS.VAULT;
    this.#journals = journals;
    this.#createdAt = data.createdAt || new Date().toISOString();
    this.#releasedAt = data.releasedAt ?? null;
    this.#releaseReflection = data.releaseReflection ?? null;
    this.#userId = data.userId ?? null;
  }

  get id() {
    return this.#id;
  }

  get name() {
    return this.#name;
  }

  get worryText() {
    return this.#worryText;
  }

  get smallStep() {
    return this.#smallStep;
  }

  get activity() {
    return this.#activity;
  }

  get people() {
    return this.#people;
  }

  get location() {
    return this.#location;
  }

  get gridBackground() {
    return this.#gridBackground;
  }

  get worryType() {
    return this.#worryType;
  }

  get dollId() {
    return this.#dollId;
  }

  get dollState() {
    return this.#dollState;
  }

  get status() {
    return this.#status;
  }

  get journals() {
    return [...this.#journals];
  }

  get createdAt() {
    return this.#createdAt;
  }

  get releasedAt() {
    return this.#releasedAt;
  }

  get releaseReflection() {
    return this.#releaseReflection;
  }

  get userId() {
    return this.#userId;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      worryText: this.worryText,
      smallStep: this.smallStep,
      activity: this.activity,
      people: this.people,
      location: this.location,
      gridBackground: this.gridBackground,
      worryType: this.worryType,
      dollId: this.dollId,
      dollState: this.dollState,
      status: this.status,
      journals: this.journals,
      createdAt: this.createdAt,
      ...(this.releasedAt ? { releasedAt: this.releasedAt } : {}),
      ...(this.releaseReflection ? { releaseReflection: this.releaseReflection } : {}),
      ...(this.userId ? { userId: this.userId } : {}),
    };
  }
}
