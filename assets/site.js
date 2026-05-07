// CamargAqua — site interactions
(function () {
  'use strict';

  // ——— Scroll to top on page load / refresh ———
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);

  // ——— Timeline marquee : démarre quand visible ———
  if (window.innerWidth <= 900) {
    var timelineObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('anim-play', entry.isIntersecting);
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('.timeline-steps').forEach(function (el) {
      timelineObs.observe(el);
    });
  }

  // ——— Scroll reveal ———
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
        // 6 — déclencher clip-reveal sur h2 enfants (desktop uniquement)
        if (window.innerWidth > 900) {
          setTimeout(function () {
            entry.target.querySelectorAll('h2.clip-reveal').forEach(function (h) {
              h.classList.add('clip-in');
            });
            if (entry.target.tagName === 'H2' && entry.target.classList.contains('clip-reveal')) {
              entry.target.classList.add('clip-in');
            }
          }, 180);
        }
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

    // For timeline: only hide the absolute connecting line (marquee CSS handles the rest)
    if (el.classList.contains('timeline-steps')) {
      var prev = el.previousElementSibling;
      if (prev) prev.style.display = 'none';
    }

    var isTimeline = el.classList.contains('timeline-steps');

    // Wrap in slider-wrap
    var wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    // Timeline uses CSS marquee animation — parent must clip the overflow
    if (isTimeline) wrap.style.overflow = 'hidden';
    el.parentNode.insertBefore(wrap, el);

    wrap.appendChild(el);

    // Dots (skip for timeline — it has its own progress bar)
    var items = el.children;
    var nSlides = items.length;
    if (!isTimeline) {
      var dots = document.createElement('div');
      dots.className = 'slider-dots';
      for (var i = 0; i < nSlides; i++) {
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

      // Nudge once to reveal the next card, then snap back
      if (nSlides > 1) {
        setTimeout(function () {
          el.scrollTo({ left: 48, behavior: 'smooth' });
          setTimeout(function () { el.scrollTo({ left: 0, behavior: 'smooth' }); }, 500);
        }, 800);
      }
    }
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

  // ——— A — Parallaxe hero (toutes les pages) ———
  var parallaxSpeed = isTouch ? 0.12 : 0.28;

  // Home hero — translateY sur le div .bg
  var heroBg = document.querySelector('.home-hero .bg');
  if (heroBg) {
    window.addEventListener('scroll', function () {
      var scrolled = window.pageYOffset;
      var hero = heroBg.parentElement;
      if (hero && scrolled < hero.offsetHeight * 1.8) {
        heroBg.style.transform = 'translateY(' + (scrolled * parallaxSpeed) + 'px)';
      }
    }, { passive: true });
  }

  // Page heroes (projet, produit, ancrage…) — décalage background-position
  var pageHero = document.querySelector('.page-hero-bg');
  if (pageHero) {
    var bgPosBase = 35; // position initiale en %
    window.addEventListener('scroll', function () {
      var scrolled = window.pageYOffset;
      var heroH   = pageHero.offsetHeight;
      if (scrolled < heroH * 1.5) {
        var shift = bgPosBase + scrolled * (isTouch ? 0.008 : 0.018);
        pageHero.style.backgroundPositionY = shift + '%';
      }
    }, { passive: true });
  }

  // ——— C — Tilt 3D sur les cartes (desktop uniquement) ———
  if (!isTouch) {
    document.querySelectorAll('.team-card, .stat-card, .pillar').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect  = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width  - 0.5;
        var y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform =
          'perspective(700px) rotateX(' + (-y * 9) + 'deg) rotateY(' + (x * 9) + 'deg) translateY(-6px) scale(1.02)';
        card.style.boxShadow = '0 20px 50px rgba(15,27,77,0.18)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  // ═══════════════════════════════════════════════
  // 1 — Révélation hero h1 mot par mot
  // ═══════════════════════════════════════════════
  function splitHeroWords(el) {
    if (!el) return;
    var nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    var delay = 0.05;
    nodes.forEach(function (node) {
      var words = [];
      if (node.nodeType === 3) {
        // nœud texte — séparer par mots
        node.textContent.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk.trim()) { el.appendChild(document.createTextNode(chunk)); return; }
          words.push({ text: chunk, el: null });
        });
        words.forEach(function (w) {
          var ww = document.createElement('span'); ww.className = 'word-wrap';
          var wi = document.createElement('span'); wi.className = 'word';
          wi.textContent = w.text; wi.style.animationDelay = delay + 's';
          delay += 0.09; ww.appendChild(wi); el.appendChild(ww);
        });
      } else {
        // span (.it, em…) — traiter comme un mot entier
        var ww = document.createElement('span'); ww.className = 'word-wrap';
        var wi = document.createElement('span'); wi.className = 'word';
        wi.appendChild(node.cloneNode(true)); wi.style.animationDelay = delay + 's';
        delay += 0.09; ww.appendChild(wi); el.appendChild(ww);
      }
    });
  }
  document.querySelectorAll('.home-hero h1, .page-hero-bg h1').forEach(splitHeroWords);

  // ═══════════════════════════════════════════════
  // 2 — Curseur personnalisé fuchsia
  // ═══════════════════════════════════════════════
  if (!isTouch) {
    document.body.classList.add('has-custom-cursor');
    var cur = document.createElement('div');
    cur.className = 'custom-cursor';
    document.body.appendChild(cur);
    var mx = 0, my = 0, cx2 = 0, cy2 = 0;
    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });
    (function tickCursor() {
      cx2 += (mx - cx2) * 0.14;
      cy2 += (my - cy2) * 0.14;
      cur.style.left = cx2 + 'px';
      cur.style.top  = cy2 + 'px';
      requestAnimationFrame(tickCursor);
    })();
    document.querySelectorAll('a, button, .btn, .team-card, .pillar, .market-card, .product-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('grow'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('grow'); });
    });
  }

  // ═══════════════════════════════════════════════
  // 4 — Watermarks géants en arrière-plan
  // ═══════════════════════════════════════════════
  (function () {
    var wms = [
      { sel: '.terroir-block',                     text: '100%',  light: false },
      { sel: 'section[style*="royal-3"]',           text: '95%',   light: true  },
      { sel: '.pf-grid',                            text: 'J+0',   light: false },
      { sel: '.timeline-steps',                     text: 'J+0',   light: false },
    ];
    wms.forEach(function (cfg) {
      var target = document.querySelector(cfg.sel);
      if (!target) return;
      var section = target.closest('section') || target.parentElement;
      if (!section) return;
      var wm = document.createElement('div');
      wm.className = 'section-wm' + (cfg.light ? ' light' : '');
      wm.setAttribute('aria-hidden', 'true');
      wm.textContent = cfg.text;
      if (window.getComputedStyle(section).position === 'static') {
        section.style.position = 'relative';
      }
      section.style.overflow = 'hidden';
      section.appendChild(wm);
    });
  })();

  // ═══════════════════════════════════════════════
  // 6 — Clip-path reveal sur les h2 (desktop seulement)
  // ═══════════════════════════════════════════════
  if (window.innerWidth > 900) {
    document.querySelectorAll('h2').forEach(function (el) {
      el.classList.add('clip-reveal');
      if (!el.closest('.reveal')) {
        var h2io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('clip-in'); h2io.unobserve(e.target); }
          });
        }, { threshold: 0 });   /* 0 = dès qu'un pixel est visible */
        h2io.observe(el);
      }
    });
  }

  // ═══════════════════════════════════════════════
  // 7 — Boutons magnétiques
  // ═══════════════════════════════════════════════
  if (!isTouch) {
    document.querySelectorAll('.btn-primary, .topbar .cta').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left  - r.width  / 2) * 0.3;
        var y = (e.clientY - r.top   - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  // ——— Mark active nav link ———
  var path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.primary a, .mobile-nav-overlay a').forEach(function (a) {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

})();
