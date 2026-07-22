/* ============================================================
   JU YOGA THAI — main.js
   Slider, Navbar scroll, Mobile menu, Scroll animations
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ─────────────────────────────────
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Mobile menu ──────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMenu  = document.getElementById('close-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }
  if (closeMenu && mobileMenu) {
    closeMenu.addEventListener('click', () => {
      hamburger && hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu on link click
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger && hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Sliders / Carousels ───────────────────────────────────
  document.querySelectorAll('.slider-wrap').forEach(wrap => {
    const track  = wrap.querySelector('.slider-track');
    const slides = wrap.querySelectorAll('.slide');
    const dotsWrap = wrap.parentElement.querySelector('.slider-dots');
    const prevBtn  = wrap.querySelector('.slider-arrow.prev');
    const nextBtn  = wrap.querySelector('.slider-arrow.next');

    if (!track || slides.length === 0) return;

    let current = 0;
    let autoplay = null;
    const total = slides.length;

    // Build dots
    let dots = [];
    if (dotsWrap) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (prevBtn) prevBtn.addEventListener('click', () => { resetAutoplay(); prev(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { resetAutoplay(); next(); });

    // Keyboard navigation
    wrap.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { resetAutoplay(); prev(); }
      if (e.key === 'ArrowRight') { resetAutoplay(); next(); }
    });

    // Touch / swipe
    let touchStartX = 0;
    wrap.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    wrap.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) {
        resetAutoplay();
        dx < 0 ? next() : prev();
      }
    }, { passive: true });

    // Autoplay (if slider has more than 1 slide and data-autoplay attr)
    const delay = parseInt(wrap.dataset.autoplay || '0');
    if (delay > 0 && total > 1) {
      autoplay = setInterval(next, delay);
    }

    function resetAutoplay() {
      if (autoplay) {
        clearInterval(autoplay);
        autoplay = setInterval(next, delay || 4000);
      }
    }
  });

  // ── Scroll animations ─────────────────────────────────────
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length > 0 && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach((el, i) => {
      el.style.transitionDelay = `${i * 0.07}s`;
      obs.observe(el);
    });
  } else {
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // ── Contact form (Formspree) ──────────────────────────────
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Senden...';
      btn.disabled = true;

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.innerHTML = '<p style="text-align:center;padding:40px 0;color:#62615C;font-size:1rem;">Danke für deine Nachricht! Ich melde mich bald. 🙏</p>';
        } else {
          btn.textContent = 'Fehler. Bitte erneut versuchen.';
          btn.disabled = false;
        }
      } catch {
        btn.textContent = 'Verbindungsfehler.';
        btn.disabled = false;
      }
    });
  }

});
