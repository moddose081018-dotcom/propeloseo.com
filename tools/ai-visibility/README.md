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

## Current baseline

One prompt, one model: PropeloSEO is **not mentioned and not cited**, while
Posirank, AEO Collective, Arvow, AIO Copilot and ZeroRank are all named. That
is the honest starting point the 90-Day Progress Report should be measured
against.
