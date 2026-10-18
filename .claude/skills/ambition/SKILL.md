---
name: ambition
description: Make a task more ambitious before doing it — raise altitude (outcome over task), depth (expert-grade methods, tools, outside validation) and range (several disciplines, red team). Use when the user says "be more ambitious", "top 1% version", "/ambition", or for high-stakes work (client pitches, audits, launches, revenue-critical pages).
---

# Ambition Skill

Adapted from Felix Rieseberg (Anthropic, lead engineer on the Claude app, Cowork and Claude Code desktop), "How to be more ambitious: a tutorial for humans with models", as summarised in the video https://youtu.be/NarezKh3w4o. Core claim: the users who get the most from agents ask for more, not just better.

Run this **before** starting the work. Output the rewritten brief, then execute it.

---

## Step 1 — Altitude: ask for the outcome, not the task

Ask: *What does the user actually want to happen next? What is the goal beyond the goal?*

- Restate the request as a durable outcome that removes the human from the loop where possible (Felix: "fix this crash" → "keep the apps crash-free").
- Works best when the outcome is definable and measurable. For open-ended creative/commercial goals ("make money"), keep the user's creative direction — do not invent strategy they didn't ask for.

PropeloSEO examples:
| Task (noun-level) | Outcome (altitude) |
|---|---|
| Write a client SEO report | Get the client to renew and approve next quarter's budget |
| Fix these 5 broken links | Keep the site free of broken links and 4xx pages (recurring check) |
| Fill in the pitch deck template | Win this prospect — consider interactive HTML deck, live data, demo of their own SERP |

## Step 2 — Depth: do it the way a top expert would

"Act like an expert" only changes vocabulary. Change the **methods** instead. Answer these four questions explicitly:

1. What would a top professional do here that the user is not asking for?
2. What is the rawest source material they would start from? (e.g. GSC/GA4 exports, live SERPs, crawl data — not summaries)
3. Which methods and tools would they use? (Use the connected MCP tools — Ahrefs, DataForSEO, SE Ranking, Open SEO, GSC — not a hand-made table in chat.)
4. What, other than the model or the user, would prove the result is right?

Then:
- **Stretch the target.** If asked for 5s page load, try for 1s or 200ms. If it looks impossible, assume it's solvable and keep going before conceding.
- **Use an outside judge.** Never self-grade important work. Prefer a tool check (Lighthouse/PageSpeed, schema validator, rank/traffic data, crawl re-run) after each change. For creative work, spawn an independent sub-agent as reviewer.

## Step 3 — Range: bring in other fields

- **Nouns → verbs** (from *The Art of Innovation*). A QBR is not "a PowerPoint"; it is "getting busy people to believe a story about cause and effect and decide under uncertainty in 30 minutes." A listing is not "a page"; it is "helping a family picture their life in this house before visiting."
- **Assemble the crew.** From the verb, list 3–5 roles whose viewpoint changes the output (e.g. analyst, sales manager, designer, CRO specialist, local-market expert). Run them as parallel sub-agents for important work.
- **Always include a red team** whose only job is to find holes.
- Goal: surface unknown unknowns — options nobody considered (Felix's example: 3D Blender scenes for a website).
- Sub-agents cost tokens: use the full crew only for high-stakes work.

## Step 4 — Rewritten brief (output this)

```
Outcome: <altitude restatement>
Expert method: <tools, raw sources, approach>
Stretch target: <ambitious measurable bar>
Validation: <outside judge / tool check>
Crew: <roles + red team>  (or "skipped — low stakes")
Unknown unknowns considered: <1–3 options the user may not have thought of>
```

Then execute it. Respect existing guardrails (interview-me: client separation, drafts-only handoff, quality gates). Ambition never overrides "draft, don't publish" or factual-accuracy rules.

## Guardrail — pace it

Ambition should serve a reason. If the stretch version costs far more time/tokens than the outcome is worth, say so in one line and offer the standard version.
