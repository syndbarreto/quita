import {
  BACKGROUND_OPTIONS,
  CHOICE_GROUPS,
  DOLL_STATES,
  QUITA_NAME_MAX_LENGTH,
  WORRY_TYPES,
  createChoice,
  createQuita,
  getBackgroundOption,
  limitQuitaName,
  normalizeQuitaName,
  pickRandomDoll,
  saveQuita,
} from "../models/QuitaModel.js";

const nameInput = document.querySelector("[data-name-input]");
const liveName = document.querySelector("[data-live-quita-name]");
const form = document.querySelector("[data-create-quita-form]");
const backgroundOptions = document.querySelector("[data-background-options]");
const backgroundPreview = document.querySelector("[data-background-preview]");
const dollPreview = document.querySelector("[data-doll-preview]");

const colorOrder = ["blue", "pink", "green", "orange", "yellow"];
const selectedChoices = {
  activity: null,
  people: null,
  location: null,
};
const selectedDoll = pickRandomDoll();
let selectedBackgroundId = BACKGROUND_OPTIONS[0].id;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return entities[char];
  });
}

function renderLiveName(value = "Quita") {
  const normalizedName = normalizeQuitaName(value);
  const letters = Array.from(normalizedName)
    .map((char, index) => {
      const color = colorOrder[index % colorOrder.length];
      const content = char === " " ? "&nbsp;" : escapeHtml(char);

      return `<span class="name-letter--${color}">${content}</span>`;
    })
    .join("");

  liveName.innerHTML = `<span class="quita-display-name__content">${letters}</span>`;

  fitLiveName();
}

function fitLiveName() {
  liveName.style.setProperty("--quita-name-scale", "1");

  requestAnimationFrame(() => {
    const content = liveName.querySelector(".quita-display-name__content");

    if (!content) {
      return;
    }

    const availableWidth = liveName.clientWidth;
    const contentWidth = content.getBoundingClientRect().width;

    if (contentWidth <= availableWidth) {
      return;
    }

    const scale = Math.max(0.72, (availableWidth / contentWidth) * 0.98);

    liveName.style.setProperty("--quita-name-scale", scale.toFixed(3));
  });
}

function createChoiceButton(group, value, type = "preset") {
  const button = document.createElement("button");
  button.className = type === "custom" ? "soft-chip soft-chip--custom" : "soft-chip";
  button.type = "button";
  button.textContent = value;
  button.dataset.choiceOption = value;
  button.dataset.choiceGroup = group;
  button.dataset.choiceType = type;
  button.setAttribute("aria-pressed", "false");

  return button;
}

function setSelectedChoice(button) {
  const group = button.dataset.choiceGroup;
  const list = button.closest("[data-choice-list]");

  list.querySelectorAll("[data-choice-option]").forEach((option) => {
    option.classList.toggle("is-selected", option === button);
    option.setAttribute("aria-pressed", option === button ? "true" : "false");
  });

  selectedChoices[group] = createChoice(
    button.dataset.choiceOption,
    button.dataset.choiceType
  );
}

function addCustomChoice(group, list) {
  const currentInput = list.querySelector("[data-custom-choice-input]");

  if (currentInput) {
    currentInput.focus();
    return;
  }

  const input = document.createElement("input");
  input.className = "soft-chip-input";
  input.type = "text";
  input.placeholder = "Write one...";
  input.dataset.customChoiceInput = group;

  list.append(input);
  input.focus();

  const commitCustomChoice = () => {
    const value = input.value.trim();

    if (!value) {
      input.remove();
      return;
    }

    const existing = Array.from(list.querySelectorAll("[data-choice-option]")).find(
      (button) => button.dataset.choiceOption.toLowerCase() === value.toLowerCase()
    );

    if (existing) {
      input.remove();
      setSelectedChoice(existing);
      return;
    }

    const customButton = createChoiceButton(group, value, "custom");
    input.replaceWith(customButton);
    setSelectedChoice(customButton);
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitCustomChoice();
    }

    if (event.key === "Escape") {
      input.remove();
    }
  });

  input.addEventListener("blur", commitCustomChoice);
}

function renderChoiceGroups() {
  document.querySelectorAll("[data-choice-group]").forEach((section) => {
    const group = section.dataset.choiceGroup;
    const list = section.querySelector("[data-choice-list]");
    const addButton = document.createElement("button");

    addButton.className = "soft-chip soft-chip--add";
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.dataset.addChoice = group;
    addButton.setAttribute("aria-label", `Add custom ${group}`);

    list.append(addButton);

    CHOICE_GROUPS[group].forEach((option) => {
      list.append(createChoiceButton(group, option));
    });
  });
}

function renderBackgroundOptions() {
  BACKGROUND_OPTIONS.forEach((option) => {
    const swatch = document.createElement("button");
    swatch.className = "swatch-button";
    swatch.type = "button";
    swatch.style.setProperty("--swatch-color", `var(--${option.background})`);
    swatch.dataset.backgroundOption = option.id;
    swatch.setAttribute("aria-label", option.label);

    backgroundOptions.append(swatch);
  });
}

function setBackground(id) {
  const option = getBackgroundOption(id);

  selectedBackgroundId = option.id;
  backgroundPreview.className = `background-preview background-option--${option.id}`;

  backgroundOptions.querySelectorAll("[data-background-option]").forEach((button) => {
    const isSelected = button.dataset.backgroundOption === option.id;

    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });
}

function renderDollPreview() {
  dollPreview.src = selectedDoll.states[DOLL_STATES.WORRIED];
  dollPreview.alt = `${selectedDoll.label} Quita doll preview`;
}

function getFormData() {
  const data = new FormData(form);

  return {
    name: data.get("name"),
    worryText: data.get("worryText"),
    smallStep: data.get("smallStep"),
    activity: selectedChoices.activity,
    people: selectedChoices.people,
    location: selectedChoices.location,
    gridBackground: selectedBackgroundId,
    worryType: WORRY_TYPES.SEED,
    dollId: selectedDoll.id,
    dollState: DOLL_STATES.WORRIED,
  };
}

renderLiveName();
renderDollPreview();
renderChoiceGroups();
renderBackgroundOptions();
setBackground(selectedBackgroundId);
nameInput.maxLength = QUITA_NAME_MAX_LENGTH;

nameInput.addEventListener("input", (event) => {
  const limitedValue = limitQuitaName(event.target.value);

  if (event.target.value !== limitedValue) {
    event.target.value = limitedValue;
  }

  renderLiveName(limitedValue);
});

window.addEventListener("resize", () => {
  renderLiveName(nameInput.value);
});

document.fonts?.ready.then(() => {
  renderLiveName(nameInput.value);
});

document.addEventListener("click", (event) => {
  const choiceButton = event.target.closest("[data-choice-option]");
  const addChoiceButton = event.target.closest("[data-add-choice]");
  const backgroundButton = event.target.closest("[data-background-option]");

  if (choiceButton) {
    setSelectedChoice(choiceButton);
  }

  if (addChoiceButton) {
    const group = addChoiceButton.dataset.addChoice;
    const list = addChoiceButton.closest("[data-choice-list]");

    addCustomChoice(group, list);
  }

  if (backgroundButton) {
    setBackground(backgroundButton.dataset.backgroundOption);
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const quita = createQuita(getFormData());
  saveQuita(quita);

  window.location.href = "./vault.html";
});
