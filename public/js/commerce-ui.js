// ============================================================
// COMMERCE-UI.JS — Figma-inspired e-commerce interactions
// Promo bar · Count-up stats · Floating CTA
// ============================================================

(function () {
  'use strict';

  // ── Promo bar dismiss ────────────────────────────────────────
  function initPromoBar() {
    const closeBtn = document.getElementById('promoClose');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', () => {
      document.body.classList.add('promo-dismissed');
      try { sessionStorage.setItem('promo-dismissed', '1'); } catch (_) {}
    });

    try {
      if (sessionStorage.getItem('promo-dismissed') === '1') {
        document.body.classList.add('promo-dismissed');
      }
    } catch (_) {}
  }

  // ── Count-up animation for hero stats ────────────────────────
  function initCountUp() {
    const counters = document.querySelectorAll('[data-count-up]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting || entry.target.dataset.counted) return;
        entry.target.dataset.counted = '1';
        animateCount(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  function animateCount(el) {
    const target = parseInt(el.dataset.countUp, 10);
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value + (target === 98 ? '%' : '+');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  // ── Floating CTA — show after scrolling past hero ────────────
  function initFloatingCta() {
    const cta = document.getElementById('floatingCta');
    if (!cta) return;

    const hero = document.querySelector('.hero-commerce, .hero');
    const threshold = hero ? hero.offsetHeight * 0.6 : 400;

    function onScroll() {
      if (window.scrollY > threshold) {
        cta.classList.add('is-visible');
      } else {
        cta.classList.remove('is-visible');
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    initPromoBar();
    initCountUp();
    initFloatingCta();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
