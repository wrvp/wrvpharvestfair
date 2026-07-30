/** Local-friendly form submit: always land on confirmation page. */
(function () {
  document.querySelectorAll("form[action*='confirmation.html']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      // When not on Netlify, avoid opaque POST failures on file:// or static hosts
      const host = window.location.hostname;
      const onNetlify = host.includes("netlify.app") || host.includes("wrvp") || host.includes("harvestfair");
      if (!onNetlify) {
        event.preventDefault();
        window.location.href = form.getAttribute("action") || "confirmation.html";
      }
    });
  });
})();
