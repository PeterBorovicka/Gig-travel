/* ================================================================
   GigTravel — script.js
   • Particle canvas (hero background)
   • Sticky nav with scroll detection
   • Nav scroll-spy (active section highlighting)
   • Counter animation for stat numbers
   • Scroll-reveal for .reveal elements
   • Pricing monthly / annual toggle
   • Mobile nav burger
   • FAQ accordion
   • CTA email form (mock submit)
   • Hero mockup mouse parallax
   ================================================================ */

(function () {
  'use strict';

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
     3. NAV SCROLL-SPY
  ────────────────────────────────────────────────────────────── */
  const navAnchorLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  const spySections    = Array.from(navAnchorLinks)
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.35;
    let active = null;

    spySections.forEach(section => {
      if (section.offsetTop <= scrollMid) {
        active = section.id;
      }
    });

    navAnchorLinks.forEach(a => {
      const isActive = a.getAttribute('href') === `#${active}`;
      a.classList.toggle('active', isActive);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ──────────────────────────────────────────────────────────────
     4. MOBILE BURGER MENU
  ────────────────────────────────────────────────────────────── */
  const burger   = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');

  burger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', isOpen);
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => (s.style.cssText = ''));
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => (s.style.cssText = ''));
    });
  });

  /* ──────────────────────────────────────────────────────────────
     5. COUNTER ANIMATION (hero stats)
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
     6. SCROLL REVEAL + counter trigger
  ────────────────────────────────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const statNums  = document.querySelectorAll('.stat__num[data-target]');
  let statsTriggered = false;

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
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
     7. PRICING TOGGLE (monthly / annual)
  ────────────────────────────────────────────────────────────── */
  const toggleBtn    = document.getElementById('pricingToggle');
  const priceAmounts = document.querySelectorAll('.pcard__amount');

  let isAnnual = false;

  function updatePrices() {
    priceAmounts.forEach(el => {
      const target = isAnnual
        ? parseInt(el.dataset.annual, 10)
        : parseInt(el.dataset.monthly, 10);

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
     8. FAQ ACCORDION
  ────────────────────────────────────────────────────────────── */
  const faqItems = document.querySelectorAll('[data-faq]');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-item__q');
    const answer = item.querySelector('.faq-item__a');

    btn.addEventListener('click', () => {
      const isOpen = item.hasAttribute('data-open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item) {
          other.removeAttribute('data-open');
          const otherA = other.querySelector('.faq-item__a');
          const otherBtn = other.querySelector('.faq-item__q');
          otherA.style.maxHeight = '0';
          otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.removeAttribute('data-open');
        answer.style.maxHeight = '0';
        btn.setAttribute('aria-expanded', 'false');
      } else {
        item.setAttribute('data-open', '');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ──────────────────────────────────────────────────────────────
     9. CTA EMAIL FORM
  ────────────────────────────────────────────────────────────── */
  const ctaForm  = document.getElementById('ctaForm');
  const ctaNote  = document.getElementById('ctaFormNote');

  if (ctaForm) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = ctaForm.querySelector('[type="email"]');
      const email = emailInput.value.trim();

      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) {
        ctaNote.textContent = 'Please enter a valid email address.';
        ctaNote.className = 'cta-form__note cta-form__note--error';
        emailInput.focus();
        return;
      }

      // Simulate async submission
      const submitBtn = ctaForm.querySelector('.cta-form__submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';

      setTimeout(() => {
        ctaNote.textContent = '🎉 You\'re on the list! We\'ll be in touch very soon.';
        ctaNote.className = 'cta-form__note cta-form__note--success';
        emailInput.value = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Get early access <svg class="btn-arrow" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0-3-3m3 3-3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      }, 900);
    });
  }

  /* ──────────────────────────────────────────────────────────────
     10. HERO MOCKUP MOUSE PARALLAX
  ────────────────────────────────────────────────────────────── */
  const mockupWrap = document.getElementById('heroMockup');

  if (mockupWrap) {
    const heroSection = document.getElementById('hero');
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) / rect.width;
      const dy   = (e.clientY - cy) / rect.height;
      mockupWrap.style.transform =
        `perspective(900px) rotateY(${dx * 6}deg) rotateX(${-dy * 4}deg) translateY(-6px)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      mockupWrap.style.transform = '';
    });
  }

  /* ──────────────────────────────────────────────────────────────
     11. SMOOTH SCROLL for anchor links
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
