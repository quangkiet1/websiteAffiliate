// ============================================================
// NEXTMOTION-FX.JS — Wobble Cards, Scroll AnimatePresence,
//                     Email Live Preview (Markdown)
// Inspired by yoyocharlie/nextMotion
// ============================================================

(function () {
  'use strict';

  // ── 1. WOBBLE CARDS — 3D tilt following mouse ────────────────
  function initWobbleCards() {
    document.querySelectorAll('.wobble-card').forEach(card => {
      // Create glow element if not present
      if (!card.querySelector('.wobble-glow')) {
        const glow = document.createElement('div');
        glow.className = 'wobble-glow';
        card.appendChild(glow);
      }

      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Move glow
        const glow = card.querySelector('.wobble-glow');
        if (glow) {
          glow.style.left = x + 'px';
          glow.style.top = y + 'px';
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  // ── 2. SCROLL ANIMATE-PRESENCE ───────────────────────────────
  // Like Framer Motion's AnimatePresence — show/hide with transitions
  function initScrollAnimatePresence() {
    const elements = document.querySelectorAll('[data-scroll-animate]');
    const staggerGroups = document.querySelectorAll('[data-scroll-stagger]');

    if (!elements.length && !staggerGroups.length) return;

    // Use IntersectionObserver with threshold options
    const showObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } else {
          // AnimatePresence: remove when out of viewport
          if (entry.target.dataset.scrollAnimate === 'once') return;
          entry.target.classList.remove('is-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    elements.forEach(el => showObserver.observe(el));
    staggerGroups.forEach(el => showObserver.observe(el));
  }

  // ── 3. EMAIL LIVE PREVIEW (Simple Markdown rendering) ────────
  function initEmailPreview() {
    const form = document.getElementById('contactForm');
    const previewBody = document.getElementById('emailPreviewBody');
    if (!form || !previewBody) return;

    const nameInput = form.querySelector('#contact_name');
    const emailInput = form.querySelector('#contact_email');
    const companyInput = form.querySelector('#contact_company');
    const messageInput = form.querySelector('#contact_message');

    function simpleMarkdown(text) {
      if (!text) return '';
      let html = text
        // Escape HTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Inline code
        .replace(/`(.+?)`/g, '<code>$1</code>')
        // Line breaks
        .replace(/\n/g, '<br>');
      return html;
    }

    function updatePreview() {
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const company = companyInput ? companyInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name && !email && !message) {
        previewBody.innerHTML = '<div class="ep-placeholder">Nhập thông tin bên trái để xem email preview trực tiếp...</div>';
        return;
      }

      const date = new Date();
      const dateStr = date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      previewBody.innerHTML = `
        <div class="ep-from">Từ: ${name || 'Khách hàng'} &lt;${email || '...'}&gt;</div>
        <div class="ep-subject">Yêu cầu tư vấn${company ? ' — ' + company : ''}</div>
        <div class="ep-meta">
          <span>📅 ${dateStr}</span>
          ${company ? '<span>🏢 ' + company + '</span>' : ''}
        </div>
        <div class="ep-content">${simpleMarkdown(message) || '<em>Chưa có nội dung...</em>'}</div>
      `;
    }

    // Listen to all inputs
    [nameInput, emailInput, companyInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('input', updatePreview);
      }
    });

    // Initial render
    updatePreview();
  }

  // ── INIT ─────────────────────────────────────────────────────
  function init() {
    initWobbleCards();
    initScrollAnimatePresence();
    initEmailPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
