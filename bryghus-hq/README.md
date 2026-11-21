# Bryghus HQ: command center demo

An operations dashboard for the owner of Christiania Bryghus, built as a companion to the website redesign in `../christiania-bryghus/`. **Every figure is mock data**, generated in the browser.

Plain HTML, CSS and JavaScript. No build step and no libraries. All charts are hand-drawn SVG/HTML, and the only external request is Google Fonts.

## Open it

```bash
cd bryghus-hq
python3 -m http.server 8000
```

Then open http://localhost:8000. You can also double-click `index.html`, which works without a server.

## What's inside

| View | What the owner sees |
|---|---|
| **Command center** | Revenue hero with a month-to-date target meter, KPI tiles with sparklines, revenue vs the previous period, channel mix, the live cellar, alerts that need attention, top beers, lowest stock cover and a live activity feed |
| **Sales & revenue** | Small multiples per sales channel (on a shared scale), monthly revenue vs target, revenue by beer, and a searchable, sortable, exportable orders table |
| **Inventory** | Finished goods with days of cover and status, raw materials and packaging vs reorder points, the keg fleet and incoming purchase orders |
| **Production** | Tank grid; click a tank for its gravity and temperature curves, readings and actions. Also a three-week production plan (Gantt) and the batch log |
| **The Lab taproom** | Today vs a typical day hour by hour, top sellers, a tap list with keg levels, a busy-hours heatmap and today's shift |
| **Bookings & community** | Upcoming BeerWalks with seats left, a Beer Mile countdown, Folkeaktier shareholder growth and weekly guests |
| **Partners & accounts** | Fictional B2B accounts with trends, overdue invoices (with reminder buttons) and account detail panels |

Across the app:

- **Search:** ⌘K / Ctrl+K opens a command palette that jumps to views, tanks, beers and accounts.
- **Filters:** date-range presets (7D / 30D / 90D / YTD / 12M) re-compute every figure, and Sales also has a channel filter.
- **Live feed:** sales, bookings and tank readings tick in every few seconds, and today's totals update with them.
- **Themes:** dark by default, with a light theme. The choice is remembered.
- **Chart / table toggle:** every chart has one, and the data tables export to CSV.
- **Responsive:** works down to phone width.

## Mock data

`js/data.js` generates about two years of daily revenue per channel. It uses a fixed seed and is anchored to today's date, with:

- seasonality: summer peaks for the taproom and BeerWalks, a Christmas bump for retail and the webshop
- weekday patterns and year-on-year growth

Tanks, fermentation readings, stock levels, raw materials, kegs, accounts, orders, taps and bookings are all invented. Beer names, styles and ABVs come from the real beer list. Account, supplier and staff names are fictional.

Replacing the mock layer with real sources (POS, webshop, accounting, brewing software) means swapping `js/data.js` for API calls that return the same shapes.

## Chart colours

Chart colours use a colour-blind-checked palette, validated against both theme backgrounds:

- categorical colours for sales channels
- an ordered blue ramp for production phases
- a single-hue blue ramp for the heatmap
- reserved status colours (good / warning / attention / critical), always shown with an icon and a label

The brand yellow is used only for interface highlights, never as a data colour.
