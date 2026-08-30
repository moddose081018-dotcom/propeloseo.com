# AI Visibility Scoring — implementation spec

How to turn "we track AI visibility" into a defensible, repeatable number.

Derived from a read of [Climby AI SEO](https://github.com/Marc-Moeller/Climby-AI-SEO)
(`apps/web/src/services/geo/`, AGPL-3.0). The **algorithms, weights and taxonomies**
below are facts about how a working system behaves and are free to reimplement.
The **prompt wording is deliberately not reproduced** — that is Climby's creative
expression and is covered by their licence. Where a prompt is needed, this spec
states what it must elicit and leaves the drafting to us.

Nothing here requires running or forking their code.

---

## 1. Why this shape

Our homepage promises three things that need machinery behind them:

| Promise on the page | What has to exist |
| --- | --- |
| "identical prompt set and method every month" | A frozen, versioned prompt table |
| "not just mentions but which domains and pages AI models cite" | Mention detection *and* citation parsing, kept separate |
| "names every business those AI engines recommend instead of you" | Competitor extraction per response |

Those are three different measurements. Collapsing them into one "visibility score"
is what makes most competitor tooling untrustworthy. Keep them separate and derive
the composite last.

---

## 2. Data model

Five tables. Names are ours; the shape follows what works.

**`prompt`** — the frozen question set. This is the integrity anchor.

| Column | Notes |
| --- | --- |
| `id`, `project_id` | |
| `text` | **unique per project** — this constraint is what makes month-over-month comparable |
| `category` | grouping for rollups, default `general` |
| `intent` | free text |
| `query_type` | enum, drives priority weighting (§6) |
| `subtopic` | optional |
| `target_products` | string[] — product names to look for in answers |
| `is_active` | soft-disable rather than delete, so history stays valid |

**`run`** — one prompt × one model × one date.

Deterministic fields (from §4): `mentioned_in_content`, `cited_in_annotations`,
`citation_count` (owned only), `total_citations`, `products_mentioned`,
`full_response`, `response_snippet`.

Judged fields (from §5): `accuracy`, `coverage`, `sentiment`, `alignment_score`
(the composite), `is_recommended`, `recommendation_position`, `attribute_data`,
`scoring_model`, `scored_at`.

Bookkeeping: `model_slug`, `model_label`, `check_date`, `status`, `error`,
`prompt_tokens`, `completion_tokens`, `scoring_prompt_tokens`,
`scoring_completion_tokens`. **Keep the token/cost columns** — per-run spend is how
you find out a prompt set has quietly become uneconomic.

**`citation`** — one row per URL in an answer: `url`, `title`, `domain`,
`is_owned`, `position`, `snippet`.

**`competitor_mention`** — `run_id`, `brand`, `product`, `was_recommended`,
`position`, `attributes[]`.

**`gap`** — `run_id`, `root_cause`, `evidence`, `recommended_action`, `priority`,
`affected_page_url`, `status` (`open`/`resolved`).

**`action_item`** — `gap_id`, `title`, `description`, `action_type`,
`priority_score`. Upserted on `gap_id` so re-running never duplicates the queue.

---

## 3. The pipeline

Five stages, each independently skippable and independently re-runnable:

```
checks → scoring → claim classification → gap diagnosis → priority
```

Only `checks` costs an external answer-engine call. Everything downstream operates
on stored text, so scoring can be re-run after a prompt change without re-querying
the engines. Build it in that order and each stage is shippable on its own.

---

## 4. Stage 1 — Check (deterministic, no LLM)

Run every active prompt against every tracked model. Parse the response with
**pure functions** — no model judgement at this layer. This is what makes the
headline numbers auditable.

**Mention detection.** Case-insensitive substring match of the answer text against
a token list: brand name, bare domain, and aliases. Any hit ⇒ `mentioned = true`.
Crude on purpose — it is explainable to a client, and a false positive is visible
in the stored response.

**Citation detection.** For each cited URL: lowercase the hostname, strip a leading
`www.`, then

```
is_owned = (domain === own) || domain.endsWith("." + own)
```

`citation_count` counts **owned** citations only; `total_citations` counts all.
Keeping both is what lets you say "you were cited 2 of 47 times" rather than a
bare rate.

**Product detection.** Word-boundary regex per product name, with names **sorted
descending by length** so `"Wedding Photo Booth"` matches before `"Photo Booth"`.
Escape regex metacharacters in the names.

> **Resolved 2026-08-30.** DataForSEO's `ai_optimization_llm_response` returns
> structured citations under `items[].sections[].annotations[]` — `title`, `url`,
> `start_index`, `end_index`. Richer than the reference implementation's source:
> the character offsets give citation order for free, so `position` can be
> populated rather than left null. Implemented in `tools/ai-visibility/`.

---

## 5. Stage 2 — Score (LLM as judge)

One call per run, against a *cheap* model, at **temperature 0.1** and a hard token
cap (~800). Ask for strict JSON.

**Three dimensions, 0–100 each:**

- **accuracy** — factual correctness about us, judged against supplied brand facts
- **coverage** — how many of our priority facts the answer reflects
- **sentiment** — how favourably we are positioned

**Composite:**

```
alignment_score = accuracy × 0.4 + coverage × 0.3 + sentiment × 0.3
```

Accuracy carries the most weight because a confidently wrong answer is worse than
a neutral omission.

**Also extract:** `is_recommended` (bool), `recommendation_position` (1–5 or null),
`attributes[]` (`{attribute, credited, evidence}`), `competitors[]`
(`{brand, product, recommended, position, attributes[]}`).

**Ground truth in the prompt.** Supply a compact brand-intel block: priority facts,
deal-breaker answers, differentiators, named attributes, and known competitor
names. Without this the judge invents a standard and scores drift between months.

**Three defensive details that matter more than they look:**

1. **JSON extraction fallback** — try `JSON.parse` on the trimmed string; on
   failure, slice from the first `{` to the last `}` and retry. Models add prose
   and code fences even when told not to.
2. **Attribute allowlisting** — discard any attribute name the judge returns that
   is not in your declared list. Otherwise the attribute set grows every month and
   nothing is comparable.
3. **Clamp** every numeric to 0–100 and coerce non-finite values to 0.

**Never fail over to a different model mid-run for the subject call.** A silent
model swap mislabels the measurement. Fallback models are fine for the *judging*
call, never for the answer being judged.

---

## 6. Stages 3–5 — Diagnosis and prioritisation

### Root-cause taxonomy (six values)

| Root cause | Meaning |
| --- | --- |
| `MISSING_CONTENT` | We have no content answering this query |
| `COMPETITOR_DOMINANCE` | Competitors named, cited or positioned more strongly |
| `ENTITY_GAP` | The model does not understand us as an entity in this category |
| `FACTUAL_ERROR` | The answer states something incorrect about us |
| `NEGATIVE_COVERAGE` | Weak or negative sentiment suppresses recommendation |
| `EXTERNAL_CONSENSUS_GAP` | Citations favour competitors via third parties; the fix is **off-site**, not on-page |

`EXTERNAL_CONSENSUS_GAP` is the one worth stealing outright. It is the difference
between "write a page" and "get named on these five specific domains" — and when
it fires, the recommended action must **name the domains**. Default to
`MISSING_CONTENT` on an unrecognised value.

### Priority score

```
priority = 100 × (
    w.gapSeverity         × gapSeverity
  + w.competitorAdvantage × competitorAdvantage
  + w.categoryImportance  × categoryImportance
  + w.fixEase             × fixEase
  + w.queryTypeWeight     × queryTypeWeight
)
```

**Inputs (all clamped 0–1):**

- `gapSeverity = (100 − alignment_score) / 100`, or **0.7** when unscored
- `competitorAdvantage = min(1, recommendedCompetitors / 3)` — three recommended
  rivals saturates it
- `categoryImportance` — 0.6 default, 0.5 when the category is unknown
- `fixEase` — `MISSING_CONTENT` 0.9 · `FACTUAL_ERROR` 0.7 · `ENTITY_GAP` 0.5 ·
  `COMPETITOR_DOMINANCE` 0.5 · `NEGATIVE_COVERAGE` 0.4 ·
  `EXTERNAL_CONSENSUS_GAP` 0.25 · fallback 0.6
- `queryTypeWeight` — `deal_breaker` 1.0 · `comparison` 0.9 · `feature_verify` 0.7 ·
  `icp_alignment` 0.6 · `awareness` 0.5 · fallback 0.6

**Default weights:** severity 0.30, competitor 0.25, category 0.20, ease 0.15,
query type 0.10.

**Override for `EXTERNAL_CONSENSUS_GAP`:** severity 0.25, competitor **0.40**,
category 0.20, ease **0.05**, query type 0.10. Off-site work is hard and slow, so
ease is nearly discounted and competitor pressure drives the ranking instead. This
per-root-cause weight profile is the clever bit — a single global weighting buries
consensus gaps beneath easy on-page wins forever.

---

## 7. Reporting rollups

```
mention_rate  = mentioned / total_checks × 100
citation_rate = cited     / total_checks × 100
avg_alignment = AVG(alignment_score)
```

Report all three plus raw counts. Trend them by `check_date` against a **fixed
prompt set** — that, and only that, is what licenses the claim that a change
reflects real movement rather than prompt variance.

Attribute win-rates (`credited / mentioned`, ours vs each competitor) are the
strongest single artifact for a Growth Pack: they say *what* rivals are being
credited for that we are not.

---

## 8. Mapping onto our stack

Climby uses OpenRouter for judging and a SERP proxy for the answer engines. We
already pay for the equivalents:

| Need | Climby | Ours |
| --- | --- | --- |
| Subject-model answers | OpenRouter / `altserp` | DataForSEO `ai_optimization_llm_response`, `ai_optimization_chat_gpt_scraper` |
| Model catalogue | hardcoded slugs | DataForSEO `ai_optimization_llm_models` |
| Mention corroboration | — | DataForSEO `ai_opt_llm_ment_search`, `..._top_domains`, `..._top_pages` |
| Citation/brand corroboration | — | Ahrefs `brand-radar-cited-domains`, `brand-radar-cited-pages` |
| Judging call | OpenRouter cheap model | Claude via the API |
| Storage | Postgres + Drizzle | Cloudflare D1 (already provisioned) |

Both DataForSEO and Ahrefs are already wired as MCP servers, so a first pass can
run entirely from the agent side with no service to host.

---

## 9. Verify before building

1. ~~**Does `ai_optimization_llm_response` return structured citations?**~~
   **Answered — yes.** See §4. Stage one is built and tested against a real
   payload in `tools/ai-visibility/`.
2. ~~**Per-call cost.**~~ **Answered.** A live `gpt-4o-mini` call with web search
   reported `money_spent` of **$0.0266**. Twenty-five prompts × four engines is
   roughly **$2.66 per client per month** for subject calls — comfortably inside
   $97, even before judging costs. Re-check on a reasoning model, which will cost
   materially more.
3. **Judge stability.** Still open, and only matters once stage two is built. Run
   the same stored response through the judge three times. If `alignment_score`
   moves more than a few points, the composite is not trendable and needs a lower
   temperature or a coarser scale.
4. **Citation noise.** New, found while building stage one. Models attach
   citations that do not support the adjacent claim — 4 of 9 cited domains in the
   first real answer were irrelevant. Cited-domain lists need a human pass before
   reaching a client; do not present the raw list as "who the AI trusts".

---

## 10. Minimum viable version

Ship stage 1 only — deterministic mention and citation detection over a frozen
prompt set, no LLM judging at all.

That alone delivers mention rate, citation rate, cited-domain list and competitor
names, which is every factual claim the homepage currently makes. Scoring,
diagnosis and prioritisation are what turn it into a Growth Pack, and they can
land later without re-querying anything, because stage 1 stores the full response
text.

**It would also let the Trust Score scanner return real numbers instead of the
hardcoded sample it serves today.**

Stage one now exists: `tools/ai-visibility/`. Pure parser, nine passing tests
against a real captured payload, and a report that already produces mention
rate, citation rate, cited domains and competitor share of voice.
