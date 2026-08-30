# AI visibility — stage one

Deterministic mention and citation measurement over a frozen prompt set.
No LLM judging: every number here is reproducible by re-running pure functions
over the stored response text, which is what makes it defensible to a client.

Implements stage one of [`docs/ai-visibility-scoring-spec.md`](../../docs/ai-visibility-scoring-spec.md).

```
tools/ai-visibility/
  prompts.json   frozen prompt set — the integrity anchor
  brand.json     own domain, mention tokens, products, competitor names
  src/parse.mjs  pure parsing + rollups (no I/O)
  bin/scan.mjs   report over captured responses
  fixtures/      real captured DataForSEO payloads
  test/          node:test suite, runs against the real fixture
```

## Run

```bash
node --test tools/ai-visibility/test/     # 9 tests, no dependencies
node tools/ai-visibility/bin/scan.mjs     # report
node tools/ai-visibility/bin/scan.mjs --json > report.json
```

## Fetch and parse are separate on purpose

Capture responses once via the DataForSEO MCP tool
(`ai_optimization_llm_response`, `web_search: true`), save the
`tasks[0].result[0]` object into `fixtures/`, then parse as often as you like.
Re-running a report after a config change costs nothing and never re-queries a
paid endpoint. It also means the parse layer stays unit-testable forever
against real payloads.

## What the DataForSEO response actually gives us

Confirmed against a live call on 2026-08-30 (`gpt-4o-mini`, web search on):

- **Structured citations.** `items[].sections[].annotations[]`, each with
  `title`, `url`, `start_index`, `end_index`. Richer than expected — the
  character offsets let us order citations by appearance, which is a `position`
  field the reference implementation had to leave null.
- **Real cost per call:** `money_spent` = **$0.0266**. So 25 prompts × 4
  engines ≈ **$2.66 per client per month** for subject calls.
- **`fan_out_queries`** — the search the model actually ran. Free signal for
  keyword work; not part of stage one.
- Every citation URL carries `?utm_source=openai`, stripped by `canonicalUrl`
  so one page dedupes to one URL.

## Two things to know before this touches a client deliverable

**Citations include noise.** In the sample answer, 4 of 9 cited domains were
irrelevant to the question — an icon library, a Dutch article about Arrow
Electronics, a Turkish credit app, a webcatalog page titled "Apple". The model
attaches citations that do not support the claim beside them. Cited-domain
lists need a human pass before they go in front of a client; do not present the
raw list as "who the AI trusts".

**Competitor lists are only as good as `brand.json`.** Detection is
word-boundary matching against a maintained list, so a competitor you have not
listed is invisible. Seed the list from a first sweep, then keep it current.
Nested names are handled — matching "AEO Collective" masks the span so "AEO"
cannot double-count it — but unknown names are simply missed.

## Baseline: 20 runs, 5 prompts x 4 engines, 2026-08-30

`gpt-4o-mini` / `claude-haiku-4-5` / `gemini-2.5-flash` / `sonar`, web search
requested on every call. Total spend **$0.3835**.

**PropeloSEO was mentioned in 0 of 20 answers and cited in 0 of 328 citations.**
That is the honest starting point the 90-Day Progress Report measures against.

Recommended instead, by share of voice:

| Brand | Checks | Share of voice |
| --- | --- | --- |
| Semrush | 8 | 40% |
| SE Ranking | 4 | 20% |
| Ahrefs | 3 | 15% |
| Peec AI | 3 | 15% |
| Profound | 2 | 10% |

Semrush, SE Ranking and Ahrefs are the incumbents to displace — and note we
*pay* two of them. 145 distinct domains were cited across the 20 answers.

## What the run exposed

**1. `web_search: true` is a request, not a guarantee — and gpt-4o-mini ignored
it 3 times in 5.** The result object reports what actually happened. Ungrounded
runs answer from model memory, return zero citations, and cost ~33x less
($0.0008 vs $0.027). Pooling them with grounded runs would silently deflate
citation rate and corrupt any trend. `scan.mjs` flags them and reports a
grounded-only citation rate. **Any production run must check `web_search` on
the response and re-issue when false** — or use a model that grounds reliably.

**2. Four engines, four different citation shapes.** The parser handles all
four; a naive implementation would break on three of them.

| Engine | Shape | Offsets | Domain source |
| --- | --- | --- | --- |
| ChatGPT | one section, inline annotations | yes | URL |
| Claude | many fragments, `annotations: null` on unattributed ones, duplicated entries | no | URL |
| Gemini | one section, heavy duplication | yes | **`title` only** |
| Perplexity | one section, 20-source bibliography, `[n]` markers in text | no | URL |

**3. Gemini hides the real domain.** Every Gemini citation URL is a
`vertexaisearch.cloud.google.com/grounding-api-redirect/...` wrapper. Resolving
the domain from the URL would attribute every Gemini citation to Google and
make an owned citation **undetectable**. `resolveDomain()` falls back to the
annotation `title`, which Gemini supplies as a bare domain.

**4. Perplexity is 5-7x cheaper and cites 20 sources a time** ($0.0056 vs
$0.023-$0.037). But its citations are a bibliography, not per-claim
attributions, so "cited" means something weaker there than on ChatGPT. Do not
pool citation rates across engines without saying so.

**5. Three of four engines actively warn buyers off this price band.** Claude
calls "$99-$199/month for comprehensive SEO" a red flag; Gemini says anything
under $200/month "should be carefully vetted... automated spam tactics"; a
cited source warns to "be wary of companies offering services for $150 a month
or less". **The $97 price is not just unknown to AI search — it pattern-matches
to something these engines tell buyers to avoid.** That is a positioning
problem no amount of citation-building fixes on its own, and it is the single
most actionable finding in this run.

## Two cautions before this reaches a client

**Citations include noise.** In the first sampled answer, 4 of 9 cited domains
were irrelevant — an icon library, a Dutch article about Arrow Electronics, a
Turkish credit app. Cited-domain lists need a human pass; never present the raw
list as "who the AI trusts".

**Competitor detection only sees names in `brand.json`.** Unknown competitors
are invisible. This run surfaced many worth adding (Otterly, Rankscale,
Writesonic, ZipTie, Ranked.ai, Sitemile, WebFX, Thrive, Searchbloom). Seed from
a sweep, then maintain. Nested names are handled — matching "AEO Collective"
masks the span so "AEO" cannot double-count — but unlisted names are missed.
