(function () {
  const body = document.body;
  const currentPath = window.location.pathname.replace(/\/+$/, "") || "/";

  const pageLinks = Array.from(document.querySelectorAll("[data-nav-link]"));
  const productLinks = Array.from(document.querySelectorAll("[data-product-link]"));
  const dropdownItems = Array.from(document.querySelectorAll("[data-products-dropdown]"));
  const mobileToggle = document.querySelector("[data-nav-toggle]");
  const mobileButton = document.querySelector("[data-nav-button]");
  const yearNode = document.querySelector("[data-year]");
  const revealNodes = Array.from(document.querySelectorAll(".reveal"));
  const form = document.querySelector("[data-contact-form]");
  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }

  const normalizePath = (path) => path.replace(/\/+$/, "") || "/";

  const matches = (target) => normalizePath(target) === currentPath;

  pageLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && matches(href)) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  productLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const productPath = normalizePath(href);
    if (currentPath === productPath) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
      dropdownItems.forEach((dropdown) => dropdown.classList.add("open"));
    }
  });

  const closeDropdowns = () => {
    dropdownItems.forEach((dropdown) => dropdown.classList.remove("open"));
  };

  dropdownItems.forEach((dropdown) => {
    const trigger = dropdown.querySelector("[data-products-trigger]");
    if (!trigger) return;
    trigger.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 920px)").matches) {
        event.preventDefault();
        const isOpen = dropdown.classList.contains("open");
        closeDropdowns();
        if (!isOpen) dropdown.classList.add("open");
      }
    });
  });

  if (mobileToggle) {
    mobileToggle.addEventListener("change", () => {
      if (!mobileToggle.checked) closeDropdowns();
    });
  }

  if (mobileToggle && mobileButton) {
    mobileButton.addEventListener("click", (event) => {
      if (window.matchMedia("(max-width: 920px)").matches) {
        event.preventDefault();
        mobileToggle.checked = !mobileToggle.checked;
        if (!mobileToggle.checked) {
          closeDropdowns();
        }
      }
    });
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    if (!target.closest("[data-products-dropdown]")) {
      closeDropdowns();
    }

    if (
      mobileToggle &&
      mobileToggle.checked &&
      !target.closest(".nav") &&
      !target.closest(".nav-button")
    ) {
      mobileToggle.checked = false;
      closeDropdowns();
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
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const status = form.querySelector("[data-form-status]");
      if (status) {
        status.textContent =
          "Thanks. Your message is ready to be connected to a backend or email service.";
      }
      form.reset();
    });
  }

})();
