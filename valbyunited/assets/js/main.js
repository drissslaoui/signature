/* ==========================================================================
   Valby United — site behaviour
   ========================================================================== */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Danish date helpers ---------- */
  const WEEKDAYS = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const MONTHS = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
  const MONTHS_SHORT = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  const pad = (n) => String(n).padStart(2, "0");
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const fmtTime = (d) => `kl. ${pad(d.getHours())}.${pad(d.getMinutes())}`;
  const fmtLong = (d) => `${cap(WEEKDAYS[d.getDay()])} ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  const fmtShort = (d) => `${WEEKDAYS[d.getDay()].slice(0, 3)} ${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}`;
  const fmtNews = (d) => `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
      burger.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
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
  if (nm && next) {
    const home = D.teams[next.home], away = D.teams[next.away];
    $("[data-nm-comp]", nm).textContent = `${next.comp} · ${next.round}`;
    $("[data-nm-home]", nm).innerHTML = `${crest(next.home, 64)}<span>${esc(home.name)}</span>`;
    $("[data-nm-away]", nm).innerHTML = `${crest(next.away, 64)}<span>${esc(away.name)}</span>`;
    $("[data-nm-time]", nm).innerHTML = `${pad(next.date.getHours())}.${pad(next.date.getMinutes())}<small>${next.home === "VU" ? "Hjemme" : "Ude"}</small>`;
    $("[data-nm-date]", nm).textContent = fmtLong(next.date);
    $("[data-nm-venue]", nm).textContent = next.venue;
    const maps = $("[data-nm-maps]", nm);
    if (maps) maps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.venue + ", København")}`;

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

    // add to calendar (.ics)
    $("[data-nm-ics]", nm)?.addEventListener("click", () => {
      const toICS = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
      const end = new Date(next.date.getTime() + 2 * 36e5);
      const ics = [
        "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Valby United//Kampprogram//DA", "CALSCALE:GREGORIAN",
        "BEGIN:VEVENT",
        `UID:${toICS(next.date)}-${next.home}-${next.away}@valbyunited.dk`,
        `DTSTAMP:${toICS(new Date())}`,
        `DTSTART:${toICS(next.date)}`,
        `DTEND:${toICS(end)}`,
        `SUMMARY:${home.name} – ${away.name}`,
        `LOCATION:${next.venue}`,
        `DESCRIPTION:${next.comp} · ${next.round}`,
        "END:VEVENT", "END:VCALENDAR",
      ].join("\r\n");
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: "valby-united-naeste-kamp.ics" });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  /* ---------- Fixtures ---------- */
  const fixturesEl = $("[data-fixtures]");
  function fixtureCard(f, isNext) {
    const isResult = Array.isArray(f.score);
    const usHome = f.home === "VU";
    let badge = "";
    let homeCls = "", awayCls = "";
    if (isResult) {
      const [hs, as] = f.score;
      const ours = usHome ? hs : as, theirs = usHome ? as : hs;
      const r = ours > theirs ? "V" : ours === theirs ? "U" : "T";
      const label = { V: "Sejr", U: "Uafgjort", T: "Nederlag" }[r];
      badge = `<span class="result-badge result-badge--${r}" title="${label}">${label}</span>`;
      if (hs < as) homeCls = " is-loser"; else if (as < hs) awayCls = " is-loser";
    }
    const team = (key, cls, score) => `<div class="fixture__team${cls}">${crest(key, 32)}<span>${esc(D.teams[key].name)}</span>${isResult ? `<b>${score}</b>` : ""}</div>`;
    const foot = isResult
      ? badge
      : isNext ? `<span class="chip chip--green">Næste kamp</span>` : f.free ? `<span class="chip">Fri entré</span>` : "";
    return `<article class="fixture${isNext ? " fixture--next" : ""}">
      <div class="fixture__top"><span>${esc(f.comp)} · ${esc(f.round)}</span><span class="fixture__ha" title="${usHome ? "Hjemmekamp" : "Udekamp"}">${usHome ? "H" : "U"}</span></div>
      <div class="fixture__body">
        <div class="fixture__date">${fmtShort(f.date)}<small>${isResult ? "Slutresultat" : fmtTime(f.date)}</small></div>
        <div class="fixture__teams">${team(f.home, homeCls, isResult ? f.score[0] : "")}${team(f.away, awayCls, isResult ? f.score[1] : "")}</div>
      </div>
      <div class="fixture__foot"><span><svg class="i i--sm"><use href="#i-pin"/></svg>${esc(f.venue)}</span>${foot}</div>
    </article>`;
  }
  function renderFixtures(kind) {
    if (!fixturesEl) return;
    const list = kind === "results" ? D.results : D.upcoming;
    fixturesEl.innerHTML = list.map((f, i) => fixtureCard(f, kind !== "results" && i === 0)).join("");
    fixturesEl.scrollLeft = 0;
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
    renderFixtures("upcoming");
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
  const tableBody = $("[data-league]");
  if (tableBody) {
    const last = D.table.length;
    tableBody.innerHTML = D.table.map((r, i) => {
      const [key, p, w, dr, l, gf, ga, form] = r;
      const pos = i + 1;
      const gd = gf - ga;
      const zone = pos === 1 ? '<i class="zone zone--up" aria-hidden="true"></i>' : pos > last - 2 ? '<i class="zone zone--down" aria-hidden="true"></i>' : "";
      const formHtml = form.split("").map((c) => `<i class="${c}">${c}</i>`).join("");
      return `<tr class="${key === "VU" ? "is-us" : ""}">
        <td>${zone}${pos}</td>
        <td><span class="team-cell">${crest(key, 24)}${esc(D.teams[key].name)}</span></td>
        <td>${p}</td><td class="hide-sm">${w}</td><td class="hide-sm">${dr}</td><td class="hide-sm">${l}</td>
        <td class="hide-sm">${gf}–${ga}</td><td>${gd > 0 ? "+" + gd : gd}</td>
        <td class="pts">${w * 3 + dr}</td>
        <td class="hide-sm"><span class="form" aria-label="Form: ${form}">${formHtml}</span></td>
      </tr>`;
    }).join("");
  }

  /* ---------- Season stats ---------- */
  const statsEl = $("[data-stats]");
  if (statsEl) {
    const s = D.seasonStats;
    $("[data-stat-goals]", statsEl).textContent = s.goals;
    $("[data-stat-cs]", statsEl).textContent = s.cleanSheets;
    $("[data-stat-losses]", statsEl).textContent = s.losses;
    const us = D.table.find((r) => r[0] === "VU");
    $("[data-stat-form]", statsEl).innerHTML = us[7].split("").map((c) => `<i class="${c}" title="${{ V: "Sejr", U: "Uafgjort", T: "Nederlag" }[c]}">${c}</i>`).join("");
    const top = [...D.squad].sort((a, b) => b.goals - a.goals).slice(0, 4);
    const max = top[0].goals || 1;
    $("[data-scorers]", statsEl).innerHTML = top.map((p) => `
      <div class="scorer">
        <span class="scorer__no">${p.no}</span>
        <div class="scorer__name">${esc(p.first)} ${esc(p.last)}<small>${posLabel(p.pos)}</small><div class="bar"><i style="width:${(p.goals / max) * 100}%"></i></div></div>
        <span class="scorer__goals">${p.goals}</span>
      </div>`).join("");
  }

  /* ---------- Squad ---------- */
  function posLabel(p) { return { GK: "Målmand", DF: "Forsvar", MF: "Midtbane", FW: "Angriber" }[p]; }
  const squadEl = $("[data-squad]");
  if (squadEl) {
    const order = { GK: 0, DF: 1, MF: 2, FW: 3 };
    const sil = `<svg class="player__sil" viewBox="0 0 200 230" aria-hidden="true"><path fill="currentColor" d="M100 18c22 0 38 18 38 44 0 19-8 35-20 43v13c30 6 62 22 70 52 4 16 6 38 6 60H6c0-22 2-44 6-60 8-30 40-46 70-52v-13c-12-8-20-24-20-43 0-26 16-44 38-44z"/></svg>`;
    squadEl.innerHTML = [...D.squad].sort((a, b) => order[a.pos] - order[b.pos] || a.no - b.no).map((p) => `
      <article class="player" data-pos="${p.pos}" tabindex="0" aria-label="${esc(p.first)} ${esc(p.last)}, nummer ${p.no}, ${posLabel(p.pos)}">
        <span class="player__no" aria-hidden="true">${p.no}</span>
        ${p.captain ? '<span class="player__cap" title="Anfører">C</span>' : ""}
        <span class="photo-note">Foto kommer</span>
        ${sil}
        <div class="player__info">
          <div class="player__first">${esc(p.first)}</div>
          <div class="player__last">${esc(p.last)}</div>
          <div class="player__pos">${posLabel(p.pos)}</div>
          <div class="player__stats"><div><b>${p.apps}</b><span>Kampe</span></div><div><b>${p.goals}</b><span>Mål</span></div></div>
        </div>
      </article>`).join("");
    $("[data-tabs='squad']")?.addEventListener("tabchange", (e) => {
      const f = e.detail;
      $$(".player", squadEl).forEach((el) => el.classList.toggle("is-hidden", f !== "all" && el.dataset.pos !== f));
    });
    const staffEl = $("[data-staff]");
    if (staffEl) staffEl.innerHTML = D.staff.map((s) => `<div class="staff__item"><span>${esc(s.role)}</span><b>${esc(s.name)}</b></div>`).join("");
  }

  /* ---------- News dates (relative to latest result, keeps the demo consistent) ---------- */
  const base = D.results[0]?.date;
  if (base) {
    $$("[data-news-offset]").forEach((el) => {
      const d = new Date(base);
      d.setDate(d.getDate() - Number(el.dataset.newsOffset));
      el.textContent = fmtNews(d);
      el.setAttribute("datetime", d.toISOString().slice(0, 10));
    });
  }

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
          msg.textContent = "Indtast en gyldig e-mailadresse.";
          msg.className = "form-msg is-err";
          input.focus();
          return;
        }
        msg.textContent = "Tak! Du er nu tilmeldt Valby United-nyhedsbrevet.";
        msg.className = "form-msg is-ok";
        form.reset();
      });
    });

    const wl = $("[data-waitlist]");
    if (wl) {
      const card = wl.closest(".form-card");
      const rules = {
        name: (v) => v.trim().length >= 2 || "Skriv dit fulde navn.",
        email: (v) => emailOk(v) || "Indtast en gyldig e-mailadresse.",
        phone: (v) => /^(\+?45)?\s?(\d\s?){8}$/.test(v.trim()) || "Indtast et dansk telefonnummer (8 cifre).",
        age: (v) => v !== "" || "Vælg alder.",
        consent: (_, el) => el.checked || "Forælder/værge skal give samtykke.",
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
        if (nameSlot) nameSlot.textContent = first;
        card.classList.add("is-done");
        $(".form-success h3", card)?.focus();
      });
    }
  }
})();
