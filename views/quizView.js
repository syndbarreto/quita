import { requireAuth } from "../services/auth-service.js";

if (!requireAuth()) {
  throw new Error("Authentication required.");
}

const quizSteps = [...document.querySelectorAll("[data-step]")];
const resultTypeByStep = {
  5: "burden",
  6: "seed",
  7: "knot",
};
let currentWorryType = "seed";

function showQuizStep(stepNumber) {
  quizSteps.forEach((step) => {
    step.hidden = step.dataset.step !== String(stepNumber);
  });
}

// Navigation between quiz steps
document.addEventListener("click", (event) => {
  const nextTrigger = event.target.closest("[data-go-to-next-step]");
  const prevTrigger = event.target.closest("[data-go-to-prev-step]");
  const backTrigger = event.target.closest("[data-back-to-home]");
  const resultContinueTrigger = event.target.closest("[data-quiz-result-continue]");

  if (nextTrigger) {
    const currentStep = nextTrigger.closest("[data-step]").dataset.step;
    const nextStep = String(parseInt(currentStep) + 1);
    if (quizSteps.some((step) => step.dataset.step === nextStep)) {
      showQuizStep(nextStep);
    }
    return;
  }

  if (prevTrigger) {
    const currentStep = prevTrigger.closest("[data-step]").dataset.step;
    const prevStep = String(parseInt(currentStep) - 1);
    if (quizSteps.some((step) => step.dataset.step === prevStep)) {
      showQuizStep(prevStep);
    }
    return;
  }

  if (backTrigger) {
    window.location.href = "./home.html";
  }

  if (resultContinueTrigger) {
    const currentStep = resultContinueTrigger.closest("[data-step]").dataset.step;
    const worryType = resultTypeByStep[currentStep] || currentWorryType;

    window.location.href = `./create-quita.html?worryType=${encodeURIComponent(worryType)}`;
  }
});

// Handle radio button changes with event delegation
document.addEventListener("change", (event) => {
  if (event.target.type === "radio") {
    // Remove 'selected' class from all labels with same name
    document.querySelectorAll(`input[name="${event.target.name}"]`).forEach((radio) => {
      radio.closest(".quiz-option").classList.remove("selected");
    });
    
    // Add 'selected' class to the clicked label
    event.target.closest(".quiz-option").classList.add("selected");
  }
});

showQuizStep("1");

// Coleta as respostas do quiz e calcula o resultado
function getQuizResult() {
  // Mapeia cada resposta para seu valor de ponto
  const pointMap = {
    "option-1": 1, // seed
    "option-2": 2, // knot
    "option-3": 3  // burden
  };

  let totalPoints = 0;
  
  // Percorre todas as perguntas (question-1 a question-4)
  for (let i = 1; i <= 4; i++) {
    const selectedOption = document.querySelector(`input[name="question-${i}"]:checked`);
    if (selectedOption) {
      totalPoints += pointMap[selectedOption.value];
    }
  }

  // Determina o resultado baseado nos pontos totais
  let result;
  if (totalPoints <= 4) {
    result = { step: "6", worryType: "seed" };
  } else if (totalPoints <= 8) {
    result = { step: "7", worryType: "knot" };
  } else {
    result = { step: "5", worryType: "burden" };
  }

  return result;
}

document.addEventListener("click", (event) => {
  const submitTrigger = event.target.closest("[data-quiz-finish]");
  if (submitTrigger) {
    const result = getQuizResult();

    currentWorryType = result.worryType;
    showQuizStep(result.step);
  }
});
