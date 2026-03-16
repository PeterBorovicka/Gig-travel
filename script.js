/* ================================================================
   GigTravel — script.js
   • Particle canvas (hero background)
   • Sticky nav with scroll detection
   • Counter animation for stat numbers
   • Scroll-reveal for .reveal elements
   • Pricing monthly / annual toggle
   • Mobile nav burger
   ================================================================ */

(function () {
  'use strict';

  /* ── Utility: lerp ──────────────────────────────────────────── */
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ──────────────────────────────────────────────────────────────
     1. HERO PARTICLE CANVAS
  ────────────────────────────────────────────────────────────── */
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  const PARTICLE_COUNT = 90;
  const ACCENT_COLORS = ['#6c63ff', '#00d4b4', '#8b5cf6', '#a78bfa', '#34d399'];

  function resizeCanvas() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    const color = ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
    return {
      x:    Math.random() * W,
      y:    Math.random() * H,
      vx:   (Math.random() - .5) * .55,
      vy:   (Math.random() - .5) * .55,
      r:    Math.random() * 1.6 + .4,
      alpha: Math.random() * .5 + .1,
      color,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function drawLine(p1, p2, dist) {
    const maxDist = 140;
    const alpha = (1 - dist / maxDist) * .18;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = `rgba(108,99,255,${alpha})`;
    ctx.lineWidth = .6;
    ctx.stroke();
  }

  function animateParticles() {
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0)  p.x = W;
      if (p.x > W)  p.x = 0;
      if (p.y < 0)  p.y = H;
      if (p.y > H)  p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Connect nearby particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 140) drawLine(p, q, dist);
      }
    }

    requestAnimationFrame(animateParticles);
  }

  resizeCanvas();
  initParticles();
  animateParticles();
  window.addEventListener('resize', () => { resizeCanvas(); });

  /* ──────────────────────────────────────────────────────────────
     2. STICKY NAV
  ────────────────────────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  function handleNavScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ──────────────────────────────────────────────────────────────
     3. MOBILE BURGER MENU
  ────────────────────────────────────────────────────────────── */
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
    // Animate burger lines
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => (s.style.cssText = ''));
    }
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => (s.style.cssText = ''));
    });
  });

  /* ──────────────────────────────────────────────────────────────
     4. COUNTER ANIMATION (hero stats)
  ────────────────────────────────────────────────────────────── */
  function animateCounter(el) {
    const target  = parseInt(el.dataset.target, 10);
    const duration = 2000;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const value  = Math.floor(eased * target);
      el.textContent = value >= 1000
        ? (value / 1000).toFixed(1).replace('.0', '') + 'K'
        : value;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  /* ──────────────────────────────────────────────────────────────
     5. SCROLL REVEAL + counter trigger
  ────────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const statNums  = document.querySelectorAll('.stat__num[data-target]');
  let statsTriggered = false;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Staggered delay for sibling elements
          const siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${idx * 0.08}s`;
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  // Trigger counters when hero stats scroll into view
  const statsSection = document.querySelector('.hero__stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsTriggered) {
          statsTriggered = true;
          statNums.forEach(el => animateCounter(el));
          statsObserver.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    statsObserver.observe(statsSection);
  }

  /* ──────────────────────────────────────────────────────────────
     6. PRICING TOGGLE (monthly / annual)
  ────────────────────────────────────────────────────────────── */
  const toggleBtn   = document.getElementById('pricingToggle');
  const priceAmounts = document.querySelectorAll('.pcard__amount');

  let isAnnual = false;

  function updatePrices() {
    priceAmounts.forEach(el => {
      const target = isAnnual
        ? parseInt(el.dataset.annual, 10)
        : parseInt(el.dataset.monthly, 10);

      // Flash animation
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
      setTimeout(() => {
        el.textContent = target;
        el.style.transition = 'opacity .25s, transform .25s';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 150);
    });
  }

  toggleBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    toggleBtn.setAttribute('aria-pressed', isAnnual);
    updatePrices();
  });

  /* ──────────────────────────────────────────────────────────────
     7. SMOOTH SCROLL for anchor links
  ────────────────────────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = nav.offsetHeight;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

})();
