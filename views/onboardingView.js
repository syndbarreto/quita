const steps = [...document.querySelectorAll("[data-step]")];

function showStep(stepNumber) {
  steps.forEach((step) => {
    step.hidden = step.dataset.step !== stepNumber;
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
