(function () {
  const nav = document.getElementById('mainNav');
  const toggle = document.querySelector('.menu-toggle');

  if (nav && toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === currentFile) {
      link.classList.add('active');
    }
  });
})();

