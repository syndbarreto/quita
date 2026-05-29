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