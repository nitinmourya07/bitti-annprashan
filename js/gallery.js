/* ════════════════════════════════════════════════════════
   Annaprashan – Gallery Interactions (Lightbox + Tabs)
   ════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── TAB FILTERING ────────────────────────────────────
  function initTabs() {
    const tabs = document.querySelectorAll('.gallery-tab');
    const items = document.querySelectorAll('.gallery-item');

    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Filter items
        items.forEach(item => {
          const itemCategories = (item.dataset.category || '').split(' ');
          if (category === 'all' || itemCategories.includes(category)) {
            item.style.display = '';
            item.style.animation = 'fade-in-up 0.5s ease forwards';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });

    // Trigger initial filter so only one section is open on load
    const initialActive = document.querySelector('.gallery-tab.active');
    if (initialActive) {
      initialActive.click();
    }
  }

  // ─── LIGHTBOX ─────────────────────────────────────────
  let lightboxImages = [];
  let currentImageIdx = 0;

  function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item[data-src]');
    if (!galleryItems.length) return;

    // Build lightbox markup
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close">×</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous">‹</button>
        <button class="lightbox-nav lightbox-next" aria-label="Next">›</button>
        <img src="" alt="" />
        <div class="lightbox-caption"></div>
      </div>
    `;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector('img');
    const captionEl = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    // Gather images
    lightboxImages = Array.from(galleryItems).map(item => ({
      src: item.dataset.src,
      caption: item.dataset.caption || ''
    }));

    function openLightbox(idx) {
      currentImageIdx = idx;
      const img = lightboxImages[idx];
      imgEl.src = img.src;
      imgEl.alt = img.caption;
      captionEl.textContent = img.caption;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    function showPrev() {
      currentImageIdx = (currentImageIdx - 1 + lightboxImages.length) % lightboxImages.length;
      openLightbox(currentImageIdx);
    }

    function showNext() {
      currentImageIdx = (currentImageIdx + 1) % lightboxImages.length;
      openLightbox(currentImageIdx);
    }

    // Event listeners
    galleryItems.forEach((item, idx) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.gallery-download')) return; // Don't open lightbox on download
        openLightbox(idx);
      });
    });

    closeBtn.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', showPrev);
    nextBtn.addEventListener('click', showNext);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Swipe on lightbox
    let startX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) > 60) {
        if (dx < 0) showNext();
        else showPrev();
      }
    }, { passive: true });
  }

  // ─── INIT ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initLightbox();
  });
})();
