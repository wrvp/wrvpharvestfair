/** Enrich Netlify email subjects; locally skip real POST. */
(function () {
  const host = window.location.hostname;
  const onNetlify =
    host.endsWith("netlify.app") ||
    host.includes("harvestfair") ||
    host.includes("wrvp");

  function val(form, name) {
    const el = form.elements.namedItem(name);
    if (!el) return "";
    return String(el.value || "").trim();
  }

  function ensureSubjectInput(form) {
    let subject = form.querySelector('input[name="subject"][type="hidden"]');
    if (!subject) {
      subject = document.createElement("input");
      subject.type = "hidden";
      subject.name = "subject";
      form.appendChild(subject);
    }
    subject.setAttribute("data-remove-prefix", "");
    return subject;
  }

  function buildSubject(form) {
    const formName = form.getAttribute("name") || val(form, "form-name");
    const email = val(form, "email");
    const who =
      val(form, "organization") ||
      val(form, "contact") ||
      val(form, "name") ||
      "Unknown";

    if (formName === "vendor-registration") {
      const contact = val(form, "contact");
      const label = contact && contact !== who ? `${who} (${contact})` : who;
      return `Vendor reservation — ${label}${email ? ` <${email}>` : ""}`;
    }

    if (formName === "volunteer-registration") {
      return `Volunteer signup — ${who}${email ? ` <${email}>` : ""}`;
    }

    if (formName === "contact") {
      const topic = val(form, "topic") || val(form, "subject") || "Message";
      return `Contact — ${topic} — ${who}${email ? ` <${email}>` : ""}`;
    }

    return `Harvest Fair form — ${who}${email ? ` <${email}>` : ""}`;
  }

  document.querySelectorAll("form[data-netlify], form[action*='confirmation']").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const subject = ensureSubjectInput(form);
      subject.value = buildSubject(form);

      if (!onNetlify) {
        event.preventDefault();
        const action = form.getAttribute("action") || "/confirmation.html";
        window.location.href = action.replace(/^\//, "");
      }
    });
  });
})();
