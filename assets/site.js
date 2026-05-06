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

  // ——— Team data hydration from _data/team.json (Pages CMS) ———
  if (document.querySelector('[data-team-slot]')) {
    fetch('/_data/team.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var members = Array.isArray(data) ? data : (data.members || []);
        document.querySelectorAll('[data-team-slot]').forEach(function (card) {
          var m = members[parseInt(card.dataset.teamSlot, 10)];
          if (!m) return;
          var roleEl = card.querySelector('.team-card-role');
          var nameEl = card.querySelector('.team-card-name');
          var descEl = card.querySelector('.team-card-desc');
          var img    = card.querySelector('.team-card-photo img');
          if (roleEl) roleEl.textContent = m.role;
          if (nameEl) nameEl.textContent = m.name;
          if (descEl) descEl.textContent = m.desc;
          if (img && m.photo) { img.src = m.photo; img.alt = m.name; }
        });
      })
      .catch(function () {}); // static HTML fallback remains
  }

  // ——— Disable inline hover transforms on touch devices ———
  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (isTouch) {
    document.querySelectorAll('[onmouseover], [onmouseout]').forEach(function (el) {
      el.removeAttribute('onmouseover');
      el.removeAttribute('onmouseout');
      el.style.transform = '';
    });
  }

  // ——— Mobile horizontal sliders ———
  function makeSlider(el, bgVar) {
    if (!el || el.children.length < 2) return;
    // Mark as slider
    el.classList.add('mobile-slider');
    if (bgVar) el.style.setProperty('--slider-bg-inner', bgVar);

    // For timeline: hide the absolute connecting line + build progress bar
    if (el.classList.contains('timeline-steps')) {
      var prev = el.previousElementSibling;
      if (prev) prev.style.display = 'none';

      // Build progress bar with dots
      var bar = document.createElement('div');
      bar.className = 'timeline-progress-bar';
      var fill = document.createElement('div');
      fill.className = 'tpb-fill';
      bar.appendChild(fill);
      var nSteps = el.children.length;
      var dots = [];
      for (var d = 0; d < nSteps; d++) {
        var dot = document.createElement('div');
        dot.className = 'tpb-dot' + (d === 0 ? ' active' : '');
        dots.push(dot);
        bar.appendChild(dot);
        // Click dot to navigate
        (function(idx) {
          dot.addEventListener('click', function() {
            el.scrollTo({ left: idx * el.clientWidth, behavior: 'smooth' });
          });
        })(d);
      }
      // Insert bar before the slider
      el.parentNode.insertBefore(bar, el);

      // Remove default dots (will be handled by bar)
      el._hasProgressBar = true;
      el._fill = fill;
      el._tpbDots = dots;
      el._nSteps = nSteps;

      // Override scroll sync for timeline
      el.addEventListener('scroll', function() {
        var step = Math.round(el.scrollLeft / el.clientWidth);
        step = Math.max(0, Math.min(step, nSteps - 1));
        dots.forEach(function(d2, i) {
          d2.classList.toggle('active', i === step);
          d2.classList.toggle('done', i < step);
        });
        fill.style.width = (step / (nSteps - 1) * 100) + '%';
      }, { passive: true });
    }

    // Wrap in slider-wrap
    var wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    el.parentNode.insertBefore(wrap, el);

    // Hint
    var hint = document.createElement('div');
    hint.className = 'slider-hint';
    hint.textContent = 'Faire glisser';
    wrap.appendChild(hint);

    wrap.appendChild(el);

    // Dots
    var dots = document.createElement('div');
    dots.className = 'slider-dots';
    var items = el.children;
    for (var i = 0; i < items.length; i++) {
      var dot = document.createElement('span');
      if (i === 0) dot.classList.add('active');
      (function(idx) {
        dot.addEventListener('click', function () {
          el.children[idx].scrollIntoView({ behavior:'smooth', block:'nearest', inline:'start' });
        });
      })(i);
      dots.appendChild(dot);
    }
    wrap.appendChild(dots);

    // Sync dots on scroll
    el.addEventListener('scroll', function () {
      var center = el.scrollLeft + el.clientWidth / 3;
      var active = 0;
      for (var j = 0; j < items.length; j++) {
        if (items[j].offsetLeft <= center) active = j;
      }
      dots.querySelectorAll('span').forEach(function (d, k) {
        d.classList.toggle('active', k === active);
      });
    }, { passive: true });
  }

  // Only activate sliders on mobile
  if (window.innerWidth <= 900) {
    var seen = new WeakSet();
    function trySlider(el) {
      if (!el || seen.has(el)) return;
      // Never convert image/layout grids (pf-grid, anchor-grid, pt-grid, ras-grid, infra)
      var skip = ['pf-grid','anchor-grid','pt-grid','ras-grid','produit-hero-grid',
                  'anchor-image','project-body','anchor-copy'];
      if (skip.some(function(c){ return el.classList.contains(c); })) return;
      // Skip if contains large image elements (layout grids, not card grids)
      if (el.querySelector('.anchor-image, .pf-image, .pt-image, .produit-hero-img')) return;
      // Skip if it's a flex container used for layout (not cards)
      var style = el.getAttribute('style') || '';
      if (/1\.15fr|1\.2fr|1\.4fr|1\.05fr|0\.95fr/.test(style)) return; // skip asymmetric layout grids
      seen.add(el);
      makeSlider(el, null);
    }

    // Only target: CSS utility classes and explicit markers
    document.querySelectorAll('.grid-4col, .grid-3col, .grid-2col').forEach(trySlider);
    document.querySelectorAll('.js-mobile-slider').forEach(trySlider);
  }

  // Always init existing .slider-wrap
  document.querySelectorAll('.slider-wrap').forEach(function (wrap) {
    var track = wrap.querySelector('.mobile-slider');
    if (!track) return;
    // already handled above
  });

  // ——— Mark active nav link ———
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.primary a, .mobile-nav-overlay a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

})();
