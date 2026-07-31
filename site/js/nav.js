/** Shared header/footer injection for multipage static site */
(function () {
  const page = document.body.dataset.page || "";

  function navLink(href, label, id) {
    const current = page === id ? ' aria-current="page"' : "";
    return `<a href="${href}"${current}>${label}</a>`;
  }

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `
      <div class="header-inner">
        <a class="brand" href="index.html">
          <span class="brand-name">Harvest Fair</span>
          <span class="brand-sub">White River Valley Players</span>
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
        <nav class="nav" id="site-nav" aria-label="Primary">
          ${navLink("index.html", "Home", "home")}
          ${navLink("about.html", "About", "about")}
          <details class="nav-dropdown">
            <summary>Sign Up</summary>
            <div class="dropdown-panel">
              ${navLink("register-vendor.html", "As Vendor", "vendor")}
              ${navLink("register-volunteer.html", "As Volunteer", "volunteer")}
            </div>
          </details>
          ${navLink("faq.html", "FAQs", "faq")}
          ${navLink("news.html", "News", "news")}
          ${navLink("contact.html", "Contact", "contact")}
          <a class="nav-donate" href="https://wrvp.org/donate" target="_blank" rel="noopener">Donate</a>
        </nav>
      </div>
    `;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner">
        <div>
          <strong>37th Annual Harvest Fair</strong><br />
          Sat Sept 12, 2026 · 10 a.m.–4 p.m. · Rochester Park
        </div>
        <div>
          Suggested donation $5 · Kids free<br />
          <a href="https://wrvp.org" target="_blank" rel="noopener">wrvp.org</a>
          ·
          <a href="contact.html">Contact</a>
        </div>
      </div>
    `;
  }
})();
