import {
  BACKGROUND_OPTIONS,
  DOLL_STATES,
  QUITA_NAME_MAX_LENGTH,
  QUITA_STATUS,
  WORRY_TYPES,
  getDollById,
  pickRandomDoll,
} from "./constants.js";

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

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
  constructor(data = {}) {
    const journals = Array.isArray(data.journals) ? data.journals : [];
    const selectedDoll = data.dollId ? getDollById(data.dollId) : pickRandomDoll();

    this.id = data.id || createId();
    this.name = normalizeName(data.name);
    this.worryText = data.worryText?.trim() || "";
    this.smallStep = data.smallStep?.trim() || "";
    this.activity = data.activity ?? null;
    this.people = data.people ?? null;
    this.location = data.location ?? null;
    this.gridBackground = data.gridBackground || BACKGROUND_OPTIONS[0].id;
    this.worryType = data.worryType || WORRY_TYPES.SEED;
    this.dollId = selectedDoll.id;
    this.dollState = data.dollState || getDollStateByProgress(journals.length);
    this.status = data.status || QUITA_STATUS.VAULT;
    this.journals = journals;
    this.createdAt = data.createdAt || new Date().toISOString();
  }
}
