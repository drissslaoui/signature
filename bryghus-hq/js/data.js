/* Bryghus HQ — mock data
   Everything here is generated from a fixed seed, anchored to today's date,
   so the numbers are stable between reloads but always look current. */
(function () {
  'use strict';

  /* ---------- seeded random ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rnd = mulberry32(1440);
  const R = {
    f: (a, b) => a + rnd() * (b - a),
    i: (a, b) => Math.floor(a + rnd() * (b - a + 1)),
    pick: arr => arr[Math.floor(rnd() * arr.length)],
    n: () => (rnd() + rnd() + rnd() + rnd() - 2) / 2 // ~ -1..1, bell shaped
  };

  const DAY = 86400000;
  const now = new Date();
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const dayOfYear = d => Math.round((d - new Date(d.getFullYear(), 0, 1)) / DAY);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round = (v, step) => Math.round(v / step) * step;

  /* ---------- reference data ---------- */
  const CHANNELS = [
    { id: 'taproom', name: 'The Lab taproom', short: 'Taproom', base: 9200, margin: 0.76, perL: 155, spend: 118,
      wd: [1.05, 0.62, 0.7, 0.82, 1.0, 1.42, 1.6], season: 'summer' },
    { id: 'webshop', name: 'Webshop', short: 'Webshop', base: 2300, margin: 0.61, perL: 92, spend: 420,
      wd: [1.25, 1.2, 1.0, 0.95, 0.9, 0.85, 0.9], season: 'xmas' },
    { id: 'retail', name: 'Retail & bottle shops', short: 'Retail', base: 8600, margin: 0.43, perL: 46, spend: 2900,
      wd: [0.15, 1.35, 1.2, 1.25, 1.3, 1.2, 0.25], season: 'xmasmild' },
    { id: 'ontrade', name: 'Bars & restaurants', short: 'On-trade', base: 6100, margin: 0.54, perL: 71, spend: 2300,
      wd: [0.2, 0.9, 1.25, 1.2, 1.35, 1.3, 0.4], season: 'summermild' },
    { id: 'events', name: 'BeerWalk & events', short: 'Events', base: 2500, margin: 0.68, perL: 128, spend: 295,
      wd: [1.7, 0.3, 0.35, 0.6, 0.7, 1.25, 2.0], season: 'summerstrong' }
  ];

  const BEERS = [
    { id: 'pilsner', name: 'Christiania Pilsner', short: 'Pilsner', style: 'Pilsner', abv: 4.6, label: '#EE151F', w: 0.30 },
    { id: 'bobcat', name: 'Bobcat Sam', short: 'Bobcat Sam', style: 'Blonde Ale', abv: 5.0, label: '#86C5E0', w: 0.14 },
    { id: 'bombay', name: 'Bombay', short: 'Bombay', style: 'American IPA', abv: 6.4, label: '#0E7A5F', w: 0.15 },
    { id: 'pedersen', name: 'Dry Pedersen', short: 'Dry Pedersen', style: 'Brut IPA', abv: 5.8, label: '#C3D600', w: 0.09 },
    { id: 'haze', name: 'Orange Haze', short: 'Orange Haze', style: 'NEIPA', abv: 6.0, label: '#FF6B1A', w: 0.14 },
    { id: 'kush', name: 'Blueberry Kush', short: 'Blueberry Kush', style: 'Gose', abv: 4.5, label: '#2C4AA6', w: 0.07, season: 'summer' },
    { id: 'axel', name: 'Axel Julemand', short: 'Axel Julemand', style: 'Black IPA', abv: 7.5, label: '#0F3B2A', w: 0.07, season: 'xmas' },
    { id: 'labx', name: 'LAB:X series', short: 'LAB:X', style: 'Experimental', abv: 5.5, label: '#FFF200', w: 0.04 }
  ];
  const beerById = Object.fromEntries(BEERS.map(b => [b.id, b]));

  function season(kind, d) {
    const doy = dayOfYear(d);
    const s = Math.sin(2 * Math.PI * (doy - 110) / 365);
    const xmas = Math.exp(-Math.pow(doy - 345, 2) / (2 * 12 * 12));
    switch (kind) {
      case 'summer': return 1 + 0.32 * s;
      case 'summermild': return 1 + 0.15 * s;
      case 'summerstrong': return 1 + 0.55 * s;
      case 'xmas': return 1 + 0.1 * s + 0.9 * xmas;
      case 'xmasmild': return 1 + 0.06 * s + 0.35 * Math.exp(-Math.pow(doy - 340, 2) / (2 * 16 * 16));
      default: return 1;
    }
  }

  /* ---------- daily revenue, 2+ years ---------- */
  const N_DAYS = 760;
  const hour = now.getHours() + now.getMinutes() / 60;
  const days = [];
  for (let i = 0; i < N_DAYS; i++) {
    const date = addDays(today, i - (N_DAYS - 1));
    const growth = 1 + 0.15 * (i - (N_DAYS - 1)) / 365;
    const rev = {};
    let total = 0;
    CHANNELS.forEach(c => {
      let v = c.base * c.wd[date.getDay()] * season(c.season, date) * growth * Math.max(0.35, 1 + 0.16 * R.n());
      // Christiania Beer Mile — last Saturday-ish of May
      if (c.id === 'events' && date.getMonth() === 4 && date.getDate() >= 20 && date.getDate() <= 26 && date.getDay() === 6) v *= 7;
      if (i === N_DAYS - 1) {
        const p = c.id === 'taproom' ? clamp((hour - 12) / 10, 0, 1) : clamp((hour - 7) / 12, 0, 1);
        v *= p;
      }
      rev[c.id] = Math.round(v);
      total += rev[c.id];
    });
    days.push({ date, rev, total });
  }

  function beerWeights(date) {
    const m = date.getMonth(), d = date.getDate();
    const xmasOn = (m === 10 && d >= 6) || m === 11 || (m === 0 && d <= 6);
    const w = BEERS.map(b => {
      if (b.season === 'xmas') return xmasOn ? b.w * 2.2 : 0;
      if (b.season === 'summer') return b.w * clamp(season('summerstrong', date), 0.15, 2);
      return b.w;
    });
    const sum = w.reduce((a, b) => a + b, 0);
    return w.map(x => x / sum);
  }

  /* ---------- tanks ---------- */
  function fermentCurve(og, fg, totalFerment, uptoDay, setTemp, drift) {
    const out = [];
    const mid = totalFerment * 0.32, k = Math.max(0.8, totalFerment * 0.09);
    for (let t = 0; t <= uptoDay; t++) {
      const sg = fg + (og - fg) / (1 + Math.exp((t - mid) / k));
      let temp = setTemp + R.n() * 0.25;
      if (drift && t >= uptoDay - 2) temp = setTemp + drift * (1 - (uptoDay - t) * 0.35);
      out.push({ day: t, sg: Math.round((sg + R.n() * 0.0006) * 10000) / 10000, temp: Math.round(temp * 10) / 10 });
    }
    return out;
  }

  const TANKS = [
    { id: 'FV1', type: 'Fermenter', cap: 2000, beer: 'pilsner', batch: 'B-2611', phase: 'Conditioning', day: 24, total: 35, vol: 1960, set: 2.0, og: 1.048, fg: 1.009, ferment: 10 },
    { id: 'FV2', type: 'Fermenter', cap: 2000, beer: 'haze', batch: 'B-2622', phase: 'Fermenting', day: 3, total: 13, vol: 1940, set: 30.0, og: 1.058, fg: 1.012, ferment: 6, note: 'Kveik (Voss) — fermenting warm by design' },
    { id: 'FV3', type: 'Fermenter', cap: 2000, beer: 'bombay', batch: 'B-2619', phase: 'Fermenting', day: 6, total: 16, vol: 1900, set: 19.0, og: 1.060, fg: 1.011, ferment: 9, drift: 1.4 },
    { id: 'FV4', type: 'Fermenter', cap: 1000, beer: 'bobcat', batch: 'B-2614', phase: 'Ready to package', day: 15, total: 15, vol: 980, set: 3.0, og: 1.050, fg: 1.010, ferment: 8 },
    { id: 'FV5', type: 'Fermenter', cap: 2000, beer: 'axel', batch: 'B-2608', phase: 'Conditioning', day: 19, total: 28, vol: 1880, set: 2.0, og: 1.072, fg: 1.015, ferment: 10 },
    { id: 'FV6', type: 'Fermenter', cap: 1000, beer: null, batch: null, phase: 'Cleaning', day: 0, total: 1, vol: 0, set: null },
    { id: 'FV7', type: 'Fermenter', cap: 1000, beer: 'pedersen', batch: 'B-2617', phase: 'Fermenting', day: 8, total: 17, vol: 960, set: 18.0, og: 1.054, fg: 1.002, ferment: 10 },
    { id: 'FV8', type: 'Fermenter', cap: 1000, beer: 'labx', batch: 'B-2624', phase: 'Fermenting', day: 2, total: 16, vol: 900, set: 24.0, og: 1.052, fg: 1.006, ferment: 9, note: 'LAB:X #28 — Hemp Saison' },
    { id: 'BBT1', type: 'Bright tank', cap: 2000, beer: 'pilsner', batch: 'B-2604', phase: 'Carbonating', day: 2, total: 3, vol: 1880, set: 1.0, og: 1.048, fg: 1.009, ferment: 10, co2: 2.6 },
    { id: 'BBT2', type: 'Bright tank', cap: 2000, beer: null, batch: null, phase: 'Empty', day: 0, total: 0, vol: 0, set: null }
  ];
  TANKS.forEach(t => {
    if (!t.beer) { t.temp = 8 + R.f(-0.5, 0.5); t.sg = null; t.readings = []; return; }
    if (t.type === 'Bright tank') {
      t.readings = Array.from({ length: t.day + 1 }, (_, d) => ({ day: d, sg: Math.round((t.fg + R.n() * 0.0003) * 10000) / 10000, temp: Math.round((t.set + R.n() * 0.2) * 10) / 10 }));
      t.sg = t.fg; t.temp = t.readings[t.day].temp; t.abv = Math.round((t.og - t.fg) * 131.25 * 10) / 10;
      return;
    }
    const fermentDays = Math.min(t.day, t.ferment);
    const fermentSet = t.phase === 'Fermenting' ? t.set : (t.beer === 'pilsner' ? 11 : t.beer === 'haze' ? 30 : 19);
    const r = fermentCurve(t.og, t.fg, t.ferment, t.phase === 'Fermenting' ? t.day : fermentDays, fermentSet, t.drift);
    // conditioning: cold crash readings
    if (t.phase !== 'Fermenting') {
      const condDays = t.type === 'Bright tank' ? 0 : t.day - fermentDays;
      for (let d = 1; d <= condDays; d++) {
        const temp = Math.max(t.set, fermentSet - d * 5) + R.n() * 0.2;
        r.push({ day: fermentDays + d, sg: Math.round((t.fg + R.n() * 0.0004) * 10000) / 10000, temp: Math.round(temp * 10) / 10 });
      }
    }
    t.readings = r;
    const last = r[r.length - 1];
    t.sg = last.sg;
    t.temp = t.drift ? Math.round((t.set + t.drift) * 10) / 10 : (t.phase === 'Fermenting' ? last.temp : Math.round((t.set + R.n() * 0.2) * 10) / 10);
    t.abv = Math.round((t.og - t.sg) * 131.25 * 10) / 10;
  });

  /* production plan for the gantt: phases are ordered (brew → ferment → condition → package) */
  const PHASES = ['Brew day', 'Fermenting', 'Conditioning', 'Packaging'];
  const PLAN = [
    { tank: 'FV1', start: -24, seq: [['Brew day', 1, 'pilsner'], ['Fermenting', 10], ['Conditioning', 24], ['Packaging', 1], ['Cleaning', 1], ['Brew day', 1, 'pilsner'], ['Fermenting', 10]] },
    { tank: 'FV2', start: -3, seq: [['Brew day', 1, 'haze'], ['Fermenting', 6], ['Conditioning', 6], ['Packaging', 1], ['Cleaning', 1], ['Brew day', 1, 'bobcat'], ['Fermenting', 7]] },
    { tank: 'FV3', start: -6, seq: [['Brew day', 1, 'bombay'], ['Fermenting', 9], ['Conditioning', 6], ['Packaging', 1], ['Cleaning', 1], ['Brew day', 1, 'haze'], ['Fermenting', 6]] },
    { tank: 'FV4', start: -15, seq: [['Brew day', 1, 'bobcat'], ['Fermenting', 8], ['Conditioning', 6], ['Packaging', 1], ['Cleaning', 1], ['Brew day', 1, 'pedersen'], ['Fermenting', 10], ['Conditioning', 7]] },
    { tank: 'FV5', start: -19, seq: [['Brew day', 1, 'axel'], ['Fermenting', 10], ['Conditioning', 18], ['Packaging', 1], ['Cleaning', 1], ['Brew day', 1, 'pilsner'], ['Fermenting', 10]] },
    { tank: 'FV6', start: 0, seq: [['Cleaning', 1], ['Brew day', 1, 'haze'], ['Fermenting', 6], ['Conditioning', 6], ['Packaging', 1], ['Cleaning', 1]] },
    { tank: 'FV7', start: -8, seq: [['Brew day', 1, 'pedersen'], ['Fermenting', 10], ['Conditioning', 7], ['Packaging', 1], ['Cleaning', 1], ['Brew day', 1, 'labx'], ['Fermenting', 9]] },
    { tank: 'FV8', start: -2, seq: [['Brew day', 1, 'labx'], ['Fermenting', 9], ['Conditioning', 7], ['Packaging', 1], ['Cleaning', 1]] },
    { tank: 'BBT1', start: -2, seq: [['Conditioning', 3, 'pilsner'], ['Packaging', 1], ['Cleaning', 1], ['Conditioning', 3, 'axel'], ['Packaging', 1], ['Cleaning', 1], ['Conditioning', 3, 'pilsner']] },
    { tank: 'BBT2', start: 4, seq: [['Conditioning', 2, 'bobcat'], ['Packaging', 1], ['Cleaning', 1], ['Conditioning', 3, 'bombay'], ['Packaging', 1]] }
  ];
  PLAN.forEach(p => {
    let t = p.start, beer = null;
    p.segments = p.seq.map(([phase, len, b]) => {
      if (b) beer = b;
      const seg = { phase, start: t, end: t + len, beer: phase === 'Cleaning' ? null : beer };
      t += len;
      return seg;
    });
  });

  /* batch log */
  const BATCHES = [];
  const batchBeers = ['pilsner', 'bombay', 'haze', 'bobcat', 'pilsner', 'axel', 'pedersen', 'labx', 'pilsner', 'haze', 'bobcat', 'bombay', 'kush', 'pilsner'];
  for (let i = 0; i < 14; i++) {
    const beer = beerById[batchBeers[i]];
    const og = round(1.010 + beer.abv * 0.0076 + R.f(-0.002, 0.002), 0.001);
    const fg = round(og - beer.abv / 131.25 + R.f(-0.001, 0.001), 0.001);
    const vol = R.pick([980, 1000, 1940, 1960, 2000, 1900]);
    BATCHES.push({
      id: 'B-' + (2603 - i),
      beer: beer.id, date: addDays(today, -(30 + i * 6 + R.i(0, 2))), og, fg,
      abv: Math.round((og - fg) * 131.25 * 10) / 10, vol, yield: Math.round(R.f(88, 96) * 10) / 10,
      status: 'Packaged'
    });
  }

  /* ---------- finished goods ---------- */
  const SKUS = [
    { sku: 'CP-B33', beer: 'pilsner', format: 'Bottle 33cl · case of 24', unit: 'cases', onHand: 412, reserved: 96, daily: 14.2, price: 360 },
    { sku: 'CP-K20', beer: 'pilsner', format: 'Keg 20L', unit: 'kegs', onHand: 38, reserved: 12, daily: 2.9, price: 1390 },
    { sku: 'CP-K30', beer: 'pilsner', format: 'Keg 30L', unit: 'kegs', onHand: 22, reserved: 6, daily: 1.1, price: 1990 },
    { sku: 'BS-B33', beer: 'bobcat', format: 'Bottle 33cl · case of 24', unit: 'cases', onHand: 168, reserved: 30, daily: 5.1, price: 384 },
    { sku: 'BS-K20', beer: 'bobcat', format: 'Keg 20L', unit: 'kegs', onHand: 14, reserved: 5, daily: 1.3, price: 1490 },
    { sku: 'BO-B33', beer: 'bombay', format: 'Bottle 33cl · case of 24', unit: 'cases', onHand: 96, reserved: 40, daily: 6.4, price: 432 },
    { sku: 'BO-K20', beer: 'bombay', format: 'Keg 20L', unit: 'kegs', onHand: 21, reserved: 4, daily: 1.6, price: 1690 },
    { sku: 'DP-B33', beer: 'pedersen', format: 'Bottle 33cl · case of 24', unit: 'cases', onHand: 133, reserved: 10, daily: 3.2, price: 420 },
    { sku: 'OH-C44', beer: 'haze', format: 'Can 44cl · case of 24', unit: 'cases', onHand: 58, reserved: 22, daily: 5.8, price: 528 },
    { sku: 'OH-K20', beer: 'haze', format: 'Keg 20L', unit: 'kegs', onHand: 17, reserved: 3, daily: 1.4, price: 1790 },
    { sku: 'BK-C44', beer: 'kush', format: 'Can 44cl · case of 24', unit: 'cases', onHand: 240, reserved: 0, daily: 1.1, price: 504 },
    { sku: 'AJ-B33', beer: 'axel', format: 'Bottle 33cl · case of 24', unit: 'cases', onHand: 520, reserved: 140, daily: 11.5, price: 480 },
    { sku: 'AJ-K20', beer: 'axel', format: 'Keg 20L', unit: 'kegs', onHand: 30, reserved: 10, daily: 1.2, price: 1890 },
    { sku: 'LX-C44', beer: 'labx', format: 'Can 44cl · case of 24 (LAB:X #27)', unit: 'cases', onHand: 34, reserved: 6, daily: 0.9, price: 552 },
    { sku: 'CP-G06', beer: 'pilsner', format: 'Gift box · 6 bottles', unit: 'boxes', onHand: 75, reserved: 10, daily: 1.8, price: 149 }
  ];
  SKUS.forEach(s => {
    s.available = s.onHand - s.reserved;
    s.cover = s.available / s.daily;
    s.value = s.onHand * s.price;
    s.status = s.cover < 7 ? 'critical' : s.cover < 14 ? 'warning' : s.cover > 90 ? 'over' : 'good';
  });

  /* ---------- raw materials ---------- */
  const MATERIALS = [
    { group: 'Malt', name: 'Pilsner malt', unit: 'kg', onHand: 4200, cap: 8000, reorder: 2500, supplier: 'Nordic Malt Co.', lead: 10 },
    { group: 'Malt', name: 'Pale ale malt', unit: 'kg', onHand: 2900, cap: 6000, reorder: 1800, supplier: 'Nordic Malt Co.', lead: 10 },
    { group: 'Malt', name: 'Munich malt', unit: 'kg', onHand: 640, cap: 1500, reorder: 400, supplier: 'Nordic Malt Co.', lead: 10 },
    { group: 'Malt', name: 'Wheat malt', unit: 'kg', onHand: 380, cap: 1000, reorder: 300, supplier: 'Nordic Malt Co.', lead: 10 },
    { group: 'Malt', name: 'Roasted malt (Carafa)', unit: 'kg', onHand: 90, cap: 300, reorder: 100, supplier: 'Nordic Malt Co.', lead: 14 },
    { group: 'Hops', name: 'Citra', unit: 'kg', onHand: 34, cap: 80, reorder: 30, supplier: 'HopHaus Supply', lead: 7 },
    { group: 'Hops', name: 'Mosaic', unit: 'kg', onHand: 58, cap: 100, reorder: 35, supplier: 'HopHaus Supply', lead: 7 },
    { group: 'Hops', name: 'Simcoe', unit: 'kg', onHand: 21, cap: 40, reorder: 12, supplier: 'HopHaus Supply', lead: 7 },
    { group: 'Hops', name: 'Tettnanger', unit: 'kg', onHand: 46, cap: 60, reorder: 20, supplier: 'HopHaus Supply', lead: 7 },
    { group: 'Hops', name: 'Amarillo', unit: 'kg', onHand: 6, cap: 30, reorder: 10, supplier: 'HopHaus Supply', lead: 7, safety: 7 },
    { group: 'Hops', name: 'Cascade', unit: 'kg', onHand: 18, cap: 40, reorder: 12, supplier: 'HopHaus Supply', lead: 7 },
    { group: 'Hemp', name: 'Food-grade hemp flowers', unit: 'kg', onHand: 22, cap: 40, reorder: 12, supplier: 'Fyn Hemp', lead: 5 },
    { group: 'Hemp', name: 'Toasted hemp seeds', unit: 'kg', onHand: 140, cap: 200, reorder: 60, supplier: 'Fyn Hemp', lead: 5 },
    { group: 'Yeast', name: 'Lager yeast (W-34/70)', unit: 'packs', onHand: 12, cap: 20, reorder: 6, supplier: 'Yeast Lab DK', lead: 4 },
    { group: 'Yeast', name: 'US-05 ale yeast', unit: 'packs', onHand: 18, cap: 30, reorder: 8, supplier: 'Yeast Lab DK', lead: 4 },
    { group: 'Yeast', name: 'Kveik (Voss)', unit: 'packs', onHand: 3, cap: 10, reorder: 4, supplier: 'Yeast Lab DK', lead: 6 },
    { group: 'Packaging', name: 'Bottles 33cl', unit: 'pcs', onHand: 18400, cap: 40000, reorder: 12000, supplier: 'Glasværket Nord', lead: 21 },
    { group: 'Packaging', name: 'Crown caps', unit: 'pcs', onHand: 52000, cap: 100000, reorder: 20000, supplier: 'Glasværket Nord', lead: 14 },
    { group: 'Packaging', name: 'Cans 44cl', unit: 'pcs', onHand: 5200, cap: 20000, reorder: 6000, supplier: 'CanCo Nordic', lead: 28 },
    { group: 'Packaging', name: 'Shipping cases (24)', unit: 'pcs', onHand: 1250, cap: 3000, reorder: 800, supplier: 'Pap & Kasse ApS', lead: 7 }
  ];
  MATERIALS.forEach(m => {
    m.status = (m.safety && m.onHand < m.safety) ? 'critical' : m.onHand < m.reorder ? 'warning' : 'good';
  });

  const PURCHASE_ORDERS = [
    { id: 'PO-1187', supplier: 'HopHaus Supply', items: 'Amarillo 20 kg · Citra 30 kg', eta: addDays(today, 3), amount: 18400, status: 'Confirmed' },
    { id: 'PO-1186', supplier: 'CanCo Nordic', items: 'Cans 44cl × 12,000', eta: addDays(today, 9), amount: 21600, status: 'In transit' },
    { id: 'PO-1185', supplier: 'Nordic Malt Co.', items: 'Pilsner malt 3,000 kg', eta: addDays(today, 12), amount: 26100, status: 'Confirmed' },
    { id: 'PO-1184', supplier: 'Yeast Lab DK', items: 'Kveik (Voss) × 8', eta: addDays(today, 5), amount: 2960, status: 'Awaiting supplier' }
  ];

  /* ---------- kegs ---------- */
  const KEGS = [
    { id: 'filled', name: 'Filled, at brewery', count: 86 },
    { id: 'empty', name: 'Empty / cleaning', count: 64 },
    { id: 'market', name: 'Out with customers', count: 248 },
    { id: 'overdue', name: 'Overdue (> 60 days)', count: 22 }
  ];

  /* ---------- accounts (fictional) ---------- */
  const ACCOUNT_SEED = [
    ['Mælkevejen Kiosk', 'Retail · Christiania', 'Christiania'], ['Fristaden Købmand', 'Retail · Christiania', 'Christiania'],
    ['Den Grønne Kælder', 'Bar · Christiania', 'Christiania'], ['Christianshavn Vinbar', 'Bar', 'Copenhagen K'],
    ['Nørrebro Ølhus', 'Bar', 'Copenhagen N'], ['Vesterbro Bottle Shop', 'Retail · Copenhagen', 'Copenhagen V'],
    ['Amager Købmand', 'Retail · Copenhagen', 'Amager'], ['Østerbro Deli', 'Retail · Copenhagen', 'Copenhagen Ø'],
    ['Islands Brygge Café', 'Restaurant', 'Copenhagen S'], ['Frederiksberg Fadøl', 'Bar', 'Frederiksberg'],
    ['Havnens Pizza', 'Restaurant', 'Copenhagen K'], ['Refshaleøen Food Hall', 'Restaurant', 'Copenhagen K'],
    ['Kanalens Smørrebrød', 'Restaurant', 'Copenhagen K'], ['Valby Ølbutik', 'Retail · Copenhagen', 'Valby'],
    ['Roskilde Craft Corner', 'Retail · Zealand', 'Roskilde'], ['Helsingør Havnebar', 'Bar', 'Helsingør'],
    ['Aarhus Ølbar', 'Bar', 'Aarhus'], ['Odense Ølkælder', 'Bar', 'Odense'],
    ['Aalborg Bryg & Bid', 'Restaurant', 'Aalborg'], ['Bornholm Delikatesse', 'Retail · Bornholm', 'Rønne'],
    ['Malmö Craft Imports', 'Distributor · Sweden', 'Malmö'], ['Berlin Hanf & Hopfen', 'Distributor · Germany', 'Berlin']
  ];
  const ACCOUNTS = ACCOUNT_SEED.map(([name, type, city], i) => {
    const big = i === 20 || i === 21 ? 2.6 : type.startsWith('Retail') ? 1.2 : 1;
    const revYTD = round(R.f(38000, 260000) * big, 100);
    const lastOrder = i === 7 ? 41 : i === 15 ? 37 : R.i(1, 19);
    const overdueDays = i === 4 ? 22 : i === 12 ? 18 : i === 18 ? 31 : 0;
    const outstanding = overdueDays ? round(R.f(6000, 24000), 10) : R.f(0, 1) > 0.5 ? round(R.f(2000, 14000), 10) : 0;
    const status = overdueDays > 14 ? 'Overdue' : lastOrder > 30 ? 'At risk' : 'Active';
    const trend = Array.from({ length: 12 }, (_, k) => Math.max(0, revYTD / 11 * (0.7 + 0.5 * Math.sin((k + i) / 2)) * (1 + R.n() * 0.2)));
    return { id: 'A' + (101 + i), name, type, city, revYTD, lastOrder, outstanding, overdueDays, status, trend,
      kegs: type.startsWith('Bar') || type === 'Restaurant' ? R.i(2, 18) : type.startsWith('Distributor') ? R.i(20, 40) : 0 };
  });

  /* ---------- orders (last 45 days) ---------- */
  const SHOPPERS = ['Mads K.', 'Sofie L.', 'Jonas P.', 'Freja H.', 'Emil S.', 'Ida N.', 'Lukas B.', 'Clara M.', 'Oscar T.', 'Alma R.', 'William J.', 'Ella D.', 'Noah V.', 'Karla F.'];
  const ORDERS = [];
  let soNo = 4870, wNo = 1290;
  for (let d = 0; d < 45; d++) {
    const date = addDays(today, -d);
    const n = d === 0 ? R.i(2, 4) : R.i(2, 6);
    for (let k = 0; k < n; k++) {
      const b2b = rnd() < 0.55;
      let status;
      if (d <= 1) status = R.pick(['Packing', 'Packing', 'Pending payment']);
      else if (d <= 4) status = R.pick(['Shipped', 'Delivered', 'Pending payment']);
      else status = 'Delivered';
      if (b2b) {
        const acc = R.pick(ACCOUNTS);
        if (acc.overdueDays && d > 14 && d < 40 && rnd() < 0.5) status = 'Overdue';
        ORDERS.push({ id: 'SO-' + (soNo--), date, customer: acc.name, channel: acc.type.startsWith('Retail') || acc.type.startsWith('Distributor') ? 'retail' : 'ontrade',
          items: R.i(4, 30) + ' items', amount: round(R.f(1400, 9800), 10), status });
      } else {
        const cases = R.i(1, 3);
        ORDERS.push({ id: 'W-' + (wNo--), date, customer: R.pick(SHOPPERS), channel: 'webshop',
          items: cases === 1 ? 'Mixed case 24' : cases + ' × mixed case', amount: round(R.f(289, 420) * cases, 1), status: status === 'Pending payment' ? 'Packing' : status });
      }
    }
  }
  ORDERS.forEach((o, i) => {
    o.date = new Date(o.date.getTime() + (9 + (i % 9)) * 3600000 + (i * 7 % 60) * 60000);
    if (o.date > now) o.date = new Date(now.getTime() - (8 + i * 13) * 60000);
  });
  ORDERS.sort((a, b) => b.date - a.date);

  /* ---------- taproom ---------- */
  const TAPS = [
    { tap: 1, beer: 'pilsner', name: 'Christiania Pilsner', keg: '30L', left: 0.64, pours: 0 },
    { tap: 2, beer: 'pilsner', name: 'Pilsner Ufiltreret', keg: '20L', left: 0.31, pours: 0 },
    { tap: 3, beer: 'bobcat', name: 'Bobcat Sam', keg: '20L', left: 0.82, pours: 0 },
    { tap: 4, beer: 'bombay', name: 'Bombay', keg: '20L', left: 0.12, pours: 0 },
    { tap: 5, beer: 'pedersen', name: 'Dry Pedersen', keg: '20L', left: 0.55, pours: 0 },
    { tap: 6, beer: 'haze', name: 'Orange Haze', keg: '20L', left: 0.08, pours: 0 },
    { tap: 7, beer: 'axel', name: 'Axel Julemand', keg: '20L', left: 0.93, pours: 0 },
    { tap: 8, beer: 'labx', name: 'LAB:X #27 Hemp Saison', keg: '20L', left: 0.47, pours: 0 },
    { tap: 9, beer: 'labx', name: 'LAB:X #26 Smoked Hemp Porter', keg: '20L', left: 0.22, pours: 0 },
    { tap: 10, beer: 'kush', name: 'Blueberry Kush', keg: '20L', left: 0.18, pours: 0 },
    { tap: 11, beer: null, name: 'Hemp Lemonade (non-alc.)', keg: '20L', left: 0.71, pours: 0 },
    { tap: 12, beer: null, name: 'Fristaden Cider (guest)', keg: '20L', left: 0.39, pours: 0 }
  ];
  const tapProgress = clamp((hour - 12) / 10, 0, 1);
  TAPS.forEach(t => { t.pours = Math.round(R.f(8, 46) * (t.tap <= 7 ? 1.4 : 0.8) * tapProgress * (today.getDay() === 6 || today.getDay() === 5 ? 1.4 : 1)); });

  // traffic heatmap: average revenue per hour, last 4 weeks. Rows Mon..Sun, cols 12..22
  const OPEN_HOURS = { 0: [12, 21], 1: [12, 21], 2: [12, 21], 3: [12, 21], 4: [12, 22], 5: [12, 22], 6: [12, 22] };
  const HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const hourCurve = h => 0.35 + 0.65 * Math.exp(-Math.pow(h - 18.6, 2) / (2 * 2.4 * 2.4));
  const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
  const tapSeason = season('summer', today);
  const curveSum = wd => HOURS.reduce((a, h) => a + (h < OPEN_HOURS[wd][1] ? hourCurve(h) : 0), 0);
  const expectedHour = (wd, h) => (h >= OPEN_HOURS[wd][1] ? null : CHANNELS[0].base * CHANNELS[0].wd[wd] * tapSeason * hourCurve(h) / curveSum(wd));
  const HEAT = WEEK_ORDER.map(wd => HOURS.map(h => {
    const v = expectedHour(wd, h);
    return v == null ? null : Math.round(v * (1 + R.n() * 0.12));
  }));
  const typicalToday = HOURS.map(h => { const v = expectedHour(today.getDay(), h); return v == null ? null : Math.round(v); });
  const todayHourly = HOURS.map((h, i) => {
    if (h + 1 > hour || typicalToday[i] === null) return null;
    return Math.round(typicalToday[i] * (1.06 + R.n() * 0.16));
  });
  // today's taproom revenue = completed hours + the hour in progress
  (function syncToday() {
    const ci = HOURS.indexOf(Math.floor(hour));
    const partial = ci >= 0 && typicalToday[ci] != null ? Math.round(typicalToday[ci] * (hour % 1) * 1.05) : 0;
    const tapToday = todayHourly.reduce((a, v) => a + (v || 0), 0) + partial;
    const dT = days[N_DAYS - 1];
    dT.total += tapToday - dT.rev.taproom;
    dT.rev.taproom = tapToday;
  })();
  const tapOpenNow = () => { const d = new Date(); const hh = d.getHours(); const oh = OPEN_HOURS[d.getDay()]; return hh >= oh[0] && hh < oh[1]; };

  /* ---------- bookings ---------- */
  const GUIDES = ['Freja', 'Kasper', 'Jonas', 'Ida', 'Malthe'];
  const WALKS = [];
  for (let d = 0; d < 15; d++) {
    const date = addDays(today, d);
    const wd = date.getDay();
    const slots = wd === 6 || wd === 0 ? [[12, 'EN'], [15, 'DA']] : wd === 5 ? [[16, 'EN']] : wd === 3 ? [[17, 'DA']] : [];
    slots.forEach(([h, lang]) => {
      const start = new Date(date); start.setHours(h, 0, 0, 0);
      if (start < now) return;
      const fullness = clamp(1.05 - d * 0.055 + R.n() * 0.2, 0.1, 1);
      WALKS.push({ start, lang, guide: R.pick(GUIDES), cap: 16, booked: Math.min(16, Math.round(16 * fullness)), price: 295, type: 'Christiania BeerWalk' });
    });
  }
  WALKS.splice(3, 0, { start: (() => { const s = addDays(today, 6); s.setHours(14, 0, 0, 0); return s; })(), lang: 'DA', guide: 'Kasper', cap: 24, booked: 22, price: 275, type: 'Private group · company outing' });

  const BEER_MILE = (() => {
    let y = today.getFullYear(); if (today.getMonth() > 4) y += 1;
    const d = new Date(y, 4, 26); while (d.getDay() !== 6) d.setDate(d.getDate() - 1);
    return { date: d, signups: 214, cap: 300, price: 349 };
  })();

  const SHAREHOLDERS = (() => {
    const out = []; let v = 1610;
    for (let m = 23; m >= 0; m--) {
      const date = new Date(today.getFullYear(), today.getMonth() - m, 1);
      v += Math.round(18 + R.f(0, 22) + (date.getMonth() === 11 ? 40 : 0) + (date.getMonth() === 5 ? 25 : 0));
      out.push({ date, value: v });
    }
    return out;
  })();
  const MEMBERS = { shareholders: SHAREHOLDERS[SHAREHOLDERS.length - 1].value, active: 1912, newThisMonth: SHAREHOLDERS[23].value - SHAREHOLDERS[22].value, eventsThisMonth: 3 };

  /* ---------- live activity templates ---------- */
  function activityEvent() {
    const roll = rnd();
    const t = new Date();
    if (roll < 0.42 && tapOpenNow()) {
      const tap = R.pick(TAPS.filter(x => x.beer));
      const n = R.i(1, 4);
      tap.pours += n;
      return { t, kind: 'taproom', icon: 'beer', title: `Taproom · ${n} × ${tap.name}`, meta: 'The Lab · bar 1', amount: n * R.pick([65, 70, 75]) };
    }
    if (roll < 0.58) {
      const cases = R.i(1, 2);
      return { t, kind: 'webshop', icon: 'cart', title: `Webshop order W-${++wNo + 200}`, meta: cases === 1 ? 'Mixed case 24 · pickup' : '2 × mixed case · delivery', amount: cases * R.pick([299, 349, 389]) };
    }
    if (roll < 0.7) {
      const g = R.i(2, 6);
      const w = R.pick(WALKS.slice(0, 6));
      return { t, kind: 'events', icon: 'calendar', title: `BeerWalk booked · ${g} guests`, meta: w ? w.start.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ' · ' + w.lang : 'Saturday', amount: g * 295 };
    }
    if (roll < 0.82) {
      const tank = R.pick(TANKS.filter(x => x.beer && x.phase === 'Fermenting'));
      return { t, kind: 'production', icon: 'flask', title: `${tank.id} reading logged`, meta: `${tank.sg.toFixed(3)} SG · ${tank.temp.toFixed(1)} °C`, amount: null };
    }
    if (roll < 0.92) {
      const acc = R.pick(ACCOUNTS);
      return { t, kind: 'retail', icon: 'receipt', title: `Invoice paid · ${acc.name}`, meta: 'Bank transfer', amount: round(R.f(1800, 9600), 10) };
    }
    const acc = R.pick(ACCOUNTS.filter(a => a.kegs > 0));
    return { t, kind: 'kegs', icon: 'keg', title: `Kegs returned · ${R.i(2, 6)} × 20L`, meta: acc.name, amount: null };
  }

  const SEED_ACTIVITY = [];
  for (let i = 0; i < 9; i++) {
    const e = activityEvent();
    e.t = new Date(now.getTime() - (i * 7 + R.i(1, 5)) * 60000);
    SEED_ACTIVITY.push(e);
  }

  window.HQ = {
    R, now, today, addDays, DAY,
    CHANNELS, BEERS, beerById, days, beerWeights,
    TANKS, PLAN, PHASES, BATCHES,
    SKUS, MATERIALS, PURCHASE_ORDERS, KEGS,
    ACCOUNTS, ORDERS,
    TAPS, HEAT, HOURS, WEEK_ORDER, OPEN_HOURS, typicalToday, todayHourly,
    WALKS, BEER_MILE, SHAREHOLDERS, MEMBERS,
    activityEvent, SEED_ACTIVITY
  };
})();
