(() => {
  const materials = {
    aluminum: { title: 'Strong lines. Lighter possibilities.', copy: 'From carefully detailed frames to expressive facades, aluminum brings versatility and definition to architectural ideas.', image: 'windows', index: '01 / Aluminum', alt: 'Illustrative aluminum window frame concept', link: 'windows' },
    glass: { title: 'More light. A wider perspective.', copy: 'Glass connects interior and exterior, inviting daylight into spaces through windows, overhead glazing and architectural details.', image: 'sky-light', index: '02 / Glass', alt: 'Illustrative glazed skylight concept', link: 'sky-light' },
    steel: { title: 'Quiet strength. Refined detail.', copy: 'Stainless steel brings a considered finish to hand rails and architectural details, coordinated with the needs of the space.', image: 'hand-rails', index: '03 / Stainless steel', alt: 'Illustrative hand rail concept', link: 'hand-rails' }
  };
  document.querySelectorAll('[data-material]').forEach(button => {
    button.addEventListener('click', () => {
      const material = materials[button.dataset.material];
      document.querySelectorAll('[data-material]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('[data-material-title]').textContent = material.title;
      document.querySelector('[data-material-copy]').textContent = material.copy;
      document.querySelector('[data-material-index]').textContent = material.index;
      const image = document.querySelector('[data-material-image]');
      image.src = '/assets/studies/' + material.image + '.svg';
      image.alt = material.alt;
      document.querySelector('[data-material-link]').href = '/products/' + material.link + '/';
    });
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-ready');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.section-top, .feature, .material-copy').forEach(node => observer.observe(node));
  }
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const values = new FormData(form);
      const subject = 'Project enquiry: ' + values.get('subject');
      const body = 'Name: ' + values.get('name') + '\nEmail: ' + values.get('email') + '\n\n' + values.get('message');
      // No backend is configured: prepare an email, never claim a message was sent.
      window.location.href = 'mailto:info@eramtech.co?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      form.querySelector('[data-form-status]').textContent = 'Your email app has been requested. Please send the prepared email there. If it did not open, email info@eramtech.co directly.';
    });
  }
})();
