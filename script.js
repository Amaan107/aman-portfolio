/* =============================================================
   SCRIPT.JS — Amanullah Khan Portfolio
   Modular vanilla JS powering the interactive bits:
   preloader, typing, particles, nav, scroll reveals,
   counters, tilt, theme toggle, form validation, and more.
   ============================================================= */

(function () {
  'use strict';

  // ── Cached DOM refs ──────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const dom = {
    body:           document.body,
    preloader:      $('#preloader'),
    scrollProgress: $('#scrollProgress'),
    cursorDot:      $('#cursorDot'),
    cursorRing:     $('#cursorRing'),
    header:         $('#header'),
    navMenu:        $('#navMenu'),
    navToggle:      $('#navToggle'),
    navLinks:       $$('.nav__link'),
    themeToggle:    $('#themeToggle'),
    typedOutput:    $('#typedOutput'),
    particleCanvas: $('#particleCanvas'),
    contactForm:    $('#contactForm'),
    toast:          $('#toast'),
    toastMessage:   $('#toastMessage'),
    backToTop:      $('#backToTop'),
    statNumbers:    $$('[data-count]'),
    skillCards:     $$('.skill-card'),
    revealEls:      $$('.reveal-up'),
    tiltCards:      $$('[data-tilt]'),
    sections:       $$('section[id]'),
  };


  // =============================================================
  //  PRELOADER
  // =============================================================
  function initPreloader() {
    dom.body.classList.add('loading');

    window.addEventListener('load', () => {
      // Small delay so it doesn't flash on fast connections
      setTimeout(() => {
        dom.preloader.classList.add('hidden');
        dom.body.classList.remove('loading');
      }, 600);
    });
  }


  // =============================================================
  //  TYPING EFFECT
  // =============================================================
  function initTypingEffect() {
    const phrases = [
      'Computer Science Student',
      'Aspiring Software Engineer',
      'Frontend Developer',
      'Flutter Enthusiast',
      'Problem Solver',
    ];

    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
      const current = phrases[phraseIndex];

      if (isDeleting) {
        dom.typedOutput.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 40;
      } else {
        dom.typedOutput.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 80;
      }

      // Finished typing the phrase
      if (!isDeleting && charIndex === current.length) {
        typingSpeed = 2200; // pause at end
        isDeleting = true;
      }

      // Finished deleting
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // brief pause before next phrase
      }

      setTimeout(type, typingSpeed);
    }

    // Kick off after a short delay
    setTimeout(type, 1200);
  }


  // =============================================================
  //  PARTICLE CANVAS (lightweight floating dots)
  // =============================================================
  function initParticles() {
    const canvas = dom.particleCanvas;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 18000), 80);
      particles = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 99, 255, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(drawParticles);
    }

    resize();
    createParticles();
    drawParticles();

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        createParticles();
      }, 200);
    });

    // Pause when hero is not visible (perf optimization)
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!animId) drawParticles();
        } else {
          cancelAnimationFrame(animId);
          animId = null;
        }
      },
      { threshold: 0 }
    );

    heroObserver.observe($('#hero'));
  }


  // =============================================================
  //  CUSTOM CURSOR
  // =============================================================
  function initCursor() {
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dom.cursorDot.style.left = mouseX + 'px';
      dom.cursorDot.style.top = mouseY + 'px';
    });

    // Smooth ring follow
    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      dom.cursorRing.style.left = ringX + 'px';
      dom.cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Expand ring on interactive elements
    const hoverTargets = $$('a, button, .btn, .skill-card, .project-card, .form-input');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => dom.cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => dom.cursorRing.classList.remove('hovering'));
    });
  }


  // =============================================================
  //  NAVIGATION
  // =============================================================
  function initNav() {
    // Scroll-based header styling
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      dom.header.classList.toggle('scrolled', scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // check on load

    // Mobile toggle
    dom.navToggle.addEventListener('click', () => {
      const isOpen = dom.navMenu.classList.toggle('open');
      dom.navToggle.classList.toggle('open', isOpen);
      dom.navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close mobile menu on link click
    dom.navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        dom.navMenu.classList.remove('open');
        dom.navToggle.classList.remove('open');
        dom.navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Active link tracking via Intersection Observer
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            dom.navLinks.forEach((link) => {
              link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
            });
          }
        });
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      }
    );

    dom.sections.forEach((section) => navObserver.observe(section));
  }


  // =============================================================
  //  SCROLL PROGRESS BAR
  // =============================================================
  function initScrollProgress() {
    window.addEventListener(
      'scroll',
      () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        dom.scrollProgress.style.width = progress + '%';
      },
      { passive: true }
    );
  }


  // =============================================================
  //  SCROLL REVEAL (Intersection Observer)
  // =============================================================
  function initScrollReveal() {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target); // only animate once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    dom.revealEls.forEach((el) => revealObserver.observe(el));
  }


  // =============================================================
  //  ANIMATED COUNTERS
  // =============================================================
  function initCounters() {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          const duration = 1800; // ms
          const startTime = performance.now();

          function updateCount(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease-out cubic for a natural feel
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            }
          }

          requestAnimationFrame(updateCount);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );

    dom.statNumbers.forEach((el) => counterObserver.observe(el));
  }


  // =============================================================
  //  SKILL PROGRESS BARS
  // =============================================================
  function initSkillBars() {
    const skillObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            skillObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    dom.skillCards.forEach((card) => skillObserver.observe(card));
  }


  // =============================================================
  //  TILT EFFECT (subtle parallax on hover)
  // =============================================================
  function initTiltEffect() {
    // Skip on touch devices — no hover there
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    dom.tiltCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -4;
        const rotateY = ((x - centerX) / centerX) * 4;

        card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => (card.style.transition = ''), 500);
      });
    });
  }


  // =============================================================
  //  THEME TOGGLE
  // =============================================================
  function initThemeToggle() {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'dark'); // default to dark

    document.documentElement.setAttribute('data-theme', initial);

    dom.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }


  // =============================================================
  //  CONTACT FORM (frontend validation + toast)
  // =============================================================
  function initContactForm() {
    if (!dom.contactForm) return;

    const fields = {
      name: {
        input: $('#formName'),
        validate: (val) => val.trim().length >= 2,
      },
      email: {
        input: $('#formEmail'),
        validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      },
      message: {
        input: $('#formMessage'),
        validate: (val) => val.trim().length >= 10,
      },
    };

    // Real-time validation on blur
    Object.values(fields).forEach(({ input, validate }) => {
      input.addEventListener('blur', () => {
        input.classList.toggle('invalid', !validate(input.value));
      });

      // Clear error on input
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid') && validate(input.value)) {
          input.classList.remove('invalid');
        }
      });
    });

    dom.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let isValid = true;

      Object.values(fields).forEach(({ input, validate }) => {
        const valid = validate(input.value);
        input.classList.toggle('invalid', !valid);
        if (!valid) isValid = false;
      });

      if (!isValid) return;

      // Simulate submission (swap this with real backend later)
      showToast('Message sent successfully! I\'ll get back to you soon.');
      dom.contactForm.reset();
    });
  }


  // =============================================================
  //  TOAST NOTIFICATION
  // =============================================================
  function showToast(message, duration = 4000) {
    dom.toastMessage.textContent = message;
    dom.toast.classList.add('show');

    setTimeout(() => {
      dom.toast.classList.remove('show');
    }, duration);
  }


  // =============================================================
  //  BACK TO TOP
  // =============================================================
  function initBackToTop() {
    dom.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  // =============================================================
  //  LAZY LOADING IMAGES
  //  (native lazy loading is handled via attr, but this adds
  //   a fallback observer for older browsers)
  // =============================================================
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) return; // native support

    const images = $$('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          imgObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imgObserver.observe(img));
  }


  // =============================================================
  //  INIT — wire everything up
  // =============================================================
  function init() {
    initPreloader();
    initThemeToggle();
    initNav();
    initScrollProgress();
    initTypingEffect();
    initParticles();
    initCursor();
    initScrollReveal();
    initCounters();
    initSkillBars();
    initTiltEffect();
    initContactForm();
    initBackToTop();
    initLazyLoading();
  }

  // Wait for DOM before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
