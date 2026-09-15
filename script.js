/* =========================================================
   YS TEKNİK — script.js
   Modular vanilla JS: navbar, mobile menu, reveal/counter
   animations, gauge, accordion, testimonial slider, form.
   ========================================================= */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Sticky header: shrink + active link on scroll
  --------------------------------------------------------- */
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('main section[id]');

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 40);

    let currentId = sections[0] ? sections[0].id : '';
    const scrollPos = window.scrollY + 140;
    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) currentId = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Mobile hamburger menu
  --------------------------------------------------------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');

  function closeMenu() {
    hamburger.classList.remove('open');
    mainNav.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  /* ---------------------------------------------------------
     Scroll reveal via IntersectionObserver
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add('in-view'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------
     Hero pressure gauge — fills once on load to signal
     "ready / online" service status
  --------------------------------------------------------- */
  const heroFill = document.getElementById('heroGaugeFill');
  const heroNeedle = document.getElementById('heroNeedle');
  if (heroFill && heroNeedle) {
    const circumference = 2 * Math.PI * 120; // r=120
    heroFill.style.strokeDasharray = String(circumference);
    heroFill.style.strokeDashoffset = String(circumference);

    window.requestAnimationFrame(() => {
      setTimeout(() => {
        const targetFraction = 0.78; // ~ready level
        heroFill.style.strokeDashoffset = String(circumference * (1 - targetFraction));
        heroNeedle.style.transform = `rotate(${-90 + targetFraction * 270}deg)`;
      }, 400);
    });
  }

  /* ---------------------------------------------------------
     Stat rings + animated counters (gauge-style, on reveal)
  --------------------------------------------------------- */
  const statCards = document.querySelectorAll('.stat-card');
  const statObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const numEl = card.querySelector('.stat-num');
        const ringFill = card.querySelector('.ring-fill');
        const target = parseInt(numEl.dataset.count, 10);
        const ringCirc = 2 * Math.PI * 52;

        ringFill.style.strokeDasharray = String(ringCirc);
        ringFill.style.strokeDashoffset = String(ringCirc);
        requestAnimationFrame(() => {
          ringFill.style.strokeDashoffset = String(ringCirc * 0.08);
        });

        if (prefersReducedMotion) {
          numEl.textContent = target;
        } else {
          const duration = 1600;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            numEl.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
        obs.unobserve(card);
      });
    },
    { threshold: 0.4 }
  );
  statCards.forEach((card) => statObserver.observe(card));

  /* ---------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------- */
  const accItems = document.querySelectorAll('.acc-item');
  accItems.forEach((item) => {
    const trigger = item.querySelector('.acc-trigger');
    const panel = item.querySelector('.acc-panel');

    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      accItems.forEach((other) => {
        other.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
        other.querySelector('.acc-panel').style.maxHeight = null;
      });

      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  /* ---------------------------------------------------------
     Testimonial slider
  --------------------------------------------------------- */
  const testiTrack = document.getElementById('testiTrack');
  const testiDotsWrap = document.getElementById('testiDots');
  if (testiTrack) {
    const slides = testiTrack.querySelectorAll('.testi-slide');
    let current = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Yorum ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      testiDotsWrap.appendChild(dot);
    });
    const dots = testiDotsWrap.querySelectorAll('button');

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      testiTrack.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function autoAdvance() {
      timer = setInterval(() => goTo(current + 1), 6000);
    }
    autoAdvance();

    testiTrack.closest('.testi-slider').addEventListener('mouseenter', () => clearInterval(timer));
    testiTrack.closest('.testi-slider').addEventListener('mouseleave', autoAdvance);
  }

    /* ---------------------------------------------------------
      Contact form -> WhatsApp
    --------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        formNote.textContent = 'Lütfen zorunlu alanları doldurun.';
        formNote.style.color = '#e0645a';
        return;
      }

      const name = document.getElementById('cf-name').value.trim();
      const phone = document.getElementById('cf-phone').value.trim();
      const service = document.getElementById('cf-service').value;
      const message = document.getElementById('cf-msg').value.trim();
      const whatsappMessage = [
        'Yeni Servis Talebi:',
        `Ad Soyad: ${name}`,
        `Telefon: ${phone}`,
        `Hizmet: ${service}`,
        `Mesajınız: ${message}`
      ].join('\n');

      const encodedMessage = encodeURIComponent(whatsappMessage);
      window.open(`https://wa.me/905465503918?text=${encodedMessage}`, '_blank');
    });
  }

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
