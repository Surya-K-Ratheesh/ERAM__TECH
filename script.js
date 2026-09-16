(function () {
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";
  const pageLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const yearNode = document.querySelector("[data-year]");
  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  const form = document.querySelector("[data-contact-form]");

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const normalizePath = (p) => p.replace(/\/+$/, "") || "/";
  const matches = (t) => normalizePath(t) === currentPath;

  pageLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && matches(href)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const status = form.querySelector("[data-form-status]");
      if (status) status.textContent = "Thanks. Your message has been received.";
      form.reset();
    });
  }
})();
