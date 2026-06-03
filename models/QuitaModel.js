const STORAGE_KEY = "quita.items";
const LATEST_STORAGE_KEY = "quita.latest";

export const QUITA_NAME_MAX_LENGTH = 5;

export const WORRY_TYPES = Object.freeze({
  SEED: "seed",
  KNOT: "knot",
  BURDEN: "burden",
});

export const DOLL_STATES = Object.freeze({
  WORRIED: "worried",
  CALM: "calm",
  HAPPY: "happy",
});

export const QUITA_STATUS = Object.freeze({
  VAULT: "vault",
  BLISS: "bliss",
});

export const DOLL_CATALOG = Object.freeze([
  {
    id: "star",
    label: "Star",
    states: {
      [DOLL_STATES.WORRIED]: "./assets/dolls/star-worried.png",
      [DOLL_STATES.CALM]: "./assets/dolls/star-calm.png",
      [DOLL_STATES.HAPPY]: "./assets/dolls/star-happy.png",
    },
  },
  {
    id: "diamond",
    label: "Diamond",
    states: {
      [DOLL_STATES.WORRIED]: "./assets/dolls/diamond-worried.png",
      [DOLL_STATES.CALM]: "./assets/dolls/diamond-calm.png",
      [DOLL_STATES.HAPPY]: "./assets/dolls/diamond-happy.png",
    },
  },
  {
    id: "flower",
    label: "Flower",
    states: {
      [DOLL_STATES.WORRIED]: "./assets/dolls/flower-worried.png",
      [DOLL_STATES.CALM]: "./assets/dolls/flower-calm.png",
      [DOLL_STATES.HAPPY]: "./assets/dolls/flower-happy.png",
    },
  },
]);

export const BACKGROUND_OPTIONS = Object.freeze([
  { id: "blue", label: "Blue", background: "blue", stars: "yellow" },
  { id: "mint", label: "Mint", background: "mint", stars: "blue" },
  {
    id: "dark-orange",
    label: "Orange",
    background: "dark-orange",
    stars: "hot-pink",
  },
  {
    id: "light-red",
    label: "Red",
    background: "light-red",
    stars: "light-pink",
  },
  {
    id: "light-pink",
    label: "Pink",
    background: "light-pink",
    stars: "dark-orange",
  },
  {
    id: "light-orange",
    label: "Light orange",
    background: "light-orange",
    stars: "yellow",
  },
  {
    id: "light-blue",
    label: "Light blue",
    background: "light-blue",
    stars: "light-yellow",
  },
  {
    id: "dark-red",
    label: "Dark red",
    background: "dark-red",
    stars: "light-yellow",
  },
  {
    id: "light-green",
    label: "Light green",
    background: "light-green",
    stars: "light-blue",
  },
  {
    id: "hot-pink",
    label: "Hot pink",
    background: "hot-pink",
    stars: "light-red",
  },
  {
    id: "light-yellow",
    label: "Light yellow",
    background: "light-yellow",
    stars: "dark-red",
  },
]);

export const CHOICE_GROUPS = Object.freeze({
  activity: ["Eating", "Driving", "Resting", "Hobbies", "Fitness", "Hanging Out"],
  people: ["Family", "Pets", "Friends", "By Myself", "Co-Workers"],
  location: ["Home", "Outside", "Work", "School", "Commuting"],
});

export function createChoice(value, type = "preset") {
  return {
    type,
    value: value.trim(),
  };
}

export function limitQuitaName(name) {
  return Array.from(name?.trim() || "")
    .slice(0, QUITA_NAME_MAX_LENGTH)
    .join("");
}

export function normalizeQuitaName(name) {
  const normalizedName = limitQuitaName(name);

  return normalizedName || "Quita";
}

export function getBackgroundOption(id) {
  return BACKGROUND_OPTIONS.find((option) => option.id === id) ?? BACKGROUND_OPTIONS[0];
}

export function getDollById(id) {
  return DOLL_CATALOG.find((doll) => doll.id === id) ?? DOLL_CATALOG[0];
}

export function getDollAsset(dollId, state = DOLL_STATES.WORRIED) {
  const doll = getDollById(dollId);

  return doll.states[state] ?? doll.states[DOLL_STATES.WORRIED];
}

export function pickRandomDoll() {
  const index = Math.floor(Math.random() * DOLL_CATALOG.length);

  return DOLL_CATALOG[index];
}

export function createJournalEntry(data) {
  const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: crypto.randomUUID?.() ?? fallbackId,
    createdAt: data.createdAt || new Date().toISOString(),
    text: data.text?.trim() || "",
    progressStep: data.progressStep ?? null,
  };
}

export function getDollStateByProgress(journalCount = 0) {
  if (journalCount <= 0) {
    return DOLL_STATES.WORRIED;
  }

  if (journalCount === 1) {
    return DOLL_STATES.CALM;
  }

  return DOLL_STATES.HAPPY;
}

export function createQuita(data) {
  const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const journals = Array.isArray(data.journals) ? data.journals : [];
  const selectedDoll = data.dollId ? getDollById(data.dollId) : pickRandomDoll();

  return {
    id: crypto.randomUUID?.() ?? fallbackId,
    name: normalizeQuitaName(data.name),
    worryText: data.worryText?.trim() || "",
    smallStep: data.smallStep?.trim() || "",
    activity: data.activity ?? null,
    people: data.people ?? null,
    location: data.location ?? null,
    gridBackground: data.gridBackground || BACKGROUND_OPTIONS[0].id,
    worryType: data.worryType || WORRY_TYPES.SEED,
    dollId: selectedDoll.id,
    dollState: data.dollState || getDollStateByProgress(journals.length),
    status: data.status || QUITA_STATUS.VAULT,
    journals,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function getQuitas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

export function saveQuita(quita) {
  const quitas = getQuitas();
  const updatedQuitas = [quita, ...quitas];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedQuitas));
  localStorage.setItem(LATEST_STORAGE_KEY, JSON.stringify(quita));

  return quita;
}
