/** Inject shared wireframe chrome into [data-wf-nav] and [data-wf-footer]. */
(function () {
  const page = document.body.dataset.page || "";

  function link(href, label, opts = {}) {
    const current = opts.current || page === opts.id;
    const cls = opts.cls ? ` class="${opts.cls}"` : "";
    const cur = current ? ' aria-current="page"' : "";
    return `<a href="${href}"${cls}${cur}>${label}</a>`;
  }

  const navEl = document.querySelector("[data-wf-nav]");
  if (navEl) {
    navEl.innerHTML = `
      <div class="brand-block">
        <a class="brand" href="index.html">Harvest Fair 2026</a>
        <span class="brand-sub">White River Valley Players</span>
      </div>
      <nav class="nav" aria-label="Primary">
        ${link("index.html", "Home", { id: "home" })}
        ${link("about.html", "About", { id: "about" })}
        <details class="nav-dropdown">
          <summary>Sign Up</summary>
          <div class="dropdown-panel">
            ${link("register-vendor.html", "As Vendor", { id: "vendor" })}
            ${link("register-volunteer.html", "As Volunteer", { id: "volunteer" })}
          </div>
        </details>
        ${link("faq.html", "FAQs", { id: "faq" })}
        ${link("news.html", "News Links", { id: "news" })}
        ${link("contact.html", "Contact Us", { id: "contact" })}
        ${link("https://wrvp.org/donate", "Donate", { cls: "nav-donate", id: "donate" })}
      </nav>
    `;
  }

  const foot = document.querySelector("[data-wf-footer]");
  if (foot) {
    foot.innerHTML = `
      <span>Wireframe · Not final design · Rochester Park · Sat Sept 12, 2026</span>
      <span>Suggested donation $2 · Kids free</span>
    `;
  }

  const meta = document.querySelector("[data-wf-screens]");
  if (meta) {
    const screens = [
      ["index.html", "Home"],
      ["about.html", "About"],
      ["register-vendor.html", "Vendor"],
      ["register-volunteer.html", "Volunteer"],
      ["confirmation.html", "Confirm"],
      ["faq.html", "FAQs"],
      ["news.html", "News"],
      ["contact.html", "Contact"],
    ];
    meta.innerHTML = screens
      .map(([href, label]) => `<a href="${href}">${label}</a>`)
      .join("");
  }
})();
