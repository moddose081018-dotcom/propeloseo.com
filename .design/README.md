# Homepage design canvas

Working sources for the PropeloSEO homepage design canvas. Each `.dc.html` file is
one artboard; `canvas.json` positions them across two pages and holds the notes.

## Page 1 — Homepage

Direction A ("Evidence-first") built out full length: the Trust Score terminal is
promoted to the hero on a dark fold.

| Artboard | Contents |
| --- | --- |
| `Main.dc.html` | The whole page, 16 sections, ~10,640px tall |
| `MainMobile.dc.html` | The same page at 390px wide, ~8,720px tall |

Section order: hero with the live scan · data-source band · "run it on your domain"
scanner · the problem · why AI SEO matters now · AI SEO vs traditional SEO · the
90-day sprint · the Evidence Engine · AI visibility · how to choose an AI SEO service ·
Growth Credits · pricing · guarantee + founding cohort · FAQ · closing CTA · footer.

## Copy

Rewritten against NeuronWriter for the commercial term **"ai seo services"**, scoring
**81/100** — above the highest-scoring page currently ranking on that SERP (81) and
well above the 38–77 typical of the rest of the top ten.

The first target tried, "ai visibility monitoring", was abandoned deliberately: that
SERP is 76% informational and dominated by 3,000–11,700-word "best AI visibility
tools" listicles, whose own winners only reach 56–73. Scoring 80+ there would have
meant turning the homepage into a competitor comparison article.

Copy still comes from the live page for every factual claim — the $97/$197 prices, the
five-business-day guarantee, the ten-member cohort, the month 1–3 checklists. Nothing
is invented, and the new buyer's-guide section states plainly what the service does
not do (no link building, no pay-per-click, no full-service digital marketing).

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
