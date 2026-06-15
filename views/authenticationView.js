
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-navigate]");

  if (!trigger) {
    return;
  }

  event.preventDefault();
  window.location.href = trigger.dataset.navigate;
});
  