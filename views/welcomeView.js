const splashDuration = 2000;
const transitionDuration = 450;

window.setTimeout(() => {
  document.body.classList.add("is-leaving");
}, splashDuration - transitionDuration);

window.setTimeout(() => {
  window.location.href = "./pages/onboarding.html";
}, splashDuration);
