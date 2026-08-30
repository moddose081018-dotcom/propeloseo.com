# ranking-factor-analyzer run — "ai seo services"

Run date: 2026-08-30. Keyword: **ai seo services**, United States / en, desktop.

## What this is

[Marc Moeller's ranking-factor-analyzer](https://github.com/Marc-Moeller/ranking-factor-analyzer)
(`ranklens`) is a Cora-style correlation engine: it takes a SERP, fetches every
ranking page, extracts 113 on-page factors from each, and Spearman-correlates
each factor against rank. Factors whose |r| clears a sample-size-dependent
critical value are flagged significant; everything else is noise.

Licence position: the repo is dual-licensed and `LICENSING.md` is explicit —
"Running an unmodified copy internally carries no such obligation. Neither does
modifying it for your own private use without offering it to anyone else."
This run is internal and unmodified: the upstream clone is untouched, and the
only code here is a shim that hands it a SERP. Nothing from `ranklens` is
vendored into this repo. Commercial use needs a licence from marc@ecomexperts.au.

## How it was run

`ranklens` sources its SERP from a SERP-provider API (`SERP_API_KEY`) or falls
back to DataForSEO's REST API (`DATAFORSEO_LOGIN`/`PASSWORD`). Neither credential
exists in this container — the DataForSEO account is reachable only through an
MCP server, whose keys never touch this process.

So the SERP was fetched through the MCP tool, frozen to
`serp-ai-seo-services.json`, and injected. `run_analyze_injected.py` replaces
`ranklens.pipeline.fetch_serp` with a function returning the frozen `Serp`, and
sets `serp_source="serpmaster"` so `need_deep` stays False and the
credential-requiring DataForSEO client is never called. Everything downstream is
upstream code, unmodified.

LLM-dependent stages (entity/EAV extraction, topical authority, the funnel
panels, the AI narrative) are switched off — there is no LLM key here and each
would have degraded to `None` regardless.

```
python3 run_analyze_injected.py --serp serp-ai-seo-services.json \
    --target https://propeloseo.com/ --out report
```

Output: `report/report.json`, `report/report.html`.

## Result: the run is largely empty, and here is why

```
injected SERP: 'ai seo services' — 29 organic results
pages fetched ok: 0/29   n=29   |r| significance threshold: 0.370
```

**0 of 29 pages could be fetched.** This session's egress policy denies CONNECT
to general web hosts — every fetch returned `403 CONNECT tunnel failed` from the
agent proxy, including `https://propeloseo.com/` itself. That is an organisation
policy decision, not a bug in the tool and not something to route around.

The consequence: 105 of the 113 factors need page HTML and could not be
computed. Only the 8 SERP-presentation factors — the ones derived from the SERP
row itself (title, snippet, displayed URL, domain) — had any input.

### The 8 factors that did compute

n = 29, so a factor needs |r| > **0.370** to be significant.

| Factor | Spearman | Pearson | top-N avg | max | usage | significant |
|---|---:|---:|---:|---:|---:|---|
| Search Result Domain Length | +0.252 | +0.239 | 11.80 | 25.0 | 1.00 | no |
| Search Result Domain is .com/.net/.org | +0.193 | +0.193 | 0.60 | 1.0 | 0.76 | no |
| Variations in Search Result Display URL | +0.148 | +0.148 | 1.00 | 2.0 | 0.76 | no |
| Search Result Summary Length | +0.032 | −0.229 | 147.20 | 163.0 | 0.97 | no |
| Variations in Search Result Summary | −0.038 | +0.009 | 2.90 | 7.0 | 0.86 | no |
| Variations in Search Result Link Text | −0.009 | +0.018 | 3.30 | 7.0 | 1.00 | no |
| Search Result Domain Has Hyphen | — | — | — | — | — | no |
| Search Result URL has Year | — | — | — | — | — | no |

**Not one factor is significant.** The last two are constant across the sample,
so no correlation is defined. No recommendations were generated, and the target
could not be graded (its page was unfetchable too).

The honest read: nothing here is actionable. That is the correct output for the
input it was given, not a failure of the method — and it is worth noting the
author's own framing in the repo README: *"Treat the output as a list of
hypotheses ordered by how unusual you are, not as a list of instructions."*

To get the real 113-factor run, the engine needs to execute somewhere with
ordinary outbound HTTP.

## Substitute measurement (not ranklens)

Because the correlation half was blocked, the ranking pages were measured
instead through DataForSEO's Instant Pages endpoint, which fetches server-side.
This is a **descriptive comparison, not a correlation** — five pages cannot
support one — and it is not `ranklens` output. It is here because it answers the
question the run was meant to answer.

| | PropeloSEO (new, local) | Thrive #3 | WebFX #4 | Level #6 | SEO.co #8 |
|---|---:|---:|---:|---:|---:|
| Word count | 2,611 | 3,766 | 1,276 | 2,158 | 1,100 |
| Title length | 67 | 63 | 52 | 52 | 54 |
| Meta description length | 166 | 141 | 150 | 57 | 205 |
| H2 count | 12 | 37 | 6 | 25 | 7 |
| H3 count | 39 | 35 | 3 | 18 | 12 |
| Total headings | 52 | 93 | 40 | 55 | 19 |
| Internal links | 21 | 159 | 136 | 44 | 37 |
| HTML size (KB) | 71 | 566 | 964 | 275 | 106 |
| Text-to-HTML rate | 0.222 | 0.042 | 0.008 | 0.049 | 0.067 |
| JSON-LD blocks | 2 | — | — | — | — |

Where the new homepage sits well: word count is mid-band, heading depth is
competitive, and the text-to-HTML ratio is 3–27× better than any of them — the
page is lean where theirs are framework bloat.

The one clear structural gap is **internal links: 21 against a 37–159 band**,
and the two largest counts belong to the two highest-ranked pages here. That is
a correlation of two, not evidence — but it is consistent with the obvious:
those are agencies with a hundred service pages to link to, and PropeloSEO has
five pages total. The fix is not to stuff links into the homepage; it is that
there is nothing to link to yet.

Two competitor pages could not be measured either: `theadfirm.net` (rank 1)
returns 403 to DataForSEO's fetcher as well.

## Files

- `serp-ai-seo-services.json` — the frozen SERP, 29 organic results (DataForSEO
  `serp_organic_live_advanced`, depth 100, 3 pages of results)
- `run_analyze_injected.py` — the injection shim
- `report/report.json`, `report/report.html` — the run output
