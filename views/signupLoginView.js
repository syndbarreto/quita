const views = [...document.querySelectorAll("[data-step]")];

function showView(viewName) {
  views.forEach((view) => {
    view.hidden = view.dataset.step !== viewName;
  });
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-go-to-step]");

  if (!trigger) {
    return;
  }

  event.preventDefault(); // Previne que tags <a> recarreguem a página
  showView(trigger.dataset.goToStep);
});

// Verifica se na URL há indicação de qual vista abrir (ex: ?view=login)
const urlParams = new URLSearchParams(window.location.search);
const initialView = urlParams.get("view") || "signup";

showView(initialView);