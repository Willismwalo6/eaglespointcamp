/* Eagles Point Camp — site behaviour (no dependencies) */
(function () {
  'use strict';
  var WA = '254719215135';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Mobile menu ---------- */
  var burger = $('.burger'), nav = $('#site-nav');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (burger) { burger.setAttribute('aria-expanded', String(open)); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); }
  }
  if (burger && nav) {
    burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1060) setMenu(false); });
  }

  /* ---------- Hero slideshow ---------- */
  var show = $('[data-slideshow]');
  if (show) {
    var slides = $$('.slide', show), dotsBox = $('.dots', show), idx = 0, timer = null, paused = false, DELAY = 6000;
    var dots = slides.map(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show photograph ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); }); dotsBox.appendChild(b); return b;
    });
    function go(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === idx); s.setAttribute('aria-hidden', i === idx ? 'false' : 'true'); });
      dots.forEach(function (d, i) { d.classList.remove('is-active', 'is-done'); if (i < idx) d.classList.add('is-done'); });
      dots[idx].classList.remove('is-active'); void dots[idx].offsetWidth; dots[idx].classList.add('is-active');
      dots.forEach(function (d, i) { d.setAttribute('aria-current', i === idx ? 'true' : 'false'); });
      var nx = slides[(idx + 1) % slides.length].querySelector('img'); if (nx && nx.loading === 'lazy') nx.loading = 'eager';
    }
    function start() { if (reduce || paused) return; clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, DELAY); }
    function restart() { clearInterval(timer); start(); }
    var pv = $('[data-prev]', show), nx2 = $('[data-next]', show);
    if (pv) pv.addEventListener('click', function () { go(idx - 1); restart(); });
    if (nx2) nx2.addEventListener('click', function () { go(idx + 1); restart(); });
    show.addEventListener('mouseenter', function () { paused = true; clearInterval(timer); });
    show.addEventListener('mouseleave', function () { paused = false; start(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearInterval(timer); else start(); });
    var tx = null;
    show.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) { go(idx + (dx < 0 ? 1 : -1)); restart(); } tx = null; }, { passive: true });
    go(0); start();
  }

  /* ---------- Scroll reveal ---------- */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* ---------- Lightbox + gallery filters ---------- */
  var lb, lbImg, lbCap, lbList = [], lbI = 0, lastFocus = null;
  function buildLb() {
    lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photograph viewer');
    lb.innerHTML = '<button class="x" aria-label="Close"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 2l12 12M14 2L2 14"/></svg></button>' +
      '<button class="p" aria-label="Previous photograph"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M10 2L4 8l6 6"/></svg></button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="n" aria-label="Next photograph"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 2l6 6-6 6"/></svg></button>';
    document.body.appendChild(lb); lbImg = $('img', lb); lbCap = $('figcaption', lb);
    $('.x', lb).addEventListener('click', closeLb); $('.p', lb).addEventListener('click', function () { showLb(lbI - 1); }); $('.n', lb).addEventListener('click', function () { showLb(lbI + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowRight') showLb(lbI + 1); else if (e.key === 'ArrowLeft') showLb(lbI - 1);
      else if (e.key === 'Tab') { var f = $$('button', lb); var first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    var sx = null; lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (sx === null) return; var d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 50) showLb(lbI + (d < 0 ? 1 : -1)); sx = null; }, { passive: true });
  }
  function showLb(n) {
    lbI = (n + lbList.length) % lbList.length; var el = lbList[lbI];
    lbImg.src = el.getAttribute('data-full'); lbImg.alt = el.getAttribute('data-alt') || ''; lbCap.textContent = el.getAttribute('data-cap') || '';
    var nxt = lbList[(lbI + 1) % lbList.length]; if (nxt) { var im = new Image(); im.src = nxt.getAttribute('data-full'); }
  }
  function openLb(group, el) {
    if (!lb) buildLb();
    lbList = $$('[data-lb="' + group + '"]').filter(function (x) { return !x.hidden; });
    lastFocus = document.activeElement; lb.classList.add('open'); document.body.style.overflow = 'hidden';
    showLb(Math.max(0, lbList.indexOf(el))); $('.x', lb).focus();
  }
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; if (lastFocus) lastFocus.focus(); }
  $$('[data-lb]').forEach(function (el) { el.addEventListener('click', function () { openLb(el.getAttribute('data-lb'), el); }); });

  var fbtns = $$('.filters button');
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-filter');
      fbtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      $$('.grid .g').forEach(function (g) { g.hidden = !(cat === 'all' || g.getAttribute('data-cat') === cat); });
    });
  });

  /* ---------- WhatsApp enquiry forms ---------- */
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function nice(s) { return parse(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
  var today = new Date(); today.setHours(0, 0, 0, 0);

  $$('form[data-wa]').forEach(function (form) {
    var f = function (n) { return form.elements[n]; };
    var cin = f('checkin'), cout = f('checkout'), status = $('.form-status', form);
    if (cin) { cin.min = iso(today); }
    if (cout) { cout.min = iso(new Date(today.getTime() + 864e5)); }
    if (cin && cout) cin.addEventListener('change', function () {
      if (!cin.value) return; var nxt = new Date(parse(cin.value).getTime() + 864e5); cout.min = iso(nxt);
      if (cout.value && parse(cout.value) <= parse(cin.value)) cout.value = iso(nxt);
    });
    function setErr(name, msg) {
      var el = f(name); if (!el) return true; var wrap = el.closest('.field'); var e = wrap && $('.err', wrap);
      wrap.classList.toggle('invalid', !!msg); if (e) e.textContent = msg || ''; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); return !msg;
    }
    form.addEventListener('input', function (e) { if (e.target.name) { var w = e.target.closest('.field'); if (w) w.classList.remove('invalid'); } });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var v = function (n) { return f(n) ? f(n).value.trim() : ''; };
      var ok = true, first = null;
      function chk(name, msg) { var r = setErr(name, msg); if (!r) { ok = false; if (!first) first = f(name); } }
      chk('name', v('name').length < 2 ? 'Please enter your full name.' : '');
      if (f('email')) { var req = f('email').required; var bad = (req || v('email')) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email')); chk('email', bad ? 'Please enter a valid email address.' : ''); }
      var digits = v('phone').replace(/\D/g, ''); chk('phone', (digits.length < 9 || digits.length > 15) ? 'Please enter a valid phone number (e.g. 0712 345 678).' : '');
      var m1 = '', m2 = '';
      if (!v('checkin')) m1 = 'Please choose your check-in date.'; else if (parse(v('checkin')) < today) m1 = 'Check-in cannot be in the past.';
      chk('checkin', m1);
      if (!v('checkout')) m2 = 'Please choose your check-out date.'; else if (!m1 && parse(v('checkout')) <= parse(v('checkin'))) m2 = 'Check-out must be after check-in.';
      chk('checkout', m2);
      var ad = parseInt(v('adults'), 10); chk('adults', (isNaN(ad) || ad < 1 || ad > 40) ? 'At least 1 adult (max 40).' : '');
      var ch = v('children') === '' ? 0 : parseInt(v('children'), 10); chk('children', (isNaN(ch) || ch < 0 || ch > 40) ? 'Enter 0 or more.' : '');
      if (f('room') && f('room').tagName === 'SELECT') chk('room', v('room') ? '' : 'Please choose your preferred accommodation.');
      if (!ok) { status.className = 'form-status bad'; status.textContent = 'Please check the highlighted fields and try again.'; if (first) first.focus(); return; }
      var nights = Math.round((parse(v('checkout')) - parse(v('checkin'))) / 864e5);
      var lines = ['Hello Eagles Point Camp, I would like to make a booking enquiry.', '',
        'Name: ' + v('name'), 'Phone: ' + v('phone')];
      if (v('email')) lines.push('Email: ' + v('email'));
      lines.push('Accommodation: ' + (v('room') || 'Not sure yet'), 'Check-in: ' + nice(v('checkin')), 'Check-out: ' + nice(v('checkout')) + ' (' + nights + ' night' + (nights > 1 ? 's' : '') + ')',
        'Guests: ' + ad + ' adult' + (ad > 1 ? 's' : '') + (ch ? ', ' + ch + ' child' + (ch > 1 ? 'ren' : '') : ''));
      if (v('message')) lines.push('Special requests: ' + v('message'));
      lines.push('', 'Please confirm availability and rates. Thank you!');
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
      status.className = 'form-status ok';
      status.innerHTML = 'Thank you, ' + v('name').split(' ')[0].replace(/[<>&"]/g, '') + '. Opening WhatsApp with your enquiry ready to send. If nothing opens, <a href="' + url + '" target="_blank" rel="noopener">tap here to continue on WhatsApp</a>.';
      var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove(); /* the success message above also carries a manual link */
    });
  });

  /* "Book / Enquire" links that preselect an accommodation in the main form */
  $$('[data-room]').forEach(function (a) {
    a.addEventListener('click', function () {
      var sel = $('#book select[name="room"]'); if (sel) sel.value = a.getAttribute('data-room');
    });
  });
  if (location.hash === '#book' || /[?&]room=/.test(location.search)) {
    var m = /[?&]room=([^&]+)/.exec(location.search); var s2 = $('#book select[name="room"]');
    if (m && s2) s2.value = decodeURIComponent(m[1]);
  }

  /* ---------- Cookie notice ---------- */
  var cb = $('.cookie');
  try {
    if (cb && !localStorage.getItem('epc-cookie')) { setTimeout(function () { cb.classList.add('show'); document.body.classList.add('has-cookie'); }, 3500); }
  } catch (e) { if (cb) cb.classList.add('show'); }
  $$('[data-cookie]', cb || document).forEach(function (b) {
    b.addEventListener('click', function () {
      try { localStorage.setItem('epc-cookie', b.getAttribute('data-cookie')); } catch (e) {}
      cb.classList.remove('show'); document.body.classList.remove('has-cookie');
    });
  });

  /* ---------- Year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
