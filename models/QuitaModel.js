const STORAGE_KEY = "quita.items";
const LATEST_STORAGE_KEY = "quita.latest";

export const WORRY_TYPES = Object.freeze({
  SEED: "seed",
  KNOT: "knot",
  BURDEN: "burden",
});

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

export function getBackgroundOption(id) {
  return BACKGROUND_OPTIONS.find((option) => option.id === id) ?? BACKGROUND_OPTIONS[0];
}

export function createQuita(data) {
  const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: crypto.randomUUID?.() ?? fallbackId,
    name: data.name?.trim() || "Quita",
    worryText: data.worryText?.trim() || "",
    smallStep: data.smallStep?.trim() || "",
    activity: data.activity ?? null,
    people: data.people ?? null,
    location: data.location ?? null,
    gridBackground: data.gridBackground || BACKGROUND_OPTIONS[0].id,
    worryType: data.worryType || WORRY_TYPES.SEED,
    createdAt: new Date().toISOString(),
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
