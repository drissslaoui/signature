# Christiania Bryghus — website redesign

A single-page redesign concept for [christianiabryghus.dk](https://christianiabryghus.dk), aiming for the polish of big beer brands (Heineken, Budweiser) while staying true to the brewery's own identity.

Plain HTML, CSS and JavaScript. No build step and no dependencies apart from Google Fonts.

## Preview locally

```bash
cd christiania-bryghus
python3 -m http.server 8000
```

Then open http://localhost:8000. The repo's Dockerfile also serves it at `/christiania-bryghus/`.

## Structure

```
christiania-bryghus/
├── index.html        page markup
├── css/style.css     design tokens, layout, responsive rules
├── js/main.js        age gate, beer explorer, live opening hours, reveals
└── assets/
    ├── logo.png      original logo, unchanged (from the current site)
    └── img/          placeholder photography
```

## Design system

- **Colours:** taken from the logo. Badge red `#EE151F`, leaf yellow `#FFF200`, warm near-black `#130D0B`, white. Yellow is kept for primary actions and highlights.
- **Type:** Big Shoulders Display (condensed display, uppercase) with Barlow for body text.
- **Signature moments:**
  - an age gate
  - a spinning "Skål" stamp in the hero
  - an interactive beer explorer: the section recolours itself for each beer and swaps a code-drawn bottle with its own label
  - a live "Open now" status for The Lab, in Copenhagen time

## What's real and what's placeholder

From the current site:

- beer names, styles, ABV, IBU, hops and collaborations
- The Lab's address and opening hours
- Folkeaktier / BrygNitterne, BeerWalk, Beer Mile and gift cards
- social links
- the logo

Mock content, to replace before launch:

- BeerWalk price and duration, Beer Mile date, gift card price
- "On tap today" list, including LAB:X #27
- the bitterness, body and hemp meters in the beer explorer (bitterness is derived from IBU)
- all photography: stock images from Unsplash (Unsplash License), standing in for the brewery's own photos

Unsplash photo IDs used: `1546622891-02c72c1537b6`, `1571767454098-246b94fbcf70`, `1559526642-c3f001ea68ee`, `1600093463592-8e36ae95ef56`, `1575037614876-c38a4d44f5b8`, `1436076863939-06870fe779c2`, `1600788886242-5c96aabe3757`, `1513309914637-65c20a5962e1`, `1567696911980-2eed69a46042`, `1518176258769-f227c798150e`, `1575444758702-4a6b9222336e`, `1523567830207-96731740fa71`, `1571613316887-6f8d5cbf7ef7`, `1559818454-1b46997bfe30`.

Copy is in English. A Danish version would be the natural next step for the local audience.
