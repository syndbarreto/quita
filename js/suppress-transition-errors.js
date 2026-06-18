window.addEventListener("unhandledrejection", function (e) {
  if (e.reason instanceof DOMException && e.reason.name === "AbortError") {
    e.preventDefault();
  }
});
