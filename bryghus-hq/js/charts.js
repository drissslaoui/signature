/* Bryghus HQ — hand-rolled SVG/HTML charts
   Colors are referenced as CSS custom properties so a theme switch
   recolors every chart without a re-render. */
(function () {
  'use strict';

  const NS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- formatting ---------- */
  const nf0 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
  const nf1 = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
  const Fmt = {
    num: v => nf0.format(Math.round(v)),
    dec: (v, d = 1) => new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(v),
    compact(v) {
      const a = Math.abs(v);
      if (a >= 1e6) return nf1.format(v / 1e6).replace(/\.0$/, '') + 'M';
      if (a >= 1e4) return nf0.format(v / 1e3) + 'K';
      if (a >= 1e3) return nf1.format(v / 1e3) + 'K';
      return nf0.format(v);
    },
    kr: v => nf0.format(Math.round(v)) + ' kr',
    krc(v) {
      const a = Math.abs(v);
      if (a >= 1e6) return (v / 1e6).toFixed(2).replace(/0$/, '') + 'M kr';
      if (a >= 1e4) return nf0.format(v / 1e3) + 'K kr';
      return nf0.format(Math.round(v)) + ' kr';
    },
    pct: (v, d = 1) => (v * 100).toFixed(d) + '%',
    signedPct: (v, d = 1) => (v >= 0 ? '+' : '−') + Math.abs(v * 100).toFixed(d) + '%',
    day: d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    dayLong: d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
    month: d => d.toLocaleDateString('en-GB', { month: 'short' }),
    monthYear: d => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
    time: d => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  };

  /* ---------- scales ---------- */
  function niceStep(range, count) {
    const raw = range / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
    const n = raw / mag;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag;
  }
  function niceRange(lo, hi, count) {
    if (hi <= lo) hi = lo + 1;
    const step = niceStep(hi - lo, count);
    const start = Math.floor(lo / step) * step;
    const end = Math.ceil(hi / step) * step;
    const ticks = [];
    for (let v = start; v <= end + step * 1e-6; v += step) ticks.push(Math.round(v / step) * step);
    return { lo: start, hi: end, ticks, step };
  }
  function tickFormatter(top, custom) {
    if (custom) return custom;
    return v => (top >= 10000 ? Fmt.compact(v) : Fmt.num(v));
  }

  /* ---------- tooltip ---------- */
  const tip = () => document.getElementById('tooltip');
  function showTip(clientX, clientY, title, rows) {
    const t = tip();
    t.replaceChildren();
    if (title) t.appendChild(h('div', 'tt-title', title));
    rows.forEach(r => {
      const row = h('div', 'tt-row');
      const key = h('span', 'tt-key tt-key--' + (r.kind || 'line'));
      if (r.color) key.style.background = r.color;
      if (r.kind === 'none') key.style.display = 'none';
      const val = h('strong', 'tt-val', r.value);
      const lab = h('span', 'tt-lab', r.label);
      row.append(key, val, lab);
      t.appendChild(row);
    });
    t.hidden = false;
    const pad = 14;
    const bw = t.offsetWidth, bh = t.offsetHeight;
    let x = clientX + pad, y = clientY - bh - pad;
    if (x + bw > window.innerWidth - 8) x = clientX - bw - pad;
    if (y < 8) y = clientY + pad;
    t.style.transform = `translate(${Math.max(8, x)}px, ${y}px)`;
  }
  function hideTip() { tip().hidden = true; }
  function tipAtElement(el, title, rows) {
    const r = el.getBoundingClientRect();
    showTip(r.left + r.width / 2, r.top, title, rows);
  }

  /* ---------- line chart (crosshair + tooltip) ---------- */
  function lineChart(host, o) {
    host.replaceChildren();
    const W = Math.max(260, host.clientWidth || 600);
    const H = o.height || 240;
    const n = o.labels.length;
    const vals = o.series.flatMap(s => s.values.filter(v => v != null));
    (o.refLines || []).forEach(r => vals.push(r.value));
    const lo = o.yMin != null ? Math.min(o.yMin, ...vals) : 0;
    const hi = Math.max(...vals);
    const top = o.yMin != null ? hi + (hi - lo) * 0.08 : hi * (o.headroom || 1.04);
    const sc = niceRange(o.yMin != null ? lo : 0, top, o.ticks || 4);
    const tf = tickFormatter(sc.hi, o.tickFormat);
    const labelW = Math.max(...sc.ticks.map(t => tf(t).length)) * 7 + 12;
    const m = { t: 14, r: o.endLabel ? 70 : 14, b: 28, l: Math.max(36, labelW) };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const x = i => m.l + (n === 1 ? iw / 2 : i * iw / (n - 1));
    const y = v => m.t + ih - (v - sc.lo) / (sc.hi - sc.lo) * ih;

    const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'chart', role: 'img', tabindex: '0', 'aria-label': o.title || 'Line chart' });

    // grid + y ticks
    sc.ticks.forEach(t => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), class: t === sc.lo ? 'baseline' : 'gridline' }, root);
      svg('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'axis-label' }, root).textContent = tf(t);
    });
    // x labels
    const want = Math.min(n, Math.max(2, Math.floor(iw / 90)));
    const step = Math.max(1, Math.round((n - 1) / (want - 1)));
    for (let i = 0; i < n; i += step) {
      if (n - 1 - i < step * 0.6 && i !== n - 1) continue;
      svg('text', { x: x(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : 'middle', class: 'axis-label' }, root).textContent = o.xFormat(o.labels[i], i);
    }
    if ((n - 1) % step !== 0) svg('text', { x: x(n - 1), y: H - 8, 'text-anchor': 'end', class: 'axis-label' }, root).textContent = o.xFormat(o.labels[n - 1], n - 1);

    // reference lines (thresholds/targets: dashed on purpose — they are not gridlines)
    (o.refLines || []).forEach(r => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(r.value), y2: y(r.value), class: 'ref-line' }, root);
      svg('text', { x: W - m.r, y: y(r.value) - 6, 'text-anchor': 'end', class: 'ref-label' }, root).textContent = r.label;
    });

    function pathFor(values) {
      let d = '', pen = false;
      values.forEach((v, i) => {
        if (v == null) { pen = false; return; }
        d += (pen ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1);
        pen = true;
      });
      return d;
    }
    const ordered = o.series.slice().sort((a, b) => (a.primary ? 1 : 0) - (b.primary ? 1 : 0));
    ordered.forEach(s => {
      if (s.area) {
        const idx = s.values.map((v, i) => (v == null ? null : i)).filter(i => i != null);
        if (idx.length > 1) {
          const d = pathFor(s.values) + `L${x(idx[idx.length - 1])},${y(sc.lo)}L${x(idx[0])},${y(sc.lo)}Z`;
          svg('path', { d, class: 'area', style: `fill:${s.color}` }, root);
        }
      }
      svg('path', { d: pathFor(s.values), class: 'line' + (s.thin ? ' line--thin' : ''), style: `stroke:${s.color}` }, root);
      if (s.markers) {
        s.values.forEach((v, i) => { if (v != null) svg('circle', { cx: x(i), cy: y(v), r: 3.5, class: 'marker', style: `fill:${s.color}` }, root); });
      }
    });

    // end dot + label for the primary series
    const prim = o.series.find(s => s.primary) || o.series[0];
    let lastI = -1; prim.values.forEach((v, i) => { if (v != null) lastI = i; });
    if (lastI >= 0) {
      svg('circle', { cx: x(lastI), cy: y(prim.values[lastI]), r: 4.5, class: 'marker', style: `fill:${prim.color}` }, root);
      if (o.endLabel) {
        const t = svg('text', { x: x(lastI) + 10, y: y(prim.values[lastI]) + 4, class: 'end-label' }, root);
        t.textContent = (o.endFormat || o.fmt)(prim.values[lastI]);
      }
    }

    // crosshair
    const cross = svg('g', { class: 'crosshair', style: 'display:none' }, root);
    const cl = svg('line', { y1: m.t, y2: m.t + ih, class: 'cross-line' }, cross);
    const dots = o.series.map(s => svg('circle', { r: 4.5, class: 'marker', style: `fill:${s.color}` }, cross));
    const overlay = svg('rect', { x: m.l, y: m.t, width: iw, height: ih, fill: 'transparent', class: 'overlay' }, root);

    let cur = -1;
    function place(i, clientX, clientY) {
      i = Math.max(0, Math.min(n - 1, i)); cur = i;
      cross.style.display = '';
      cl.setAttribute('x1', x(i)); cl.setAttribute('x2', x(i));
      o.series.forEach((s, k) => {
        const v = s.values[i];
        if (v == null) { dots[k].style.display = 'none'; return; }
        dots[k].style.display = '';
        dots[k].setAttribute('cx', x(i)); dots[k].setAttribute('cy', y(v));
      });
      const rows = o.series.filter(s => s.values[i] != null).map(s => ({ value: o.fmt(s.values[i]), label: s.name, color: s.color, kind: 'line' }));
      if (o.extraTip) rows.push(...o.extraTip(i));
      const title = o.tipTitle ? o.tipTitle(i) : String(o.labels[i]);
      if (clientX == null) {
        const r = root.getBoundingClientRect();
        showTip(r.left + x(i) * r.width / W, r.top + m.t * r.height / H + 20, title, rows);
      } else showTip(clientX, clientY, title, rows);
    }
    overlay.addEventListener('pointermove', e => {
      const r = root.getBoundingClientRect();
      const px = (e.clientX - r.left) * W / r.width;
      place(Math.round((px - m.l) / (iw / Math.max(1, n - 1))), e.clientX, e.clientY);
    });
    overlay.addEventListener('pointerleave', () => { cross.style.display = 'none'; hideTip(); });
    root.addEventListener('focus', () => place(cur < 0 ? n - 1 : cur));
    root.addEventListener('blur', () => { cross.style.display = 'none'; hideTip(); });
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); place(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); place(cur + 1); }
      if (e.key === 'Home') { e.preventDefault(); place(0); }
      if (e.key === 'End') { e.preventDefault(); place(n - 1); }
    });

    host.appendChild(root);
    return root;
  }

  /* ---------- column chart (optional target ticks) ---------- */
  function topRounded(x, y, w, hgt, r) {
    r = Math.min(r, hgt, w / 2);
    if (hgt <= 0) return '';
    return `M${x},${y + hgt}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + hgt}Z`;
  }
  function columnChart(host, o) {
    host.replaceChildren();
    const W = Math.max(260, host.clientWidth || 600);
    const H = o.height || 240;
    const n = o.values.length;
    const hi = Math.max(...o.values, ...(o.targets || []).filter(v => v != null));
    const sc = niceRange(0, hi * 1.08, 4);
    const tf = tickFormatter(sc.hi, o.tickFormat);
    const m = { t: 22, r: 8, b: 28, l: Math.max(36, Math.max(...sc.ticks.map(t => tf(t).length)) * 7 + 12) };
    const iw = W - m.l - m.r, ih = H - m.t - m.b;
    const band = iw / n;
    const bw = Math.min(24, band * 0.56);
    const y = v => m.t + ih - v / sc.hi * ih;

    const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'chart', role: 'img', 'aria-label': o.title || 'Column chart' });
    sc.ticks.forEach(t => {
      svg('line', { x1: m.l, x2: W - m.r, y1: y(t), y2: y(t), class: t === 0 ? 'baseline' : 'gridline' }, root);
      svg('text', { x: m.l - 8, y: y(t) + 4, 'text-anchor': 'end', class: 'axis-label' }, root).textContent = tf(t);
    });
    const every = band < 34 ? 2 : 1;
    o.values.forEach((v, i) => {
      const cx = m.l + band * i + band / 2;
      const x0 = cx - bw / 2;
      const g = svg('g', { class: 'col', tabindex: '0', role: 'img', 'aria-label': `${o.labelFormat(i)}: ${o.fmt(v)}` }, root);
      svg('path', { d: topRounded(x0, y(v), bw, y(0) - y(v), 4), class: 'bar' + (o.partial && o.partial(i) ? ' bar--partial' : ''), style: `fill:${o.color}` }, g);
      if (o.targets && o.targets[i] != null) {
        svg('line', { x1: x0 - 5, x2: x0 + bw + 5, y1: y(o.targets[i]), y2: y(o.targets[i]), class: 'target-tick' }, g);
      }
      if (i % every === 0 || i === n - 1) {
        svg('text', { x: cx, y: H - 8, 'text-anchor': 'middle', class: 'axis-label' }, root).textContent = o.axisFormat(i);
      }
      if (o.labelIndex != null && o.labelIndex === i) {
        const top = Math.min(y(v), o.targets && o.targets[i] != null ? y(o.targets[i]) : Infinity);
        svg('text', { x: cx, y: top - 8, 'text-anchor': 'middle', class: 'value-label' }, root).textContent = o.compactFmt ? o.compactFmt(v) : o.fmt(v);
      }
      const hit = svg('rect', { x: m.l + band * i, y: m.t, width: band, height: ih, fill: 'transparent' }, g);
      const tipRows = () => {
        const rows = [{ value: o.fmt(v), label: o.seriesName || 'Value', color: o.color, kind: 'rect' }];
        if (o.targets && o.targets[i] != null) {
          rows.push({ value: o.fmt(o.targets[i]), label: 'Target', color: 'var(--text-1)', kind: 'line' });
          const d = v / o.targets[i] - 1;
          rows.push({ value: Fmt.signedPct(d), label: 'vs target', kind: 'none' });
        }
        return rows;
      };
      hit.addEventListener('pointermove', e => { g.classList.add('is-hover'); showTip(e.clientX, e.clientY, o.labelFormat(i), tipRows()); });
      hit.addEventListener('pointerleave', () => { g.classList.remove('is-hover'); hideTip(); });
      g.addEventListener('focus', () => { g.classList.add('is-hover'); tipAtElement(g, o.labelFormat(i), tipRows()); });
      g.addEventListener('blur', () => { g.classList.remove('is-hover'); hideTip(); });
    });
    host.appendChild(root);
    return root;
  }

  /* ---------- ranked horizontal bars (HTML) ---------- */
  function hbars(host, o) {
    host.replaceChildren();
    const max = o.max || Math.max(...o.rows.map(r => r.value)) || 1;
    const list = h('div', 'hbars');
    o.rows.forEach(r => {
      const row = h('div', 'hbar');
      row.tabIndex = 0;
      const lab = h('div', 'hbar__label');
      if (r.swatch) { const sw = h('span', 'beer-chip'); sw.style.background = r.swatch; lab.appendChild(sw); }
      lab.appendChild(h('span', null, r.label));
      const track = h('div', 'hbar__track');
      const bar = h('div', 'hbar__bar');
      bar.style.width = Math.max(0.5, r.value / max * 100) + '%';
      bar.style.background = o.color;
      track.appendChild(bar);
      const val = h('div', 'hbar__value', o.fmt(r.value));
      row.append(lab, track, val);
      const rows = () => [{ value: o.fmt(r.value), label: o.seriesName || 'Value', color: o.color, kind: 'rect' }].concat(r.extra || []);
      row.addEventListener('pointermove', e => showTip(e.clientX, e.clientY, r.label, rows()));
      row.addEventListener('pointerleave', hideTip);
      row.addEventListener('focus', () => tipAtElement(bar, r.label, rows()));
      row.addEventListener('blur', hideTip);
      list.appendChild(row);
    });
    host.appendChild(list);
  }

  /* ---------- sparkline ---------- */
  function sparkline(host, values, o = {}) {
    host.replaceChildren();
    const W = Math.max(60, host.clientWidth || 120), H = o.height || 34;
    const lo = Math.min(...values), hi = Math.max(...values);
    const pad = 4;
    const x = i => pad + i * (W - pad * 2) / (values.length - 1);
    const y = v => H - pad - (hi === lo ? 0.5 : (v - lo) / (hi - lo)) * (H - pad * 2);
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', height: H, class: 'spark', 'aria-hidden': 'true' });
    svg('path', { d: values.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(''), class: 'spark-line' }, root);
    const li = values.length - 1;
    svg('circle', { cx: x(li), cy: y(values[li]), r: 3.5, class: 'marker', style: 'fill:var(--s1)' }, root);
    host.appendChild(root);
  }

  /* ---------- heatmap (HTML grid) ---------- */
  function heatmap(host, o) {
    host.replaceChildren();
    const flat = o.values.flat().filter(v => v != null);
    const lo = Math.min(...flat), hi = Math.max(...flat);
    const steps = 7;
    const grid = h('div', 'heat');
    grid.style.gridTemplateColumns = `44px repeat(${o.cols.length}, minmax(0, 1fr))`;
    grid.appendChild(h('div', 'heat__corner'));
    o.cols.forEach(c => grid.appendChild(h('div', 'heat__col', c)));
    o.rows.forEach((rl, ri) => {
      grid.appendChild(h('div', 'heat__row', rl));
      o.cols.forEach((cl, ci) => {
        const v = o.values[ri][ci];
        const cell = h('div', 'heat__cell');
        if (v == null) { cell.classList.add('is-closed'); cell.setAttribute('aria-label', `${rl} ${cl}: closed`); }
        else {
          const k = Math.min(steps, 1 + Math.floor((v - lo) / (hi - lo + 1e-9) * steps));
          cell.style.background = `var(--seq-${k})`;
          cell.addEventListener('pointermove', e => { cell.classList.add('is-hover'); showTip(e.clientX, e.clientY, `${o.rowLong ? o.rowLong[ri] : rl} · ${cl}:00`, [{ value: o.fmt(v), label: o.seriesName, color: `var(--seq-${k})`, kind: 'rect' }]); });
          cell.addEventListener('pointerleave', () => { cell.classList.remove('is-hover'); hideTip(); });
        }
        grid.appendChild(cell);
      });
    });
    host.appendChild(grid);
    const legend = h('div', 'scale-legend');
    legend.appendChild(h('span', null, o.fmt(lo)));
    const ramp = h('span', 'scale-legend__ramp');
    for (let k = 1; k <= steps; k++) { const s = h('i'); s.style.background = `var(--seq-${k})`; ramp.appendChild(s); }
    legend.appendChild(ramp);
    legend.appendChild(h('span', null, o.fmt(hi)));
    const closed = h('span', 'scale-legend__closed'); closed.appendChild(h('i')); closed.appendChild(document.createTextNode('Closed'));
    legend.appendChild(closed);
    host.appendChild(legend);
  }

  /* ---------- thin segmented bar ---------- */
  function segBar(parts, o = {}) {
    const wrap = h('div', 'seg' + (o.tall ? ' seg--tall' : ''));
    const total = parts.reduce((a, p) => a + p.value, 0) || 1;
    parts.forEach(p => {
      if (p.value <= 0) return;
      const s = h('div', 'seg__part');
      s.style.flexGrow = p.value;
      s.style.background = p.color;
      s.tabIndex = 0;
      s.setAttribute('aria-label', `${p.name}: ${o.fmt ? o.fmt(p.value) : p.value} (${Fmt.pct(p.value / total)})`);
      const rows = () => [{ value: o.fmt ? o.fmt(p.value) : String(p.value), label: p.name, color: p.color, kind: 'rect' }, { value: Fmt.pct(p.value / total), label: 'share', kind: 'none' }];
      s.addEventListener('pointermove', e => showTip(e.clientX, e.clientY, null, rows()));
      s.addEventListener('pointerleave', hideTip);
      s.addEventListener('focus', () => tipAtElement(s, null, rows()));
      s.addEventListener('blur', hideTip);
      wrap.appendChild(s);
    });
    return wrap;
  }

  /* ---------- meter ---------- */
  function meter(value, max, o = {}) {
    const wrap = h('div', 'meter' + (o.status ? ' meter--' + o.status : '') + (o.size ? ' meter--' + o.size : ''));
    const fill = h('div', 'meter__fill');
    fill.style.width = Math.max(0, Math.min(100, value / max * 100)) + '%';
    wrap.appendChild(fill);
    if (o.marker != null) {
      const mk = h('div', 'meter__marker');
      mk.style.left = Math.min(100, o.marker / max * 100) + '%';
      mk.title = o.markerLabel || '';
      wrap.appendChild(mk);
    }
    wrap.setAttribute('role', 'meter');
    wrap.setAttribute('aria-valuemin', '0');
    wrap.setAttribute('aria-valuemax', String(max));
    wrap.setAttribute('aria-valuenow', String(Math.round(value)));
    if (o.label) wrap.setAttribute('aria-label', o.label);
    return wrap;
  }

  /* ---------- gantt (production plan) ---------- */
  function gantt(host, o) {
    host.replaceChildren();
    const span = o.to - o.from;
    const wrap = h('div', 'gantt');
    const head = h('div', 'gantt__head');
    head.appendChild(h('div', 'gantt__label'));
    const scale = h('div', 'gantt__scale');
    for (let d = o.from; d < o.to; d++) {
      const date = o.dateOf(d);
      const c = h('div', 'gantt__day' + (d === 0 ? ' is-today' : '') + (date.getDay() === 0 || date.getDay() === 6 ? ' is-weekend' : ''));
      c.appendChild(h('span', null, date.toLocaleDateString('en-GB', { weekday: 'narrow' })));
      c.appendChild(h('strong', null, String(date.getDate())));
      scale.appendChild(c);
    }
    head.appendChild(scale);
    wrap.appendChild(head);

    const body = h('div', 'gantt__body');
    o.rows.forEach(row => {
      const r = h('div', 'gantt__row');
      const lab = h('div', 'gantt__label');
      lab.appendChild(h('strong', null, row.label));
      lab.appendChild(h('span', null, row.sub || ''));
      r.appendChild(lab);
      const track = h('div', 'gantt__track');
      row.segments.forEach(sg => {
        const s0 = Math.max(o.from, sg.start), s1 = Math.min(o.to, sg.end);
        if (s1 <= s0) return;
        const b = h('div', 'gantt__seg');
        b.style.left = ((s0 - o.from) / span * 100) + '%';
        b.style.width = `calc(${(s1 - s0) / span * 100}% - 2px)`;
        b.style.background = o.colorOf(sg);
        b.style.color = o.inkOf(sg);
        b.dataset.len = String(s1 - s0);
        if (sg.start < o.from) b.classList.add('is-clipped-left');
        const text = o.labelOf(sg);
        if (text) b.appendChild(h('span', null, text));
        b.tabIndex = 0;
        const rows = () => o.tipRows(sg, row);
        const title = `${row.label} · ${sg.phase}`;
        b.addEventListener('pointermove', e => showTip(e.clientX, e.clientY, title, rows()));
        b.addEventListener('pointerleave', hideTip);
        b.addEventListener('focus', () => tipAtElement(b, title, rows()));
        b.addEventListener('blur', hideTip);
        track.appendChild(b);
      });
      const today = h('div', 'gantt__now');
      today.style.left = ((0 - o.from) / span * 100) + '%';
      track.appendChild(today);
      r.appendChild(track);
      body.appendChild(r);
    });
    wrap.appendChild(body);
    host.appendChild(wrap);
    // hide labels that don't fit their segment
    requestAnimationFrame(() => {
      wrap.querySelectorAll('.gantt__seg span').forEach(sp => {
        if (sp.scrollWidth > sp.parentElement.clientWidth - 10) sp.style.visibility = 'hidden';
      });
    });
  }

  /* ---------- table view ---------- */
  function table(host, cols, rows) {
    host.replaceChildren();
    const wrap = h('div', 'table-wrap');
    const t = h('table', 'data-table');
    const thead = h('thead'), tr = h('tr');
    cols.forEach(c => { const th = h('th', c.align === 'right' ? 'num' : null, c.label); th.scope = 'col'; tr.appendChild(th); });
    thead.appendChild(tr); t.appendChild(thead);
    const tb = h('tbody');
    rows.forEach(r => {
      const row = h('tr');
      cols.forEach(c => row.appendChild(h('td', c.align === 'right' ? 'num' : null, c.format ? c.format(r[c.key], r) : String(r[c.key]))));
      tb.appendChild(row);
    });
    t.appendChild(tb); wrap.appendChild(t); host.appendChild(wrap);
  }

  window.Charts = { svg, h, Fmt, niceRange, showTip, hideTip, tipAtElement, lineChart, columnChart, hbars, sparkline, heatmap, segBar, meter, gantt, table };
})();
