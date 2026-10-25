(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Scroll reveal ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('visible'));

  /* ---------- Mobile menu ---------- */
  const toggle = $('#mobileMenuToggle'), menu = $('#mobileMenu'), menuIcon = $('#menuIcon use');
  const setMenu = (open) => {
    menu.classList.toggle('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menuIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
  };
  toggle.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && setMenu(false));

  /* ---------- Modals (focus management + trap) ---------- */
  let lastFocus = null, openModalEl = null;
  const focusable = (root) => $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', root).filter((el) => el.offsetParent !== null);
  const openModal = (modal, trigger) => {
    setMenu(false);
    lastFocus = trigger || document.activeElement;
    openModalEl = modal;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    (modal.querySelector('input,select') || modal.querySelector('.modal-close')).focus();
  };
  const closeModal = () => {
    if (!openModalEl) return;
    openModalEl.classList.remove('is-open'); openModalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; openModalEl = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };
  const bind = (ids, modalId) => ids.forEach((id) => {
    const el = document.getElementById(id), modal = document.getElementById(modalId);
    if (el && modal) el.addEventListener('click', (e) => { e.preventDefault(); openModal(modal, el); });
  });
  bind(['navLoginBtn', 'mobileLoginBtn'], 'loginModal');
  // NOTE: #heroExploreBtn is a real link to the dashboard platform
  // ("DRYFTQ ALL DASHBOARD/index.html"), so it must never be bound to a modal —
  // bind() calls preventDefault(), which would block the navigation.
  bind(['navGetStartedBtn', 'mobileGetStartedBtn', 'ctaTalkTeamBtn'], 'contactModal');
  bind(['heroWatchDemoBtn'], 'videoModal');
  $$('.modal').forEach((m) => {
    m.addEventListener('mousedown', (e) => { if (e.target === m) closeModal(); });
    $$('.modal-close', m).forEach((b) => b.addEventListener('click', closeModal));
  });
  document.addEventListener('keydown', (e) => {
    if (!openModalEl) { if (e.key === 'Escape' && !menu.classList.contains('hidden')) { setMenu(false); toggle.focus(); } return; }
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
    if (e.key === 'Tab') {
      const f = focusable(openModalEl); if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Forms: no backend is wired up in this project, so confirm inline (no alert()). */
  const wireForm = (id, msg) => {
    const form = document.getElementById(id); if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = $('[data-status]', form); s.textContent = msg; s.classList.remove('hidden');
      form.reset();
    });
    form.addEventListener('input', () => $('[data-status]', form).classList.add('hidden'));
  };
  wireForm('loginForm', 'Authentication simulated. Accessing telemetry node...');
  wireForm('inquiryForm', 'Demo mode: no backend is connected yet, so this request was not sent.');

  /* ---------- Dashboard tabs ---------- */
  const titles = { overview: 'Process Overview', machines: 'Connected Line Assets', analytics: 'Drift & Anomaly Diagnostics', alerts: 'Real-time Incident Feed', reports: 'Yield & Performance Audits', settings: 'Telemetry & Sensor Config' };
  const tabs = $$('#dashboardSidebarMenu .tab-btn'), viewTitle = $('#currentViewTitle');
  tabs.forEach((b) => b.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === b)));
    viewTitle.textContent = titles[b.dataset.tab] || viewTitle.textContent;
  }));

  /* ---------- Scroll-spy for nav ---------- */
  const spyMap = { hero: '#hero', services: '#services', process: '#process', about: '#about', platform: '#platform', results: null, contact: '#contact-footer', 'contact-footer': '#contact-footer' };
  const secs = Object.keys(spyMap).map((id) => document.getElementById(id)).filter(Boolean)
    .sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  const links = $$('#primaryNav a, #mobileMenu a');
  let ticking = false;
  const spy = () => {
    ticking = false;
    const y = innerHeight * 0.35;
    let cur = secs[0];
    secs.forEach((s) => { if (s.getBoundingClientRect().top <= y) cur = s; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = document.getElementById('contact-footer');
    const target = spyMap[cur.id];
    links.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === target)));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
  spy();

  /* ---------- Quantum wave canvas ---------- */
  const canvas = $('#quantumWaveCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d'), box = canvas.parentElement;
    let w = 0, h = 0, t = 0, visible = true, raf = 0;
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = box.clientWidth; h = box.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };
    const wave = (freq, amp, speed, off, stroke, dot) => {
      ctx.beginPath(); ctx.lineWidth = 1.6; ctx.strokeStyle = stroke;
      const pts = [];
      for (let x = 0; x <= w; x += 4) {
        const env = Math.sin((x / w) * Math.PI);
        const y = h / 2 + Math.sin(x * freq + t * speed + off) * amp * env + Math.cos(x * freq * 1.5 - t * speed * 0.7) * amp * 0.4 * env;
        x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        if (x % 36 === 0) pts.push([x, y]);
      }
      ctx.stroke();
      if (dot) { ctx.fillStyle = dot; pts.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 6.283); ctx.fill(); }); }
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const k = Math.min(1, h / 90); // scale amplitudes to canvas height
      wave(0.007, 30 * k, 0.018, 0, 'rgba(6,182,212,.55)', 'rgba(6,182,212,.8)');
      wave(0.011, 34 * k, 0.024, 2.2, 'rgba(255,90,31,.9)', 'rgba(255,140,50,.95)');
      wave(0.015, 22 * k, 0.016, 4.5, 'rgba(245,158,11,.4)');
      wave(0.02, 17 * k, 0.028, 1.2, 'rgba(59,130,246,.55)', 'rgba(96,165,250,.8)');
    };
    const loop = () => { t += 1; draw(); raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0; };
    const start = () => { if (!raf && !reduceMotion && visible && !document.hidden) raf = requestAnimationFrame(loop); };
    new ResizeObserver(size).observe(box);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(box);
    document.addEventListener('visibilitychange', start);
    size(); start();
  }
})();
