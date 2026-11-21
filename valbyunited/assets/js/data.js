/* ==========================================================================
   Valby United — MOCK DATA
   --------------------------------------------------------------------------
   Everything in this file is placeholder content for the design: opponents,
   fixtures, results, league table, squad and staff are invented.
   Replace it with real data, or fetch it from the club backend and pass the
   same shape to the render functions in main.js.

   Fixture dates are generated relative to "today" so the countdown and
   match centre always look alive in the demo.
   ========================================================================== */
(function () {
  "use strict";

  // resolve the crest relative to this script, so pages in sub-folders (e.g. /en/) work too
  const SCRIPT = document.currentScript && document.currentScript.src;
  const CREST = window.VU_CREST || (SCRIPT ? new URL("../img/brand/crest-128.png", SCRIPT).href : "assets/img/brand/crest-128.png");

  const teams = {
    VU:  { name: "Valby United",      short: "VU",  crest: CREST },
    KEI: { name: "Kgs. Enghave IF",   short: "KEI", colors: ["#c8102e", "#ffffff"] },
    VFC: { name: "Vigerslev FC",      short: "VFC", colors: ["#0b3d91", "#ffd100"] },
    SBK: { name: "Sydhavn BK",        short: "SBK", colors: ["#00a3e0", "#ffffff"] },
    DBK: { name: "Damhus BK",         short: "DBK", colors: ["#ffd100", "#111111"] },
    CBI: { name: "Carlsberg Byen IF", short: "CBI", colors: ["#7a1f2b", "#f2e6c9"] },
    GU:  { name: "Grøndal United",    short: "GU",  colors: ["#e35205", "#ffffff"] },
    TBK: { name: "Toftegård BK",      short: "TBK", colors: ["#2b2b2b", "#e8e8e8"] },
    AFC: { name: "Ålholm FC",         short: "ÅFC", colors: ["#d4a017", "#1e1e1e"] },
    LIF: { name: "Langgade IF",       short: "LIF", colors: ["#1f4e79", "#ffffff"] },
    HN:  { name: "Hvidovre Nord",     short: "HN",  colors: ["#b91c1c", "#111111"] },
    BFC: { name: "Bellahøj FC",       short: "BFC", colors: ["#0e7490", "#ffffff"] },
  };

  /* ---- relative dates ---- */
  const now = new Date();
  let toSunday = (7 - now.getDay()) % 7;
  if (toSunday === 0 && now.getHours() >= 15) toSunday = 7;
  function day(offset, hh, mm) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + toSunday + offset);
    d.setHours(hh, mm || 0, 0, 0);
    return d;
  }

  const HOME = "Valby Idrætspark";

  const upcoming = [
    { date: day(0, 13),      comp: "league", round: 14, home: "VU",  away: "VFC", venue: HOME, free: true },
    { date: day(6, 14),      comp: "league", round: 15, home: "CBI", away: "VU",  venue: "Carlsberg Byen Kunstgræs" },
    { date: day(11, 19, 30), comp: "cup", round: "QF", home: "VU", away: "HN", venue: HOME, free: true },
    { date: day(14, 12),     comp: "league", round: 16, home: "GU",  away: "VU",  venue: "Grøndal Idrætsanlæg" },
    { date: day(21, 13),     comp: "league", round: 17, home: "VU",  away: "AFC", venue: HOME, free: true },
  ];

  const results = [
    { date: day(-7, 13),  comp: "league", round: 13, home: "VU",  away: "SBK", score: [2, 1], venue: HOME },
    { date: day(-14, 15), comp: "league", round: 12, home: "DBK", away: "VU",  score: [1, 1], venue: "Damhus Boldbaner" },
    { date: day(-21, 13), comp: "league", round: 11, home: "VU",  away: "TBK", score: [3, 0], venue: HOME },
    { date: day(-28, 14), comp: "league", round: 10, home: "LIF", away: "VU",  score: [0, 2], venue: "Langgade Stadion" },
    { date: day(-35, 13), comp: "league", round: 9,  home: "VU",  away: "KEI", score: [1, 2], venue: HOME },
  ];

  // [team, played, won, drawn, lost, goalsFor, goalsAgainst, form (newest first: W/D/L)]
  const table = [
    ["KEI", 13, 10, 2, 1, 31, 11, "WWDWW"],
    ["VU",  13,  9, 3, 1, 29, 12, "WDWWL"],
    ["VFC", 13,  8, 2, 3, 25, 15, "WWLWD"],
    ["SBK", 13,  7, 3, 3, 22, 16, "LWWDW"],
    ["DBK", 13,  6, 4, 3, 20, 17, "DDWLW"],
    ["CBI", 13,  5, 2, 6, 21, 19, "WLLWD"],
    ["GU",  13,  4, 3, 6, 18, 20, "LDWLL"],
    ["TBK", 13,  3, 4, 6, 15, 21, "LLDDW"],
    ["AFC", 13,  3, 3, 7, 14, 22, "DLWLL"],
    ["LIF", 13,  3, 2, 8, 15, 24, "LLWLD"],
    ["HN",  13,  2, 3, 8, 12, 25, "DLLLW"],
    ["BFC", 13,  1, 3, 9, 10, 30, "LLDLL"],
  ];

  // pos: GK | DF | MF | FW   (labels are translated in main.js)
  const squad = [
    { no: 1,  first: "Mikkel",  last: "Sørensen",  pos: "GK", apps: 13, goals: 0 },
    { no: 16, first: "Ali",     last: "Rahimi",    pos: "GK", apps: 2,  goals: 0 },
    { no: 2,  first: "Frederik",last: "Holm",      pos: "DF", apps: 12, goals: 1 },
    { no: 3,  first: "Yusuf",   last: "Demir",     pos: "DF", apps: 13, goals: 0 },
    { no: 4,  first: "Daniel",  last: "Osei",      pos: "DF", apps: 13, goals: 3 },
    { no: 5,  first: "Mads",    last: "Lund",      pos: "DF", apps: 11, goals: 1 },
    { no: 15, first: "Oliver",  last: "Nielsen",   pos: "DF", apps: 8,  goals: 0 },
    { no: 6,  first: "Tobias",  last: "Andersen",  pos: "MF", apps: 13, goals: 1 },
    { no: 8,  first: "Emre",    last: "Yilmaz",    pos: "MF", apps: 12, goals: 5 },
    { no: 10, first: "Jonas",   last: "Kristensen",pos: "MF", apps: 13, goals: 7, captain: true },
    { no: 14, first: "Noah",    last: "Petersen",  pos: "MF", apps: 10, goals: 0 },
    { no: 17, first: "Samir",   last: "El-Amrani", pos: "MF", apps: 9,  goals: 0 },
    { no: 7,  first: "Lucas",   last: "Pedersen",  pos: "FW", apps: 12, goals: 0 },
    { no: 9,  first: "Karim",   last: "Benali",    pos: "FW", apps: 13, goals: 11 },
    { no: 11, first: "Adam",    last: "Mortensen", pos: "FW", apps: 11, goals: 0 },
    { no: 19, first: "Ibrahim", last: "Diallo",    pos: "FW", apps: 7,  goals: 0 },
  ];

  const staff = [
    { role: "head",      name: "Rasmus Dahl" },
    { role: "assistant", name: "Hassan Jaber" },
    { role: "keeper",    name: "Peter Vinther" },
  ];

  const seasonStats = { goals: 29, cleanSheets: 6, losses: 1 };

  window.VU_DATA = { teams, upcoming, results, table, squad, staff, seasonStats, homeVenue: HOME };
})();
