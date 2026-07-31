/** Local-only form shim; on Netlify, let the platform handle POST + email. */
(function () {
  const host = window.location.hostname;
  const onNetlify =
    host.endsWith("netlify.app") ||
    host.includes("harvestfair") ||
    host.includes("wrvp");

  if (onNetlify) return;

  document.querySelectorAll("form[action*='confirmation']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const action = form.getAttribute("action") || "/confirmation.html";
      window.location.href = action.replace(/^\//, "");
    });
  });
})();
