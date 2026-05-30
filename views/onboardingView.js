const steps = [...document.querySelectorAll("[data-step]")];
let currentStep = steps.find((step) => !step.hidden) || steps[0];
let isTransitioning = false;

function showStep(stepNumber) {
  const nextStep = steps.find((step) => step.dataset.step === stepNumber);

  if (!nextStep || nextStep === currentStep || isTransitioning) {
    return;
  }

  const direction =
    Number(nextStep.dataset.step) > Number(currentStep.dataset.step)
      ? "forward"
      : "backward";

  isTransitioning = true;
  nextStep.hidden = false;
  nextStep.classList.add("is-entering", `is-${direction}`);
  currentStep.classList.add("is-exiting", `is-${direction}`);

  requestAnimationFrame(() => {
    nextStep.classList.add("is-active");
    currentStep.classList.remove("is-active");
  });

  window.setTimeout(() => {
    currentStep.hidden = true;
    currentStep.classList.remove("is-exiting", "is-forward", "is-backward");
    nextStep.classList.remove("is-entering", "is-forward", "is-backward");

    currentStep = nextStep;
    isTransitioning = false;
  }, 520);
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-go-to-step]");

  if (!trigger) {
    return;
  }

  showStep(trigger.dataset.goToStep);
});

steps.forEach((step) => {
  step.hidden = step.dataset.step !== "1";
  step.classList.toggle("is-active", step.dataset.step === "1");
});
