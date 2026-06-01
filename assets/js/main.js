/* =========================================================================
   Renoriser — site interactions (shared across all pages).
   Each module feature-detects by element presence, so one file serves
   home, services, technology, quote, work, and privacy pages.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Web3Forms key — get a free one at https://web3forms.com to change the destination.
  var WEB3FORMS_KEY = '360776cf-4e34-4f90-9bf5-f830ad11b832';
  var MANIFEST_URL = 'images/manifest.json';
  var LOC_LABELS = { H: 'Hamilton', T: 'Hamilton', B: 'Burlington' };

  function track(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params || {});
  }

  /* ---- Footer year ---- */
  $$('#year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Header shrink on scroll ---- */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile full-screen overlay nav ---- */
  var nav = $('#nav');
  var toggle = $('#navToggle');
  if (nav && toggle) {
    var setOpen = function (open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      toggle.innerHTML = open ? '&times;' : '&#9776;';
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) setOpen(false); });
  }

  /* ---- Hero background video: pause control + reduced-motion ---- */
  var heroVideo = $('#heroVideo');
  var heroPause = $('#heroPause');
  if (heroVideo) {
    if (reduce) {
      heroVideo.removeAttribute('autoplay');
      try { heroVideo.pause(); } catch (e) {}
    }
    if (heroPause) {
      var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
      heroPause.addEventListener('click', function () {
        if (heroVideo.paused) {
          heroVideo.play();
          heroPause.innerHTML = ICON_PAUSE;
          heroPause.setAttribute('aria-pressed', 'false');
          heroPause.setAttribute('aria-label', 'Pause background video');
        } else {
          heroVideo.pause();
          heroPause.innerHTML = ICON_PLAY;
          heroPause.setAttribute('aria-pressed', 'true');
          heroPause.setAttribute('aria-label', 'Play background video');
        }
      });
    }
  }

  /* ---- Reveal on scroll ---- */
  var reveals = $$('.reveal');
  if (reveals.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }
  }

  /* ---- RI product mock animation (home teaser + technology page) ---- */
  initRiMock();
  function initRiMock() {
    var mock = $('#riMock');
    if (!mock) return;
    var chatSteps = $$('#riChat .msg', mock);
    var specSteps = $$('#riSpec [data-step]', mock);
    var typing = $('#riTyping', mock);
    var totalEl = $('#riTotal', mock);
    var chatScroll = $('#riChat', mock);
    var rafId = null, timers = [], running = false;

    function fmt(n) { return '$' + Math.round(n).toLocaleString('en-CA'); }

    function showStep(n) {
      chatSteps.forEach(function (el) { if (+el.getAttribute('data-step') === n) el.classList.add('show'); });
      specSteps.forEach(function (el) { if (+el.getAttribute('data-step') === n) el.classList.add('show'); });
      if (chatScroll) requestAnimationFrame(function () { chatScroll.scrollTop = chatScroll.scrollHeight; });
      var sum = 0;
      $$('#riSpec .spec-row.show', mock).forEach(function (r) { sum += +(r.getAttribute('data-price') || 0); });
      countTo(sum);
    }

    function countTo(target) {
      if (rafId) cancelAnimationFrame(rafId);
      var start = parseInt((totalEl.textContent || '0').replace(/[^0-9]/g, ''), 10) || 0;
      var t0 = null, dur = 700;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        totalEl.textContent = fmt(start + (target - start) * eased);
        if (p < 1) rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    function reset() {
      chatSteps.forEach(function (el) { el.classList.remove('show'); });
      specSteps.forEach(function (el) { el.classList.remove('show'); });
      if (typing) typing.style.display = 'none';
      if (totalEl) totalEl.textContent = '$0';
      if (chatScroll) chatScroll.scrollTop = 0;
    }

    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

    function play() {
      timers.forEach(clearTimeout); timers = [];
      reset();
      at(300, function () { showStep(0); });
      at(1000, function () { showStep(1); });
      at(1800, function () { if (typing) typing.style.display = 'flex'; });
      at(2900, function () { if (typing) typing.style.display = 'none'; showStep(2); });
      at(4500, function () { showStep(3); });
      at(5300, function () { if (typing) typing.style.display = 'flex'; });
      at(6300, function () { if (typing) typing.style.display = 'none'; showStep(4); });
      at(9800, play);
    }

    if (reduce) {
      [0, 1, 2, 3, 4].forEach(showStep);
    } else if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting && !running) { running = true; play(); } });
      }, { threshold: 0.3 });
      mio.observe(mock);
    } else {
      play();
    }
  }

  /* ---- Quote page: pre-select project type from ?intent= ---- */
  (function quoteIntent() {
    var form = $('#contactForm');
    if (!form) return;
    var params = new URLSearchParams(window.location.search);
    var intent = (params.get('intent') || '').toLowerCase();
    if (!intent) return;
    var map = {
      ri: { match: /early access/i, msg: "I'd like early access to RI (Renovation Intelligence)." },
      kitchen: { match: /^kitchen$/i },
      bathroom: { match: /^bathroom$/i },
      basement: { match: /^basement$/i },
      flooring: { match: /flooring/i }
    };
    var cfg = map[intent];
    if (!cfg) return;
    var sel = form.querySelector('[name=project]');
    if (sel) {
      for (var i = 0; i < sel.options.length; i++) {
        if (cfg.match.test(sel.options[i].text)) { sel.selectedIndex = i; break; }
      }
    }
    var msg = form.querySelector('[name=message]');
    if (cfg.msg && msg && !msg.value) msg.value = cfg.msg;
    if (intent === 'ri') {
      var heading = $('#quoteHeading');
      if (heading) heading.textContent = 'Request early access to RI';
    }
  })();

  /* ---- Contact / quote form (Web3Forms) ---- */
  (function contactForm() {
    var form = $('#contactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = $('#formStatus');
      var submitBtn = form.querySelector('[type=submit]');

      $$('.field-error', form).forEach(function (el) { el.remove(); });
      $$('.input-error', form).forEach(function (el) { el.classList.remove('input-error'); });

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      var errors = [];
      if (!String(data.name || '').trim()) errors.push({ field: 'name', msg: 'Name is required.' });
      if (!String(data.email || '').trim()) errors.push({ field: 'email', msg: 'Email is required.' });
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.email).trim())) errors.push({ field: 'email', msg: 'Please enter a valid email address.' });

      if (errors.length) {
        errors.forEach(function (er) {
          var input = form.querySelector('[name="' + er.field + '"]');
          if (!input) return;
          input.classList.add('input-error');
          var span = document.createElement('span');
          span.className = 'field-error';
          span.textContent = er.msg;
          input.insertAdjacentElement('afterend', span);
        });
        var firstBad = form.querySelector('.input-error');
        if (firstBad) firstBad.focus();
        return;
      }

      submitBtn.disabled = true;
      var origLabel = submitBtn.innerHTML;
      submitBtn.textContent = 'Sending…';
      if (status) { status.textContent = ''; status.className = 'form-status'; }

      var payload = {
        access_key: WEB3FORMS_KEY,
        subject: 'Quote Request — Renoriser',
        from_name: String(data.name).trim(),
        email: String(data.email).trim(),
        phone: data.phone || '',
        project_type: data.project || '',
        message: data.message || ''
      };

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success) {
            if (status) { status.textContent = "✓ Request sent! We'll be in touch within 24 hours."; status.className = 'form-status success'; }
            form.reset();
            track('quote_submitted', { project: payload.project_type || 'unspecified' });
          } else {
            throw new Error(json.message || 'Submission failed');
          }
        })
        .catch(function () {
          if (status) { status.textContent = 'Something went wrong. Please email us directly at renoriser@outlook.com'; status.className = 'form-status error'; }
        })
        .then(function () {
          submitBtn.disabled = false;
          submitBtn.innerHTML = origLabel;
        });
    });
  })();

  /* ---- Work page: project gallery (before/after grouped) ---- */
  var lbState = { items: [], idx: 0 };

  function isVideoSrc(src) { return /\.(mp4|webm|ogg)$/i.test(src); }
  function mediaTag(src, label) {
    if (isVideoSrc(src)) return '<video src="' + src + '" muted playsinline loop preload="metadata"></video>';
    return '<img src="' + src + '" alt="' + label + ' photo" loading="lazy">';
  }

  (function projectGallery() {
    var grid = $('#projectGrid');
    if (!grid) return;

    fetch(MANIFEST_URL)
      .then(function (r) { if (!r.ok) throw new Error('manifest not found'); return r.json(); })
      .then(function (data) {
        var projects = (data && data.projects) || [];
        if (!projects.length) { grid.innerHTML = '<p class="muted">Projects coming soon.</p>'; return; }

        grid.innerHTML = projects.map(function (p, pi) {
          var after = p.after || [], before = p.before || [];
          var hero = after[0] || before[0] || '';
          var extra = Math.max(after.length - 1, 0);
          var label = p.title || p.type || p.location || 'Project';
          var beforeHtml = before.length
            ? '<button class="proj-before-toggle" data-project="' + pi + '" aria-expanded="false">See before (' + before.length + ')</button>'
              + '<div class="proj-before" hidden>'
              + before.map(function (b, bi) {
                  return '<button class="proj-thumb" data-project="' + pi + '" data-index="' + (after.length + bi) + '" aria-label="View before photo">' + mediaTag(b, 'Before') + '</button>';
                }).join('')
              + '</div>'
            : '';
          return '<article class="proj-card">'
            + '<button class="proj-hero" data-project="' + pi + '" data-index="0" aria-label="Open ' + label + ' photos">'
            + mediaTag(hero, 'After')
            + '<span class="proj-stage after">After</span>'
            + (extra > 0 ? '<span class="proj-count">+' + extra + ' more</span>' : '')
            + '</button>'
            + '<div class="proj-meta">'
            + (p.type ? '<div class="proj-type">' + p.type + '</div>' : '')
            + '<div class="proj-loc"><span class="pin"></span> ' + (p.title || p.location || '') + '</div>'
            + '</div>'
            + beforeHtml
            + '</article>';
        }).join('');

        var listFor = function (pi) {
          var p = projects[pi]; return (p.after || []).concat(p.before || []);
        };

        $$('.proj-hero, .proj-thumb', grid).forEach(function (btn) {
          btn.addEventListener('click', function () {
            openLightbox(listFor(+btn.getAttribute('data-project')), +btn.getAttribute('data-index'));
          });
        });

        $$('.proj-before-toggle', grid).forEach(function (btn) {
          btn.addEventListener('click', function () {
            var panel = btn.nextElementSibling;
            if (!panel) return;
            var hidden = panel.hasAttribute('hidden');
            if (hidden) { panel.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); btn.textContent = btn.textContent.replace('See', 'Hide'); }
            else { panel.setAttribute('hidden', ''); btn.setAttribute('aria-expanded', 'false'); btn.textContent = btn.textContent.replace('Hide', 'See'); }
          });
        });
      })
      .catch(function () {
        grid.innerHTML = '<p class="muted">Unable to load projects. Please try again later.</p>';
      });
  })();

  /* ---- Lightbox with prev/next over a project's photos ---- */
  function renderLb() {
    var content = $('#lightboxContent');
    if (!content) return;
    var src = lbState.items[lbState.idx];
    content.innerHTML = '';
    if (!src) return;
    if (isVideoSrc(src)) {
      var v = document.createElement('video');
      v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
      content.appendChild(v);
    } else {
      var wrap = document.createElement('div'); wrap.className = 'lb-image';
      var img = document.createElement('img'); img.src = src; img.alt = 'Project photo';
      wrap.appendChild(img); content.appendChild(wrap);
    }
    var multi = lbState.items.length > 1;
    ['#lbPrev', '#lbNext'].forEach(function (s) { var el = $(s); if (el) el.style.display = multi ? '' : 'none'; });
  }
  function openLightbox(items, idx) {
    var lb = $('#lightbox');
    if (!lb) return;
    lbState.items = items || [];
    lbState.idx = idx || 0;
    renderLb();
    lb.setAttribute('aria-hidden', 'false');
    var close = $('#lightboxClose'); if (close) close.focus();
  }
  function lbStep(d) {
    if (!lbState.items.length) return;
    lbState.idx = (lbState.idx + d + lbState.items.length) % lbState.items.length;
    renderLb();
  }
  (function lightboxInit() {
    var lb = $('#lightbox');
    if (!lb) return;
    var close = function () {
      lb.setAttribute('aria-hidden', 'true');
      var c = $('#lightboxContent'); if (c) c.innerHTML = '';
    };
    var cb = $('#lightboxClose'); if (cb) cb.addEventListener('click', close);
    var bd = $('#lightboxBackdrop'); if (bd) bd.addEventListener('click', close);
    var pv = $('#lbPrev'); if (pv) pv.addEventListener('click', function (e) { e.stopPropagation(); lbStep(-1); });
    var nx = $('#lbNext'); if (nx) nx.addEventListener('click', function (e) { e.stopPropagation(); lbStep(1); });
    window.addEventListener('keydown', function (e) {
      if (lb.getAttribute('aria-hidden') === 'true') return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') lbStep(-1);
      else if (e.key === 'ArrowRight') lbStep(1);
    });
  })();

})();
