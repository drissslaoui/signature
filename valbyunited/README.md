# Valby United — new website (redesign)

A complete redesign of [valbyunited.dk](https://valbyunited.dk/). It's a static site (HTML, CSS and vanilla JS) with no build step, styled after the big club sites (FC Barcelona, Real Madrid) and built on Valby United's own identity: the black/white split crest and Valby green `#08BB61`.

The crest is used exactly as it is. It has only been resized for web use, and the original file is kept in `assets/img/brand/crest-original.png`.

## Pages

| File | Contents |
| --- | --- |
| `index.html` | Hero with live countdown to the next match, a values ticker, news, match centre (fixtures/results, league table, season stats, top scorers), squad with position filter, coaching staff, about the club, academy/teams with training times, e-sport teaser, kits/fan shop, membership, partners, newsletter and footer |
| `esport.html` | The e-sport department: concept, a typical session, games, waiting-list form with validation, and FAQ |

## Running locally

```bash
cd valbyunited
python3 -m http.server 8000
# open http://localhost:8000
```

Any static host works: Netlify, Vercel, GitHub Pages, nginx, and so on.

## What is real and what is mock

**Real** (taken from the current site): the crest, the club's photos (`club-people.jpg`, `esport-key-art.jpg`), the about text, the club history (founded in 2021 as Boldklubben Folehaven, renamed in 2024), the values, the e-sport text, the partner logos, the address, phone, e-mail and the Facebook link.

**Mock (placeholder for the design):**

- `assets/js/data.js` contains all match data: opponents, fixtures, results, league table, squad, staff and season stats. Fixture dates are generated relative to today, so the countdown always works in the demo.
- News articles, training times, membership prices, kits/prices, the "300+ members" and "40+ volunteers" figures, the home ground "Valby Idrætspark", and the e-sport session plan and FAQ answers.
- The stock photos (see credits below).

Replace these with real content before launch.

### Connecting real data

The old site fetched articles and matches from a backend that no longer responds (`valbyunitedbackendv1-production.up.railway.app` returns 404). To use live data, fetch it in `data.js` and map it to the same structure (`teams`, `upcoming`, `results`, `table`, `squad`, `staff`). The render functions in `main.js` work unchanged.

### Forms

The newsletter and the e-sport waiting list validate and show a confirmation **in the browser only**. Nothing is sent anywhere. Connect them to a form service (Formspree, Netlify Forms) or to the club's own backend in `initForms()` in `assets/js/main.js`.

## Structure

```
valbyunited/
├── index.html
├── esport.html
└── assets/
    ├── css/main.css        design tokens + all components
    ├── js/data.js          MOCK DATA (fixtures, table, squad …)
    ├── js/main.js          header, menu, countdown, .ics, tabs, rendering, forms
    └── img/
        ├── brand/          crest in several sizes, favicon, OG image
        ├── partners/       partner logos
        └── photos/         photos
```

## Design

- **Typeface:** Archivo (Google Fonts, variable width). Condensed 800 uppercase for headings, normal width for body text.
- **Colours:** black `#0B0C0B`, white, light grey `#F2F3F1`, and green `#08BB61` for CTAs, active states and highlights. Green text on white uses `#067A40` for contrast.
- **Signature details:** the small split square next to every label echoes the split crest; the home kit is drawn from the crest; the player cards carry a tiger-stripe texture.
- Responsive from 360 px to large screens, with keyboard navigation (skip link, tabs with arrow keys, Esc closes the menu), `prefers-reduced-motion` support and alt text.

## Photo credits

The stock photos come from [Pexels](https://www.pexels.com/license/), which is free to use and requires no attribution. They should be replaced with the club's own photos.

| File | Source |
| --- | --- |
| `hero-match.jpg` | https://www.pexels.com/photo/men-playing-a-soccer-game-16602711/ |
| `stadium-night.jpg` | https://www.pexels.com/photo/illuminated-soccer-stadium-at-night-with-crowd-30651230/ |
| `news-volley.jpg` | https://www.pexels.com/photo/a-people-playing-soccer-12358254/ |
| `news-duel.jpg` | https://www.pexels.com/photo/men-playing-football-on-a-field-18799030/ |
| `academy-coach.jpg` | https://www.pexels.com/photo/a-coach-teaching-children-at-a-soccer-field-8941567/ |
| `academy-huddle.jpg` | https://www.pexels.com/photo/boys-standing-in-the-middle-of-a-soccer-field-8941647/ |
| `academy-session.jpg` | https://www.pexels.com/photo/a-man-in-blue-shirt-coaching-a-group-of-kids-standing-on-a-soccer-field-8941613/ |
| `floodlight.jpg` | https://www.pexels.com/photo/floodlights-on-black-stand-4135333/ |
