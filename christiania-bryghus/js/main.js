/* Christiania Bryghus — interactions */
(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const store = {
    get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
    set(key, val) { try { window.localStorage.setItem(key, val); } catch (e) { /* storage unavailable */ } }
  };

  /* ------------------------------------------------------------------
     Beer data. Style, ABV, IBU, hops and collaborations come from the
     current beer list; hemp/body levels are illustrative.
     ------------------------------------------------------------------ */
  const BEERS = [
    {
      id: 'pilsner', name: 'Christiania Pilsner', label: ['Pilsner'], sub: 'Christiania', style: 'Pilsner', ghost: 'Pilsner',
      abv: 4.6, ibu: 30, hops: 'Tettnanger, Mittelfrüh', tag: 'Our flagship',
      desc: 'Our very first beer in a bottle. Crisp, golden and clean with a soft herbal finish from the hemp. For every bottle sold, 1 kr goes to Fonden Fristaden Christiania.',
      hemp: 2, body: 2,
      bg: '#E9B10A', fg: '#130D0B', lbl: '#EE151F', lblText: '#FFF200', accent: '#FFF200', cap: '#EE151F'
    },
    {
      id: 'bobcat-sam', name: 'Bobcat Sam', label: ['Bobcat', 'Sam'], style: 'Blonde Ale', ghost: 'Blonde',
      abv: 5.0, ibu: 25, hops: 'Hallertau Perle, Simcoe, Galena', tag: 'Named after a friend',
      desc: 'Named after Sam, who helped us build The Lab. A bright, easy-drinking blonde with gentle fruit from the Simcoe and a quiet herbal hum underneath.',
      hemp: 2, body: 2,
      bg: '#86C5E0', fg: '#130D0B', lbl: '#FFFFFF', lblText: '#130D0B', accent: '#EE151F', cap: '#130D0B'
    },
    {
      id: 'bombay', name: 'Bombay', label: ['Bombay'], style: 'American IPA · SMaSH', ghost: 'IPA',
      abv: 6.4, ibu: 54, hops: 'Mosaic', tag: 'Single malt, single hop',
      desc: 'Single malt, single hop: a SMaSH IPA where Mosaic does all the talking. A lighter, properly bitter IPA with a big fruity nose.',
      hemp: 3, body: 3,
      bg: '#0E7A5F', fg: '#FFFFFF', lbl: '#F6C445', lblText: '#130D0B', accent: '#130D0B', cap: '#F6C445'
    },
    {
      id: 'dry-pedersen', name: 'Dry Pedersen', label: ['Dry', 'Pedersen'], style: 'Brut IPA', ghost: 'Brut IPA',
      abv: 5.8, ibu: 25, hops: 'Cascade, Citra, Mosaic, Zeus', tag: 'With Bycycle Brewing',
      desc: 'A bone-dry, sparkling Brut IPA brewed with our friends at Bycycle Brewing Copenhagen. Lemongrass and hemp up front, crisp all the way down.',
      hemp: 4, body: 1,
      bg: '#C3D600', fg: '#130D0B', lbl: '#130D0B', lblText: '#C3D600', accent: '#C3D600', cap: '#130D0B'
    },
    {
      id: 'orange-haze', name: 'Orange Haze', label: ['Orange', 'Haze'], style: 'NEIPA', ghost: 'NEIPA',
      abv: 6.0, ibu: 44, hops: 'Amarillo, Citra, Mosaic', tag: 'With Sakiškės Brewery',
      desc: 'A juicy New England IPA brewed with Sakiškės Brewery. Norwegian kveik yeast pushes the tropical fruit even further. Soft, hazy and dangerously drinkable.',
      hemp: 3, body: 4,
      bg: '#FF6B1A', fg: '#130D0B', lbl: '#FFF200', lblText: '#130D0B', accent: '#130D0B', cap: '#FFF200'
    },
    {
      id: 'blueberry-kush', name: 'Blueberry Kush', label: ['Blueberry', 'Kush'], style: 'Gose', ghost: 'Gose',
      abv: 4.5, ibu: 3.4, hops: 'Sybilla', tag: 'With Browar Rockmill',
      desc: 'A tart, lightly salted gose loaded with blueberries, brewed with Browar Rockmill. Summer in a glass, whatever the Danish weather is doing.',
      hemp: 2, body: 2,
      bg: '#2C4AA6', fg: '#FFFFFF', lbl: '#F4A9C6', lblText: '#130D0B', accent: '#FFFFFF', cap: '#F4A9C6'
    },
    {
      id: 'axel-julemand', name: 'Axel Julemand', label: ['Axel', 'Julemand'], style: 'Black IPA · Bourbon', ghost: 'Black IPA',
      abv: 7.5, ibu: 93, hops: 'Columbus, Mosaic, Citra', tag: 'With Ghost Brewing',
      desc: 'Our Christmas heavyweight. A Black IPA with bourbon, brewed with Ghost Brewing: roasty, resinous and warming from the very first sip.',
      hemp: 3, body: 5,
      bg: '#0F3B2A', fg: '#FFFFFF', lbl: '#EE151F', lblText: '#FFFFFF', accent: '#FFF200', cap: '#EE151F'
    }
  ];

  const BOTTLE_PATH = 'M88,40 L132,40 L133,62 L135,72 L135,196 C135,256 185,276 185,346 L185,618 C185,638 172,648 152,648 L68,648 C48,648 35,638 35,618 L35,346 C35,276 85,256 85,196 L85,72 L87,62 Z';
  let svgUid = 0;

  function esc(str) {
    return String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function bottleSVG(b) {
    const u = 'b' + (++svgUid);
    const lines = b.label.map(s => s.toUpperCase());
    const longest = Math.max(...lines.map(l => l.length));
    const fs = Math.min(lines.length > 1 ? 30 : 34, 116 / (longest * 0.5));
    const lineGap = fs * 0.9;
    const firstY = lines.length > 1 ? 506 : 518;
    const nameEls = lines.map((l, i) =>
      `<text x="110" y="${(firstY + i * lineGap).toFixed(1)}" text-anchor="middle" class="bl-name" font-size="${fs.toFixed(1)}" fill="${b.lblText}">${esc(l)}</text>`
    ).join('');
    const after = firstY + (lines.length - 1) * lineGap;
    const styleShort = (b.sub || b.style.split('·')[0].trim()).toUpperCase();

    return `
<svg viewBox="0 0 220 660" role="img" aria-label="${esc(b.name)} bottle">
  <defs>
    <linearGradient id="${u}-glass" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#170a03"/>
      <stop offset=".16" stop-color="#4f2408"/>
      <stop offset=".36" stop-color="#8b4613"/>
      <stop offset=".58" stop-color="#5c2b0a"/>
      <stop offset="1" stop-color="#100601"/>
    </linearGradient>
    <linearGradient id="${u}-shade" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".6"/>
      <stop offset=".2" stop-color="#000" stop-opacity=".08"/>
      <stop offset=".33" stop-color="#fff" stop-opacity=".2"/>
      <stop offset=".45" stop-color="#fff" stop-opacity="0"/>
      <stop offset=".78" stop-color="#000" stop-opacity=".18"/>
      <stop offset="1" stop-color="#000" stop-opacity=".65"/>
    </linearGradient>
    <linearGradient id="${u}-cap" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity=".45"/>
      <stop offset=".35" stop-color="#fff" stop-opacity=".35"/>
      <stop offset=".55" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".5"/>
    </linearGradient>
    <clipPath id="${u}-clip"><path d="${BOTTLE_PATH}"/></clipPath>
  </defs>

  <ellipse cx="110" cy="650" rx="86" ry="9" fill="#000" opacity=".28"/>
  <path d="${BOTTLE_PATH}" fill="url(#${u}-glass)"/>

  <g clip-path="url(#${u}-clip)">
    <!-- neck label -->
    <rect x="0" y="112" width="220" height="64" fill="${b.lbl}"/>
    <rect x="0" y="118" width="220" height="2.5" fill="${b.accent}"/>
    <rect x="0" y="167" width="220" height="2.5" fill="${b.accent}"/>
    <text x="110" y="148" text-anchor="middle" class="bl-style" font-size="8" fill="${b.lblText}">CB</text>

    <!-- body label -->
    <rect x="0" y="384" width="220" height="214" fill="${b.lbl}"/>
    <rect x="0" y="392" width="220" height="3" fill="${b.accent}"/>
    <rect x="0" y="587" width="220" height="3" fill="${b.accent}"/>
    <image href="assets/logo.png" x="74" y="400" width="72" height="72" preserveAspectRatio="xMidYMid meet"/>
    ${nameEls}
    <text x="110" y="${(after + 24).toFixed(1)}" text-anchor="middle" class="bl-style" fill="${b.lblText}">${esc(styleShort)}</text>
    <text x="110" y="${(after + 42).toFixed(1)}" text-anchor="middle" class="bl-abv" fill="${b.lblText}" opacity=".8">${b.abv.toFixed(1)}% · BRYGGET MED HAMP</text>

    <!-- cylindrical shading + highlights -->
    <rect x="0" y="0" width="220" height="660" fill="url(#${u}-shade)"/>
    <rect x="51" y="352" width="9" height="276" rx="4.5" fill="#fff" opacity=".26"/>
    <rect x="166" y="372" width="3.5" height="230" rx="1.75" fill="#fff" opacity=".12"/>
    <rect x="94" y="76" width="5" height="150" rx="2.5" fill="#fff" opacity=".26"/>
    <path d="M58,330 C62,296 84,272 96,252" stroke="#fff" stroke-opacity=".22" stroke-width="5" fill="none" stroke-linecap="round"/>
  </g>

  <!-- crown cap -->
  <path d="M80,30 Q80,20 90,20 L130,20 Q140,20 140,30 L140,42 Q140,46 136,46 L84,46 Q80,46 80,42 Z" fill="${b.cap}"/>
  <path d="M80,30 Q80,20 90,20 L130,20 Q140,20 140,30 L140,42 Q140,46 136,46 L84,46 Q80,46 80,42 Z" fill="url(#${u}-cap)"/>
  <g stroke="#000" stroke-opacity=".22" stroke-width="1.4">
    <line x1="86" y1="34" x2="86" y2="45"/><line x1="93" y1="34" x2="93" y2="45"/><line x1="100" y1="34" x2="100" y2="45"/>
    <line x1="107" y1="34" x2="107" y2="45"/><line x1="114" y1="34" x2="114" y2="45"/><line x1="121" y1="34" x2="121" y2="45"/>
    <line x1="128" y1="34" x2="128" y2="45"/><line x1="135" y1="34" x2="135" y2="45"/>
  </g>
</svg>`;
  }

  function meter(label, value) {
    let segs = '';
    for (let i = 1; i <= 5; i++) segs += `<span class="${i <= value ? 'on' : ''}"></span>`;
    return `<div class="meter" role="img" aria-label="${label}: ${value} out of 5"><span class="meter__label">${label}</span><span class="meter__track">${segs}</span></div>`;
  }

  function infoHTML(b) {
    const bitterness = Math.min(5, Math.max(1, Math.round(b.ibu / 20)));
    return `
      <div class="beers__meta">
        <span class="pill pill--solid">${esc(b.style)}</span>
        <span class="pill">${esc(b.tag)}</span>
      </div>
      <h3 class="beers__name">${esc(b.name)}</h3>
      <p class="beers__desc">${esc(b.desc)}</p>
      <dl class="beers__specs">
        <div><dt>ABV</dt><dd>${b.abv.toFixed(1)}%</dd></div>
        <div><dt>IBU</dt><dd>${b.ibu}</dd></div>
        <div><dt>Hops</dt><dd class="small">${esc(b.hops)}</dd></div>
      </dl>
      <div class="beers__meters">
        ${meter('Bitterness', bitterness)}
        ${meter('Body', b.body)}
        ${meter('Hemp', b.hemp)}
      </div>
      <div class="beers__ctas">
        <a class="btn btn--dark-auto" href="#beers">Where to buy
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>
        </a>
        <a class="btn btn--ghost" href="#the-lab">On tap at The Lab</a>
      </div>`;
  }

  function initBeers() {
    const section = $('#beers');
    if (!section) return;
    const tabsEl = $('[data-beer-tabs]', section);
    const bottleEl = $('[data-beer-bottle]', section);
    const infoEl = $('[data-beer-info]', section);
    const ghostEl = $('[data-beer-ghost]', section);
    const indexEl = $('[data-beer-index]', section);
    const totalEl = $('[data-beer-total]', section);
    const stage = $('.beers__stage', section);
    let current = -1;
    let busy = false;

    totalEl.textContent = String(BEERS.length).padStart(2, '0');

    tabsEl.innerHTML = BEERS.map((b, i) => `
      <button type="button" class="beer-tab" role="tab" id="tab-${b.id}" aria-controls="beer-panel" aria-selected="false" tabindex="-1" data-index="${i}">
        <span class="beer-tab__dot" style="background:${b.lbl}"></span>
        <span class="beer-tab__name">${esc(b.name.replace('Christiania ', ''))}</span>
        <span class="beer-tab__style">${esc(b.style.split('·')[0].trim())} · ${b.abv.toFixed(1)}%</span>
      </button>`).join('');
    const tabs = $$('.beer-tab', tabsEl);

    function render(i, animate) {
      const b = BEERS[i];
      section.style.setProperty('--bg', b.bg);
      section.style.setProperty('--fg', b.fg);
      ghostEl.textContent = b.ghost;
      indexEl.textContent = String(i + 1).padStart(2, '0');
      bottleEl.innerHTML = bottleSVG(b);
      infoEl.innerHTML = infoHTML(b);
      stage.setAttribute('aria-labelledby', 'tab-' + b.id);
      tabs.forEach((t, ti) => {
        const on = ti === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      if (animate && !prefersReducedMotion) {
        bottleEl.classList.remove('bottle-out');
        bottleEl.classList.add('bottle-in');
        infoEl.classList.remove('info-in');
        void infoEl.offsetWidth;
        infoEl.classList.add('info-in');
      }
    }

    function go(i) {
      i = (i + BEERS.length) % BEERS.length;
      if (i === current || busy) return;
      const first = current === -1;
      current = i;
      if (first || prefersReducedMotion) { render(i, false); return; }
      busy = true;
      bottleEl.classList.remove('bottle-in');
      bottleEl.classList.add('bottle-out');
      setTimeout(() => {
        render(i, true);
        busy = false;
      }, 320);
      const tab = tabs[i];
      if (tab && tabsEl.scrollWidth > tabsEl.clientWidth) {
        tabsEl.scrollTo({ left: tab.offsetLeft - 16, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }

    tabs.forEach(t => t.addEventListener('click', () => go(Number(t.dataset.index))));
    tabsEl.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      let next = current;
      if (e.key === 'ArrowRight') next = current + 1;
      if (e.key === 'ArrowLeft') next = current - 1;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = BEERS.length - 1;
      go(next);
      tabs[(next + BEERS.length) % BEERS.length].focus();
    });
    $('[data-beer-prev]', section).addEventListener('click', () => go(current - 1));
    $('[data-beer-next]', section).addEventListener('click', () => go(current + 1));

    // swipe on touch devices
    let startX = null;
    stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) go(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    go(0);
  }

  /* ------------------------------------------------------------------
     Age gate
     ------------------------------------------------------------------ */
  function initGate(onPass) {
    const gate = $('#gate');
    const KEY = 'cb_age_verified';
    if (!gate || store.get(KEY) === 'yes') { onPass(); return; }

    gate.hidden = false;
    document.body.classList.add('is-locked');
    const yes = $('[data-gate="yes"]', gate);
    const no = $('[data-gate="no"]', gate);
    const denied = $('.gate__denied', gate);
    setTimeout(() => yes.focus(), 50);

    gate.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const focusables = [yes, no];
      const idx = focusables.indexOf(document.activeElement);
      e.preventDefault();
      focusables[(idx + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
    });

    yes.addEventListener('click', () => {
      store.set(KEY, 'yes');
      document.body.classList.remove('is-locked');
      if (prefersReducedMotion) { gate.hidden = true; onPass(); return; }
      gate.classList.add('is-leaving');
      setTimeout(onPass, 250);
      setTimeout(() => { gate.hidden = true; gate.classList.remove('is-leaving'); }, 750);
    });
    no.addEventListener('click', () => { denied.hidden = false; });
  }

  /* ------------------------------------------------------------------
     Header: scrolled state, hide on scroll down, active link
     ------------------------------------------------------------------ */
  function initHeader() {
    const header = $('#site-header');
    let lastY = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      const menuOpen = document.body.classList.contains('menu-open');
      if (!menuOpen) header.classList.toggle('is-hidden', y > 700 && y > lastY + 2);
      if (y < lastY - 2) header.classList.remove('is-hidden');
      lastY = y;
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    // active nav link
    const links = $$('.nav a');
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const ids = Array.from(map.keys());
    const inView = new Set();
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) inView.add(entry.target.id); else inView.delete(entry.target.id);
      });
      const activeId = ids.find(id => inView.has(id));
      links.forEach(l => l.classList.toggle('is-active', map.get(activeId) === l));
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el); });
  }

  /* ------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------ */
  function initMenu() {
    const toggle = $('.menu-toggle');
    const menu = $('#mobile-menu');
    if (!toggle || !menu) return;

    function open() {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
      toggle.setAttribute('aria-expanded', 'true');
      $('.sr-only', toggle).textContent = 'Close menu';
      document.body.classList.add('is-locked', 'menu-open');
      $('#site-header').classList.remove('is-hidden');
    }
    function close() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      $('.sr-only', toggle).textContent = 'Open menu';
      document.body.classList.remove('is-locked', 'menu-open');
      setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, prefersReducedMotion ? 0 : 550);
    }
    toggle.addEventListener('click', () => (toggle.getAttribute('aria-expanded') === 'true' ? close() : open()));
    $$('a', menu).forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { close(); toggle.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 1180 && toggle.getAttribute('aria-expanded') === 'true') close(); });
  }

  /* ------------------------------------------------------------------
     The Lab: live open / closed status in Copenhagen time
     ------------------------------------------------------------------ */
  function initOpenStatus() {
    const HOURS = { 0: [12, 21], 1: [12, 21], 2: [12, 21], 3: [12, 21], 4: [12, 22], 5: [12, 22], 6: [12, 22] };
    const DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

    function nowInCopenhagen() {
      try {
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Copenhagen', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(new Date());
        const get = type => (parts.find(p => p.type === type) || {}).value;
        return { day: DAYS[get('weekday')], hour: Number(get('hour')) + Number(get('minute')) / 60 };
      } catch (e) {
        const d = new Date();
        return { day: d.getDay(), hour: d.getHours() + d.getMinutes() / 60 };
      }
    }

    function update() {
      const { day, hour } = nowInCopenhagen();
      const [open, close] = HOURS[day];
      let text, state;
      if (hour >= open && hour < close) {
        text = `Open now · until ${close}:00`; state = 'open';
      } else if (hour < open) {
        text = `Closed · opens today at ${open}:00`; state = 'closed';
      } else {
        text = `Closed · opens tomorrow at ${HOURS[(day + 1) % 7][0]}:00`; state = 'closed';
      }
      $$('[data-open-status]').forEach(el => { el.textContent = text; });
      $$('[data-status-dot]').forEach(el => {
        el.classList.toggle('is-open', state === 'open');
        el.classList.toggle('is-closed', state === 'closed');
      });
      $$('.hours tr[data-days]').forEach(tr => {
        tr.classList.toggle('is-today', tr.dataset.days.split(',').map(Number).includes(day));
      });
    }
    update();
    setInterval(update, 60 * 1000);
  }

  /* ------------------------------------------------------------------
     Scroll reveal + count-up
     ------------------------------------------------------------------ */
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion || !target) return;
    const dur = 1400;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(tick);
  }

  function initReveal() {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // stagger siblings that enter together
        const siblings = Array.from(el.parentElement.children).filter(c => c.hasAttribute('data-reveal'));
        const idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx * 80, 400) + 'ms';
        el.classList.add('is-visible');
        $$('[data-count]', el).forEach(countUp);
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  /* ------------------------------------------------------------------
     Subtle parallax on the brewhouse image
     ------------------------------------------------------------------ */
  function initParallax() {
    if (prefersReducedMotion) return;
    const imgs = $$('[data-parallax]');
    if (!imgs.length) return;
    let ticking = false;
    function update() {
      const vh = window.innerHeight;
      imgs.forEach(img => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
        img.style.transform = `translate3d(0, ${(progress * -14).toFixed(2)}%, 0)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  /* ------------------------------------------------------------------
     Newsletter (front-end only)
     ------------------------------------------------------------------ */
  function initNewsletter() {
    const form = $('[data-newsletter]');
    if (!form) return;
    const msg = $('[data-newsletter-msg]');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input.value.trim() || !input.checkValidity()) {
        msg.textContent = 'Please enter a valid email address.';
        msg.classList.add('is-error');
        input.focus();
        return;
      }
      msg.classList.remove('is-error');
      msg.textContent = "Tak! Thanks for signing up. We've sent you an email with a link to confirm.";
      form.reset();
    });
  }

  /* ------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    initBeers();
    initHeader();
    initMenu();
    initOpenStatus();
    initParallax();
    initNewsletter();
    initGate(() => {
      document.body.classList.add('is-ready');
      initReveal();
    });
  });
})();
