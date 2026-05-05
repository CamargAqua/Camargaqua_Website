// CamargAqua — site interactions
(function () {
  'use strict';

  // ——— Scroll to top on page load / refresh ———
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // ——— Scroll reveal ———
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });

  // ——— Animated number counters ———
  function animateCount(el) {
    var target = parseFloat(el.dataset.target);
    var isFloat = el.dataset.target.indexOf('.') !== -1;
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var ease = 1 - Math.pow(1 - progress, 3);
      var val = target * ease;
      el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString('fr-FR');
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-target]').forEach(function (el) {
    countObserver.observe(el);
  });

  // ——— Mobile menu — uses .mobile-nav-overlay (outside topbar to avoid backdrop-filter bug on iOS) ———
  var toggle = document.querySelector('.menu-toggle');
  var overlay = document.querySelector('.mobile-nav-overlay');

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });
  }

  // Close menu on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  // ——— Contact form: mailto fallback ———
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var nom   = (form.querySelector('#f-nom')  || {}).value || '';
      var org   = (form.querySelector('#f-org')  || {}).value || '';
      var email = (form.querySelector('#f-mail') || {}).value || '';
      var type  = (form.querySelector('#f-type') || {}).value || '';
      var msg   = (form.querySelector('#f-msg')  || {}).value || '';

      if (!nom.trim() || !email.trim() || !msg.trim()) {
        if (status) {
          status.className = 'form-status err';
          status.textContent = 'Merci de renseigner votre nom, votre email et votre message.';
        }
        return;
      }

      var routing = {
        'Direction':   'direction@camargaqua.fr',
        'Commercial':  'commercial@camargaqua.fr',
        'Presse':      'presse@camargaqua.fr',
        'Partenariat': 'direction@camargaqua.fr',
        'Autre':       'contact@camargaqua.fr'
      };
      var to = routing[type] || 'contact@camargaqua.fr';
      var subject = '[' + type + '] Contact — ' + nom;
      var body = 'Nom : ' + nom + '\nOrganisation : ' + org +
                 '\nEmail : ' + email + '\nDemande : ' + type +
                 '\n\n' + msg;

      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body='    + encodeURIComponent(body);

      if (status) {
        status.className = 'form-status ok';
        status.textContent = 'Votre messagerie va s’ouvrir avec le message pré-rempli. Si rien ne se passe, écrivez-nous directement à ' + to + '.';
      }
    });
  }

  // ——— Mark active nav link ———
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.primary a, .mobile-nav-overlay a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

})();
