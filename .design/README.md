# Homepage design canvas

Working sources for the PropeloSEO homepage design canvas. Each `.dc.html` file is
one artboard; `canvas.json` positions them across two pages and holds the notes.

## Page 1 — Homepage

Direction A ("Evidence-first") built out full length: the Trust Score terminal is
promoted to the hero on a dark fold.

| Artboard | Contents |
| --- | --- |
| `Main.dc.html` | The whole page, 14 sections, ~7,400px tall |
| `MainMobile.dc.html` | 390px wide — first screens only |

Section order: hero with the live scan · data-source band · "run it on your domain"
scanner · the problem · the 90-day sprint · the Evidence Engine · AI visibility ·
Growth Credits · pricing · guarantee + founding cohort · FAQ · closing CTA · footer.

Static mockup — nothing is clickable. The FAQ shows every answer open so the copy
reads at a glance. One tweak above the artboard changes the accent colour globally.

## Page 2 — Earlier directions

Kept for reference; not carried forward.

| Artboard | Direction |
| --- | --- |
| `Editorial.dc.html` | B · Editorial ledger — serif, hairline rules, scan as a table |
| `SprintBoard.dc.html` | C · Sprint board — the 90-day board above the fold |
| `PriceForward.dc.html` | D · Price-forward — $97 as the argument |

## Conventions

All artboards reuse the tokens already in `index.html`: `#2563eb` action, `#0f172a`
dark, slate text, the Catppuccin terminal palette, and the 16/10/6px radii. Copy is
taken from the live page; no figures are invented.

Frame heights in `canvas.json` are measured from a real render, not estimated.

These are exploration only — nothing here is wired into the published site.
