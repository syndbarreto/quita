console.log('quizView.js carregado!');

const quizSteps = [...document.querySelectorAll("[data-step]")];

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
});

// Handle radio button changes with event delegation
document.addEventListener('change', (event) => {
  if (event.target.type === 'radio') {
    console.log(`Pergunta: ${event.target.name}, Opção: ${event.target.value}`);
    
    // Remove 'selected' class from all labels with same name
    document.querySelectorAll(`input[name="${event.target.name}"]`).forEach((radio) => {
      radio.closest('.quiz-option').classList.remove('selected');
    });
    
    // Add 'selected' class to the clicked label
    event.target.closest('.quiz-option').classList.add('selected');
  }
});

showQuizStep("1");

// Coleta as respostas do quiz e calcula o resultado
function getQuizResult() {
  // Mapeia cada resposta para seu valor de ponto
  const pointMap = {
    'option-1': 1, // seed
    'option-2': 2, // knot
    'option-3': 3  // burden
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
  let resultStep;
  if (totalPoints <= 4) {
    resultStep = "6"; // Seed
  } else if (totalPoints <= 8) {
    resultStep = "7"; // Knot
  } else {
    resultStep = "5"; // Burden
  }

  return resultStep;
}

document.addEventListener("click", (event) => {
  const submitTrigger = event.target.closest("[data-quiz-finish]");
  if (submitTrigger) {
    const resultStep = getQuizResult();
    showQuizStep(resultStep);
  }
});