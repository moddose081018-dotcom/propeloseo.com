---
name: linkedin-engine
description: Self-improving LinkedIn content engine for PropeloSEO. Generates, publishes (to draft), tracks, and refines posts based on real performance data.
---

# PropeloSEO LinkedIn Engine

A self-improving content system that writes LinkedIn posts optimized for comments, learns from performance data, and gets better over time. Follows the same hard rules as the `interview-me` skill.

---

## Hard Rules (non-negotiable)

- **Never publish live.** All posts go to `linkedin-vault/outbox/` as drafts. Shane posts manually or approves auto-publish.
- **No fabricated data.** Every statistic, result, or claim must come from the vault, web research, or be marked `[unverified]`.
- **No engagement bait.** LinkedIn penalizes "Type 1 if you agree" patterns by −60% reach. Use genuine conversation starters only.
- **No generic AI voice.** Every post must sound like Shane — direct, honest, willing to say what doesn't work. Read `linkedin-vault/voice.md` before writing.
- **Keep all state in the repo.** Performance data, posted content, and learnings live in `linkedin-vault/`.
- **Mandatory two-agent review.** Every draft must pass through a writer → reviewer → revision loop before being saved to outbox. The reviewer agent checks every playbook rule. No draft ships without this. See "Two-Agent Review Gate" below.

---

## System Architecture

```
linkedin-vault/
├── voice.md                  # Brand voice rules + Shane's writing patterns
├── engagement-playbook.md    # Engagement research (format/topic/CTA rankings)
├── performance-log.md        # Post-by-post metrics (Shane logs or auto-pulled)
├── hooks-that-worked.md      # Self-updating: hooks that beat baseline
├── topics-used.md            # Prevents repetition
├── outbox/                   # Draft posts awaiting Shane's send
│   └── YYYY-MM-DD_topic-slug.md
└── posted/                   # Archive of sent posts + their metrics
    └── YYYY-MM-DD_topic-slug.md
```

---

## Modes of Operation

### Mode 1: `/linkedin-engine` (Full Auto-Generate)

Run the complete pipeline: topic → research → write → quality gate → draft.

**Steps:**

1. **Read the vault.**
   - `voice.md` — tone, patterns, what to avoid.
   - `engagement-playbook.md` — format/topic/CTA rankings, benchmark data.
   - `performance-log.md` — what's worked, what hasn't, current trends.
   - `hooks-that-worked.md` — proven openers to riff on.
   - `topics-used.md` — avoid repeats within 30 days.

2. **Pick a topic.**
   If Shane provides a topic, use it. If not:
   - Search the web for what SEO professionals are talking about RIGHT NOW — Google algorithm updates, AI search changes, tool launches, industry drama.
   - Check Reddit (`r/SEO`, `r/bigseo`, `r/TechSEO`) for pain points and questions.
   - Cross-reference against `topics-used.md` to avoid repeats.
   - Present 3 topic options with a recommended pick and the reasoning. Wait for Shane to choose (or approve the recommendation).

3. **Select format + CTA combo.**
   Use the ranked combinations from `engagement-playbook.md`. Match format to topic:
   - Data/process/framework → Native Document (carousel)
   - Opinion/hot take/lesson → Text post (1,300–1,900 chars)
   - Comparison/visual data → Multi-image
   - Before/after/case study → Document or multi-image
   - Industry prediction → Poll (use sparingly, max 1x/month)

4. **Research.**
   Search the web for hard statistics, recent data, and credible sources related to the chosen topic. Find at least 2 data points that can be woven into the post. Prioritize numbers that surprise or challenge assumptions.

5. **Write the post.**
   Follow the Post Structure Framework (below). Write 3 hook variations. Present the full post with the recommended hook.

6. **Quality gate.**
   Run the devil's advocate pass (same as `interview-me`):
   - Does it sound like Shane or like generic AI?
   - Is every claim verifiable?
   - Does the hook stop the scroll (would YOU stop for this)?
   - Is the CTA genuine conversation, not engagement bait?
   - Is it the right length for the format?
   If anything fails, fix it before presenting.

7. **Two-agent review gate.**
   Spawn a reviewer agent (see "Two-Agent Review Gate" below). The reviewer audits the draft against every playbook rule and returns a verdict with specific fixes. The writer revises and resubmits. This loop continues until the reviewer returns APPROVED. Minimum 1 review round, no maximum.

8. **Save draft.**
   Write the approved post to `linkedin-vault/outbox/YYYY-MM-DD_topic-slug.md` with metadata header.
   Append the topic to `topics-used.md`.

### Mode 2: `/linkedin-engine review`

Performance review and self-improvement cycle.

1. Read `performance-log.md` for all posts in the last 30 days.
2. Identify:
   - **Top performers** (above-average comments, likes, impressions).
   - **Underperformers** (below average on any metric).
   - **Patterns**: which formats, topics, hooks, CTAs, posting times correlated with high comments.
3. Update `hooks-that-worked.md` with any hook that beat the 30-day average by 20%+.
4. Update `engagement-playbook.md` with any new learnings (e.g., "carousel + contrarian take outperformed by 3x this month").
5. Present a brief report to Shane: what's working, what to do more of, what to stop.

### Mode 3: `/linkedin-engine batch`

Generate a week of content (3 posts) following the optimal cadence:
- **Tuesday:** Data-driven carousel (document format)
- **Wednesday:** Contrarian text post (opinion/hot take)
- **Thursday:** Case study or personal story (multi-image or text)

Run Mode 1 three times with these constraints pre-set. Present all three for review.

---

## Post Structure Framework

### Hook (Line 1 — before the "See more" fold)
The hook determines whether anyone reads the post. It must:
- Lead with a specific number, a contrarian claim, or a vulnerable admission.
- Create an information gap the reader needs to close.
- Be under 200 characters.

**Hook formulas that work for SEO content:**
- "We [did X] across [Y clients/URLs/sites]. Here's what [actually happened]."
- "[Common belief] is wrong. Here's [specific data showing why]."
- "I lost [specific thing] because of [honest mistake]. Here's what I'd do differently."
- "[X]% of [thing] do [surprising behavior]. We have the data."
- "The [framework/template/checklist] we use for [specific task]. [Y] steps."

### Body
- Short paragraphs (2–3 sentences max).
- 1,300–1,900 characters for text posts (the +47% engagement sweet spot).
- Use white space aggressively — LinkedIn is mobile-first.
- Include 1–2 hard statistics with implicit source attribution.
- For carousels: 6–10 slides, one idea per slide, visual hierarchy.

### CTA (Final line)
Must be a genuine conversation starter, not engagement bait. Templates:
- "What shifts are you seeing in [specific area]?"
- "What am I missing? I'd genuinely love counterarguments."
- "Have you tried [specific thing]? What happened?"
- "What would you add to this?"
- "Which of these surprised you most?"

### Hashtags (after CTA)
3–5 hashtags max. Always include:
- 1 broad: `#SEO` or `#DigitalMarketing`
- 1 mid: `#TechnicalSEO`, `#ContentMarketing`, `#LinkBuilding`, or `#LocalSEO`
- 1 specific to the post topic
- Optional: `#SearchEngineOptimization`, `#SEOStrategy`, `#AISearch`

---

## Draft File Format

Every draft in `outbox/` uses this structure:

```markdown
---
date: YYYY-MM-DD
topic: [topic slug]
format: document | text | multi-image | video | poll
hook_variant: [which of the 3 hooks was chosen]
cta_type: open-question | counterargument | experience-share | add-to-list
target_day: Tuesday | Wednesday | Thursday
hashtags: [list]
research_sources: [URLs used]
---

[POST CONTENT HERE]

---
## Alternate hooks (not used)
1. [hook 2]
2. [hook 3]
```

## Performance Log Format

Shane (or an automated pull) logs metrics to `performance-log.md`:

```markdown
## YYYY-MM-DD — [topic slug]
- Format: [format]
- Hook used: [first line]
- Impressions: [number]
- Likes: [number]
- Comments: [number]
- Reposts: [number]
- Profile visits: [number]
- Post link: [URL]
- Notes: [any qualitative observation]
```

---

## Self-Improvement Loop

The engine improves itself through three mechanisms:

1. **Hook evolution.** When a hook beats the 30-day comment average by 20%+, it goes into `hooks-that-worked.md` with its format and topic context. Future posts use these as templates to riff on, not copy.

2. **Format rebalancing.** If the performance data shows one format consistently outperforming (e.g., carousels getting 3x comments vs. text), the weekly batch shifts allocation. The default 1-1-1 split becomes 2-1 or 1-2 based on data.

3. **Topic pattern recognition.** The review cycle identifies which topic categories drive engagement (e.g., "algorithm updates" vs. "agency lessons" vs. "tool comparisons") and weights future topic selection accordingly. Topics that underperform twice get deprioritized.

These updates are written directly into the vault files — the system literally rewrites its own playbook based on results.

---

## Posting Schedule (from benchmark data)

| Day | Time (audience local) | Content Type | Priority |
|---|---|---|---|
| Tuesday | 11 AM–1 PM | Data-driven carousel | High |
| Wednesday | 4 PM | Contrarian text post | Highest (peak slot) |
| Thursday | 10 AM–12 PM | Case study / story | High |

Personal profile posts generate 5x more engagement than company page posts. Always post from Shane's personal profile.

---

## Two-Agent Review Gate (non-negotiable)

Every post must pass through a writer–reviewer loop before being saved to outbox. No exceptions.

### How it works

1. **Writer** generates the full draft (hook, body, CTA, first comment, hashtags, metadata).
2. **Writer spawns a Reviewer agent** with the draft text and the playbook rules below.
3. **Reviewer** audits the draft and returns one of:
   - `APPROVED` — draft passes all checks. Include one sentence on what makes this post strong.
   - `REVISE` — draft fails one or more checks. Return a numbered list of specific fixes required.
4. If `REVISE`: Writer applies every fix, then sends the revised draft back to the Reviewer.
5. Loop continues until Reviewer returns `APPROVED`.
6. Only an `APPROVED` draft gets saved to `outbox/`.

### Reviewer Checklist (check every item)

**Playbook compliance:**
- [ ] Format matches the target day (Tue=document, Wed=text, Thu=story)
- [ ] Uses a Top 15 combo from `engagement-playbook.md` with score 7.0+
- [ ] Text post is 1,300–1,900 characters (count it)
- [ ] Carousel has 6–10 slides, one idea per slide
- [ ] CTA ends with a direct question (+77% comments rule)
- [ ] CTA is genuine conversation, NOT engagement bait (−60% reach penalty)
- [ ] First-comment section is present and substantive
- [ ] No external links in post body (links go in first comment only)
- [ ] 3–5 hashtags: 1 broad, 1 mid, 1 topic-specific
- [ ] Hook is under 200 characters
- [ ] 3 hook variations provided

**Voice compliance (read `linkedin-vault/voice.md`):**
- [ ] Sounds like Shane, not generic AI
- [ ] No banned phrases: "game-changer," "revolutionary," "In today's landscape," "Let me share," "I'm excited to announce," "Hot take:"
- [ ] No emoji in body text
- [ ] Short paragraphs (1–3 sentences max per block)
- [ ] Operator tone — writing from inside the work, not above it
- [ ] Uses "I" and "we," never "one should consider"

**Data integrity:**
- [ ] Every statistic is sourced (URL in research_sources)
- [ ] No fabricated data — all claims verifiable or marked `[unverified]`
- [ ] At least 2 hard statistics from web research

**Scroll-stop test:**
- [ ] Would YOU stop scrolling for this hook? (If no, fail it.)
- [ ] Does the hook create an information gap?
- [ ] Is the post saying something the audience hasn't heard this week?

**Differentiation:**
- [ ] Topic not in `topics-used.md` within the last 30 days
- [ ] Hook is not a copy of `hooks-that-worked.md` (riff on them, don't repeat)
- [ ] Post adds a perspective or data point not in the obvious first-page Google results

### Reviewer Agent Prompt Template

When spawning the reviewer, use this prompt structure:

```
You are the PropeloSEO LinkedIn Editor. Your job is to ruthlessly audit this draft against the playbook. You are NOT the writer — you are the quality gate. Be specific and demanding. Vague "looks good" approvals are a failure of your role.

Read these files first:
- linkedin-vault/voice.md
- linkedin-vault/engagement-playbook.md
- linkedin-vault/hooks-that-worked.md
- linkedin-vault/topics-used.md

Then audit this draft against every item on the Reviewer Checklist in the linkedin-engine skill.

Return either:
APPROVED — [one sentence on what makes this strong]
or
REVISE — [numbered list of every specific fix required, with the exact playbook rule each violates]

Draft to review:
[PASTE FULL DRAFT HERE]
```

---

## Voice Check (quick reference — full rules in vault)

Shane's LinkedIn voice is:
- **Direct.** No throat-clearing, no "In today's landscape..." openers.
- **Honest about what doesn't work.** Willing to say "this failed" or "most advice here is wrong."
- **Specific.** Real numbers, real clients (anonymized), real tools. Never vague.
- **Operator tone.** Writing from the seat of someone doing the work, not commenting on it.
- **Anti-hype.** No "game-changer," no "revolutionary," no breathless superlatives.
- **Short paragraphs.** Mobile-first. Lots of white space.
