# PropeloSEO Affiliate Engine — Dashboard

*Updated by the daily routine (09:00 Bangkok / 02:00 UTC). Honest state only — no invented data.*

**Last updated:** 2026-09-13 (realigned to the "empty shelf" model — see `strategy.md`)

**Operating model:** creator-partnership "empty shelf" method — put the **Skool affiliate link**
on mid-size creators' empty shelves (no ebooks/Whop). Primary offer: Rainmakers ($144.50/mo per
member). See `strategy.md`.

## Phase status
- **Phase 1 — Prospects:** ✅ 94 qualified creators in `prospects/creators.csv` (SEO + adjacent money-making niches; 79 DataForSEO-verified, 6 web-estimated X counts, 9 still unverified — Skool/newsletter/LinkedIn can't be confirmed programmatically here)
- **Phase 2 — Assets:** ✅ drafted in `assets/` (outreach, review + comparison pages, swipe kit, side agreement)
- **Phase 3 — Daily routine:** ✅ SOP in `daily-routine.md`; scheduled task created (see below)
- **Models:** ✅ `revenue-model.md`, `paid-advertising-model.md`, `blended-scenario.md`

## Pipeline funnel (live)
| Stage | Count |
|---|---|
| Total prospects | 94 |
| Outreach drafted (awaiting Shane to send) | 20 |
| Contacted (sent) | 0 |
| Replied | 0 |
| Interested | 0 |
| Active partners | 0 |
| Members referred | 0 |
| Dead / declined | 0 |

*Batch 1 (top 10 by fit) in `outbox/2026-09-25/`; batch 2 (prospects 11–20) in `outbox/2026-09-25-batch2/` — nothing sent yet. "Contacted" moves once Shane sends and logs it in `inbox/replies.md`.*

## Revenue (live vs model)
| | Live | Model target (base) |
|---|---|---|
| Referred members (active) | 0 | Month 6: ~30 · Month 12: ~94 |
| Estimated MRR | $0 | Month 6: ~$6.9K · Month 12: ~$19K |

Target: $20K/mo. Per `blended-scenario.md`, base case reaches it ~month 13; ~month 8–9 only if
partner activation is fast and churn held to 4%. The original 6-month goal is the optimistic ceiling.

## What's working / what's stalling
- Too early to judge — **no outreach sent yet.** Nothing has left `outbox/`.

## Blocking before the engine can run at full value
1. **Merge PR #30 to `main`** so the daily routine has the engine files to operate on. Until then it runs on the feature branch.
2. **Personal results** — review "My take", Citation Playbook post techniques, star rating (Shane's own notes; do not invent). See `assets/research-notes.md`.
3. **Citation Playbook price + member count** — needed to firm up the blended model (currently ~$3K/mo of the month-12 total is illustrative).
4. **Verify** the `[unverified]` audience sizes in `creators.csv` and comparison entries 3–6 before sending outreach or publishing.

## Scheduled task
- **When:** daily 09:00 Bangkok (02:00 UTC). First run: 2026-09-14.
- **What:** runs `daily-routine.md` in a fresh session; drafts to `outbox/`, updates CSV + this dashboard, logs, commits.
- **Trigger ID:** `trig_01Ge5JUT3baYHYQ233NpNYvh`
- **Control:** pause/stop by disabling or deleting the Routine (ask Claude, or via the claude.ai Routines list).
- **Note:** the Routine runs without MCP connectors (git push works via the environment proxy; no GitHub MCP / DataForSEO in the fired sessions). If the routine later needs those, recreate it from a session that holds the connectors or via the claude.ai Routines UI.
