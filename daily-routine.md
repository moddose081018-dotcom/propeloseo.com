# Daily Operating Routine

The SOP the scheduled agent follows every day at **09:00 Bangkok (GMT+7 = 02:00 UTC)**.
Purpose: advance the affiliate engine one day **without taking any external action**. Anything
that would touch the outside world is drafted to `outbox/` for Shane to send manually.

## Hard rules (non-negotiable, every run)
- **Never send, post, or publish.** Every outreach message or external action is a *draft* saved to `outbox/`. Shane sends it.
- **No fabricated data.** Mark anything unverified `[unverified]`. Never invent replies, results, testimonials, metrics, or member counts.
- **Only the real founding-price scarcity** ($289/mo locked for life, then $299+). No fake urgency, no invented testimonials.
- **Be honest in the dashboard.** Say plainly when something isn't working, when a target looks unrealistic, or when a prospect is dead.
- **Keep all state in the repo.** No external state.
- **Respect the daily volume cap** (≤10 new outreach drafts/day) so outreach stays human and avoids spam patterns.

## Inputs the routine reads
- `prospects/creators.csv` — the prospect pipeline and tracking fields.
- `inbox/` — replies and outcomes Shane logs back (see convention below).
- `dashboard.md` — current KPI state.
- `assets/outreach/email-sequence.md` — the email/DM copy + reply-handling table.

## Steps (each run)
1. **Sync.** Pull latest. Read `prospects/creators.csv`, `dashboard.md`, and everything in `inbox/`.
2. **Process inbox.** For each reply/outcome Shane logged:
   - Update that prospect's `status`, `last_contact`, `next_action`, `next_action_date` in the CSV.
   - Draft the correct response (from the reply-handling table) into `outbox/`.
   - If they became a partner, mark `status=partner` and draft the "send it" kit handoff.
3. **Advance sequences.** For prospects whose `next_action_date` is due, draft the next step
   (Email 1 → 2 → 3, or DM) personalized from their CSV row, saved to `outbox/`. Never send.
4. **Prioritize.** Fill the day's cap highest `fit_score` first: due follow-ups before new
   outreach. Skip prospects marked dead/declined.
5. **Update tracking.** Write back `last_contact`, `next_action`, `next_action_date` for every
   touched prospect.
6. **Update the dashboard.** Refresh `dashboard.md`: funnel counts, active partners, members
   referred (only from data Shane has logged), estimated MRR vs the model target, and an honest
   "what's working / what's stalling" note.
7. **Log.** Append `logs/YYYY-MM-DD.md`: what was drafted, what changed, and any flags.
8. **Commit + push.** Commit to the operating branch and push. End with a short summary of what
   was drafted and what changed. If there was nothing to do (no due actions, empty inbox), say
   so — do not invent activity.

## Conventions

### outbox/ (drafts out — Shane sends)
- One folder per day: `outbox/YYYY-MM-DD/`.
- One file per message, named `handle_type.md` (e.g. `VascoSEOtips_email1.md`).
- Each file: recipient, channel, subject (if email), body, and the send-to address/handle.

### inbox/ (outcomes in — Shane logs)
- Shane drops replies/outcomes here after sending, so the routine can advance state.
- Simplest form: append to `inbox/replies.md` with lines like:
  `2026-09-15 | VascoSEOtips | replied: "send it"` or `... | no reply` or `... | joined (partner)`.
- The routine reads these, updates the CSV, and clears/marks processed entries in its log.

## Dependency
The routine operates on the engine files (`prospects/creators.csv`, `assets/`, the models).
**These must be on the operating branch it pulls.** Until PR #30 is merged to `main`, point the
routine at the feature branch; after merge, it runs on `main`. See dashboard.md for current state.

## Metrics the dashboard tracks (honest, real data only)
- Prospects: total, contacted, replied, interested, partner, dead.
- Active partners and members each has referred (from Shane's logged data only).
- Estimated live MRR vs the model's month-by-month target (`blended-scenario.md`).
- What's working / what's stalling — plain language, including dead prospects and weak channels.
