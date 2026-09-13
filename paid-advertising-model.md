# Paid Advertising Model — Break-Even vs Conversion Rate

Companion to `revenue-model.md` (which covers the organic creator engine). This one answers:
**if Shane spends on ads, at what conversion rate does it become profitable?**

**Bottom line up front:** Cold paid traffic sent straight to a $289/mo *third-party* offer
(where Shane earns 50%) is a **thin, high-risk channel**. It only works if click-to-member
conversion clears **~0.4–0.5%** AND clicks stay cheap (~$8 or less) AND Shane can finance a
**3–11 month payback** out of pocket while betting on retention he doesn't control. The
math is far friendlier for **retargeting** and for driving ads to **Shane's own Citation
Playbook** (100% kept) than for cold ads to Rainmakers.

---

## Step 1 — What a referred member is worth (LTV)

Recurring commission $144.50/mo. Lifetime = 1 ÷ monthly churn, minus a 7% refund haircut.

| Churn | Avg lifetime | LTV per member |
|---|---|---|
| 4% (best) | 25 mo | ~$3,360 |
| 6% (base) | 16.7 mo | ~$2,240 |
| 8% (avg) | 12.5 mo | ~$1,680 |

**Use ~$2,000 as the planning LTV.** This is the number ad spend is compared against — but
note it's earned *over ~14 months*, not up front.

---

## Step 2 — Two break-even lines

- **LTV break-even** (you finance the wait): conversion must beat **CPC ÷ LTV**.
- **Cash-safe break-even** (recoup in month 1, no retention risk): conversion must beat **CPC ÷ $144.50**.

| CPC (channel) | LTV break-even conv. (÷$2,000) | Cash-safe break-even conv. (÷$144.50) |
|---|---|---|
| $2 (Meta B2B) | 0.10% | 1.4% |
| $8 (Google B2B mid) | 0.40% | 5.5% |
| $14 (Google non-brand SEO kw) | 0.70% | 9.7% |

Cold traffic to a high-ticket community realistically converts **0.1–0.8%** click-to-member.
So on an **LTV basis it can just about work**; on a **cash basis it almost never does** — you
pay now and wait months to recoup.

---

## Step 3 — Cost per acquired member (CAC = CPC ÷ conversion)

| Click→member conv. | Meta $2 | Google $8 | Non-brand $14 |
|---|---|---|---|
| 0.10% | $2,000 | $8,000 | $14,000 |
| 0.25% | $800 | $3,200 | $5,600 |
| 0.50% | $400 | $1,600 | $2,800 |
| 1.00% | $200 | $800 | $1,400 |
| 2.00% | $100 | $400 | $700 |

Green zone = CAC below the ~$2,000 LTV. **Profitable cells:** everything at 1%+ conversion;
at 0.5% only Meta and mid-Google clear it; at 0.25% only cheap Meta clicks; at 0.1% nothing
except break-even Meta.

### Payback period (CAC ÷ $144.50/mo)
| CAC | Payback | Verdict vs ~14-mo lifetime |
|---|---|---|
| $400 | 2.8 mo | Healthy |
| $800 | 5.5 mo | Workable, financed |
| $1,600 | 11 mo | Thin — most of the member's life just repays CAC |
| $2,800 | 19 mo | **Loss** — longer than the member stays |

Any CAC above ~$1,700–2,200 loses money once churn is counted.

---

## Where it makes sense (the profitability line)

Paid ads to Rainmakers are worth running **only when all of these hold**:
1. Click-to-member conversion **≥ ~0.5%**
2. CPC **≤ ~$8** (favors Meta/YouTube over non-brand Google SEO keywords at $14)
3. Shane can **finance a 3–6 month payback** (cash-negative early)
4. Churn stays **≤ 8%** (payback must beat member lifetime)

Miss any one and it's break-even to loss.

---

## Honest recommendation

Don't lead with cold ads to a third-party $289/mo checkout — it's the hardest possible paid
funnel (high ticket, someone else's community, retention you don't control, 14-day Skool
last-touch attribution window to convert in).

Better uses of the same budget, in order:
1. **Retarget your review-page / content visitors.** Retargeting converts 2–5x cold and costs
   little. This is the one paid play with clearly positive math here.
2. **Run ads to a free lead magnet → email list → warm-up → offer.** Warm traffic converts far
   better than cold to a high-ticket offer.
3. **Point paid traffic at Shane's own Citation Playbook** (100% kept, not 50%), then graduate
   members to Rainmakers organically. Better unit economics on every click.
4. **Amplify the creator partnerships** (organic, near-zero CAC, warm audience trust) rather
   than replace them. Paid should support the organic engine, not front it.

---

## Suggested test before scaling

You cannot know your *real* click-to-member conversion until you test it — the model only
gives the threshold. Run a small controlled test:

- **Budget:** $500–1,000, one channel (start Meta retargeting or a cheap YouTube in-stream).
- **Measure:** actual click-to-member conversion with a dedicated landing page + UTM.
- **Decision rule:** continue only if conversion clears the LTV break-even for your CPC
  (e.g. ≥0.4% at $8 CPC), and you're comfortable financing the payback. Otherwise kill it and
  put the money back into partnerships.

---

## Sources
- Google Ads CPC 2026 (B2B ~$3.33; SaaS non-brand ~$13.75): [WordStream](https://www.wordstream.com/blog/2026-google-ads-benchmarks), [Kampaio](https://www.kampaio.com/blog/b2b-saas-google-ads-benchmarks-2026)
- Meta B2B CPC 2026 (~$2.52; SaaS ~$3.14): [TheeDigital](https://www.theedigital.com/blog/facebook-ads-benchmarks), [Stackmatix](https://www.stackmatix.com/blog/facebook-ads-cost-benchmarks-2026)
- YouTube CPV ($0.03–0.10) + cold traffic conversion (0.5–1.5%, lower for high-ticket) + retargeting 2–5x: [Store Growers](https://www.storegrowers.com/youtube-ads-benchmarks/), [ClickMinded](https://www.clickminded.com/landing-page-statistics/)
- Churn basis: see revenue-model.md sources.

*All rates are benchmark-derived estimates. Replace with real numbers from a live test before scaling spend.*
