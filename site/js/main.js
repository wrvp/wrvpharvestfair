(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Close signup dropdown when clicking outside (desktop)
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".nav-dropdown[open]").forEach((details) => {
      if (!details.contains(event.target)) details.removeAttribute("open");
    });
  });

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".carousel-dot"));
  if (!slides.length) return;

  let index = 0;
  let timer;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => {
      slide.classList.toggle("is-active", n === index);
    });
    dots.forEach((dot, n) => {
      dot.setAttribute("aria-selected", n === index ? "true" : "false");
    });
  }

  function next() {
    show(index + 1);
  }

  function start() {
    stop();
    timer = window.setInterval(next, 5000);
  }

  function stop() {
    if (timer) window.clearInterval(timer);
  }

  dots.forEach((dot, n) => {
    dot.addEventListener("click", () => {
      show(n);
      start();
    });
  });

  const visual = document.querySelector(".hero-visual");
  if (visual) {
    visual.addEventListener("mouseenter", stop);
    visual.addEventListener("mouseleave", start);
    visual.addEventListener("focusin", stop);
    visual.addEventListener("focusout", start);

    let touchX = null;
    visual.addEventListener(
      "touchstart",
      (e) => {
        touchX = e.changedTouches[0].screenX;
        stop();
      },
      { passive: true }
    );
    visual.addEventListener(
      "touchend",
      (e) => {
        if (touchX == null) return;
        const dx = e.changedTouches[0].screenX - touchX;
        if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
        touchX = null;
        start();
      },
      { passive: true }
    );
  }

  show(0);
  start();
})();
