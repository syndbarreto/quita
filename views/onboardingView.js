const steps = [...document.querySelectorAll("[data-step]")];

function showStep(stepNumber) {
  steps.forEach((step) => {
    const isCurrentStep = step.dataset.step === stepNumber;

    step.hidden = !isCurrentStep;
    step.classList.toggle("is-active", isCurrentStep);
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-go-to-step]");

  if (!trigger) {
    return;
  }

  showStep(trigger.dataset.goToStep);
});

showStep("1");

