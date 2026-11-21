/* Bryghus HQ — app shell, views, live simulation */
(function () {
  'use strict';

  const { Fmt, h } = Charts;
  const D = HQ;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* unavailable */ } }
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ======================================================================
     Icons
     ====================================================================== */
  const ICONS = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    trend: '<path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
    flask: '<path d="M9 3h6"/><path d="M10 3v6L4.5 18.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
    beer: '<path d="M6 8h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8z"/><path d="M16 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><path d="M6 8a3 3 0 0 1 3-3 3 3 0 0 1 5 0 2.5 2.5 0 0 1 2 3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6 6 0 0 1 3.5 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    down: '<path d="M12 5v14M19 12l-7 7-7-7"/>',
    flat: '<path d="M5 12h14"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16 10"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    critical: '<path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9z"/><path d="M12 8v5M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    neutral: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    thermo: '<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',
    drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5"/><path d="M4 20h16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L22 7H6"/>',
    receipt: '<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/><path d="M9 8h6M9 12h6"/>',
    keg: '<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M5 8h14M5 16h14"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    sort: '<path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>',
    truck: '<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    pin: '<path d="M12 21s7-6.1 7-11a7 7 0 0 0-14 0c0 4.9 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    run: '<circle cx="14" cy="4.5" r="2"/><path d="M8 21l3-6 3 2v5M6 12l3-3 4 1 3 3 3 1"/>'
  };
  const icon = (name, cls = 'i') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const STATUS_ICON = { good: 'check', warning: 'alert', serious: 'alert', critical: 'critical', neutral: 'neutral', info: 'info' };
  const statusChip = (level, label) => `<span class="status status--${level}">${icon(STATUS_ICON[level] || 'info')}${esc(label)}</span>`;
  function deltaChip(d, upIsGood = true, unit) {
    if (!isFinite(d)) return '';
    const flat = Math.abs(d) < (unit === 'pp' ? 0.0005 : 0.005);
    const good = flat ? null : (d > 0) === upIsGood;
    const cls = flat ? 'flat' : good ? 'good' : 'bad';
    return `<span class="delta delta--${cls}" title="${good === null ? 'No change' : good ? 'Better' : 'Worse'} than the comparison period">${icon(flat ? 'flat' : d > 0 ? 'up' : 'down')}${unit === 'pp' ? (d >= 0 ? '+' : '−') + Math.abs(d * 100).toFixed(1) + ' pp' : Fmt.signedPct(d)}</span>`;
  }
  const beerChip = id => { const b = D.beerById[id]; return b ? `<span class="beer-chip" style="background:${b.label}" title="${esc(b.name)} label"></span>` : '<span class="beer-chip" style="background:var(--surface-3)"></span>'; };
  function meterHTML(value, max, status, marker, label) {
    const w = Math.max(0, Math.min(100, value / max * 100));
    const mk = marker != null ? `<div class="meter__marker" style="left:${Math.min(100, marker / max * 100)}%"></div>` : '';
    return `<div class="meter${status && status !== 'good' ? ' meter--' + status : ''}" role="meter" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${Math.round(value)}" aria-label="${esc(label || '')}"><div class="meter__fill" style="width:${w}%"></div>${mk}</div>`;
  }

  /* ======================================================================
     State, ranges & aggregation
     ====================================================================== */
  const VIEWS = [
    { id: 'overview', label: 'Command center', icon: 'grid', group: 'Operations' },
    { id: 'sales', label: 'Sales & revenue', icon: 'trend', group: 'Operations' },
    { id: 'inventory', label: 'Inventory', icon: 'box', group: 'Operations' },
    { id: 'production', label: 'Production', icon: 'flask', group: 'Operations' },
    { id: 'taproom', label: 'The Lab taproom', icon: 'beer', group: 'Venues & people' },
    { id: 'bookings', label: 'Bookings & community', icon: 'calendar', group: 'Venues & people' },
    { id: 'partners', label: 'Partners & accounts', icon: 'users', group: 'Venues & people' }
  ];
  const RANGES = [
    { id: '7d', label: '7D', days: 7 }, { id: '30d', label: '30D', days: 30 }, { id: '90d', label: '90D', days: 90 },
    { id: 'ytd', label: 'YTD' }, { id: '12m', label: '12M', days: 365 }
  ];
  const CH_COLOR = { taproom: 'var(--s1)', webshop: 'var(--s2)', retail: 'var(--s3)', ontrade: 'var(--s4)', events: 'var(--s5)' };
  const chById = Object.fromEntries(D.CHANNELS.map(c => [c.id, c]));

  const state = {
    view: 'overview',
    range: RANGES.some(r => r.id === store.get('hq_range')) ? store.get('hq_range') : '30d',
    channel: 'all',
    modes: {},
    tables: {},
    activity: D.SEED_ACTIVITY.slice(),
    alerts: []
  };
  const LAST = D.days.length - 1;

  function rangeInfo(id) {
    let len;
    if (id === 'ytd') len = Math.round((D.today - new Date(D.today.getFullYear(), 0, 1)) / D.DAY) + 1;
    else len = RANGES.find(r => r.id === id).days;
    const start = LAST - len + 1;
    let prevStart = start - len, prevEnd = start - 1;
    if (id === 'ytd') { prevStart = start - 365; prevEnd = LAST - 365; }
    const gran = len <= 31 ? 'day' : 'week';
    return {
      id, len, start, end: LAST, prevStart, prevEnd, gran,
      label: id === 'ytd' ? 'Year to date' : id === '12m' ? 'Last 12 months' : `Last ${len} days`,
      vs: id === 'ytd' ? 'same period last year' : id === '12m' ? 'previous 12 months' : `previous ${len} days`
    };
  }
  const revOf = (d, ch) => (ch === 'all' ? d.total : d.rev[ch]);
  function sum(i0, i1, fn) { let s = 0; for (let i = Math.max(0, i0); i <= i1; i++) s += fn(D.days[i]); return s; }

  function buckets(i0, i1, gran) {
    const out = [];
    if (gran === 'day') { for (let i = i0; i <= i1; i++) out.push([i, i]); return out; }
    for (let e = i1; e >= i0; e -= 7) out.unshift([Math.max(i0, e - 6), e]);
    return out;
  }
  function series(r, fn) {
    const cur = buckets(r.start, r.end, r.gran);
    const prev = buckets(r.prevStart, r.prevEnd, r.gran);
    return {
      labels: cur.map(b => D.days[b[0]].date),
      ends: cur.map(b => D.days[b[1]].date),
      cur: cur.map(b => sum(b[0], b[1], fn)),
      prev: cur.map((_, k) => { const b = prev[prev.length - cur.length + k]; return b ? sum(b[0], b[1], fn) : null; })
    };
  }
  function metrics(i0, i1, ch = 'all') {
    const chans = ch === 'all' ? D.CHANNELS : [chById[ch]];
    let rev = 0, liters = 0, gm = 0, orders = 0, guests = 0, b2bRev = 0;
    for (let i = Math.max(0, i0); i <= i1; i++) {
      const d = D.days[i];
      chans.forEach(c => {
        const v = d.rev[c.id];
        rev += v; liters += v / c.perL; gm += v * c.margin;
        if (c.id === 'webshop' || c.id === 'retail' || c.id === 'ontrade') { orders += v / c.spend; b2bRev += v; }
        if (c.id === 'taproom') guests += v / c.spend;
        if (c.id === 'events') guests += v / c.spend;
      });
    }
    return { rev, hl: liters / 100, margin: rev ? gm / rev : 0, orders, guests, aov: orders ? b2bRev / orders : 0 };
  }
  function beerRevenue(i0, i1, ch = 'all') {
    const out = D.BEERS.map(() => 0);
    for (let i = i0; i <= i1; i++) {
      const d = D.days[i];
      const w = D.beerWeights(d.date);
      const v = revOf(d, ch);
      w.forEach((x, k) => { out[k] += v * x; });
    }
    return D.BEERS.map((b, k) => ({ beer: b, value: out[k] }));
  }
  function monthly(nMonths) {
    const map = new Map();
    D.days.forEach(d => {
      const key = d.date.getFullYear() * 12 + d.date.getMonth();
      map.set(key, (map.get(key) || 0) + d.total);
    });
    const curKey = D.today.getFullYear() * 12 + D.today.getMonth();
    const out = [];
    for (let k = curKey - nMonths + 1; k <= curKey; k++) {
      const date = new Date(Math.floor(k / 12), k % 12, 1);
      const actual = map.get(k) || 0;
      const ly = map.get(k - 12) || 0;
      out.push({ date, actual, target: Math.round(ly * 1.12 / 5000) * 5000, partial: k === curKey });
    }
    return out;
  }
  const resample = (arr, n = 16) => {
    if (arr.length <= n) return arr.slice();
    const out = [];
    for (let k = 0; k < n; k++) {
      const a = Math.floor(k * arr.length / n), b = Math.floor((k + 1) * arr.length / n);
      out.push(arr.slice(a, b).reduce((s, v) => s + v, 0) / (b - a));
    }
    return out;
  };

  /* ======================================================================
     Alerts
     ====================================================================== */
  function buildAlerts() {
    const A = [];
    const name = s => `${D.beerById[s.beer].short} ${s.format.split(' · ')[0].toLowerCase()}`;
    D.SKUS.filter(s => s.status === 'critical').forEach(s => A.push({
      level: 'critical', title: `${name(s)}: ${s.cover.toFixed(1)} days of stock left`,
      meta: `${s.available} ${s.unit} available · selling ${Fmt.dec(s.daily)}/day`, view: 'inventory', action: 'Plan brew'
    }));
    D.MATERIALS.filter(m => m.status === 'critical').forEach(m => {
      const po = D.PURCHASE_ORDERS.find(p => p.items.includes(m.name));
      A.push({ level: 'critical', title: `${m.name} below safety stock`, meta: `${m.onHand} ${m.unit} left${po ? ` · ${po.id} arrives ${Fmt.dayLong(po.eta)}` : ''}`, view: 'inventory', action: 'View order' });
    });
    D.TANKS.filter(t => t.drift).forEach(t => A.push({
      level: 'warning', title: `${t.id} is ${(t.temp - t.set).toFixed(1)} °C above setpoint`,
      meta: `${D.beerById[t.beer].name} · day ${t.day} of fermentation`, tank: t.id, action: 'Open tank'
    }));
    D.TAPS.filter(t => t.left < 0.1).forEach(t => A.push({ level: 'warning', title: `Tap ${t.tap} keg almost empty`, meta: `${t.name} · ${Math.round(t.left * 100)}% left`, view: 'taproom', action: 'Taproom' }));
    D.MATERIALS.filter(m => m.status === 'warning').forEach(m => A.push({ level: 'warning', title: `${m.name} below reorder point`, meta: `${Fmt.num(m.onHand)} ${m.unit} on hand · reorder at ${Fmt.num(m.reorder)}`, view: 'inventory', action: 'Reorder' }));
    const overdue = D.ACCOUNTS.filter(a => a.status === 'Overdue');
    if (overdue.length) A.push({ level: 'serious', title: `${overdue.length} invoices overdue`, meta: `${Fmt.kr(overdue.reduce((s, a) => s + a.outstanding, 0))} outstanding · oldest ${Math.max(...overdue.map(a => a.overdueDays))} days`, view: 'partners', action: 'Chase' });
    const kegOver = D.KEGS.find(k => k.id === 'overdue');
    A.push({ level: 'serious', title: `${kegOver.count} kegs out longer than 60 days`, meta: 'Deposit value ' + Fmt.kr(kegOver.count * 450), view: 'inventory', action: 'Keg fleet' });
    D.TANKS.filter(t => t.phase === 'Ready to package').forEach(t => A.push({ level: 'good', title: `${t.id} ${D.beerById[t.beer].name} is ready to package`, meta: `${Fmt.num(t.vol)} L · ${t.abv}% ABV`, tank: t.id, action: 'Open tank' }));
    const order = { critical: 0, warning: 1, serious: 2, good: 3 };
    return A.sort((a, b) => order[a.level] - order[b.level]);
  }
  const LEVEL_LABEL = { critical: 'Critical', warning: 'Warning', serious: 'Attention', good: 'Ready' };
  function alertsHTML(list) {
    return `<ul class="alerts">${list.map((a, i) => `
      <li class="alert" style="--st:var(--${a.level})">
        <span class="alert__icon">${icon(STATUS_ICON[a.level])}</span>
        <div><p class="alert__level">${LEVEL_LABEL[a.level]}</p><p class="alert__title">${esc(a.title)}</p><p class="alert__meta">${esc(a.meta)}</p></div>
        <button type="button" class="btn btn--sm" data-alert="${i}">${esc(a.action)}</button>
      </li>`).join('')}</ul>`;
  }
  function bindAlerts(root, list) {
    $$('[data-alert]', root).forEach(b => b.addEventListener('click', () => {
      const a = list[Number(b.dataset.alert)];
      closeDrawer();
      if (a.tank) openTank(a.tank);
      else if (a.view) go(a.view);
    }));
  }

  /* ======================================================================
     Chart cards (chart ⇄ table toggle) — registry is rebuilt per view
     ====================================================================== */
  let registry = {};
  function chartCard(id, o) {
    const legend = o.legend ? `<div class="legend">${o.legend.map(l => `<span class="legend__item"><span class="key key--${l.kind || 'rect'}" style="${l.kind === 'dash' ? '' : 'background:' + l.color}"></span>${esc(l.name)}</span>`).join('')}</div>` : '';
    const toggle = o.toggle === false ? '' : `<div class="view-toggle" role="group" aria-label="Display as"><button type="button" data-toggle="${id}" data-mode="chart" aria-pressed="true">Chart</button><button type="button" data-toggle="${id}" data-mode="table" aria-pressed="false">Table</button></div>`;
    return `
      <section class="card ${o.cls || ''}" aria-labelledby="t-${id}">
        <header class="card__head">
          <div><h2 class="card__title" id="t-${id}">${esc(o.title)}</h2>${o.sub ? `<p class="card__sub">${esc(o.sub)}</p>` : ''}</div>
          <div class="card__tools">${legend}${o.tools || ''}${toggle}</div>
        </header>
        <div class="card__body" data-chart="${id}"></div>
        ${o.foot ? `<footer class="card__foot">${o.foot}</footer>` : ''}
      </section>`;
  }
  function mountOne(root, id) {
    const host = $(`[data-chart="${id}"]`, root);
    if (!host || !registry[id]) return;
    const mode = state.modes[id] || 'chart';
    $$(`[data-toggle="${id}"]`, root).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    if (mode === 'table' && registry[id].table) {
      const t = registry[id].table();
      Charts.table(host, t.cols, t.rows);
    } else registry[id].render(host);
  }
  function mountCharts(root) {
    Object.keys(registry).forEach(id => mountOne(root, id));
    $$('[data-toggle]', root).forEach(b => b.addEventListener('click', () => {
      state.modes[b.dataset.toggle] = b.dataset.mode;
      mountOne(root, b.dataset.toggle);
    }));
  }
  function rerenderCharts() {
    Object.keys(registry).forEach(id => {
      if ((state.modes[id] || 'chart') !== 'chart') return;
      const host = $(`[data-chart="${id}"]`);
      if (host) registry[id].render(host);
    });
  }

  /* ======================================================================
     Sortable / searchable data tables
     ====================================================================== */
  function dataTable(id, o) {
    const ts = state.tables[id] || (state.tables[id] = { key: o.defaultSort, dir: o.defaultDir || 'desc', q: o.q || '' });
    const host = $(`[data-table="${id}"]`);
    if (!host) return;
    let rows = o.rows.slice();
    if (ts.q && o.search) {
      const q = ts.q.toLowerCase();
      rows = rows.filter(r => o.search(r).toLowerCase().includes(q));
    }
    if (ts.key) {
      const col = o.cols.find(c => c.key === ts.key);
      const get = col && col.sort ? col.sort : r => r[ts.key];
      rows.sort((a, b) => { const x = get(a), y = get(b); const c = typeof x === 'string' ? x.localeCompare(y) : x - y; return ts.dir === 'asc' ? c : -c; });
    }
    const head = o.cols.map(c => {
      const sorted = ts.key === c.key;
      const label = c.sortable === false ? esc(c.label) : `<button type="button" class="th-sort" data-sort="${c.key}" ${sorted ? `aria-sort="${ts.dir === 'asc' ? 'ascending' : 'descending'}"` : ''}>${esc(c.label)}${icon(sorted ? (ts.dir === 'asc' ? 'up' : 'down') : 'sort')}</button>`;
      return `<th scope="col" class="${c.align === 'right' ? 'num' : ''}">${label}</th>`;
    }).join('');
    let shown = rows;
    if (o.pageSize) { ts.limit = ts.limit || o.pageSize; shown = rows.slice(0, ts.limit); }
    const body = shown.length ? shown.map((r, i) => `<tr ${o.onRow ? `data-row="${i}" tabindex="0" style="cursor:pointer"` : ''}>${o.cols.map(c => `<td class="${c.align === 'right' ? 'num' : ''} ${c.cls || ''}">${c.html ? c.html(r) : esc(c.text ? c.text(r) : r[c.key])}</td>`).join('')}</tr>`).join('')
      : `<tr><td colspan="${o.cols.length}" class="empty">${esc(o.empty || 'Nothing matches.')}</td></tr>`;
    const more = o.pageSize && rows.length > o.pageSize
      ? `<div class="table-more"><span>Showing ${shown.length} of ${rows.length}</span>${shown.length < rows.length ? `<button type="button" class="btn btn--sm" data-more>Show ${Math.min(o.pageSize, rows.length - shown.length)} more</button>` : `<button type="button" class="btn btn--sm btn--ghost" data-less>Show less</button>`}</div>`
      : '';
    host.innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>${more}`;
    const mb = $('[data-more]', host), lb = $('[data-less]', host);
    if (mb) mb.addEventListener('click', () => { ts.limit += o.pageSize; dataTable(id, o); });
    if (lb) lb.addEventListener('click', () => { ts.limit = o.pageSize; dataTable(id, o); });
    $$('[data-sort]', host).forEach(b => b.addEventListener('click', () => {
      if (ts.key === b.dataset.sort) ts.dir = ts.dir === 'asc' ? 'desc' : 'asc';
      else { ts.key = b.dataset.sort; ts.dir = 'desc'; }
      dataTable(id, o);
    }));
    if (o.onRow) $$('tr[data-row]', host).forEach(tr => {
      const act = () => o.onRow(shown[Number(tr.dataset.row)]);
      tr.addEventListener('click', act);
      tr.addEventListener('keydown', e => { if (e.key === 'Enter') act(); });
    });
    $$('.spark-cell', host).forEach(el => Charts.sparkline(el, JSON.parse(el.dataset.values), { height: 26 }));
    o._rows = rows;
  }
  function bindTableSearch(id, o) {
    const input = $(`[data-search="${id}"]`);
    if (!input) return;
    input.value = (state.tables[id] && state.tables[id].q) || '';
    input.addEventListener('input', () => { state.tables[id].q = input.value; dataTable(id, o); });
  }

  function downloadCSV(filename, cols, rows) {
    const q = v => { const s = String(v == null ? '' : v); return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const csv = [cols.map(c => q(c.label)).join(',')].concat(rows.map(r => cols.map(c => q(c.csv ? c.csv(r) : r[c.key])).join(','))).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`Exported ${rows.length} rows to ${filename}`);
  }

  /* ======================================================================
     Shared fragments
     ====================================================================== */
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day);
    return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / D.DAY + 1) / 7);
  }
  function greeting() {
    const hr = new Date().getHours();
    return hr < 10 ? 'Godmorgen' : hr < 12 ? 'God formiddag' : hr < 18 ? 'God eftermiddag' : 'Godaften';
  }
  function pageHead(title, sub, actions) {
    const d = new Date();
    const eyebrow = `${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Week ${isoWeek(d)}`;
    return `<div class="page-head"><div><p class="page-head__eyebrow">${esc(eyebrow)}</p><h1>${esc(title)}</h1>${sub ? `<p class="page-head__sub">${sub}</p>` : ''}</div><div class="page-head__actions">${actions || ''}</div></div>`;
  }
  function filtersHTML(withChannel) {
    const r = rangeInfo(state.range);
    const seg = `<div class="seg-ctl" role="group" aria-label="Date range">${RANGES.map(x => `<button type="button" data-range="${x.id}" aria-pressed="${x.id === state.range}">${x.label}</button>`).join('')}</div>`;
    const ch = withChannel ? `<label class="sr-only" for="f-channel">Channel</label><select class="select" id="f-channel"><option value="all">All channels</option>${D.CHANNELS.map(c => `<option value="${c.id}" ${state.channel === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` : '';
    return `<div class="filters">${seg}${ch}<p class="filters__note">${esc(r.label)} · compared with ${esc(r.vs)}</p></div>`;
  }
  function bindFilters(root) {
    $$('[data-range]', root).forEach(b => b.addEventListener('click', () => {
      if (state.range === b.dataset.range) return;
      state.range = b.dataset.range; store.set('hq_range', state.range);
      refresh();
    }));
    const sel = $('#f-channel', root);
    if (sel) sel.addEventListener('change', () => { state.channel = sel.value; refresh(); });
  }
  function refresh() {
    const v = $('#view');
    v.classList.add('is-refreshing');
    setTimeout(() => { render(false); v.classList.remove('is-refreshing'); }, reduced ? 0 : 120);
  }
  function kpiHTML(o) {
    return `<div class="kpi"><p class="kpi__label">${o.icon ? icon(o.icon) : ''}${esc(o.label)}</p><p class="kpi__value" ${o.live ? `data-live="${o.live}"` : ''}>${o.value}</p><div class="kpi__foot">${o.delta || ''}<span>${esc(o.foot || '')}</span></div>${o.spark ? `<div class="kpi__spark" data-spark='${JSON.stringify(o.spark.map(v => Math.round(v * 100) / 100))}'></div>` : ''}</div>`;
  }
  function mountSparks(root) { $$('[data-spark]', root).forEach(el => Charts.sparkline(el, JSON.parse(el.dataset.spark))); }

  function tankCardHTML(t) {
    const beer = t.beer ? D.beerById[t.beer] : null;
    const fill = t.cap ? t.vol / t.cap * 100 : 0;
    const alert = !!t.drift;
    const phaseProgress = t.total ? Math.min(1, t.day / t.total) : 0;
    const label = beer ? (t.note && t.beer === 'labx' ? t.note.split(' — ')[0] : beer.short) : (t.phase === 'Cleaning' ? 'CIP in progress' : 'Available');
    return `
      <button type="button" class="tank${alert ? ' has-alert' : ''}${beer ? '' : ' is-empty'}" data-tank="${t.id}" aria-label="${esc(t.id)}: ${esc(beer ? beer.name : t.phase)}, ${esc(t.phase)}">
        <span class="tank__vessel"><span class="tank__liquid" style="height:${fill}%"></span>${t.phase === 'Fermenting' ? '<span class="tank__bubbles"><i></i><i></i><i></i></span>' : ''}</span>
        <span class="tank__info">
          <span class="tank__top"><span class="tank__id">${t.id}</span>${alert ? statusChip('warning', 'Temp') : t.phase === 'Ready to package' ? statusChip('good', 'Ready') : ''}</span>
          <span class="tank__beer">${beer ? beerChip(t.beer) : ''}<span>${esc(label)}</span></span>
          <span class="tank__phase">${esc(t.phase)}${t.total > 1 ? ` · day ${t.day}/${t.total}` : ''}</span>
          <span class="tank__stats">${beer ? `<span>${icon('thermo')}<b data-tank-temp="${t.id}">${t.temp.toFixed(1)}</b>°</span><span>${icon('drop')}${t.sg.toFixed(3)}</span>` : `<span>${icon('clock')}${t.phase === 'Cleaning' ? 'Done 14:30' : 'Next fill in 4 days'}</span>`}</span>
          ${t.total > 1 ? `<span class="tank__progress">${meterHTML(phaseProgress, 1, 'good', null, 'Progress')}</span>` : ''}
        </span>
      </button>`;
  }
  function bindTanks(root) { $$('[data-tank]', root).forEach(b => b.addEventListener('click', () => openTank(b.dataset.tank))); }

  function feedItemHTML(e, isNew) {
    return `<li class="${isNew ? 'is-new' : ''}"><span class="feed__icon">${icon(e.icon)}</span><div style="min-width:0"><p class="feed__title">${esc(e.title)}</p><p class="feed__meta">${esc(e.meta)}</p></div><div class="feed__right">${e.amount != null ? `<span class="feed__amount">${Fmt.kr(e.amount)}</span>` : ''}<span class="feed__time">${Fmt.time(e.t)}</span></div></li>`;
  }

  /* ======================================================================
     VIEW: Overview
     ====================================================================== */
  function viewOverview() {
    const r = rangeInfo(state.range);
    const cur = metrics(r.start, r.end), prev = metrics(r.prevStart, r.prevEnd);
    const s = series(r, d => d.total);
    const todayRev = D.days[LAST].total;
    const weekStart = LAST - ((D.today.getDay() + 6) % 7);
    const weekRev = sum(weekStart, LAST, d => d.total);
    const months = monthly(1);
    const mtd = months[0];
    const dim = new Date(D.today.getFullYear(), D.today.getMonth() + 1, 0).getDate();
    const pace = mtd.target * D.today.getDate() / dim;
    const sparkOf = fn => resample(series(r, fn).cur, 16);

    const chTotals = D.CHANNELS.map(c => ({ c, v: sum(r.start, r.end, d => d.rev[c.id]), p: sum(r.prevStart, r.prevEnd, d => d.rev[c.id]) }));
    const mixTotal = chTotals.reduce((a, x) => a + x.v, 0);
    const mover = chTotals.slice().sort((a, b) => Math.abs(b.v / b.p - 1) - Math.abs(a.v / a.p - 1))[0];

    const beers = beerRevenue(r.start, r.end).sort((a, b) => b.value - a.value);
    const lowStock = D.SKUS.slice().sort((a, b) => a.cover - b.cover).slice(0, 5);
    const inProcess = D.TANKS.reduce((a, t) => a + t.vol, 0);

    registry = {
      revenue: {
        render: host => Charts.lineChart(host, {
          title: 'Revenue over time', labels: s.labels, height: 270,
          series: [{ name: r.label, values: s.cur, color: 'var(--s1)', area: true, primary: true }, { name: 'Previous period', values: s.prev, color: 'var(--deemph)' }],
          fmt: Fmt.kr, endLabel: true, endFormat: Fmt.krc,
          xFormat: d => Fmt.day(d), tipTitle: i => r.gran === 'day' ? Fmt.dayLong(s.labels[i]) : `Week of ${Fmt.day(s.labels[i])}`
        }),
        table: () => ({ cols: [{ key: 'date', label: r.gran === 'day' ? 'Day' : 'Week of' }, { key: 'cur', label: 'Revenue', align: 'right', format: Fmt.kr }, { key: 'prev', label: 'Previous period', align: 'right', format: v => (v == null ? '—' : Fmt.kr(v)) }, { key: 'd', label: 'Change', align: 'right' }],
          rows: s.labels.map((d, i) => ({ date: Fmt.dayLong(d), cur: s.cur[i], prev: s.prev[i], d: s.prev[i] ? Fmt.signedPct(s.cur[i] / s.prev[i] - 1) : '—' })).reverse() })
      },
      beers: {
        render: host => Charts.hbars(host, { rows: beers.map(b => ({ label: b.beer.name, value: b.value, swatch: b.beer.label, extra: [{ value: Fmt.pct(b.value / cur.rev), label: 'of revenue', kind: 'none' }] })), fmt: Fmt.krc, color: 'var(--s1)', seriesName: 'Revenue' }),
        table: () => ({ cols: [{ key: 'name', label: 'Beer' }, { key: 'style', label: 'Style' }, { key: 'v', label: 'Revenue', align: 'right', format: Fmt.kr }, { key: 'share', label: 'Share', align: 'right' }],
          rows: beers.map(b => ({ name: b.beer.name, style: b.beer.style, v: b.value, share: Fmt.pct(b.value / cur.rev) })) })
      }
    };

    return `
      ${pageHead('Command center', `${greeting()}. Here's everything happening at Christiania Bryghus right now.`,
        `<button type="button" class="btn" data-action="export-overview">${icon('download')}Export</button><button type="button" class="btn btn--primary" data-action="new-order">${icon('plus')}New order</button>`)}
      ${filtersHTML(false)}

      <div class="grid">
        <section class="card hero-card col-5" aria-label="Revenue">
          <p class="kpi__label">${icon('trend')}Revenue · ${esc(r.label.toLowerCase())}</p>
          <p class="hero-figure" data-count="${Math.round(cur.rev)}">${Fmt.num(cur.rev)}<small>kr</small></p>
          <div class="hero-meta">${deltaChip(cur.rev / prev.rev - 1)}<span>vs ${Fmt.krc(prev.rev)} in the ${esc(r.vs)}</span></div>
          <div class="hero-split">
            <div><span>Today so far</span><strong data-live="today-total">${Fmt.kr(todayRev)}</strong></div>
            <div><span>This week</span><strong data-live="week-total">${Fmt.krc(weekRev)}</strong></div>
            <div><span>Gross margin</span><strong>${Fmt.pct(cur.margin)}</strong></div>
          </div>
          <div class="hero-target">
            <div class="hero-target__row"><span>${esc(D.today.toLocaleDateString('en-GB', { month: 'long' }))} target</span><span><strong>${Fmt.krc(mtd.actual)}</strong> of ${Fmt.krc(mtd.target)} · ${Fmt.pct(mtd.actual / mtd.target, 0)}</span></div>
            ${meterHTML(mtd.actual, mtd.target, 'good', pace, 'Month to date versus target')}
            <div class="hero-target__row" style="margin:8px 0 0"><span>Marker shows where we should be by today</span><span>${mtd.actual >= pace ? statusChip('good', 'Ahead of pace') : statusChip('warning', 'Behind pace')}</span></div>
          </div>
        </section>
        <div class="kpis col-7">
          ${kpiHTML({ icon: 'drop', label: 'Volume sold', value: `${Fmt.dec(cur.hl, 1)}<small>hL</small>`, delta: deltaChip(cur.hl / prev.hl - 1), foot: `vs ${Fmt.dec(prev.hl, 1)} hL`, spark: sparkOf(d => D.CHANNELS.reduce((a, c) => a + d.rev[c.id] / c.perL, 0)) })}
          ${kpiHTML({ icon: 'gauge', label: 'Gross margin', value: Fmt.pct(cur.margin), delta: deltaChip(cur.margin - prev.margin, true, 'pp'), foot: 'mix-weighted, all channels', spark: sparkOf(d => D.CHANNELS.reduce((a, c) => a + d.rev[c.id] * c.margin, 0) / (d.total || 1)) })}
          ${kpiHTML({ icon: 'receipt', label: 'Orders (B2B + webshop)', value: Fmt.num(cur.orders), delta: deltaChip(cur.orders / prev.orders - 1), foot: `avg ${Fmt.kr(cur.aov)}`, spark: sparkOf(d => d.rev.webshop / 420 + d.rev.retail / 2900 + d.rev.ontrade / 2300) })}
          ${kpiHTML({ icon: 'users', label: 'Guests (taproom + walks)', value: Fmt.num(cur.guests), delta: deltaChip(cur.guests / prev.guests - 1), foot: `avg spend ${Fmt.kr(D.CHANNELS[0].spend)}`, spark: sparkOf(d => d.rev.taproom / 118 + d.rev.events / 295) })}
        </div>
      </div>

      <div class="grid">
        ${chartCard('revenue', { cls: 'col-8', title: 'Revenue over time', sub: r.gran === 'day' ? 'Daily, all channels' : 'Weekly, all channels', legend: [{ name: r.label, color: 'var(--s1)', kind: 'line' }, { name: 'Previous period', color: 'var(--deemph)', kind: 'line' }] })}
        <section class="card col-4" aria-labelledby="t-mix">
          <header class="card__head"><div><h2 class="card__title" id="t-mix">Channel mix</h2><p class="card__sub">${esc(r.label)} · share of revenue</p></div></header>
          <div class="card__body" data-mix></div>
          <ul class="channel-list">${chTotals.map(x => `<li><span class="key key--rect" style="background:${CH_COLOR[x.c.id]}"></span><span>${esc(x.c.name)}</span><span class="channel-list__share">${Fmt.pct(x.v / mixTotal, 0)}</span><span class="channel-list__amount">${Fmt.krc(x.v)}</span></li>`).join('')}</ul>
          <footer class="card__foot"><span>Biggest mover: <strong style="color:var(--text-1)">${esc(mover.c.short)}</strong></span>${deltaChip(mover.v / mover.p - 1)}</footer>
        </section>
      </div>

      <div class="grid">
        <section class="card col-8" aria-labelledby="t-tanks">
          <header class="card__head"><div><h2 class="card__title" id="t-tanks">Cellar · live</h2><p class="card__sub">${D.TANKS.filter(t => t.beer).length} of ${D.TANKS.length} tanks in use · ${Fmt.num(inProcess)} L in process</p></div><div class="card__tools"><a class="link" href="#/production">Production plan ${icon('chevron')}</a></div></header>
          <div class="tanks">${D.TANKS.map(tankCardHTML).join('')}</div>
        </section>
        <section class="card col-4" aria-labelledby="t-alerts">
          <header class="card__head"><div><h2 class="card__title" id="t-alerts">Needs attention</h2><p class="card__sub">${state.alerts.filter(a => a.level !== 'good').length} open items</p></div></header>
          <div class="card__body" data-alerts>${alertsHTML(state.alerts.slice(0, 6))}</div>
          <footer class="card__foot"><span>${state.alerts.length} alerts in total</span><button type="button" class="link" data-action="all-alerts">See all ${icon('chevron')}</button></footer>
        </section>
      </div>

      <div class="grid">
        ${chartCard('beers', { cls: 'col-4', title: 'Top beers', sub: `Revenue · ${r.label.toLowerCase()}` })}
        <section class="card col-4" aria-labelledby="t-stock">
          <header class="card__head"><div><h2 class="card__title" id="t-stock">Lowest stock cover</h2><p class="card__sub">Days of sales left · target 14+</p></div><div class="card__tools"><a class="link" href="#/inventory">Inventory ${icon('chevron')}</a></div></header>
          <ul class="mini-list">${lowStock.map(sk => `<li><span class="mini-list__name">${beerChip(sk.beer)}<span>${esc(D.beerById[sk.beer].short)} · ${esc(sk.format.split(' · ')[0])}</span></span><span class="mini-list__value">${Fmt.dec(sk.cover, 1)} days</span>${meterHTML(Math.min(sk.cover, 30), 30, sk.status === 'over' ? 'good' : sk.status, 14, 'Days of cover')}<span class="mini-list__sub">${sk.available} ${sk.unit} available</span>${sk.status === 'critical' ? statusChip('critical', 'Critical') : sk.status === 'warning' ? statusChip('warning', 'Low') : statusChip('good', 'OK')}</li>`).join('')}</ul>
        </section>
        <section class="card col-4" aria-labelledby="t-feed">
          <header class="card__head"><div><h2 class="card__title" id="t-feed">Live activity</h2><p class="card__sub">Sales, bookings and cellar readings as they happen</p></div><span class="status status--good">${icon('check')}Streaming</span></header>
          <ul class="feed" data-feed>${state.activity.slice(0, 14).map(e => feedItemHTML(e)).join('')}</ul>
        </section>
      </div>`;
  }
  function afterOverview(root) {
    const r = rangeInfo(state.range);
    const mixHost = $('[data-mix]', root);
    mixHost.appendChild(Charts.segBar(D.CHANNELS.map(c => ({ name: c.name, value: sum(r.start, r.end, d => d.rev[c.id]), color: CH_COLOR[c.id] })), { fmt: Fmt.krc }));
    bindTanks(root);
    bindAlerts($('[data-alerts]', root), state.alerts.slice(0, 6));
    const fig = $('[data-count]', root);
    if (fig && !reduced) countUp(fig, Number(fig.dataset.count), v => `${Fmt.num(v)}<small>kr</small>`);
  }

  /* ======================================================================
     VIEW: Sales
     ====================================================================== */
  function viewSales() {
    const r = rangeInfo(state.range);
    const ch = state.channel;
    const cur = metrics(r.start, r.end, ch), prev = metrics(r.prevStart, r.prevEnd, ch);
    const sparkOf = fn => resample(series(r, fn).cur, 16);
    const months = monthly(12);
    const beers = beerRevenue(r.start, r.end, ch).sort((a, b) => b.value - a.value);
    const multi = D.CHANNELS.map(c => ({ c, s: series(r, d => d.rev[c.id]) }));
    const sharedMax = Math.max(...multi.flatMap(m => m.s.cur));
    const chName = ch === 'all' ? 'All channels' : chById[ch].name;

    registry = {
      monthly: {
        render: host => Charts.columnChart(host, {
          title: 'Monthly revenue vs target', values: months.map(m => m.actual), targets: months.map(m => m.target), color: 'var(--s1)', height: 260,
          fmt: Fmt.kr, compactFmt: Fmt.krc, seriesName: 'Revenue', labelIndex: months.length - 2,
          axisFormat: i => Fmt.month(months[i].date), labelFormat: i => Fmt.monthYear(months[i].date) + (months[i].partial ? ' (month to date)' : ''),
          partial: i => months[i].partial
        }),
        table: () => ({ cols: [{ key: 'm', label: 'Month' }, { key: 'a', label: 'Revenue', align: 'right', format: Fmt.kr }, { key: 't', label: 'Target', align: 'right', format: Fmt.kr }, { key: 'd', label: 'vs target', align: 'right' }],
          rows: months.map(m => ({ m: Fmt.monthYear(m.date) + (m.partial ? ' · MTD' : ''), a: m.actual, t: m.target, d: Fmt.signedPct(m.actual / m.target - 1) })).reverse() })
      },
      salesBeers: {
        render: host => Charts.hbars(host, { rows: beers.map(b => ({ label: b.beer.name, value: b.value, swatch: b.beer.label, extra: [{ value: Fmt.pct(b.value / (cur.rev || 1)), label: 'share', kind: 'none' }] })), fmt: Fmt.krc, color: 'var(--s1)', seriesName: 'Revenue' }),
        table: () => ({ cols: [{ key: 'name', label: 'Beer' }, { key: 'v', label: 'Revenue', align: 'right', format: Fmt.kr }, { key: 's', label: 'Share', align: 'right' }], rows: beers.map(b => ({ name: b.beer.name, v: b.value, s: Fmt.pct(b.value / (cur.rev || 1)) })) })
      }
    };
    multi.forEach(m => {
      registry['mc-' + m.c.id] = {
        render: host => Charts.lineChart(host, {
          title: m.c.name, labels: m.s.labels, height: 110, ticks: 2, headroom: sharedMax / Math.max(...m.s.cur) * 1.04,
          series: [{ name: m.c.short, values: m.s.cur, color: CH_COLOR[m.c.id], area: true, primary: true }],
          fmt: Fmt.kr, tickFormat: v => Fmt.compact(v), xFormat: d => Fmt.day(d),
          tipTitle: i => r.gran === 'day' ? Fmt.dayLong(m.s.labels[i]) : `Week of ${Fmt.day(m.s.labels[i])}`
        }),
        table: () => ({ cols: [{ key: 'd', label: 'Period' }, { key: 'v', label: 'Revenue', align: 'right', format: Fmt.kr }], rows: m.s.labels.map((d, i) => ({ d: Fmt.day(d), v: m.s.cur[i] })).reverse() })
      };
    });

    const orders = D.ORDERS.filter(o => (D.today - new Date(o.date.getFullYear(), o.date.getMonth(), o.date.getDate())) / D.DAY < r.len && (ch === 'all' || o.channel === ch));
    const ORDER_STATUS = { Delivered: 'good', Shipped: 'info', Packing: 'neutral', 'Pending payment': 'warning', Overdue: 'critical' };
    const ordersCfg = {
      rows: orders, defaultSort: 'date', pageSize: 15, search: o => `${o.id} ${o.customer} ${o.items} ${o.status}`,
      empty: ch === 'taproom' || ch === 'events' ? 'Taproom and walk-in sales have no orders. See The Lab or Bookings views.' : 'No orders match.',
      cols: [
        { key: 'id', label: 'Order', cls: 'strong' },
        { key: 'date', label: 'Date', text: o => `${Fmt.day(o.date)}, ${Fmt.time(o.date)}`, sort: o => o.date.getTime(), csv: o => o.date.toISOString() },
        { key: 'customer', label: 'Customer' },
        { key: 'channel', label: 'Channel', html: o => `<span class="legend__item"><span class="key key--rect" style="background:${CH_COLOR[o.channel]}"></span>${esc(chById[o.channel].short)}</span>`, csv: o => chById[o.channel].name },
        { key: 'items', label: 'Items', cls: 'muted' },
        { key: 'amount', label: 'Amount', align: 'right', text: o => Fmt.kr(o.amount) },
        { key: 'status', label: 'Status', html: o => statusChip(ORDER_STATUS[o.status], o.status) }
      ]
    };
    state._orders = ordersCfg;

    return `
      ${pageHead('Sales & revenue', `Where the money comes from, ${esc(chName.toLowerCase())}.`, `<button type="button" class="btn" data-action="export-orders">${icon('download')}Export orders</button>`)}
      ${filtersHTML(true)}
      <div class="kpis kpis--4" style="margin-bottom:16px">
        ${kpiHTML({ icon: 'trend', label: 'Revenue', value: Fmt.krc(cur.rev), delta: deltaChip(cur.rev / prev.rev - 1), foot: `vs ${Fmt.krc(prev.rev)}`, spark: sparkOf(d => revOf(d, ch)) })}
        ${kpiHTML({ icon: 'drop', label: 'Volume', value: `${Fmt.dec(cur.hl, 1)}<small>hL</small>`, delta: deltaChip(cur.hl / prev.hl - 1), foot: `vs ${Fmt.dec(prev.hl, 1)} hL` })}
        ${kpiHTML({ icon: 'gauge', label: 'Gross margin', value: Fmt.pct(cur.margin), delta: deltaChip(cur.margin - prev.margin, true, 'pp'), foot: 'after cost of goods' })}
        ${cur.orders > 0 ? kpiHTML({ icon: 'receipt', label: 'Average order', value: Fmt.kr(cur.aov), delta: deltaChip(cur.aov / prev.aov - 1), foot: `${Fmt.num(cur.orders)} orders` }) : kpiHTML({ icon: 'users', label: 'Guests', value: Fmt.num(cur.guests), delta: deltaChip(cur.guests / prev.guests - 1), foot: 'walk-in & bookings' })}
      </div>
      <section class="card" style="margin-bottom:16px" aria-labelledby="t-multi">
        <header class="card__head"><div><h2 class="card__title" id="t-multi">Revenue by channel</h2><p class="card__sub">${r.gran === 'day' ? 'Daily' : 'Weekly'} · same scale on every chart, so heights compare directly</p></div></header>
        <div class="multiples">${multi.map(m => {
          const tot = m.s.cur.reduce((a, v) => a + v, 0), ptot = m.s.prev.reduce((a, v) => a + (v || 0), 0);
          return `<div class="multiple" ${ch !== 'all' && ch !== m.c.id ? 'style="opacity:.4"' : ''}><p class="multiple__name"><span class="key key--rect" style="background:${CH_COLOR[m.c.id]}"></span>${esc(m.c.name)}</p><p class="multiple__value">${Fmt.krc(tot)}</p><div class="multiple__foot">${deltaChip(tot / ptot - 1)}<span class="card__sub" style="margin:0">${Fmt.pct(tot / (metrics(r.start, r.end).rev || 1), 0)} of total</span></div><div data-chart="mc-${m.c.id}"></div></div>`;
        }).join('')}</div>
      </section>
      <div class="grid">
        ${chartCard('monthly', { cls: 'col-8', title: 'Monthly revenue vs target', sub: 'All channels · target = same month last year + 12% · faded bar = month to date', legend: [{ name: 'Revenue', color: 'var(--s1)' }, { name: 'Target', color: 'var(--text-1)', kind: 'line' }] })}
        ${chartCard('salesBeers', { cls: 'col-4', title: 'Revenue by beer', sub: `${chName} · ${r.label.toLowerCase()}` })}
      </div>
      <section class="card card--flush" aria-labelledby="t-orders">
        <header class="card__head"><div><h2 class="card__title" id="t-orders">Orders</h2><p class="card__sub">${orders.length} orders · ${esc(r.len > 45 ? 'last 45 days shown' : r.label.toLowerCase())}</p></div><div class="table-tools"><label class="sr-only" for="q-orders">Search orders</label><input class="input" id="q-orders" type="search" placeholder="Search orders…" data-search="orders"></div></header>
        <div data-table="orders"></div>
      </section>`;
  }
  function afterSales() {
    dataTable('orders', state._orders);
    bindTableSearch('orders', state._orders);
  }

  /* ======================================================================
     VIEW: Inventory
     ====================================================================== */
  function viewInventory(prefill) {
    const stockValue = D.SKUS.reduce((a, s) => a + s.value, 0);
    const atRisk = D.SKUS.filter(s => s.status === 'critical' || s.status === 'warning');
    const kegs = Object.fromEntries(D.KEGS.map(k => [k.id, k.count]));
    const poTotal = D.PURCHASE_ORDERS.reduce((a, p) => a + p.amount, 0);
    const SKU_STATUS = { critical: ['critical', 'Critical'], warning: ['warning', 'Low'], good: ['good', 'Healthy'], over: ['neutral', 'Overstock'] };
    const skuCfg = {
      rows: D.SKUS, defaultSort: 'cover', defaultDir: 'asc', q: prefill || '',
      search: s => `${s.sku} ${D.beerById[s.beer].name} ${s.format}`,
      cols: [
        { key: 'sku', label: 'SKU', cls: 'strong' },
        { key: 'beer', label: 'Product', html: s => `<span class="cell-beer">${beerChip(s.beer)}<span>${esc(D.beerById[s.beer].name)}<small>${esc(s.format)}</small></span></span>`, sort: s => D.beerById[s.beer].name, csv: s => `${D.beerById[s.beer].name} — ${s.format}` },
        { key: 'onHand', label: 'On hand', align: 'right', text: s => Fmt.num(s.onHand) },
        { key: 'reserved', label: 'Reserved', align: 'right', text: s => Fmt.num(s.reserved) },
        { key: 'available', label: 'Available', align: 'right', text: s => `${Fmt.num(s.available)} ${s.unit}` },
        { key: 'daily', label: 'Sells / day', align: 'right', text: s => Fmt.dec(s.daily) },
        { key: 'cover', label: 'Days of cover', html: s => `<div style="display:grid;grid-template-columns:1fr 64px;gap:10px;align-items:center">${meterHTML(Math.min(s.cover, 45), 45, s.status === 'over' ? 'good' : s.status, 14, 'Days of cover')}<span class="num">${s.cover > 99 ? '99+' : Fmt.dec(s.cover, 1)} d</span></div>`, csv: s => s.cover.toFixed(1) },
        { key: 'value', label: 'Stock value', align: 'right', text: s => Fmt.kr(s.value) },
        { key: 'status', label: 'Status', html: s => statusChip(...SKU_STATUS[s.status]), sort: s => s.cover, csv: s => SKU_STATUS[s.status][1] }
      ]
    };
    state._skus = skuCfg;
    const groups = [...new Set(D.MATERIALS.map(m => m.group))];

    return `
      ${pageHead('Inventory', 'Finished beer, raw materials, packaging and the keg fleet.', `<button type="button" class="btn" data-action="export-skus">${icon('download')}Export stock list</button><button type="button" class="btn btn--primary" data-action="new-po">${icon('plus')}Purchase order</button>`)}
      <div class="kpis kpis--4" style="margin-bottom:16px">
        ${kpiHTML({ icon: 'box', label: 'Finished goods value', value: Fmt.krc(stockValue), foot: `${D.SKUS.length} SKUs · wholesale prices` })}
        ${kpiHTML({ icon: 'alert', label: 'SKUs under 14 days', value: String(atRisk.length), delta: atRisk.some(s => s.status === 'critical') ? statusChip('critical', `${atRisk.filter(s => s.status === 'critical').length} critical`) : '', foot: 'brew or reallocate soon' })}
        ${kpiHTML({ icon: 'keg', label: 'Kegs with customers', value: Fmt.num(kegs.market + kegs.overdue), delta: statusChip('serious', `${kegs.overdue} overdue`), foot: `of ${Fmt.num(D.KEGS.reduce((a, k) => a + k.count, 0))} in the fleet` })}
        ${kpiHTML({ icon: 'truck', label: 'Open purchase orders', value: String(D.PURCHASE_ORDERS.length), foot: `${Fmt.kr(poTotal)} on order` })}
      </div>
      <section class="card card--flush" style="margin-bottom:16px" aria-labelledby="t-skus">
        <header class="card__head"><div><h2 class="card__title" id="t-skus">Finished goods</h2><p class="card__sub">Sorted by days of cover · the marker on each bar is the 14-day reorder line</p></div><div class="table-tools"><label class="sr-only" for="q-skus">Search stock</label><input class="input" id="q-skus" type="search" placeholder="Search beer or SKU…" data-search="skus"></div></header>
        <div data-table="skus"></div>
      </section>
      <div class="grid">
        <section class="card col-7" aria-labelledby="t-mat">
          <header class="card__head"><div><h2 class="card__title" id="t-mat">Raw materials & packaging</h2><p class="card__sub">On hand vs storage capacity · marker = reorder point</p></div><div class="legend"><span class="legend__item">${statusChip('warning', 'Below reorder')}</span><span class="legend__item">${statusChip('critical', 'Below safety stock')}</span></div></header>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:4px 32px">
            ${groups.map(g => `<div><p class="sb-nav__group" style="padding:6px 0">${esc(g)}</p><ul class="mini-list">${D.MATERIALS.filter(m => m.group === g).map(m => `<li><span class="mini-list__name"><span>${esc(m.name)}</span>${m.status !== 'good' ? statusChip(m.status, m.status === 'critical' ? 'Critical' : 'Low') : ''}</span><span class="mini-list__value">${Fmt.num(m.onHand)} <span class="mini-list__sub">/ ${Fmt.num(m.cap)} ${esc(m.unit)}</span></span>${meterHTML(m.onHand, m.cap, m.status, m.reorder, m.name)}</li>`).join('')}</ul></div>`).join('')}
          </div>
        </section>
        <div class="col-5" style="display:grid;gap:16px;align-content:start">
          <section class="card" aria-labelledby="t-kegs">
            <header class="card__head"><div><h2 class="card__title" id="t-kegs">Keg fleet</h2><p class="card__sub">${Fmt.num(D.KEGS.reduce((a, k) => a + k.count, 0))} kegs · 20L and 30L</p></div></header>
            <div data-kegs></div>
            <ul class="channel-list">${D.KEGS.map((k, i) => `<li><span class="key key--rect" style="background:var(--s${i + 1})"></span><span>${esc(k.name)}</span><span class="channel-list__share">${Fmt.pct(k.count / D.KEGS.reduce((a, x) => a + x.count, 0), 0)}</span><span class="channel-list__amount">${k.count}</span></li>`).join('')}</ul>
          </section>
          <section class="card" aria-labelledby="t-po">
            <header class="card__head"><div><h2 class="card__title" id="t-po">Incoming deliveries</h2><p class="card__sub">Open purchase orders</p></div></header>
            <ul class="mini-list">${D.PURCHASE_ORDERS.slice().sort((a, b) => a.eta - b.eta).map(p => `<li><span class="mini-list__name"><span>${esc(p.supplier)}</span></span><span class="mini-list__value">${Fmt.kr(p.amount)}</span><span class="mini-list__sub">${esc(p.id)} · ${esc(p.items)}</span><span class="mini-list__sub" style="text-align:right">${statusChip(p.status === 'Awaiting supplier' ? 'warning' : p.status === 'In transit' ? 'info' : 'good', p.status)} ETA ${Fmt.dayLong(p.eta)}</span></li>`).join('')}</ul>
          </section>
        </div>
      </div>`;
  }
  function afterInventory(root) {
    dataTable('skus', state._skus);
    bindTableSearch('skus', state._skus);
    $('[data-kegs]', root).appendChild(Charts.segBar(D.KEGS.map((k, i) => ({ name: k.name, value: k.count, color: `var(--s${i + 1})` })), { fmt: v => `${v} kegs` }));
  }

  /* ======================================================================
     VIEW: Production
     ====================================================================== */
  function viewProduction() {
    const inProcess = D.TANKS.reduce((a, t) => a + t.vol, 0);
    const inUse = D.TANKS.filter(t => t.beer).length;
    const nextBrew = D.PLAN.flatMap(p => p.segments.filter(s => s.phase === 'Brew day' && s.start > 0).map(s => ({ ...s, tank: p.tank }))).sort((a, b) => a.start - b.start)[0];
    const avgYield = D.BATCHES.reduce((a, b) => a + b.yield, 0) / D.BATCHES.length;
    const phaseIdx = { 'Brew day': 1, Fermenting: 2, Conditioning: 3, Packaging: 4 };
    const batchRows = D.TANKS.filter(t => t.batch).map(t => ({ id: t.batch, beer: t.beer, date: D.addDays(D.today, -t.day), og: t.og, fg: t.sg, abv: t.abv, vol: t.vol, yield: null, status: `${t.phase} · ${t.id}`, live: true })).concat(D.BATCHES);
    const batchCfg = {
      rows: batchRows, defaultSort: 'date', pageSize: 12, search: b => `${b.id} ${D.beerById[b.beer].name} ${b.status}`,
      cols: [
        { key: 'id', label: 'Batch', cls: 'strong' },
        { key: 'beer', label: 'Beer', html: b => `<span class="cell-beer">${beerChip(b.beer)}<span>${esc(D.beerById[b.beer].name)}</span></span>`, sort: b => D.beerById[b.beer].name, csv: b => D.beerById[b.beer].name },
        { key: 'date', label: 'Brewed', text: b => Fmt.day(b.date), sort: b => b.date.getTime(), csv: b => b.date.toISOString().slice(0, 10) },
        { key: 'og', label: 'OG', align: 'right', text: b => b.og.toFixed(3) },
        { key: 'fg', label: 'FG / current', align: 'right', text: b => b.fg.toFixed(3) },
        { key: 'abv', label: 'ABV', align: 'right', text: b => b.abv.toFixed(1) + '%' },
        { key: 'vol', label: 'Volume', align: 'right', text: b => Fmt.num(b.vol) + ' L' },
        { key: 'yield', label: 'Yield', align: 'right', text: b => (b.yield ? b.yield.toFixed(1) + '%' : '—'), sort: b => b.yield || 0 },
        { key: 'status', label: 'Status', html: b => statusChip(b.live ? 'info' : 'good', b.status) }
      ]
    };
    state._batches = batchCfg;

    registry = {
      plan: {
        render: host => Charts.gantt(host, {
          from: -7, to: 22, dateOf: d => D.addDays(D.today, d),
          rows: D.PLAN.map(p => { const t = D.TANKS.find(x => x.id === p.tank); return { label: p.tank, sub: `${t.type} · ${Fmt.num(t.cap)} L`, segments: p.segments }; }),
          colorOf: s => (s.phase === 'Cleaning' ? 'var(--surface-3)' : `var(--ord-${phaseIdx[s.phase]})`),
          inkOf: s => (s.phase === 'Cleaning' ? 'var(--text-3)' : `var(--ord-ink-${phaseIdx[s.phase]})`),
          labelOf: s => (s.phase === 'Cleaning' ? 'CIP' : s.beer ? D.beerById[s.beer].short : ''),
          tipRows: s => [
            { value: s.beer ? D.beerById[s.beer].name : 'Cleaning (CIP)', label: '', kind: 'none' },
            { value: `${Fmt.dayLong(D.addDays(D.today, s.start))} → ${Fmt.dayLong(D.addDays(D.today, s.end - 1))}`, label: '', kind: 'none' },
            { value: `${s.end - s.start} day${s.end - s.start > 1 ? 's' : ''}`, label: s.start <= 0 && s.end > 0 ? 'in progress' : s.end <= 0 ? 'done' : 'planned', kind: 'none' }
          ]
        }),
        table: () => ({ cols: [{ key: 'tank', label: 'Tank' }, { key: 'phase', label: 'Phase' }, { key: 'beer', label: 'Beer' }, { key: 'from', label: 'Start' }, { key: 'to', label: 'End' }, { key: 'days', label: 'Days', align: 'right' }],
          rows: D.PLAN.flatMap(p => p.segments.filter(s => s.end > -7 && s.start < 22).map(s => ({ tank: p.tank, phase: s.phase, beer: s.beer ? D.beerById[s.beer].name : '—', from: Fmt.dayLong(D.addDays(D.today, s.start)), to: Fmt.dayLong(D.addDays(D.today, s.end - 1)), days: s.end - s.start }))) })
      }
    };

    return `
      ${pageHead('Production', 'The cellar, the brew plan and every batch we have made.', `<button type="button" class="btn" data-action="log-reading">${icon('thermo')}Log reading</button><button type="button" class="btn btn--primary" data-action="plan-brew">${icon('plus')}Plan a brew</button>`)}
      <div class="kpis kpis--4" style="margin-bottom:16px">
        ${kpiHTML({ icon: 'drop', label: 'Beer in process', value: `${Fmt.num(inProcess)}<small>L</small>`, foot: `${Fmt.dec(inProcess / 100, 1)} hL across ${inUse} tanks` })}
        ${kpiHTML({ icon: 'flask', label: 'Tank utilisation', value: Fmt.pct(inUse / D.TANKS.length, 0), foot: `${inUse} of ${D.TANKS.length} tanks in use` })}
        ${kpiHTML({ icon: 'calendar', label: 'Next brew day', value: esc(Fmt.dayLong(D.addDays(D.today, nextBrew.start))), foot: `${D.beerById[nextBrew.beer].name} → ${nextBrew.tank}` })}
        ${kpiHTML({ icon: 'gauge', label: 'Average brewhouse yield', value: Fmt.pct(avgYield / 100), foot: `last ${D.BATCHES.length} batches` })}
      </div>
      <section class="card" style="margin-bottom:16px" aria-labelledby="t-cellar">
        <header class="card__head"><div><h2 class="card__title" id="t-cellar">Cellar</h2><p class="card__sub">Click a tank for its fermentation curve, readings and actions</p></div></header>
        <div class="tanks">${D.TANKS.map(tankCardHTML).join('')}</div>
      </section>
      <div class="grid">
        ${chartCard('plan', { cls: 'col-12', title: 'Production plan', sub: 'Last week and the next three weeks · the highlighted column is today', legend: D.PHASES.map((p, i) => ({ name: p, color: `var(--ord-${i + 1})` })).concat([{ name: 'Cleaning (CIP)', color: 'var(--surface-3)' }]) })}
      </div>
      <section class="card card--flush" aria-labelledby="t-batches">
        <header class="card__head"><div><h2 class="card__title" id="t-batches">Batch log</h2><p class="card__sub">Batches in tanks and recently packaged</p></div><div class="table-tools"><label class="sr-only" for="q-b">Search batches</label><input class="input" id="q-b" type="search" placeholder="Search batches…" data-search="batches"><button type="button" class="btn btn--sm" data-action="export-batches">${icon('download')}CSV</button></div></header>
        <div data-table="batches"></div>
      </section>`;
  }
  function afterProduction(root) {
    bindTanks(root);
    const host = $('[data-chart="plan"]', root);
    host.classList.add('gantt-scroll');
    dataTable('batches', state._batches);
    bindTableSearch('batches', state._batches);
  }

  /* ======================================================================
     VIEW: Taproom
     ====================================================================== */
  function viewTaproom() {
    const todayRev = D.days[LAST].rev.taproom;
    const wd = D.today.getDay();
    const [open, close] = D.OPEN_HOURS[wd];
    const hr = new Date().getHours() + new Date().getMinutes() / 60;
    const isOpen = hr >= open && hr < close;
    const lastWeekSame = D.days[LAST - 7].rev.taproom;
    const typicalSoFar = D.typicalToday.reduce((a, v, i) => a + (v != null && D.HOURS[i] + 1 <= hr ? v : 0), 0);
    const pours = D.TAPS.reduce((a, t) => a + t.pours, 0);
    const top = D.TAPS.slice().sort((a, b) => b.pours - a.pours).slice(0, 6);
    const dayName = D.today.toLocaleDateString('en-GB', { weekday: 'long' });
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayLong = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    registry = {
      hourly: {
        render: host => Charts.lineChart(host, {
          title: 'Taproom sales by hour', labels: D.HOURS, height: 250,
          series: [{ name: 'Today', values: D.todayHourly, color: 'var(--s1)', area: true, primary: true }, { name: `Typical ${dayName}`, values: D.typicalToday, color: 'var(--deemph)' }],
          fmt: Fmt.kr, xFormat: hh => `${hh}:00`, tipTitle: i => `${D.HOURS[i]}:00 – ${D.HOURS[i] + 1}:00`
        }),
        table: () => ({ cols: [{ key: 'h', label: 'Hour' }, { key: 't', label: 'Today', align: 'right', format: v => (v == null ? '—' : Fmt.kr(v)) }, { key: 'y', label: `Typical ${dayName}`, align: 'right', format: v => (v == null ? 'Closed' : Fmt.kr(v)) }],
          rows: D.HOURS.map((hh, i) => ({ h: `${hh}:00`, t: D.todayHourly[i], y: D.typicalToday[i] })) })
      },
      topTaps: {
        render: host => Charts.hbars(host, { rows: top.map(t => ({ label: t.name, value: t.pours, swatch: t.beer ? D.beerById[t.beer].label : 'var(--surface-3)' })), fmt: v => `${v} pours`, color: 'var(--s1)', seriesName: 'Pours today' }),
        table: () => ({ cols: [{ key: 'name', label: 'Beer' }, { key: 'pours', label: 'Pours today', align: 'right' }], rows: top })
      },
      heat: {
        render: host => Charts.heatmap(host, { rows: dayNames, rowLong: dayLong, cols: D.HOURS.map(String), values: D.HEAT, fmt: Fmt.kr, seriesName: 'avg revenue / hour' }),
        table: () => ({ cols: [{ key: 'd', label: 'Day' }].concat(D.HOURS.map((hh, i) => ({ key: 'h' + i, label: `${hh}:00`, align: 'right', format: v => (v == null ? '—' : Fmt.compact(v)) }))),
          rows: dayLong.map((d, ri) => Object.assign({ d }, ...D.HOURS.map((_, i) => ({ ['h' + i]: D.HEAT[ri][i] })))) })
      }
    };

    const tapStatus = l => (l < 0.1 ? 'critical' : l < 0.25 ? 'warning' : 'good');
    return `
      ${pageHead('The Lab taproom', `Mælkevejen 81A · ${isOpen ? `open now until ${close}:00` : hr < open ? `opens today at ${open}:00` : 'closed for today'}`, `<button type="button" class="btn" data-action="change-keg">${icon('keg')}Change a keg</button>`)}
      <div class="kpis kpis--4" style="margin-bottom:16px">
        ${kpiHTML({ icon: 'trend', label: 'Sales today', value: Fmt.kr(todayRev), live: 'tap-today', delta: typicalSoFar ? deltaChip(todayRev / typicalSoFar - 1) : '', foot: typicalSoFar ? `vs a typical ${dayName} by now` : 'Opens at 12:00' })}
        ${kpiHTML({ icon: 'users', label: 'Guests today', value: Fmt.num(todayRev / 118), live: 'tap-guests', foot: `last ${dayName}: ${Fmt.num(lastWeekSame / 118)}` })}
        ${kpiHTML({ icon: 'beer', label: 'Pours today', value: Fmt.num(pours), live: 'tap-pours', foot: `${D.TAPS.length} taps on` })}
        ${kpiHTML({ icon: 'receipt', label: 'Average spend', value: todayRev ? Fmt.kr(todayRev / Math.max(1, Math.round(todayRev / 118))) : '—', foot: 'per guest · card + MobilePay' })}
      </div>
      <div class="grid">
        ${chartCard('hourly', { cls: 'col-8', title: `Today vs a typical ${dayName}`, sub: 'Revenue per hour · average of the last 8 weeks', legend: [{ name: 'Today', color: 'var(--s1)', kind: 'line' }, { name: `Typical ${dayName}`, color: 'var(--deemph)', kind: 'line' }] })}
        ${chartCard('topTaps', { cls: 'col-4', title: 'Top sellers today', sub: 'Pours since opening' })}
      </div>
      <section class="card" style="margin-bottom:16px" aria-labelledby="t-taps">
        <header class="card__head"><div><h2 class="card__title" id="t-taps">Tap list</h2><p class="card__sub">Keg level per tap · bars turn amber under 25% and red under 10%</p></div></header>
        <div class="taps">${D.TAPS.map(t => `<div class="tap"><div class="tap__top"><span class="tap__name">${t.beer ? beerChip(t.beer) : '<span class="beer-chip" style="background:var(--surface-3)"></span>'}<span>${esc(t.name)}</span></span><span class="tap__no">#${t.tap}</span></div>${meterHTML(t.left, 1, tapStatus(t.left), null, `${t.name} keg level`)}<div class="tap__foot"><span>${Math.round(t.left * 100)}% of ${esc(t.keg)}</span><span data-pours="${t.tap}">${t.pours} pours</span></div>${tapStatus(t.left) !== 'good' ? `<div>${statusChip(tapStatus(t.left), tapStatus(t.left) === 'critical' ? 'Change keg now' : 'Running low')}</div>` : ''}</div>`).join('')}</div>
      </section>
      <div class="grid">
        ${chartCard('heat', { cls: 'col-8', title: 'When is The Lab busy?', sub: 'Average revenue per hour, last 4 weeks' })}
        <section class="card col-4" aria-labelledby="t-shift">
          <header class="card__head"><div><h2 class="card__title" id="t-shift">On shift today</h2><p class="card__sub">${open}:00 – ${close}:00</p></div></header>
          <ul class="mini-list">
            ${[['Sofie', 'Bar lead', '12:00 – 20:00'], ['Malthe', 'Bar', '15:00 – close'], ['Freja', 'BeerWalk guide', '11:30 – 17:00'], ['Jonas', 'Bar + kegs', '17:00 – close']].map(([n, role, t]) => `<li><span class="mini-list__name"><span class="avatar" style="width:28px;height:28px;font-size:12px">${esc(n[0])}</span><span>${esc(n)}</span></span><span class="mini-list__value" style="font-weight:500;color:var(--text-2)">${esc(t)}</span><span class="mini-list__sub" style="padding-left:36px">${esc(role)}</span></li>`).join('')}
          </ul>
          <footer class="card__foot"><span>Staff names are placeholders</span></footer>
        </section>
      </div>`;
  }

  /* ======================================================================
     VIEW: Bookings & community
     ====================================================================== */
  function viewBookings() {
    const walks = D.WALKS.slice().sort((a, b) => a.start - b.start);
    const guests = walks.reduce((a, w) => a + w.booked, 0);
    const seats = walks.reduce((a, w) => a + w.cap, 0);
    const bRev = walks.reduce((a, w) => a + w.booked * w.price, 0);
    const daysToMile = Math.ceil((D.BEER_MILE.date - D.today) / D.DAY);
    const weeks = buckets(LAST - 83, LAST, 'week').map(b => ({ date: D.days[b[0]].date, guests: Math.round(sum(b[0], b[1], d => d.rev.events) / 295) }));

    registry = {
      walkWeeks: {
        render: host => Charts.columnChart(host, { title: 'Weekly guests', values: weeks.map(w => w.guests), color: 'var(--s5)', height: 220, fmt: v => `${Fmt.num(v)} guests`, seriesName: 'Guests', labelIndex: weeks.length - 1, compactFmt: v => Fmt.num(v), axisFormat: i => Fmt.day(weeks[i].date), labelFormat: i => `Week of ${Fmt.day(weeks[i].date)}` }),
        table: () => ({ cols: [{ key: 'w', label: 'Week of' }, { key: 'g', label: 'Guests', align: 'right' }], rows: weeks.map(w => ({ w: Fmt.day(w.date), g: w.guests })).reverse() })
      },
      holders: {
        render: host => Charts.lineChart(host, { title: 'Shareholders', labels: D.SHAREHOLDERS.map(s => s.date), height: 200, yMin: 1500,
          series: [{ name: 'Shareholders', values: D.SHAREHOLDERS.map(s => s.value), color: 'var(--s1)', area: true, primary: true }],
          fmt: v => `${Fmt.num(v)} shareholders`, endLabel: true, endFormat: v => Fmt.num(v), xFormat: d => d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }), tipTitle: i => Fmt.monthYear(D.SHAREHOLDERS[i].date) }),
        table: () => ({ cols: [{ key: 'm', label: 'Month' }, { key: 'v', label: 'Shareholders', align: 'right', format: Fmt.num }], rows: D.SHAREHOLDERS.map(s => ({ m: Fmt.monthYear(s.date), v: s.value })).reverse() })
      }
    };

    return `
      ${pageHead('Bookings & community', 'Christiania BeerWalks, the Beer Mile and the Folkeaktier shareholder club.', `<button type="button" class="btn btn--primary" data-action="new-booking">${icon('plus')}New booking</button>`)}
      <div class="kpis kpis--4" style="margin-bottom:16px">
        ${kpiHTML({ icon: 'users', label: 'Walk guests · next 14 days', value: Fmt.num(guests), foot: `${walks.length} walks & groups` })}
        ${kpiHTML({ icon: 'gauge', label: 'Seat utilisation', value: Fmt.pct(guests / seats, 0), foot: `${seats - guests} seats still open` })}
        ${kpiHTML({ icon: 'receipt', label: 'Booked revenue', value: Fmt.krc(bRev), foot: 'next 14 days' })}
        ${kpiHTML({ icon: 'star', label: 'Folkeaktier shareholders', value: Fmt.num(D.MEMBERS.shareholders), delta: deltaChip(D.MEMBERS.newThisMonth / (D.MEMBERS.shareholders - D.MEMBERS.newThisMonth)), foot: `+${D.MEMBERS.newThisMonth} this month` })}
      </div>
      <div class="grid">
        <section class="card col-7" aria-labelledby="t-walks">
          <header class="card__head"><div><h2 class="card__title" id="t-walks">Upcoming walks & groups</h2><p class="card__sub">Next 14 days · 16 seats per public walk</p></div></header>
          <ul class="walks">${walks.map(w => {
            const st = w.booked >= w.cap ? 'critical' : w.booked / w.cap > 0.8 ? 'warning' : 'good';
            return `<li class="walk"><div class="walk__date"><span>${esc(w.start.toLocaleDateString('en-GB', { weekday: 'short' }))}</span><strong>${w.start.getDate()}</strong></div><div><p class="walk__title">${esc(w.type)} · ${Fmt.time(w.start)}</p><p class="walk__meta">${w.lang === 'EN' ? 'English' : 'Danish'} · guide ${esc(w.guide)} · ${Fmt.kr(w.booked * w.price)}</p></div><div class="walk__cap"><div><span>${w.booked} / ${w.cap}</span><span>${st === 'critical' ? 'Sold out' : st === 'warning' ? 'Almost full' : `${w.cap - w.booked} left`}</span></div>${meterHTML(w.booked, w.cap, 'good', null, 'Seats booked')}</div></li>`;
          }).join('')}</ul>
        </section>
        <div class="col-5" style="display:grid;gap:16px;align-content:start">
          <section class="card" aria-labelledby="t-mile">
            <header class="card__head"><div><h2 class="card__title" id="t-mile">Christiania Beer Mile</h2><p class="card__sub">${esc(D.BEER_MILE.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}</p></div>${icon('run')}</header>
            <div class="countdown"><strong>${daysToMile}</strong><span>days to go</span></div>
            <div style="margin-top:16px" class="hero-target__row"><span>Runners signed up</span><span><strong>${D.BEER_MILE.signups}</strong> of ${D.BEER_MILE.cap}</span></div>
            ${meterHTML(D.BEER_MILE.signups, D.BEER_MILE.cap, 'good', null, 'Signups')}
            <p class="card__sub" style="margin-top:10px">${Fmt.kr(D.BEER_MILE.signups * D.BEER_MILE.price)} in entry fees · early bird ends in 3 weeks</p>
          </section>
          ${chartCard('holders', { title: 'Folkeaktier shareholders', sub: 'Every shareholder joins BrygNitterne · last 24 months' })}
        </div>
      </div>
      <div class="grid">
        ${chartCard('walkWeeks', { cls: 'col-12', title: 'BeerWalk & event guests per week', sub: 'Last 12 weeks · seasonality follows the weather' })}
      </div>`;
  }

  /* ======================================================================
     VIEW: Partners
     ====================================================================== */
  function viewPartners() {
    const A = D.ACCOUNTS;
    const revYTD = A.reduce((a, x) => a + x.revYTD, 0);
    const outstanding = A.reduce((a, x) => a + x.outstanding, 0);
    const overdue = A.filter(a => a.status === 'Overdue');
    const kegs = A.reduce((a, x) => a + x.kegs, 0);
    const top = A.slice().sort((a, b) => b.revYTD - a.revYTD).slice(0, 8);
    const ACC_STATUS = { Active: 'good', 'At risk': 'warning', Overdue: 'critical' };
    const accCfg = {
      rows: A, defaultSort: 'revYTD', search: a => `${a.name} ${a.type} ${a.city} ${a.status}`, onRow: a => openAccount(a),
      cols: [
        { key: 'name', label: 'Account', html: a => `<span class="strong">${esc(a.name)}</span><br><span class="muted" style="font-size:12px">${esc(a.type)}</span>`, csv: a => a.name },
        { key: 'city', label: 'City', cls: 'muted' },
        { key: 'revYTD', label: 'Revenue YTD', align: 'right', text: a => Fmt.kr(a.revYTD) },
        { key: 'trend', label: '12-month trend', sortable: false, html: a => `<div class="spark-cell" style="width:110px" data-values='${JSON.stringify(a.trend.map(Math.round))}'></div>`, csv: () => '' },
        { key: 'lastOrder', label: 'Last order', align: 'right', text: a => `${a.lastOrder} days ago` },
        { key: 'outstanding', label: 'Outstanding', align: 'right', text: a => (a.outstanding ? Fmt.kr(a.outstanding) : '—') },
        { key: 'kegs', label: 'Kegs', align: 'right' },
        { key: 'status', label: 'Status', html: a => statusChip(ACC_STATUS[a.status], a.status) }
      ]
    };
    state._accounts = accCfg;

    registry = {
      topAcc: {
        render: host => Charts.hbars(host, { rows: top.map(a => ({ label: a.name, value: a.revYTD, extra: [{ value: a.type, label: '', kind: 'none' }] })), fmt: Fmt.krc, color: 'var(--s3)', seriesName: 'Revenue YTD' }),
        table: () => ({ cols: [{ key: 'name', label: 'Account' }, { key: 'revYTD', label: 'Revenue YTD', align: 'right', format: Fmt.kr }], rows: top })
      }
    };

    return `
      ${pageHead('Partners & accounts', 'Bottle shops, bars, restaurants and distributors that carry our beer. Names are fictional.', `<button type="button" class="btn" data-action="export-accounts">${icon('download')}Export</button><button type="button" class="btn btn--primary" data-action="new-account">${icon('plus')}New account</button>`)}
      <div class="kpis kpis--4" style="margin-bottom:16px">
        ${kpiHTML({ icon: 'users', label: 'Active accounts', value: String(A.filter(a => a.status !== 'At risk').length), foot: `${A.filter(a => a.status === 'At risk').length} haven't ordered in 30+ days` })}
        ${kpiHTML({ icon: 'trend', label: 'B2B revenue YTD', value: Fmt.krc(revYTD), delta: deltaChip(0.118), foot: 'vs same period last year' })}
        ${kpiHTML({ icon: 'receipt', label: 'Outstanding invoices', value: Fmt.krc(outstanding), delta: statusChip('critical', `${overdue.length} overdue`), foot: Fmt.kr(overdue.reduce((a, x) => a + x.outstanding, 0)) + ' overdue' })}
        ${kpiHTML({ icon: 'keg', label: 'Kegs at accounts', value: Fmt.num(kegs), foot: 'deposit 450 kr per keg' })}
      </div>
      <div class="grid">
          ${chartCard('topAcc', { cls: 'col-7', title: 'Top accounts', sub: 'Revenue year to date' })}
          <section class="card col-5" aria-labelledby="t-od">
            <header class="card__head"><div><h2 class="card__title" id="t-od">Overdue invoices</h2><p class="card__sub">More than 14 days past due</p></div></header>
            <ul class="mini-list">${overdue.map(a => `<li><span class="mini-list__name"><span>${esc(a.name)}</span></span><span class="mini-list__value">${Fmt.kr(a.outstanding)}</span><span class="mini-list__sub">${a.overdueDays} days overdue</span><span style="text-align:right"><button type="button" class="btn btn--sm" data-remind="${a.id}">Send reminder</button></span></li>`).join('')}</ul>
          </section>
      </div>
      <section class="card card--flush" aria-labelledby="t-acc">
        <header class="card__head"><div><h2 class="card__title" id="t-acc">Accounts</h2><p class="card__sub">${A.length} accounts · click a row for details</p></div><div class="table-tools"><label class="sr-only" for="q-acc">Search accounts</label><input class="input" id="q-acc" type="search" placeholder="Search accounts…" data-search="accounts"></div></header>
        <div data-table="accounts"></div>
      </section>`;
  }
  function afterPartners(root) {
    dataTable('accounts', state._accounts);
    bindTableSearch('accounts', state._accounts);
    $$('[data-remind]', root).forEach(b => b.addEventListener('click', () => {
      const a = D.ACCOUNTS.find(x => x.id === b.dataset.remind);
      b.disabled = true; b.textContent = 'Reminder sent';
      toast(`Payment reminder sent to ${a.name}`);
    }));
  }

  /* ======================================================================
     Drawers: tank, account, alerts
     ====================================================================== */
  let lastFocus = null;
  function openDrawer(eyebrow, title, html, after) {
    lastFocus = document.activeElement;
    $('#drawer-eyebrow').textContent = eyebrow;
    $('#drawer-title').textContent = title;
    const body = $('#drawer-body');
    body.innerHTML = html;
    const dr = $('#drawer'), sc = $('#drawer-scrim');
    dr.hidden = false; sc.hidden = false;
    requestAnimationFrame(() => { dr.classList.add('is-open'); sc.classList.add('is-open'); });
    setTimeout(() => { if (after) after(body); $('#drawer-close').focus(); }, reduced ? 0 : 60);
  }
  function closeDrawer() {
    const dr = $('#drawer'), sc = $('#drawer-scrim');
    if (dr.hidden) return;
    dr.classList.remove('is-open'); sc.classList.remove('is-open');
    Charts.hideTip();
    setTimeout(() => { dr.hidden = true; sc.hidden = true; }, reduced ? 0 : 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function openTank(id) {
    const t = D.TANKS.find(x => x.id === id);
    const beer = t.beer ? D.beerById[t.beer] : null;
    const plan = D.PLAN.find(p => p.tank === id);
    const nextSegs = plan.segments.filter(s => s.end > 0).slice(0, 4);
    const planList = `<ul class="mini-list">${nextSegs.map(s => `<li><span class="mini-list__name"><span class="key key--rect" style="background:${s.phase === 'Cleaning' ? 'var(--surface-3)' : `var(--ord-${D.PHASES.indexOf(s.phase) + 1})`}"></span><span>${esc(s.phase)}${s.beer ? ' · ' + esc(D.beerById[s.beer].name) : ''}</span></span><span class="mini-list__value" style="font-weight:500">${Fmt.day(D.addDays(D.today, Math.max(0, s.start)))} – ${Fmt.day(D.addDays(D.today, s.end - 1))}</span></li>`).join('')}</ul>`;
    if (!beer) {
      openDrawer(`${t.type} · ${Fmt.num(t.cap)} L`, `${t.id} · ${t.phase}`, `
        <div class="note">${t.phase === 'Cleaning' ? 'CIP cycle running: caustic wash, rinse, acid, sanitise. Expected done at 14:30.' : 'Clean, sanitised and ready for the next transfer.'}</div>
        <div><h3>Coming up</h3>${planList}</div>
        <div class="drawer__actions"><button type="button" class="btn btn--primary" data-dact="schedule">${icon('calendar')}Schedule a fill</button></div>`, body => {
        $('[data-dact="schedule"]', body).addEventListener('click', () => toast(`${t.id} pencilled in for the next brew day`));
      });
      return;
    }
    const days = t.readings.map(r => r.day);
    const html = `
      <div class="facts">
        <div><span>Phase</span><strong>${esc(t.phase)}</strong></div>
        <div><span>Day</span><strong>${t.day} / ${t.total}</strong></div>
        <div><span>Volume</span><strong>${Fmt.num(t.vol)} L</strong></div>
        <div><span>Temperature</span><strong><span data-tank-temp="${t.id}">${t.temp.toFixed(1)}</span> °C</strong></div>
        <div><span>Setpoint</span><strong>${t.set.toFixed(1)} °C</strong></div>
        <div><span>Gravity now</span><strong>${t.sg.toFixed(3)}</strong></div>
        <div><span>Original gravity</span><strong>${t.og.toFixed(3)}</strong></div>
        <div><span>Target FG</span><strong>${t.fg.toFixed(3)}</strong></div>
        <div><span>ABV (est.)</span><strong>${t.abv.toFixed(1)}%</strong></div>
      </div>
      ${t.drift ? `<div class="note" style="display:flex;gap:10px;align-items:flex-start">${statusChip('warning', 'Warning')}<span>Temperature has crept ${(t.temp - t.set).toFixed(1)} °C above setpoint over the last two readings. Check the glycol valve on ${t.id}.</span></div>` : ''}
      ${t.note ? `<div class="note">${esc(t.note)}</div>` : ''}
      <div><h3>Gravity</h3><div data-dchart="sg"></div></div>
      <div><h3>Temperature</h3><div data-dchart="temp"></div></div>
      <div><h3>Coming up</h3>${planList}</div>
      <div class="drawer__actions">
        <button type="button" class="btn btn--primary" data-dact="reading">${icon('plus')}Log reading</button>
        ${t.phase === 'Ready to package' ? `<button type="button" class="btn" data-dact="package">${icon('box')}Send to packaging</button>` : ''}
        ${t.drift ? `<button type="button" class="btn" data-dact="ack">${icon('check')}Acknowledge alert</button>` : ''}
      </div>`;
    openDrawer(`${t.type} · batch ${t.batch}`, `${t.id} · ${beer.name}`, html, body => {
      const drawCharts = () => {
        Charts.lineChart($('[data-dchart="sg"]', body), {
          title: `${t.id} gravity`, labels: days, height: 180, yMin: t.fg - 0.004, tickFormat: v => v.toFixed(3),
          series: [{ name: 'Specific gravity', values: t.readings.map(r => r.sg), color: 'var(--s1)', primary: true, markers: t.readings.length < 20 }],
          refLines: [{ value: t.fg, label: `Target FG ${t.fg.toFixed(3)}` }],
          fmt: v => v.toFixed(3), xFormat: d => `Day ${d}`, tipTitle: i => `Day ${days[i]} · ${Fmt.dayLong(D.addDays(D.today, days[i] - t.day))}`
        });
        Charts.lineChart($('[data-dchart="temp"]', body), {
          title: `${t.id} temperature`, labels: days, height: 160, yMin: Math.min(...t.readings.map(r => r.temp), t.set) - 1, tickFormat: v => v.toFixed(0) + '°',
          series: [{ name: 'Temperature', values: t.readings.map(r => r.temp), color: 'var(--s2)', primary: true }],
          refLines: [{ value: t.set, label: `Setpoint ${t.set.toFixed(1)} °C` }],
          fmt: v => v.toFixed(1) + ' °C', xFormat: d => `Day ${d}`, tipTitle: i => `Day ${days[i]}`
        });
      };
      drawCharts();
      $('[data-dact="reading"]', body).addEventListener('click', () => {
        const last = t.readings[t.readings.length - 1];
        const sg = Math.max(t.fg, last.sg - (t.phase === 'Fermenting' ? 0.002 : 0));
        t.readings.push({ day: last.day + 1, sg: Math.round(sg * 10000) / 10000, temp: Math.round((t.set + D.R.n() * 0.2) * 10) / 10 });
        days.push(last.day + 1);
        drawCharts();
        toast(`Reading logged for ${t.id}`);
      });
      const pk = $('[data-dact="package"]', body);
      if (pk) pk.addEventListener('click', () => toast(`${t.id} added to Monday's packaging run`));
      const ack = $('[data-dact="ack"]', body);
      if (ack) ack.addEventListener('click', () => { ack.disabled = true; ack.textContent = 'Acknowledged'; toast('Alert acknowledged. Brewer on duty notified.'); });
    });
  }

  function openAccount(a) {
    const orders = D.ORDERS.filter(o => o.customer === a.name).slice(0, 6);
    const ACC_STATUS = { Active: 'good', 'At risk': 'warning', Overdue: 'critical' };
    openDrawer(a.type, a.name, `
      <div style="display:flex;gap:8px;flex-wrap:wrap">${statusChip(ACC_STATUS[a.status], a.status)}<span class="chip">${icon('pin')}${esc(a.city)}</span><span class="chip">Account ${esc(a.id)}</span></div>
      <div class="facts">
        <div><span>Revenue YTD</span><strong>${Fmt.krc(a.revYTD)}</strong></div>
        <div><span>Last order</span><strong>${a.lastOrder} days ago</strong></div>
        <div><span>Outstanding</span><strong>${a.outstanding ? Fmt.kr(a.outstanding) : '—'}</strong></div>
        <div><span>Kegs held</span><strong>${a.kegs}</strong></div>
        <div><span>Payment terms</span><strong>14 days</strong></div>
        <div><span>Price list</span><strong>${a.type.startsWith('Distributor') ? 'Export' : 'Wholesale B'}</strong></div>
      </div>
      <div><h3>Monthly revenue</h3><div data-dchart="acc"></div></div>
      <div><h3>Recent orders</h3>${orders.length ? `<ul class="mini-list">${orders.map(o => `<li><span class="mini-list__name"><span>${esc(o.id)}</span></span><span class="mini-list__value">${Fmt.kr(o.amount)}</span><span class="mini-list__sub">${Fmt.dayLong(o.date)} · ${esc(o.items)}</span><span class="mini-list__sub" style="text-align:right">${esc(o.status)}</span></li>`).join('')}</ul>` : '<p class="card__sub">No orders in the last 45 days.</p>'}</div>
      <div class="drawer__actions"><button type="button" class="btn btn--primary" data-dact="order">${icon('plus')}New order</button><button type="button" class="btn" data-dact="call">Log a call</button></div>`, body => {
      const labels = a.trend.map((_, i) => new Date(D.today.getFullYear(), D.today.getMonth() - 11 + i, 1));
      Charts.lineChart($('[data-dchart="acc"]', body), { title: 'Monthly revenue', labels, height: 170, series: [{ name: 'Revenue', values: a.trend, color: 'var(--s3)', area: true, primary: true }], fmt: Fmt.kr, xFormat: d => Fmt.month(d), tipTitle: i => Fmt.monthYear(labels[i]) });
      $('[data-dact="order"]', body).addEventListener('click', () => toast(`Draft order created for ${a.name}`));
      $('[data-dact="call"]', body).addEventListener('click', () => toast('Call logged'));
    });
  }

  function openAlerts() {
    openDrawer('Notifications', 'Needs attention', alertsHTML(state.alerts), body => bindAlerts(body, state.alerts));
  }

  /* ======================================================================
     Toasts, count-up
     ====================================================================== */
  function toast(msg) {
    const t = h('div', 'toast');
    t.innerHTML = icon('check');
    t.appendChild(document.createTextNode(msg));
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('is-leaving'); setTimeout(() => t.remove(), 300); }, 3200);
  }
  function countUp(el, to, fmt) {
    const t0 = performance.now(), dur = 900;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur);
      el.innerHTML = fmt(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ======================================================================
     Router & render
     ====================================================================== */
  const RENDER = {
    overview: [viewOverview, afterOverview],
    sales: [viewSales, afterSales],
    inventory: [viewInventory, afterInventory],
    production: [viewProduction, afterProduction],
    taproom: [viewTaproom, () => {}],
    bookings: [viewBookings, () => {}],
    partners: [viewPartners, afterPartners]
  };
  let pendingSearch = null;

  function render(animate = true) {
    const v = VIEWS.find(x => x.id === state.view) || VIEWS[0];
    const root = $('#view');
    Charts.hideTip();
    registry = {};
    const [build, after] = RENDER[v.id];
    root.innerHTML = v.id === 'inventory' ? build(pendingSearch) : build();
    pendingSearch = null;
    root.classList.toggle('is-entering', animate && !reduced);
    if (animate) setTimeout(() => root.classList.remove('is-entering'), 600);
    bindFilters(root);
    mountSparks(root);
    mountCharts(root);
    after(root);
    bindActions(root);
    $('#tb-crumb').textContent = v.label;
    document.title = `${v.label} — Bryghus HQ`;
    $$('.sb-link').forEach(a => {
      const on = a.dataset.view === v.id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }
  function go(view) {
    if (location.hash !== '#/' + view) location.hash = '#/' + view;
    else { state.view = view; render(); }
  }
  function onRoute() {
    const id = (location.hash.match(/^#\/([\w-]+)/) || [])[1];
    state.view = VIEWS.some(v => v.id === id) ? id : 'overview';
    closeSidebar();
    render();
    window.scrollTo(0, 0);
  }

  function bindActions(root) {
    $$('[data-action]', root).forEach(b => b.addEventListener('click', () => action(b.dataset.action)));
  }
  function action(name) {
    const r = rangeInfo(state.range);
    switch (name) {
      case 'export-overview': {
        const s = series(r, d => d.total);
        downloadCSV(`bryghus-revenue-${r.id}.csv`, [{ key: 'date', label: 'Period start' }, { key: 'rev', label: 'Revenue (DKK)' }, { key: 'prev', label: 'Previous period (DKK)' }],
          s.labels.map((d, i) => ({ date: d.toISOString().slice(0, 10), rev: Math.round(s.cur[i]), prev: s.prev[i] == null ? '' : Math.round(s.prev[i]) })));
        break;
      }
      case 'export-orders': downloadCSV(`bryghus-orders-${r.id}.csv`, state._orders.cols, state._orders._rows || state._orders.rows); break;
      case 'export-skus': downloadCSV('bryghus-stock.csv', state._skus.cols, state._skus._rows || state._skus.rows); break;
      case 'export-batches': downloadCSV('bryghus-batches.csv', state._batches.cols, state._batches._rows || state._batches.rows); break;
      case 'export-accounts': downloadCSV('bryghus-accounts.csv', state._accounts.cols.filter(c => c.key !== 'trend'), state._accounts._rows || state._accounts.rows); break;
      case 'all-alerts': openAlerts(); break;
      case 'log-reading': openTank('FV3'); break;
      case 'new-order': toast('New order form would open here (demo)'); break;
      case 'new-po': toast('Purchase order draft created (demo)'); break;
      case 'plan-brew': toast('Brew planner would open here (demo)'); break;
      case 'change-keg': toast('Keg change logged for tap 6 · Orange Haze (demo)'); break;
      case 'new-booking': toast('Booking form would open here (demo)'); break;
      case 'new-account': toast('New account form would open here (demo)'); break;
      case 'theme': toggleTheme(); break;
      default: break;
    }
  }

  /* ======================================================================
     Sidebar, theme, clock
     ====================================================================== */
  function buildNav() {
    const badges = {
      inventory: D.SKUS.filter(s => s.status === 'critical' || s.status === 'warning').length + D.MATERIALS.filter(m => m.status !== 'good').length,
      production: D.TANKS.filter(t => t.drift).length,
      partners: D.ACCOUNTS.filter(a => a.status === 'Overdue').length
    };
    let html = '', group = '';
    VIEWS.forEach(v => {
      if (v.group !== group) { group = v.group; html += `<p class="sb-nav__group">${esc(group)}</p>`; }
      html += `<a class="sb-link" href="#/${v.id}" data-view="${v.id}">${icon(v.icon)}<span>${esc(v.label)}</span>${badges[v.id] ? `<span class="sb-badge" aria-label="${badges[v.id]} items need attention">${badges[v.id]}</span>` : ''}</a>`;
    });
    $('#sb-nav').innerHTML = html;
  }
  function openSidebar() {
    $('#sidebar').classList.add('is-open'); $('#sb-scrim').hidden = false;
    $('#tb-menu').setAttribute('aria-expanded', 'true');
  }
  function closeSidebar() {
    $('#sidebar').classList.remove('is-open'); $('#sb-scrim').hidden = true;
    $('#tb-menu').setAttribute('aria-expanded', 'false');
  }
  function setThemeIcon() {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    const b = $('#tb-theme');
    b.innerHTML = icon(dark ? 'sun' : 'moon');
    b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function toggleTheme() {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    store.set('hq_theme', next);
    setThemeIcon();
  }
  function tickClock() {
    const t = new Date();
    $('#tb-clock').textContent = t.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  /* ======================================================================
     Live simulation
     ====================================================================== */
  function liveTick() {
    const e = D.activityEvent();
    state.activity.unshift(e);
    state.activity.length = Math.min(state.activity.length, 40);
    if (e.amount && (e.kind === 'taproom' || e.kind === 'webshop' || e.kind === 'events')) {
      const d = D.days[LAST];
      d.rev[e.kind] += e.amount; d.total += e.amount;
    }
    const feed = $('[data-feed]');
    if (feed) {
      feed.insertAdjacentHTML('afterbegin', feedItemHTML(e, true));
      while (feed.children.length > 14) feed.lastElementChild.remove();
    }
    const d = D.days[LAST];
    const set = (key, text) => $$(`[data-live="${key}"]`).forEach(el => { el.textContent = text; });
    set('today-total', Fmt.kr(d.total));
    const weekStart = LAST - ((D.today.getDay() + 6) % 7);
    set('week-total', Fmt.krc(sum(weekStart, LAST, x => x.total)));
    set('tap-today', Fmt.kr(d.rev.taproom));
    set('tap-guests', Fmt.num(d.rev.taproom / 118));
    set('tap-pours', Fmt.num(D.TAPS.reduce((a, t) => a + t.pours, 0)));
    D.TAPS.forEach(t => $$(`[data-pours="${t.tap}"]`).forEach(el => { el.textContent = `${t.pours} pours`; }));
    // tank temperatures wander a little around setpoint
    D.TANKS.forEach(t => {
      if (!t.beer || t.drift) return;
      t.temp = Math.round((t.temp + (t.set - t.temp) * 0.3 + D.R.n() * 0.12) * 10) / 10;
      $$(`[data-tank-temp="${t.id}"]`).forEach(el => { el.textContent = t.temp.toFixed(1); });
    });
  }

  /* ======================================================================
     Command palette
     ====================================================================== */
  let cmdItems = [], cmdSel = 0;
  function cmdSource() {
    return [
      ...VIEWS.map(v => ({ group: 'Go to', label: v.label, icon: v.icon, run: () => go(v.id) })),
      { group: 'Actions', label: 'Show all alerts', icon: 'bell', run: openAlerts },
      { group: 'Actions', label: 'Toggle light / dark theme', icon: 'sun', run: toggleTheme },
      { group: 'Actions', label: 'Export revenue (CSV)', icon: 'download', run: () => action('export-overview') },
      ...D.TANKS.map(t => ({ group: 'Tanks', label: `${t.id} · ${t.beer ? D.beerById[t.beer].name : t.phase}`, hint: t.phase, icon: 'flask', run: () => openTank(t.id) })),
      ...D.BEERS.map(b => ({ group: 'Beers', label: b.name, hint: `${b.style} · stock`, icon: 'beer', run: () => { pendingSearch = b.name; state.tables.skus = null; delete state.tables.skus; go('inventory'); } })),
      ...D.ACCOUNTS.map(a => ({ group: 'Accounts', label: a.name, hint: a.city, icon: 'users', run: () => { if (state.view !== 'partners') go('partners'); setTimeout(() => openAccount(a), 50); } }))
    ];
  }
  function openCmd() {
    const c = $('#cmdk');
    c.hidden = false;
    const input = $('#cmdk-input');
    input.value = '';
    renderCmd('');
    setTimeout(() => input.focus(), 10);
  }
  function closeCmd() { $('#cmdk').hidden = true; }
  function renderCmd(q) {
    const ql = q.trim().toLowerCase();
    const all = cmdSource();
    cmdItems = ql ? all.filter(i => (i.label + ' ' + (i.hint || '') + ' ' + i.group).toLowerCase().includes(ql)) : all.filter(i => i.group === 'Go to' || i.group === 'Actions' || i.group === 'Tanks');
    cmdSel = 0;
    const list = $('#cmdk-list');
    if (!cmdItems.length) { list.innerHTML = '<li class="cmdk__empty">No results</li>'; return; }
    let html = '', g = '';
    cmdItems.slice(0, 40).forEach((it, i) => {
      if (it.group !== g) { g = it.group; html += `<li class="cmdk__group" role="presentation">${esc(g)}</li>`; }
      html += `<li class="cmdk__item" role="option" id="cmd-${i}" data-i="${i}" aria-selected="${i === 0}">${icon(it.icon)}<span>${esc(it.label)}</span>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</li>`;
    });
    list.innerHTML = html;
    $('#cmdk-input').setAttribute('aria-activedescendant', 'cmd-0');
    $$('.cmdk__item', list).forEach(li => {
      li.addEventListener('mousemove', () => selectCmd(Number(li.dataset.i)));
      li.addEventListener('click', () => runCmd(Number(li.dataset.i)));
    });
  }
  function selectCmd(i) {
    const max = Math.min(cmdItems.length, 40) - 1;
    cmdSel = Math.max(0, Math.min(max, i));
    $$('.cmdk__item').forEach(li => li.setAttribute('aria-selected', String(Number(li.dataset.i) === cmdSel)));
    const el = $(`#cmd-${cmdSel}`);
    if (el) { el.scrollIntoView({ block: 'nearest' }); $('#cmdk-input').setAttribute('aria-activedescendant', el.id); }
  }
  function runCmd(i) { const it = cmdItems[i]; if (!it) return; closeCmd(); it.run(); }

  /* ======================================================================
     Boot
     ====================================================================== */
  function boot() {
    // static icons in the shell
    $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
    $('#tb-menu').innerHTML = icon('menu');
    $('#tb-bell').insertAdjacentHTML('afterbegin', icon('bell'));
    $('#drawer-close').innerHTML = icon('x');
    setThemeIcon();

    state.alerts = buildAlerts();
    $('#tb-bell-count').textContent = String(state.alerts.filter(a => a.level === 'critical' || a.level === 'warning').length);
    buildNav();

    $('#tb-theme').addEventListener('click', toggleTheme);
    $('#tb-bell').addEventListener('click', openAlerts);
    $('#tb-search').addEventListener('click', openCmd);
    $('#tb-menu').addEventListener('click', () => ($('#sidebar').classList.contains('is-open') ? closeSidebar() : openSidebar()));
    $('#sb-scrim').addEventListener('click', closeSidebar);
    $('#sb-user').addEventListener('click', () => toast('Signed in as Owner · demo account'));
    $('#drawer-close').addEventListener('click', closeDrawer);
    $('#drawer-scrim').addEventListener('click', closeDrawer);
    $('#cmdk').addEventListener('click', e => { if (e.target.id === 'cmdk') closeCmd(); });
    $('#cmdk-input').addEventListener('input', e => renderCmd(e.target.value));
    $('#cmdk-input').addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectCmd(cmdSel + 1); }
      if (e.key === 'ArrowUp') { e.preventDefault(); selectCmd(cmdSel - 1); }
      if (e.key === 'Enter') { e.preventDefault(); runCmd(cmdSel); }
    });
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#cmdk').hidden ? openCmd() : closeCmd(); }
      if (e.key === 'Escape') {
        if (!$('#cmdk').hidden) closeCmd();
        else if (!$('#drawer').hidden) closeDrawer();
        else closeSidebar();
      }
      if (e.key === '/' && document.activeElement === document.body) { e.preventDefault(); openCmd(); }
    });
    window.addEventListener('scroll', Charts.hideTip, { passive: true });
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(rerenderCharts, 150); });
    window.addEventListener('hashchange', onRoute);

    tickClock();
    setInterval(tickClock, 1000);
    setInterval(liveTick, 6000);
    onRoute();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
