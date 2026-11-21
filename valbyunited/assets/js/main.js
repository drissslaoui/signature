/* ==========================================================================
   Valby United — site behaviour (Danish + English)
   The page language comes from <html lang="da|en">.
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // One-page build: both languages live in the same file and switch in place.
  const ONE_PAGE = !!document.querySelector("[data-lang-toggle], [data-set-lang]");
  let LANG = (document.documentElement.lang || "da").slice(0, 2) === "en" ? "en" : "da";
  if (ONE_PAGE) {
    let wanted = null;
    try { wanted = new URLSearchParams(location.search).get("lang") || localStorage.getItem("vu-lang"); } catch (e) { /* storage blocked */ }
    if (wanted === "en" || wanted === "da") LANG = wanted;
  }

  /* ---------- Strings ---------- */
  const STR = {
    da: {
      title: "Valby United — Én klub. Hele Valby.",
      description: "Valby United er fodboldklubben for hele Valby. Kampprogram, nyheder, truppen, akademi, e-sport og medlemskab.",
      switchTo: "EN", switchLabel: "Switch to English",
      weekdays: ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"],
      months: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
      monthsShort: ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"],
      home: "Hjemme", away: "Ude", homeShort: "H", awayShort: "U", homeMatch: "Hjemmekamp", awayMatch: "Udekamp",
      result: { W: "Sejr", D: "Uafgjort", L: "Nederlag" }, formLetter: { W: "V", D: "U", L: "T" },
      nextMatch: "Næste kamp", freeEntry: "Fri entré", fullTime: "Slutresultat",
      comp: { league: "Elite 1", cup: "KBU Pokal" }, round: (r) => (r === "QF" ? "Kvartfinale" : `Runde ${r}`),
      pos: { GK: "Målmand", DF: "Forsvar", MF: "Midtbane", FW: "Angriber" },
      number: "nummer", captain: "Anfører", photoSoon: "Foto kommer", apps: "Kampe", goals: "Mål", form: "Form",
      staff: { head: "Cheftræner", assistant: "Assistenttræner", keeper: "Målmandstræner" },
      icsFile: "valby-united-naeste-kamp.ics",
      openMenu: "Åbn menu", closeMenu: "Luk menu",
      nlInvalid: "Indtast en gyldig e-mailadresse.", nlOk: "Tak! Du er nu tilmeldt Valby United-nyhedsbrevet.",
      err: {
        name: "Skriv dit fulde navn.", email: "Indtast en gyldig e-mailadresse.",
        phone: "Indtast et dansk telefonnummer (8 cifre).", age: "Vælg alder.", consent: "Forælder/værge skal give samtykke.",
      },
    },
    en: {
      title: "Valby United — One club. All of Valby.",
      description: "Valby United is the football club for all of Valby. Fixtures, news, the squad, academy, e-sport and membership.",
      switchTo: "DA", switchLabel: "Skift til dansk",
      weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      home: "Home", away: "Away", homeShort: "H", awayShort: "A", homeMatch: "Home match", awayMatch: "Away match",
      result: { W: "Win", D: "Draw", L: "Loss" }, formLetter: { W: "W", D: "D", L: "L" },
      nextMatch: "Next match", freeEntry: "Free entry", fullTime: "Full time",
      comp: { league: "Elite 1", cup: "KBU Cup" }, round: (r) => (r === "QF" ? "Quarter-final" : `Round ${r}`),
      pos: { GK: "Goalkeeper", DF: "Defender", MF: "Midfielder", FW: "Forward" },
      number: "number", captain: "Captain", photoSoon: "Photo coming soon", apps: "Apps", goals: "Goals", form: "Form",
      staff: { head: "Head coach", assistant: "Assistant coach", keeper: "Goalkeeper coach" },
      icsFile: "valby-united-next-match.ics",
      openMenu: "Open menu", closeMenu: "Close menu",
      nlInvalid: "Please enter a valid email address.", nlOk: "Thanks! You're now subscribed to the Valby United newsletter.",
      err: {
        name: "Please enter your full name.", email: "Please enter a valid email address.",
        phone: "Please enter a Danish phone number (8 digits).", age: "Please choose an age.", consent: "A parent/guardian must give consent.",
      },
    },
  };
  let T = STR[LANG];

  /* ---------- Date helpers ---------- */
  const pad = (n) => String(n).padStart(2, "0");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const clock = (d) => (LANG === "en" ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : `${pad(d.getHours())}.${pad(d.getMinutes())}`);
  const fmtTime = (d) => (LANG === "en" ? clock(d) : `kl. ${clock(d)}`);
  const fmtLong = (d) => LANG === "en"
    ? `${T.weekdays[d.getDay()]} ${d.getDate()} ${T.months[d.getMonth()]}`
    : `${cap(T.weekdays[d.getDay()])} ${d.getDate()}. ${T.months[d.getMonth()]}`;
  const fmtShort = (d) => LANG === "en"
    ? `${T.weekdays[d.getDay()].slice(0, 3)} ${d.getDate()} ${T.monthsShort[d.getMonth()]}`
    : `${T.weekdays[d.getDay()].slice(0, 3)} ${d.getDate()}. ${T.monthsShort[d.getMonth()]}`;
  const fmtNews = (d) => LANG === "en"
    ? `${d.getDate()} ${T.monthsShort[d.getMonth()]} ${d.getFullYear()}`
    : `${d.getDate()}. ${T.monthsShort[d.getMonth()]} ${d.getFullYear()}`;
  const compLabel = (f) => `${T.comp[f.comp]} · ${T.round(f.round)}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- Language switch: keep the current section when switching ---------- */
  $$("[data-lang-switch]").forEach((a) => {
    a.addEventListener("click", () => {
      if (location.hash) a.href = a.getAttribute("href").split("#")[0] + location.hash;
      try { localStorage.setItem("vu-lang", a.getAttribute("hreflang") || ""); } catch (e) { /* storage blocked */ }
    });
  });

  /* ---------- Header ---------- */
  const header = $(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const burger = $(".burger");
  const menu = $("#mobile-menu");
  if (burger && menu) {
    const setOpen = (open) => {
      document.documentElement.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? T.closeMenu : T.openMenu);
      menu.setAttribute("aria-hidden", String(!open));
      if (open) menu.querySelector("a")?.focus({ preventScroll: true });
    };
    burger.addEventListener("click", () => setOpen(burger.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setOpen(false); burger.focus(); }
    });
    window.addEventListener("resize", () => { if (window.innerWidth > 1180) setOpen(false); });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Crests ---------- */
  let crestId = 0;
  function crest(key, size) {
    const t = window.VU_DATA.teams[key];
    if (t.crest) return `<img src="${t.crest}" width="${size}" height="${size}" alt="" loading="lazy">`;
    const [c1, c2] = t.colors;
    const id = `cr${++crestId}`;
    const shield = "M20 2 37 7v14c0 10-8 17-17 21C11 38 3 31 3 21V7z";
    return `<svg viewBox="0 0 40 44" width="${size}" height="${size}" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${shield}"/></clipPath></defs>
      <g clip-path="url(#${id})"><rect width="40" height="44" fill="${c1}"/><rect y="16" width="40" height="12" fill="${c2}"/></g>
      <path d="${shield}" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="1.4"/>
      <text x="20" y="25.6" text-anchor="middle" font-family="Archivo, sans-serif" font-weight="800" font-size="10" style="font-stretch:70%" fill="${c1}">${esc(t.short)}</text>
    </svg>`;
  }

  const D = window.VU_DATA;
  if (!D) { initReveal(); initForms(); return; }

  /* ---------- Next match (hero) ---------- */
  const next = D.upcoming[0];
  const nm = $("[data-next-match]");
  function renderNextMatch() {
    if (!nm || !next) return;
    const home = D.teams[next.home], away = D.teams[next.away];
    $("[data-nm-comp]", nm).textContent = compLabel(next);
    $("[data-nm-home]", nm).innerHTML = `${crest(next.home, 64)}<span>${esc(home.name)}</span>`;
    $("[data-nm-away]", nm).innerHTML = `${crest(next.away, 64)}<span>${esc(away.name)}</span>`;
    $("[data-nm-time]", nm).innerHTML = `${clock(next.date)}<small>${next.home === "VU" ? T.home : T.away}</small>`;
    $("[data-nm-date]", nm).textContent = fmtLong(next.date);
    $("[data-nm-venue]", nm).textContent = next.venue;
    const maps = $("[data-nm-maps]", nm);
    if (maps) maps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.venue + ", København")}`;
  }
  if (nm && next) {
    // countdown
    const cd = { d: $("[data-cd-d]", nm), h: $("[data-cd-h]", nm), m: $("[data-cd-m]", nm), s: $("[data-cd-s]", nm) };
    const tick = () => {
      let diff = Math.max(0, next.date - new Date());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      cd.d.textContent = pad(d); cd.h.textContent = pad(h); cd.m.textContent = pad(m); cd.s.textContent = pad(s);
    };
    tick();
    setInterval(tick, 1000);

    // add to calendar (.ics) — delegated so it survives language switches
    nm.addEventListener("click", (e) => {
      if (!e.target.closest("[data-nm-ics]")) return;
      const home = D.teams[next.home], away = D.teams[next.away];
      const toICS = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const end = new Date(next.date.getTime() + 2 * 36e5);
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Valby United//Fixtures//" + LANG.toUpperCase(), "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${toICS(next.date)}-${next.home}-${next.away}@valbyunited.dk`,
        `DTSTAMP:${toICS(new Date())}`,
        `DTSTART:${toICS(next.date)}`,
        `DTEND:${toICS(end)}`,
        `SUMMARY:${home.name} – ${away.name}`,
        `LOCATION:${next.venue}`,
        `DESCRIPTION:${compLabel(next)}`,
        "END:VEVENT", "END:VCALENDAR",
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: T.icsFile });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  /* ---------- Fixtures ---------- */
  const fixturesEl = $("[data-fixtures]");
  let fixturesKind = "upcoming";
  function fixtureCard(f, isNext) {
    const isResult = Array.isArray(f.score);
    const usHome = f.home === "VU";
    let badge = "";
    let homeCls = "", awayCls = "";
    if (isResult) {
      const [hs, as] = f.score;
      const ours = usHome ? hs : as, theirs = usHome ? as : hs;
      const r = ours > theirs ? "W" : ours === theirs ? "D" : "L";
      badge = `<span class="result-badge result-badge--${r}">${T.result[r]}</span>`;
      if (hs < as) homeCls = " is-loser"; else if (as < hs) awayCls = " is-loser";
    }
    const team = (key, cls, score) => `<div class="fixture__team${cls}">${crest(key, 32)}<span>${esc(D.teams[key].name)}</span>${isResult ? `<b>${score}</b>` : ""}</div>`;
    const foot = isResult
      ? badge
      : isNext ? `<span class="chip chip--green">${T.nextMatch}</span>` : f.free ? `<span class="chip">${T.freeEntry}</span>` : "";
    return `<article class="fixture${isNext ? " fixture--next" : ""}">
      <div class="fixture__top"><span>${esc(compLabel(f))}</span><span class="fixture__ha" title="${usHome ? T.homeMatch : T.awayMatch}">${usHome ? T.homeShort : T.awayShort}</span></div>
      <div class="fixture__body">
        <div class="fixture__date">${fmtShort(f.date)}<small>${isResult ? T.fullTime : fmtTime(f.date)}</small></div>
        <div class="fixture__teams">${team(f.home, homeCls, isResult ? f.score[0] : "")}${team(f.away, awayCls, isResult ? f.score[1] : "")}</div>
      </div>
      <div class="fixture__foot"><span><svg class="i i--sm"><use href="#i-pin"/></svg>${esc(f.venue)}</span>${foot}</div>
    </article>`;
  }
  function renderFixtures(kind, keepScroll) {
    if (!fixturesEl) return;
    fixturesKind = kind;
    const left = fixturesEl.scrollLeft;
    const list = kind === "results" ? D.results : D.upcoming;
    fixturesEl.innerHTML = list.map((f, i) => fixtureCard(f, kind !== "results" && i === 0)).join("");
    fixturesEl.scrollLeft = keepScroll ? left : 0;
    updateFixtureButtons();
  }
  const prevBtn = $("[data-fx-prev]"), nextBtn = $("[data-fx-next]");
  function updateFixtureButtons() {
    if (!fixturesEl || !prevBtn) return;
    const max = fixturesEl.scrollWidth - fixturesEl.clientWidth - 2;
    prevBtn.disabled = fixturesEl.scrollLeft <= 2;
    nextBtn.disabled = fixturesEl.scrollLeft >= max;
  }
  if (fixturesEl) {
    fixturesEl.addEventListener("scroll", updateFixtureButtons, { passive: true });
    window.addEventListener("resize", updateFixtureButtons);
    const step = (dir) => {
      const card = fixturesEl.querySelector(".fixture");
      const w = card ? card.getBoundingClientRect().width + 16 : 300;
      fixturesEl.scrollBy({ left: dir * w, behavior: reduceMotion ? "auto" : "smooth" });
    };
    prevBtn?.addEventListener("click", () => step(-1));
    nextBtn?.addEventListener("click", () => step(1));
  }
  // generic tab groups
  $$("[data-tabs]").forEach((group) => {
    const tabs = $$('[role="tab"]', group);
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        const i = tabs.indexOf(tab);
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const n = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
          n.focus(); select(n);
        }
      });
    });
    function select(tab) {
      tabs.forEach((t) => { const on = t === tab; t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
      group.dispatchEvent(new CustomEvent("tabchange", { detail: tab.dataset.value }));
    }
  });
  $("[data-tabs='fixtures']")?.addEventListener("tabchange", (e) => renderFixtures(e.detail));

  /* ---------- League table ---------- */
  const formChips = (form) => form.split("").map((c) => `<i class="${c}" title="${T.result[c]}">${T.formLetter[c]}</i>`).join("");
  const tableBody = $("[data-league]");
  function renderTable() {
    if (!tableBody) return;
    const last = D.table.length;
    tableBody.innerHTML = D.table.map((r, i) => {
      const [key, p, w, dr, l, gf, ga, form] = r;
      const pos = i + 1;
      const gd = gf - ga;
      const zone = pos === 1 ? '<i class="zone zone--up" aria-hidden="true"></i>' : pos > last - 2 ? '<i class="zone zone--down" aria-hidden="true"></i>' : "";
      return `<tr class="${key === "VU" ? "is-us" : ""}">
        <td>${zone}${pos}</td>
        <td><span class="team-cell">${crest(key, 24)}${esc(D.teams[key].name)}</span></td>
        <td>${p}</td><td class="hide-sm">${w}</td><td class="hide-sm">${dr}</td><td class="hide-sm">${l}</td>
        <td class="hide-sm">${gf}–${ga}</td><td>${gd > 0 ? "+" + gd : gd}</td>
        <td class="pts">${w * 3 + dr}</td>
        <td class="hide-sm"><span class="form" aria-label="${T.form}: ${form.split("").map((c) => T.result[c]).join(", ")}">${formChips(form)}</span></td>
      </tr>`;
    }).join("");
  }

  /* ---------- Season stats ---------- */
  const statsEl = $("[data-stats]");
  function renderStats() {
    if (!statsEl) return;
    const s = D.seasonStats;
    $("[data-stat-goals]", statsEl).textContent = s.goals;
    $("[data-stat-cs]", statsEl).textContent = s.cleanSheets;
    $("[data-stat-losses]", statsEl).textContent = s.losses;
    const us = D.table.find((r) => r[0] === "VU");
    $("[data-stat-form]", statsEl).innerHTML = formChips(us[7]);
    const top = [...D.squad].sort((a, b) => b.goals - a.goals).slice(0, 4);
    const max = top[0].goals || 1;
    $("[data-scorers]", statsEl).innerHTML = top.map((p) => `
      <div class="scorer">
        <span class="scorer__no">${p.no}</span>
        <div class="scorer__name">${esc(p.first)} ${esc(p.last)}<small>${T.pos[p.pos]}</small><div class="bar"><i style="width:${(p.goals / max) * 100}%"></i></div></div>
        <span class="scorer__goals">${p.goals}</span>
      </div>`).join("");
  }

  /* ---------- Squad ---------- */
  const squadEl = $("[data-squad]");
  let squadFilter = "all";
  function applySquadFilter() {
    $$(".player", squadEl).forEach((el) => el.classList.toggle("is-hidden", squadFilter !== "all" && el.dataset.pos !== squadFilter));
  }
  function renderSquad() {
    if (!squadEl) return;
    const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const sil = `<svg class="player__sil" viewBox="0 0 200 230" aria-hidden="true"><path fill="currentColor" d="M100 18c22 0 38 18 38 44 0 19-8 35-20 43v13c30 6 62 22 70 52 4 16 6 38 6 60H6c0-22 2-44 6-60 8-30 40-46 70-52v-13c-12-8-20-24-20-43 0-26 16-44 38-44z"/></svg>`;
    squadEl.innerHTML = [...D.squad].sort((a, b) => order[a.pos] - order[b.pos] || a.no - b.no).map((p) => `
      <article class="player" data-pos="${p.pos}" tabindex="0" aria-label="${esc(p.first)} ${esc(p.last)}, ${T.number} ${p.no}, ${T.pos[p.pos]}">
        <span class="player__no" aria-hidden="true">${p.no}</span>
        ${p.captain ? `<span class="player__cap" title="${T.captain}">C</span>` : ""}
        <span class="photo-note">${T.photoSoon}</span>
        ${sil}
        <div class="player__info">
          <div class="player__first">${esc(p.first)}</div>
          <div class="player__last">${esc(p.last)}</div>
          <div class="player__pos">${T.pos[p.pos]}</div>
          <div class="player__stats"><div><b>${p.apps}</b><span>${T.apps}</span></div><div><b>${p.goals}</b><span>${T.goals}</span></div></div>
        </div>
      </article>`).join("");
    applySquadFilter();
    const staffEl = $("[data-staff]");
    if (staffEl) staffEl.innerHTML = D.staff.map((s) => `<div class="staff__item"><span>${esc(T.staff[s.role] || s.role)}</span><b>${esc(s.name)}</b></div>`).join("");
  }
  $("[data-tabs='squad']")?.addEventListener("tabchange", (e) => { squadFilter = e.detail; applySquadFilter(); });

  /* ---------- News dates (relative to latest result, keeps the demo consistent) ---------- */
  function renderNewsDates() {
    const base = D.results[0]?.date;
    if (!base) return;
    $$("[data-news-offset]").forEach((el) => {
      const d = new Date(base);
      d.setDate(d.getDate() - Number(el.dataset.newsOffset));
      el.textContent = fmtNews(d);
      el.setAttribute("datetime", d.toISOString().slice(0, 10));
    });
  }

  function renderAll(keepScroll) {
    renderNextMatch();
    renderFixtures(fixturesKind, keepScroll);
    renderTable();
    renderStats();
    renderSquad();
    renderNewsDates();
  }

  /* ---------- In-place language switch (one-page build) ---------- */
  function applyLang(lang, persist) {
    LANG = lang;
    T = STR[lang];
    document.documentElement.lang = lang;
    document.title = T.title;
    $('meta[name="description"]')?.setAttribute("content", T.description);
    $$("[data-en]").forEach((el) => {
      if (el.__da === undefined) el.__da = el.innerHTML;
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : el.__da;
      $$("[data-reveal]", el).forEach((r) => r.classList.add("is-in"));
    });
    $$("[data-success-name]").forEach((n) => (n.textContent = n.closest(".form-card")?.dataset.name || ""));
    $$("[data-en-attrs]").forEach((el) => {
      el.getAttribute("data-en-attrs").split(",").forEach((attr) => {
        const key = "__da_" + attr;
        if (el[key] === undefined) el[key] = el.getAttribute(attr);
        const v = lang === "en" ? el.getAttribute("data-en-" + attr) : el[key];
        if (v === null) el.removeAttribute(attr); else el.setAttribute(attr, v);
      });
    });
    $$("[data-lang-toggle]").forEach((b) => {
      const label = $("[data-lang-label]", b);
      if (label) label.textContent = T.switchTo;
      b.setAttribute("aria-label", T.switchLabel);
      b.setAttribute("title", T.switchLabel);
    });
    $$("[data-set-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
    if (burger) burger.setAttribute("aria-label", burger.getAttribute("aria-expanded") === "true" ? T.closeMenu : T.openMenu);
    $$(".form-msg").forEach((m) => { m.textContent = ""; m.className = "form-msg"; });
    $$(".field__err").forEach((m) => (m.textContent = ""));
    $$(".is-invalid").forEach((f) => f.classList.remove("is-invalid"));
    if (persist) { try { localStorage.setItem("vu-lang", lang); } catch (e) { /* storage blocked */ } }
    renderAll(true);
  }
  if (ONE_PAGE) {
    document.addEventListener("click", (e) => {
      const toggle = e.target.closest("[data-lang-toggle]");
      const set = e.target.closest("[data-set-lang]");
      if (toggle) applyLang(LANG === "da" ? "en" : "da", true);
      else if (set && set.dataset.setLang !== LANG) applyLang(set.dataset.setLang, true);
    });
  }

  if (ONE_PAGE && LANG !== "da") applyLang(LANG, false);
  else renderAll(false);
  document.documentElement.classList.remove("lang-pending");

  initReveal();
  initForms();

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Forms (front-end only: connect to a backend / form service) ---------- */
  function initForms() {
    const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

    $$("[data-newsletter]").forEach((form) => {
      const msg = $(".form-msg", form.parentElement);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("input[type=email]", form);
        if (!emailOk(input.value)) {
          msg.textContent = T.nlInvalid;
          msg.className = "form-msg is-err";
          input.focus();
          return;
        }
        msg.textContent = T.nlOk;
        msg.className = "form-msg is-ok";
        form.reset();
      });
    });

    const wl = $("[data-waitlist]");
    if (wl) {
      const card = wl.closest(".form-card");
      const rules = {
        name: (v) => v.trim().length >= 2 || T.err.name,
        email: (v) => emailOk(v) || T.err.email,
        phone: (v) => /^(\+?45)?\s?(\d\s?){8}$/.test(v.trim()) || T.err.phone,
        age: (v) => v !== "" || T.err.age,
        consent: (_, el) => el.checked || T.err.consent,
      };
      const check = (el) => {
        const rule = rules[el.name];
        if (!rule) return true;
        const res = rule(el.value, el);
        const field = el.closest(".field, .check");
        const err = field && $(".field__err", field);
        const ok = res === true;
        field?.classList.toggle("is-invalid", !ok);
        el.setAttribute("aria-invalid", String(!ok));
        if (err) err.textContent = ok ? "" : res;
        return ok;
      };
      $$("input, select", wl).forEach((el) => el.addEventListener("blur", () => { if (el.value || el.type === "checkbox") check(el); }));
      wl.addEventListener("submit", (e) => {
        e.preventDefault();
        const els = $$("input, select", wl);
        const bad = els.filter((el) => !check(el));
        if (bad.length) { bad[0].focus(); return; }
        const first = $("[name=name]", wl).value.trim().split(" ")[0];
        const nameSlot = $("[data-success-name]", card);
        card.dataset.name = first;
        if (nameSlot) nameSlot.textContent = first;
        card.classList.add("is-done");
        $(".form-success h3", card)?.focus();
      });
    }
  }
})();
