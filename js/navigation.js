/* ════════════════════════════════════════════════════════
   Annaprashan – Navigation & Page Interactions
   ════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── PAGE CONFIG ──────────────────────────────────────
  const PAGES = [
    { file: 'index.html',           label: 'Welcome',    icon: '🌅' },
    { file: 'page2-baby.html',      label: 'Baby Story',  icon: '👶' },
    { file: 'page3-brother.html',   label: 'Big Brother', icon: '👦' },
    { file: 'page4-ceremony.html',  label: 'Ceremony',    icon: '🍚' },
    { file: 'page5-gallery.html',   label: 'Gallery',     icon: '📸' },
    { file: 'page6-blessings.html', label: 'Blessings',   icon: '💌' },
  ];

  // ─── DETERMINE CURRENT PAGE ───────────────────────────
  function getCurrentPageIndex() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const idx = PAGES.findIndex(p => p.file === path);
    return idx >= 0 ? idx : 0;
  }

  // ─── BUILD PAGE DOTS ─────────────────────────────────
  function buildPageDots() {
    const currentIdx = getCurrentPageIndex();
    const nav = document.createElement('nav');
    nav.className = 'page-dots';
    nav.setAttribute('aria-label', 'Page navigation');

    PAGES.forEach((page, i) => {
      const a = document.createElement('a');
      a.href = page.file;
      a.className = i === currentIdx ? 'active' : '';
      a.setAttribute('aria-label', page.label);
      a.title = page.label;

      const tooltip = document.createElement('span');
      tooltip.className = 'tooltip';
      tooltip.textContent = page.label;
      a.appendChild(tooltip);

      // Transition on click
      a.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(page.file);
      });

      nav.appendChild(a);
    });

    document.body.appendChild(nav);
  }

  // ─── NAVIGATE WITH TRANSITION ─────────────────────────
  function navigateTo(url) {
    // Create overlay
    let overlay = document.querySelector('.page-transition-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'page-transition-overlay';
      document.body.appendChild(overlay);
    }

    // Trigger transition
    requestAnimationFrame(() => {
      overlay.classList.add('active');
      setTimeout(() => {
        window.location.href = url;
      }, 400);
    });
  }

  // ─── WIRE NAV BUTTONS ─────────────────────────────────
  function wireNavButtons() {
    document.querySelectorAll('.nav-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(btn.getAttribute('data-page'));
      });
    });
  }

  // ─── SCROLL REVEAL (IntersectionObserver) ─────────────
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // ─── LOADING SCREEN ──────────────────────────────────
  function initLoader() {
    const loader = document.querySelector('.loader-screen');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 600);
      }, 800);
    });
  }

  // ─── KEYBOARD NAVIGATION ─────────────────────────────
  function initKeyboardNav() {
    const currentIdx = getCurrentPageIndex();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (currentIdx < PAGES.length - 1) {
          navigateTo(PAGES[currentIdx + 1].file);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentIdx > 0) {
          navigateTo(PAGES[currentIdx - 1].file);
        }
      }
    });
  }

  // ─── TOUCH SWIPE ──────────────────────────────────────
  function initTouchSwipe() {
    let startX = 0;
    let startY = 0;
    const currentIdx = getCurrentPageIndex();

    document.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
      startY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - startX;
      const dy = e.changedTouches[0].screenY - startY;

      if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && currentIdx < PAGES.length - 1) {
          navigateTo(PAGES[currentIdx + 1].file);
        } else if (dx > 0 && currentIdx > 0) {
          navigateTo(PAGES[currentIdx - 1].file);
        }
      }
    }, { passive: true });
  }

  // ─── PERSISTENT AUDIO PLAYER ──────────────────────────
  function initAudioPlayer() {
    const AUDIO_SRC = 'assets/audio/WhatsApp Audio 2026-04-24 at 1.04.55 AM.mpeg';
    
    const audio = document.createElement('audio');
    audio.src = AUDIO_SRC;
    audio.loop = true;
    document.body.appendChild(audio);

    const btn = document.createElement('button');
    btn.className = 'global-audio-btn';
    btn.setAttribute('aria-label', 'Toggle Music');
    btn.innerHTML = '🎵';
    document.body.appendChild(btn);

    // Restore state from sessionStorage
    const isPlayingStr = sessionStorage.getItem('annaprashan_audio_playing');
    let isPlaying = isPlayingStr === 'true';
    const savedTime = sessionStorage.getItem('annaprashan_audio_time');
    
    if (savedTime) {
      audio.currentTime = parseFloat(savedTime);
    }

    // Update button visual
    function updateBtn() {
      if (isPlaying) {
        btn.classList.add('playing');
        btn.innerHTML = '🎶';
      } else {
        btn.classList.remove('playing');
        btn.innerHTML = '🔇';
      }
    }

    // First attempt to play if we were playing before
    if (isPlaying) {
      audio.play().catch(() => {
        isPlaying = false; // Browser blocked autoplay on reload
        updateBtn();
      });
    }
    updateBtn();

    // Toggle on click
    btn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          isPlaying = true;
          sessionStorage.setItem('annaprashan_audio_playing', 'true');
          updateBtn();
        });
      } else {
        audio.pause();
        isPlaying = false;
        sessionStorage.setItem('annaprashan_audio_playing', 'false');
        updateBtn();
      }
    });

    // We can also let the "Enter" button trigger audio initially if not playing
    const enterBtn = document.querySelector('.enter-btn');
    if (enterBtn) {
      enterBtn.addEventListener('click', (e) => {
        if (!isPlaying) {
          sessionStorage.setItem('annaprashan_audio_playing', 'true');
          audio.play(); // Triggers right before navigating away
        }
      });
    }

    // Save time constantly so it seamlessly resumes on next page
    setInterval(() => {
      if (isPlaying) {
        sessionStorage.setItem('annaprashan_audio_time', audio.currentTime);
      }
    }, 500);
  }

  // ─── PETAL RAIN ───────────────────────────────────────
  function initPetalRain() {
    if (document.querySelector('.petal-rain')) return; // already exists
    
    const petalHtml = `
      <div class="petal"></div><div class="petal"></div><div class="petal"></div>
      <div class="petal"></div><div class="petal"></div><div class="petal"></div>
      <div class="petal"></div><div class="petal"></div><div class="petal"></div>
      <div class="petal"></div><div class="petal"></div><div class="petal"></div>
      <div class="petal"></div><div class="petal"></div><div class="petal"></div>
    `;
    const rainContainer = document.createElement('div');
    rainContainer.className = 'petal-rain';
    rainContainer.innerHTML = petalHtml;
    document.body.prepend(rainContainer);
  }

  // ─── INIT ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    buildPageDots();
    wireNavButtons();
    initScrollReveal();
    initLoader();
    initKeyboardNav();
    initTouchSwipe();
    initAudioPlayer();
    initPetalRain();
  });

  // Expose navigateTo globally for inline use
  window.navigateTo = navigateTo;
})();
