
// ============================================================
// ANIMATIONS.JS — GSAP + Anime.js Premium Animation Engine
// Affiliate Live Co.
// ============================================================

(function () {
  'use strict';

  // ── Utility: detect if element is in viewport ──────────────
  function isInViewport(el) {
    const r = el.getBoundingClientRect();
    return r.top < window.innerHeight * 0.92 && r.bottom > 0;
  }

  // ── Anime.js: stagger reveal for [data-anime] elements ─────
  function initAnimeReveal() {
    if (typeof anime === 'undefined') return;

    const targets = document.querySelectorAll('[data-anime]');
    if (!targets.length) return;

    // Small delay to allow CSS to set initial opacity:0
    setTimeout(() => {}, 50);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const type = el.dataset.anime || 'fadeUp';

        const from = {
          fadeUp:   { opacity: [0, 1], translateY: [40, 0] },
          fadeLeft: { opacity: [0, 1], translateX: [-40, 0] },
          fadeRight:{ opacity: [0, 1], translateX: [40, 0] },
          scale:    { opacity: [0, 1], scale: [0.85, 1] },
          fade:     { opacity: [0, 1] },
        }[type] || { opacity: [0, 1], translateY: [40, 0] };

        anime({
          targets: el,
          ...from,
          duration: parseInt(el.dataset.animeDur) || 800,
          delay: parseInt(el.dataset.animeDelay) || 0,
          easing: 'easeOutExpo',
        });

        observer.unobserve(el);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    targets.forEach(el => {
      // Use requestAnimationFrame to set opacity after paint
      requestAnimationFrame(() => { el.style.opacity = '0'; });
      observer.observe(el);
    });
  }

  // ── Anime.js: stagger children of [data-anime-group] ───────
  function initAnimeGroups() {
    if (typeof anime === 'undefined') return;

    const groups = document.querySelectorAll('[data-anime-group]');
    if (!groups.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const group = entry.target;
        const children = group.querySelectorAll('[data-anime-child]');
        if (!children.length) return;

        anime({
          targets: children,
          opacity: [0, 1],
          translateY: [50, 0],
          duration: 700,
          delay: anime.stagger(100, { start: parseInt(group.dataset.animeGroupDelay) || 0 }),
          easing: 'easeOutExpo',
        });

        observer.unobserve(group);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    groups.forEach(group => {
      group.querySelectorAll('[data-anime-child]').forEach(c => {
        requestAnimationFrame(() => { c.style.opacity = '0'; });
      });
      observer.observe(group);
    });
  }

  // ── GSAP: floating particles in hero ───────────────────────
  function initParticles() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.45,
      dy: (Math.random() - 0.5) * 0.45,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    let mouse = { x: null, y: null };
    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(99,179,237,${(1 - dist / 120) * 0.22})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      // Draw particles
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

        // Mouse repulsion
        if (mouse.x !== null) {
          const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
          if (d < 90) {
            p.x += (p.x - mouse.x) / d * 1.2;
            p.y += (p.y - mouse.y) / d * 1.2;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147,210,255,${p.alpha})`;
        ctx.fill();
      });

      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── GSAP: header scroll effect ─────────────────────────────
  function initHeaderScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let lastY = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      // Hide on scroll down, show on scroll up
      if (y > lastY + 5 && y > 200) {
        header.classList.add('header-hidden');
      } else if (y < lastY - 5) {
        header.classList.remove('header-hidden');
      }
      lastY = y;
    }, { passive: true });
  }

  // ── GSAP: counter animation ─────────────────────────────────
  function initCounters() {
    if (typeof gsap === 'undefined') return;

    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.countSuffix || '';
        const duration = parseFloat(el.dataset.countDur) || 1.8;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration,
          ease: 'power2.out',
          onUpdate() {
            el.textContent = (Number.isInteger(target)
              ? Math.round(obj.val)
              : obj.val.toFixed(1)) + suffix;
          }
        });

        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  // ── GSAP: magnetic button effect ───────────────────────────
  function initMagneticButtons() {
    if (typeof gsap === 'undefined') return;

    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // ── GSAP: horizontal process timeline ──────────────────────
  function initProcessTimeline() {
    if (typeof gsap === 'undefined') return;

    const items = document.querySelectorAll('.process-item');
    if (!items.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        gsap.fromTo(items,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: 'power3.out'
          }
        );

        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    const wrapper = items[0].closest('.process-list');
    if (wrapper) observer.observe(wrapper);
  }

  // ── Anime.js: card hover tilt ────────────────────────────────
  function initCardTilt() {
    document.querySelectorAll('.card, .service-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;

        if (typeof anime !== 'undefined') {
          anime({
            targets: card,
            rotateX: y,
            rotateY: x,
            duration: 200,
            easing: 'easeOutQuad',
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        if (typeof anime !== 'undefined') {
          anime({
            targets: card,
            rotateX: 0,
            rotateY: 0,
            duration: 500,
            easing: 'easeOutElastic(1, 0.5)',
          });
        }
      });
    });
  }

  // ── GSAP: glowing cursor trail ──────────────────────────────
  function initCursorGlow() {
    const cursor = document.getElementById('cursorGlow');
    if (!cursor || typeof gsap === 'undefined') return;

    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      gsap.to(cursor, {
        x: mx - 10,
        y: my - 10,
        duration: 0.15,
        ease: 'power2.out',
      });
    });

    document.querySelectorAll('a, button, .card').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
    });
  }

  // ── Anime.js: typing effect ─────────────────────────────────
  function initTypingEffect() {
    const el = document.getElementById('typingText');
    if (!el || typeof anime === 'undefined') return;

    const words = el.dataset.words ? el.dataset.words.split('|') : [];
    if (!words.length) return;

    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function type() {
      const word = words[wordIdx];
      if (!deleting) {
        charIdx++;
        el.textContent = word.slice(0, charIdx);
        if (charIdx === word.length) {
          deleting = true;
          setTimeout(type, 1800);
          return;
        }
      } else {
        charIdx--;
        el.textContent = word.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          wordIdx = (wordIdx + 1) % words.length;
        }
      }
      setTimeout(type, deleting ? 50 : 90);
    }
    type();
  }

  // ── Anime.js: number ticker on hero stats ───────────────────
  function initHeroStats() {
    if (typeof anime === 'undefined') return;

    const stats = document.querySelectorAll('.proof-number');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const val = parseInt(el.dataset.value || el.textContent) || 0;

        anime({
          targets: el,
          innerHTML: [0, val],
          round: 1,
          duration: 1500,
          easing: 'easeOutExpo',
        });
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach(el => observer.observe(el));
  }

  // ── Init all ────────────────────────────────────────────────
  function init() {
    initParticles();
    initHeaderScroll();
    initAnimeReveal();
    initAnimeGroups();
    initCounters();
    initMagneticButtons();
    initProcessTimeline();
    initCardTilt();
    initCursorGlow();
    initTypingEffect();
    initHeroStats();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
