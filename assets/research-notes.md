# Phase 2 — Verification Notes & Outstanding Placeholders

Results of the `[verify]` tasks in the Phase 2 brief, plus the placeholders that must be
filled before any asset is used. Nothing in `assets/` should go to `/outbox` (or anywhere
external) until the "Blocking before publish" items below are resolved.

## Verified

### Keyword volumes (DataForSEO, Sep 2026, United States)
| Keyword | Volume/mo | Notes |
|---|---|---|
| seo mastermind | 40 | KD 9, commercial, declining (was 140 in Sep 2025) |
| best seo community | 10 | commercial, declining |
| ai seo rainmakers | no data | brand too new — near-zero volume |
| ai seo rainmakers review | no data | near-zero |
| charles floate skool | no data | near-zero |
| charles floate community | no data | near-zero |
| best ai seo community | no data | near-zero |
| seo skool communities | no data | near-zero |
| paid seo community | no data | near-zero |
| ai seo community | no data | near-zero |

**Verdict:** These pages will not pull meaningful organic search traffic. Their value is as
a **link to hand partners and drop into outreach**, and to capture branded "ai seo rainmakers
review" searches as the brand grows. Build for reference/conversion, not ranking. Don't invest
in link-building or heavy on-page optimization for them.

### Founding price — confirmed
$289/mo, locked for life on the founding block; $299+ after it sells out. Confirmed by Shane
(account owner, from the Rainmakers about page) on 2026-09-13. Use $289 locked-for-life in all
public copy — the review page, comparison page and swipe kit already do.

**Two different prices — don't conflate them:**
- **$289/mo** = the current price a NEW member pays when they join through Shane's link. Shane's
  commission = 50% × $289 = **$144.50/mo per referral** (revenue side — unchanged).
- **$179/mo** = Shane's OWN membership, locked at his earlier founding rate (cost side). This is
  the membership cost line in the models/dashboard, not the offer price.

### Skool commission disclosure
- No Skool rule found that prohibits stating the commission rate publicly.
- Skool **does** prohibit bidding on the "Skool" brand keyword in paid ads (already covered in
  the side-agreement conduct clause), plus spam and false claims about the platform.
- FTC requires disclosing the affiliate relationship near the recommendation — the review page,
  comparison page, swipe posts and Citation Playbook post all do this.
- **Decision:** keep the 50% rate **partner-facing only** (outreach emails + side agreement).
  It's off the public review/comparison pages by design — reads better to prospective members.
- Note: the member-to-member referral (50%) is a different mechanism from the Skool *platform*
  affiliate program (40% recurring, 60-day cookie). The $144.50/mo figure is 50% of $289.

### Comparison page entries 3–6
Filled in `assets/pages/best-ai-seo-communities.md`:
- **#3 Traffic Think Tank** — $99/mo ($990/yr), Semrush-owned Slack, 300+ hrs, monthly Q&A. Verified.
- **#4 AI SEO Mastery (Caleb Ulku)** — ~$27/mo base, ~3.1K members; Pro ~$197/mo. `[unverified — Phase 1 WebSearch]`
- **#5 AI Ranking (Nico)** — ~$47/mo premium, ~6.4K members, free tier. `[unverified — Phase 1 WebSearch]`
- **#6 The Blueprint Training (Ryan Stewart)** — ~$199/mo, ~3K members. `[unverified — Phase 1 WebSearch]`

Member counts/prices for #4–6 came from search snippets (skool.com was blocked by network
egress). Confirm on-platform before publishing.

## Blocking before publish (need Shane)

1. **Personal results — DO NOT INVENT.** These stay as placeholders until you supply real notes:
   - Review page "My take after {{n}} weeks" — 2-3 concrete things applied on a client site + results.
   - Citation Playbook post — the three techniques (or one that didn't work).
   - `{{your_rating}}` in the review page JSON-LD — your honest star rating.

2. **Citation Playbook details** — price + member count, used in the review page comparison
   table (#2 row) and the comparison page (#2). Supply both.

3. **Verify #4–6 member counts/prices** on skool.com before publishing the comparison page.

## Resolved

- **Founding price** — confirmed by Shane on 2026-09-13: $289/mo locked for life, then $299+.
  See the "Founding price — confirmed" note under Verified above.

## Files in this batch
- `assets/outreach/email-sequence.md` — emails 1-3, DM variant, reply-handling table
- `assets/outreach/side-agreement-template.md` — Deal Shape B revenue-share agreement
- `assets/pages/ai-seo-rainmakers-review.md` — review page (agencygrowthtools.com)
- `assets/pages/best-ai-seo-communities.md` — comparison page (agencygrowthtools.com)
- `assets/posts/citation-playbook-post.md` — soft-sell student-posture post
- `assets/swipe/swipe-kit.md` — X/LinkedIn/newsletter/YouTube swipe copy
