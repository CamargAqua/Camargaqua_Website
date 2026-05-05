// CamargAqua — site interactions
(function () {
  'use strict';

  // ——— Scroll reveal ———
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

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
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(function (el) {
    countObserver.observe(el);
  });

  // Mobile menu toggle
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('nav.primary');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var isOpen = document.body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Contact form: send via mailto fallback (works without backend)
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form-status');
      var nom = (form.querySelector('#f-nom') || {}).value || '';
      var org = (form.querySelector('#f-org') || {}).value || '';
      var email = (form.querySelector('#f-mail') || {}).value || '';
      var type = (form.querySelector('#f-type') || {}).value || '';
      var msg = (form.querySelector('#f-msg') || {}).value || '';

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
      var subject = '[' + type + '] Contact site — ' + nom;
      var body =
        'Nom : ' + nom + '\n' +
        'Organisation : ' + org + '\n' +
        'Email : ' + email + '\n' +
        'Type de demande : ' + type + '\n\n' +
        '----\n' + msg;

      var href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = href;

      if (status) {
        status.className = 'form-status ok';
        status.textContent = 'Votre client mail va s’ouvrir avec le message pré-rempli. Si rien ne se passe, écrivez-nous directement à ' + to + '.';
      }
    });
  }

  // Mark current page in nav (defensive — markup also sets .active)
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.primary a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });
})();
