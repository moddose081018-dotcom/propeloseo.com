# propeloseo.com — Commercial Site Audit

Date: 2026-09-28 · Target market (assumed): United States · Method: Interactive Full-Site Auditor prompt

## Audit brief and limitations

| Item | Value |
|---|---|
| Business | Propelo SEO LLC (PropeloSEO). Solo-led AEO/GEO consultancy, founder Shane Hellmrich |
| Primary offer | $1,497 Blueprint → 90 Day Search Growth Sprint ($3,000/mo × 3) → Retainer from $3,000/mo |
| Primary conversion | Free AI Visibility Check (`/intake/`, capped at 5 a week) |
| Target customer | US peptide, longevity/TRT/regenerative and psilocybin/ketamine businesses |
| Data used | DataForSEO: page fetch with JS on, 49 URLs; backlinks; ranked keywords; live Google SERPs; 4 AI-answer tests |
| Not available | Google Search Console, GA4, conversion data, screenshots/visual render, Ahrefs |
| JEV_STATUS | NOT AVAILABLE. No TypeSafe key in this environment. All judgement below is the primary model's. |
| Assumptions ("use your assumptions") | (1) The live site's code is not this repo. (2) The owner did not build the spam backlinks. (3) No GSC. (4) Off-niche pages stay for now. |

Crawl coverage:
- 49 URLs discovered, from the nav, the footer, a Google `site:` search and body links. All 49 were fetched.
- The sitemap and robots.txt return 200, but I could not read their contents, so orphan pages are not verified.
- Two linked URLs were not fetched: `/ai-audit/` and `/free-ai-check/`.
- AI tests are one generation per prompt: 3 on ChatGPT (gpt-4o-mini with web search) and 1 on Perplexity (sonar). Treat them as directional.

---

## 1. Executive verdict

**What the site already has going for it.** The site is well built:
- A clear niche position with compliance-first copy.
- Real founder expertise, a credible guarantee, and published prices.
- Clean templates: every page has a self-canonical, a unique title and H1, and valid schema.
- A proper hub-and-spoke structure for the three verticals.

Early signs that this works:
- ChatGPT already names PropeloSEO for Oregon psilocybin service centers.
- `/psilocybin-seo/psilocybin-seo-challenges/` ranks **#2 on Google for "psilocybin seo"**.

**The biggest failure.**
- **All of the site's external links are spam.** DataForSEO counts 91 referring domains. Every one uses a PBN-sale anchor such as "High Quality Dofollow Backlinks DA 50 PA 40 Premium PBN Network Service propeloseo.com…". They sit on .store/.website/.space domains, have a spam score of 51–64, and were first seen between 2026-08-01 and 2026-09-10.
- For a YMYL health consultancy that sells "trust", this is the most commercially dangerous fact on the domain.
- **The prices and offers the site publishes contradict each other.** `/ai-instructions/` is the page that tells AI assistants what PropeloSEO sells, and it still quotes the old $97/$197/$599 menu.

**Commercial consequence.**
- Google may discount the domain's authority.
- AI answers may repeat the wrong prices.
- A buyer comparing pages sees three different price structures.
- That damages a $9,000 sale at the point of trust.

**Major upside.**
- The psilocybin cluster already ranks and gets cited with no real links.
- Peptide and longevity are winnable through the same approach, plus inclusion in the third-party listicles that AI engines cite.

---

## 2. Highest-leverage moves

| # | Finding | Evidence | Exact fix | URLs | Priority | Effort | Confidence | Owner |
|---|---|---|---|---|---|---|---|---|
| 1 | Backlink profile is 100% spam anchors | 91/91 referring domains use 2 PBN-sale anchors, spam score 51–64, first seen Aug–Sep 2026 | Submit a domain-level disavow for all 91 domains. Export the backlink list monthly. Record it as suspected negative SEO. | sitewide | P0 | 1 | 0.85 | Shane |
| 2 | AI reference page lists retired offers and prices | `/ai-instructions/`: "Site Health from $97/mo", "Natural Linking $599", "AI Visibility Audit $197", "Deep Dive $1,497" | Rewrite the offer section to: Free Check → $1,497 Blueprint → $3,000/mo Sprint → Retainer. Update `/llms.txt` the same way. | /ai-instructions/, /llms.txt | P0 | 1 | 0.95 | Dev |
| 3 | Ketamine page sells the old retainer ladder | `/ketamine-clinic-seo/`: "Growth Retainer ($2,000/mo)", "Authority Retainer ($4,997/mo)", "$197 AI Visibility Audit" | Replace its offer block with the shared four-step block that the other hubs use | /ketamine-clinic-seo/ | P0 | 1 | 0.95 | Dev |
| 4 | Retainer price is inconsistent | "from $3,000" in the homepage FAQ and titles, but "$4,000 to $5,000 plus" on /services/ and /authority-retainer/ | Pick one statement, for example "from $3,000; most scopes $4,000–$5,000", and use it everywhere | /, /services/, /authority-retainer/ | P1 | 1 | 0.9 | Shane |
| 5 | Legacy offers still indexed and linked sitewide | /site-health/ (164 words), /natural-linking/ (165 words), and "free Free" in /site-health/'s meta | Remove them from the footer "Other services". If existing clients still use them, add `noindex`. Keep the URLs live (reversible). | /site-health/, /natural-linking/ | P1 | 1 | 0.8 | Dev |
| 6 | No terms or refund page for a $9,000 service | /terms/ and /refunds/ return 404. Only /privacy-policy/ exists. | Publish Terms of Service and a Refund policy that match the 30-Day Implementation Guarantee. Link them in the footer and on /services/. | new | P1 | 2 | 0.8 | Shane (legal) |
| 7 | Links point to a redirected URL | /psilocybin-seo/, /psilocybin-service-centers/ and /integration-therapists/ link to `/psilocybin-seo/ketamine-clinics/`, which 301s | Change those links to `/ketamine-clinic-seo/` | 3 pages | P1 | 1 | 1.0 | Dev |
| 8 | Informational pages don't pass authority to the hubs | The five blog pages and /over-50… have ≤2 body links, all to offer pages | Add 1–2 contextual links from each blog page to the relevant hub (see §7) | 6 pages | P1 | 1 | 0.8 | Dev |
| 9 | Peptide is invisible in AI answers and on Google | "peptide seo": not in the top 10; the AI Overview cites peptideseo.com, lanternsol.com and 747mediahouse.com. ChatGPT's peptide-agency answer lists 9 firms, not PropeloSEO. | Get into the sources those answers use (see §10). Sharpen /peptide-seo/ for clinics versus research-use-only sellers. | /peptide-seo/ cluster | P1 | 3 | 0.7 | Shane |
| 10 | Brand queries show no third-party proof | ChatGPT on "Is PropeloSEO legit?": "no widely available independent reviews" | Collect reviews on 1–2 platforms, such as a Google Business Profile or Clutch, from the dashboard clients | off-site | P1 | 2 | 0.8 | Shane |

---

## 3. What is already good

These were checked and **need no work**:
- HTTPS and Cloudflare caching. Fetches take 40–100 ms and CLS is 0.
- Every page has a self-referencing canonical and indexable robots meta. Only /onboard/ is noindex, which is correct.
- No two pages share a title or an H1.
- JSON-LD parses on all 47 HTML pages. Organization, Service, Article, FAQPage and BreadcrumbList are used sensibly.
- Hubs have been split correctly by intent: peptide into clinics, brands and pharmacies; longevity into clinics, TRT and regenerative; psilocybin into centers, integration therapists and ketamine.
- Copy on money pages answers the question first, with sources cited ("Where this page's claims come from").
- Trust building blocks are in place: named founder, About page with Person schema, a written guarantee, and published prices.
- The homepage has one primary CTA ("Get my AI visibility score"), repeated consistently.

Deliberately **not** flagged:
- Render-blocking CSS: a single stylesheet with a fast TTFB.
- H5 headings in the footer.
- Word counts.

---

## 4. Business and conversion

- **Journey:** visitor → Free Check (`/intake/`) → Blueprint or Sprint. The CTA is the same everywhere, which suits a single funnel.
- **Proof:** "Two client dashboards", names withheld. That is honest, but thin for a $9,000 decision.
  - The cheapest upgrade is one anonymised case summary with dates, the change made, and the observed movement. Keep the existing "not a promise" framing.
- **Trust gaps:**
  - No terms or refund page (move 6).
  - No independent reviews (move 10).
  - The brand is written two ways: "Propelo SEO LLC" and "PropeloSEO". That's fine, as long as schema `alternateName` keeps both, which it does.
- **Consulting page:** title "Strategy consulting" (32 characters). Its og:title and twitter:title are the **ketamine page's title**, so LinkedIn and X shares show the wrong headline.
  - Fix: set og:title to the page title, and retitle it to "SEO Strategy Consulting for Regulated Health Brands".
- **Copy defects:**
  - "Request your free Free AI Visibility Check" (homepage H2).
  - `/psilocybin-seo/psychedelic-marketing-agency/` has a broken meta and twitter description ("…retainer.'s what I do…") and no "| PropeloSEO" suffix on its title.
- **Mobile and visual:** not assessed. No render was available, so this is a limitation.
- **Experiment:** see §15.

---

## 5. Search intent and architecture

| URL | Current purpose | Recommended purpose | Target query | Action |
|---|---|---|---|---|
| / | Brand plus broad AEO/GEO | Entity home for "AI SEO for regulated health" | PropeloSEO; AEO/GEO agency for regulated health | Keep |
| /peptide-seo/ | Hub | Hub for peptide SEO agency | peptide seo, peptide seo agency | Keep; add a clinic vs RUO distinction (SERP is split) |
| /longevity-regen-seo/ | Hub | Hub for longevity clinic SEO | longevity clinic seo | Keep |
| /psilocybin-seo/ | Hub | Hub for psilocybin SEO agency | psilocybin seo | Keep; see cannibalisation (§6) |
| /psilocybin-seo/psilocybin-seo-challenges/ | Guide | Supporting guide | psilocybin seo challenges | Keep; link to the hub |
| /ketamine-clinic-seo/ | Spoke (moved out of the psilocybin folder) | Spoke | ketamine clinic seo | Fix prices and inbound links |
| /services/ | Pricing | Pricing | propeloseo pricing | Fix the retainer range |
| /deep-dive-audit/, /growth-retainer/, /authority-retainer/ | Offer pages | Offer pages | branded offers | Rename slugs later, only if worth it. `/growth-retainer/` now sells the *Sprint*. HYPOTHESIS: low value, leave for now. |
| 9 "other industries" pages | Off-niche service pages | Keep indexed and out of the main nav | electrician seo, etc. | Keep. These are the only pages with impressions. Review after 90 days with GSC. |
| /site-health/, /natural-linking/ | Retired offers | Utility | — | noindex and drop from the footer (move 5) |
| /ai-instructions/ | Entity reference for LLMs | Entity reference | PropeloSEO | Update offers (move 2) |

---

## 6. Cannibalisation matrix

| Query | URL A | URL B | Evidence | Intended winner | Action | Reversible | Confidence |
|---|---|---|---|---|---|---|---|
| psilocybin seo | /psilocybin-seo/ | /psilocybin-seo/psilocybin-seo-challenges/ | B ranks #2; A is not in the top 10 | A (the commercial hub) | Add a contextual link from B to A with the anchor "psilocybin SEO". Differentiate B's title around "challenges". Do not merge. | yes | HYPOTHESIS 0.6 (needs GSC) |
| hormone / TRT clinic seo | /longevity-regen-seo/hormone-optimization-clinics/ | /longevity-regen-seo/trt-clinics/ | A already 301s to B | B | Done. Confirm that nothing internal still links to A. | — | 0.9 |

No other collisions were found. Titles and H1s are distinct.

---

## 7. Internal link plan

| Source | Target | Anchor class | Suggested anchor | Priority |
|---|---|---|---|---|
| /psilocybin-seo/psilocybin-seo-challenges/ | /psilocybin-seo/ | partial intent | "psilocybin SEO for licensed centers" | P1 |
| /psilocybin-seo/, /psilocybin-service-centers/, /integration-therapists/ | /ketamine-clinic-seo/ | descriptive | "ketamine clinic SEO" (replaces the redirected URL) | P1 |
| /get-cited-by-llms/ | /ai-search-optimization-services/ | partial intent | "AI search optimization services" | P1 |
| /generative-engine-optimization-tools/ | /ai-search-optimization-services/ | descriptive | "how I use these tools on client sites" | P2 |
| /will-ai-replace-seo/ | /get-cited-by-llms/ | descriptive | "what gets a site cited by LLMs" | P2 |
| /longevity-regen-seo/over-50-and-want-to-live-longer/ | /longevity-regen-seo/longevity-clinics/ | descriptive | "longevity clinics" (only if it fits the reader, a public guide) | P2 |
| /how-much-does-seo-cost/ | /services/ | brand + modifier | "PropeloSEO pricing". The page already says "on the pricing page at /services/" in plain text; make it a link. | P1 |

---

## 8. Content and topical authority

- **Existing clusters:** peptide (3 spokes), longevity (4), psilocybin (4 plus ketamine), AI search (4 guides).
- **Missing or weak:**
  - Peptide content does not separate **clinics from research-use-only sellers**. The Google AI Overview explicitly asks which one the searcher means. A section on /peptide-seo/ answering "clinic vs RUO: different rules, different SEO" matches the SERP. MUST MATCH.
- **Don't create new pages yet.** The existing cluster is complete. Authority and linking are the bottleneck, not content.
- **Rich media:** one real (anonymised) dashboard walkthrough on /services/ would help the $9,000 decision more than any new article.

---

## 9. Entity and brand

- **Entity signals:**
  - Organization schema includes the legal name, alternateName, founder, a Wyoming address, phone and areaServed US/GB/AU.
  - Person schema is on /about/.
  - /ai-instructions/ is a DefinedTermSet reference page.
- **Corroboration:**
  - The brand search shows LinkedIn (Shane Hellmrich – Founder, PropeloSEO) and the Marie Haynes community profile.
  - Both say "based in Thailand". The site says a Wyoming LLC working remotely. That isn't a contradiction, but add a line to /about/ ("I work from Thailand with US, UK and AU clients") so AI summaries don't reconcile it by guessing.
- **Brand SERP noise:** propulseo-site.com (a French agency) ranks for the brand name. Low risk, but add `sameAs` links in Organization schema (LinkedIn and any other profiles) so engines can separate the entities.
- **Reviews:** none found. See move 10.

---

## 10. AI search / GEO

| Query | Engine | Named? | Cited URL | Competitors named |
|---|---|---|---|---|
| Which SEO agency should a licensed psilocybin service center in Oregon hire? | ChatGPT (web) | **Yes**, the only agency named | /psilocybin-seo/psilocybin-service-centers/ | none (it listed service centers) |
| Best SEO agencies for peptide clinics / compounding pharmacies (US) | ChatGPT (web) | No | — | PeptidesSEO, HDS, Healthful SEO, The Longevity Agency, Peptide Marketing, Peptide Ad Lab, The SEO Clinic, MedSpa SEO, PULSEO |
| Best AI SEO agency for longevity/TRT/hormone clinics | Perplexity sonar | No | — | The Longevity Agency, Snezzi, Onely, Wisevu, Cardinal |
| What is PropeloSEO and is it legit? | ChatGPT (web) | Yes | /, /services/, /deep-dive-audit/ | — ("no independent reviews") |
| Google "peptide seo" AI Overview | Google | No | — | peptideseo.com, lanternsol.com, 747mediahouse.com, slcsitestudio.com |

**Source map.**
- The longevity answer is built almost entirely from **third-party listicles**: onely.com (4 roundups), firstpagesage.com, thriveagency.com, webtonic.io, maximuslabs.ai and seoprofy.com.
- The fix is **B, third-party inclusion**. Pitch inclusion to Onely's "AI SEO agencies for longevity brands" and "wellness AI SEO experts" roundups, and to similar healthcare GEO listicles.
- For peptide it is **both A and B**: sharpen the page (§8) and get onto the roundups the AI Overview cites.

**Retrievability.** The pages already lead with self-contained answer passages. The main defect is stale facts on /ai-instructions/ (move 2), not format.

---

## 11. Schema

| Current | Valid | Appropriate | Change |
|---|---|---|---|
| Organization + WebSite + FAQPage (home) | Yes | Yes | Add `sameAs` (LinkedIn etc.) |
| Service + FAQPage (hubs and spokes) | Yes | Yes | None |
| Product on /deep-dive-audit/ | Yes | Questionable: it's a service, not a product | Change to Service with an Offer (price $1,497) |
| /consulting/: WebPage + Breadcrumb, no Organization | Yes | Inconsistent with the other pages | Add the shared Organization block |
| /psychedelic-marketing-agency/: Article, no FAQPage | Yes | Fine | None |

---

## 12. Technical and indexation

**Critical:** none.

**High impact:**
- The spam link profile (move 1). It's off-page, but it sits here because it affects indexing and trust.
- /terms/ and /refunds/ are missing (move 6).

**Opportunistic:**
- Three links point to a 301 (move 7).
- /consulting/ has the wrong og:title.
- The psychedelic-marketing-agency meta description is broken.
- "free Free" typo.
- One image without alt text on each hub, spoke, guide and industry page (a shared template image). Give it a real description.
- The `/ketamine-clinic-seo/` title is 68 characters; trim it to under 60.

**Noise:** render-blocking stylesheet, footer H5s, word counts.

---

## 13. Off-page

- **Profile:**
  - 91 backlinks from 91 referring domains, all found between 2026-08-01 and 2026-09-10.
  - Two anchors only: 79 × "Improve Website Authority with Professional propeloseo.com Link Building" and 12 × a PBN-sale anchor.
  - Spam score 51–64.
- **Relevant links:** none found. The domain has no editorial links.
- **Recommendation:**
  1. Disavow at domain level.
  2. Build **entity links** first: LinkedIn, the Marie Haynes community profile, podcast guest spots in psychedelic and longevity media, and the listicle inclusions in §10.
  3. Do not buy links. The site's own cost page warns against network links.
- Limitation: DataForSEO only; no Ahrefs cross-check.

---

## 14. Page ledger (49 URLs)

| URL | Status | Type / role | Main finding | Exact change | Priority |
|---|---|---|---|---|---|
| / | 200 | homepage / entity | "free Free" in an H2 | Fix the typo; add `sameAs` | P2 |
| /peptide-seo/ | 200 | hub / money | Not visible on Google or in AI answers | Add a clinic vs RUO section; pursue third-party inclusion | P1 |
| /peptide-seo/peptide-clinics/ | 200 | spoke / money | — | NO MATERIAL CHANGE | — |
| /peptide-seo/peptide-brands/ | 200 | spoke / money | — | NO MATERIAL CHANGE | — |
| /peptide-seo/compounding-pharmacies/ | 200 | spoke / money | — | NO MATERIAL CHANGE | — |
| /longevity-regen-seo/ | 200 | hub / money | Missing from the listicles AI engines cite | Third-party inclusion (§10) | P1 |
| /longevity-regen-seo/longevity-clinics/ | 200 | spoke | — | NO MATERIAL CHANGE | — |
| /longevity-regen-seo/trt-clinics/ | 200 | spoke | — | NO MATERIAL CHANGE | — |
| /longevity-regen-seo/regenerative-medicine-clinics/ | 200 | spoke | — | NO MATERIAL CHANGE | — |
| /longevity-regen-seo/over-50-and-want-to-live-longer/ | 200 | public guide | 2 body links | Add one reader-relevant link (§7) | P2 |
| /longevity-regen-seo/hormone-optimization-clinics/ | 301 → TRT | redirect | — | Keep the 301 | — |
| /psilocybin-seo/ | 200 | hub / money | Outranked by its own guide; links to a 301 | Fix the ketamine link; strengthen links in from the guide | P1 |
| /psilocybin-seo/psilocybin-service-centers/ | 200 | spoke / money | Cited by ChatGPT; links to a 301 | Fix the ketamine link | P1 |
| /psilocybin-seo/ketamine-clinics/ | 301 → /ketamine-clinic-seo/ | redirect | Still linked internally | Update the 3 linking pages | P1 |
| /ketamine-clinic-seo/ | 200 | spoke / money | Old $2,000/$4,997/$197 prices; 68-character title | Replace the offer block; trim the title | P0 |
| /psilocybin-seo/integration-therapists/ | 200 | spoke | Links to a 301 | Fix the ketamine link | P1 |
| /psilocybin-seo/psychedelic-marketing-agency/ | 200 | spoke | Broken meta description; no brand suffix | Rewrite the description; add "\| PropeloSEO" | P2 |
| /psilocybin-seo/psilocybin-seo-challenges/ | 200 | guide / support | Ranks #2 for "psilocybin seo" | Link to the hub (§7) | P1 |
| /services/ | 200 | pricing / money | Retainer "$4,000–$5,000 plus" vs "from $3,000" | Unify the retainer wording | P1 |
| /ai-search-optimization-services/ | 200 | service | 2 body links | Receive links from the AI guides | P2 |
| /get-cited-by-llms/ | 200 | guide | 2 body links | Link to /ai-search-optimization-services/ | P1 |
| /generative-engine-optimization-tools/ | 200 | guide | Ranks #89; 2 body links | Link to the service page | P2 |
| /will-ai-replace-seo/ | 200 | guide | Ranks #24–56 | Link to /get-cited-by-llms/ | P2 |
| /how-much-does-seo-cost/ | 200 | guide | Google snippet still shows the old "$97 to $5,997"; the page is already updated | Make the /services/ mention a link; the snippet will refresh | P2 |
| /community/ | 200 | utility | 153 words | NO MATERIAL CHANGE | — |
| /about/ | 200 | entity | Location not stated | Add "work from Thailand" line | P2 |
| /intake/ | 200 | conversion | — | NO MATERIAL CHANGE | — |
| /deep-dive-audit/ | 200 | offer | Product schema on a service | Change to Service + Offer | P2 |
| /growth-retainer/ | 200 | offer (Sprint) | Slug doesn't match the offer | Leave (HYPOTHESIS: low value) | P3 |
| /authority-retainer/ | 200 | offer (Retainer) | $4,000/$5,000 vs "from $3,000" | Unify | P1 |
| /contact/ | 200 | contact | — | NO MATERIAL CHANGE | — |
| /privacy-policy/ | 200 | legal | No body links | NO MATERIAL CHANGE | — |
| /med-spa-seo/ | 200 | off-niche service | — | Keep; review with GSC at 90 days | P3 |
| /chiropractor-seo/ | 200 | off-niche service | — | Keep; review at 90 days | P3 |
| /physiotherapy-seo/ | 200 | off-niche service | — | Keep; review at 90 days | P3 |
| /pilates-yoga-studio-seo/ | 200 | off-niche service | — | Keep; review at 90 days | P3 |
| /golf-travel-seo/ | 200 | off-niche service | — | Keep; review at 90 days | P3 |
| /electrician-seo/ | 200 | off-niche service | Best-ranking page on the site (#21) | Keep | P3 |
| /cleaning-company-seo/ | 200 | off-niche service | — | Keep; review at 90 days | P3 |
| /moving-company-seo/ | 200 | off-niche service | — | Keep; review at 90 days | P3 |
| /recruitment-agency-seo/ | 200 | off-niche service | Ranks #96 | Keep | P3 |
| /site-health/ | 200 | retired offer | Thin; "free Free" in its meta | noindex; remove from the footer | P1 |
| /natural-linking/ | 200 | retired offer | Thin | noindex; remove from the footer | P1 |
| /onboard/ | 200 (noindex) | utility | Correctly noindexed | NO MATERIAL CHANGE | — |
| /consulting/ | 200 | service | og:title belongs to the ketamine page; weak title; no Organization schema | Fix og/twitter titles; retitle; add schema | P2 |
| /ai-instructions/ | 200 | entity reference | Old $97/$197/$599 offers | Rewrite the offers | P0 |
| /sitemap.xml | 200 | — | Contents not read | Confirm it lists /ketamine-clinic-seo/ and excludes the redirects | P2 |
| /robots.txt | 200 | — | Declares the sitemap | NO MATERIAL CHANGE | — |
| /terms/, /refunds/ | 404 | — | No terms or refund page | Publish both (move 6) | P1 |

**Template ledger:** the hub, spoke, guide and industry templates (about 36 URLs) all have 1 image without alt text. Fix it once in the template. P3.

---

## 15. Experiment

| Field | Plan |
|---|---|
| Hypothesis | Contextual links from the ranking challenges guide will lift /psilocybin-seo/ into the top 10 for "psilocybin seo" |
| Change | 2 contextual links from the guide to the hub; no other psilocybin changes for 6 weeks |
| Metric | GSC position and impressions for "psilocybin seo" on both URLs |
| Success | Hub reaches the top 10 and the guide stays in the top 5 |
| Failure | Hub unchanged, or the guide drops more than 3 places |
| Next action | On failure, re-target the hub title at the commercial phrase "psilocybin SEO agency" |

---

## 16. 30 / 60 / 90 day plan

- **Days 1–30:** disavow; fix the prices on /ai-instructions/, /llms.txt and /ketamine-clinic-seo/; unify the retainer wording; noindex /site-health/ and /natural-linking/; publish terms and refunds; fix the redirected links and add the contextual links; fix /consulting/ metadata and the typos.
- **Days 31–60:** add the peptide clinic vs RUO section; add `sameAs` and the location line; change the deep-dive schema; publish one anonymised case summary; collect the first reviews.
- **Days 61–90:** pitch inclusion to Onely and other healthcare-GEO roundups; get podcast guest spots in psychedelic and longevity media; review the off-niche pages with GSC; re-run the AI test set to compare.

---

## Final execution summary

### DO THESE FIRST
1. Disavow the 91 spam domains.
2. Correct the prices on /ai-instructions/, /llms.txt and /ketamine-clinic-seo/.
3. Unify the retainer price wording.
4. Publish Terms and Refund pages.

### DO THESE NEXT
5. Fix the 3 links to the redirected URL and add the §7 contextual links.
6. noindex and de-list /site-health/ and /natural-linking/.
7. Fix the /consulting/ og:title, the broken meta description and the "free Free" typo.
8. Collect independent reviews.

### DO THESE ONLY AFTER THE FIRST TWO GROUPS MOVE
9. Add the peptide clinic vs RUO section.
10. Pitch third-party listicle inclusion.
11. Get podcast and press placements.
12. Review the off-niche pages with GSC data.

### DO NOT WASTE MONEY ON THESE YET
- New articles: the cluster is complete.
- Buying links of any kind.
- Renaming the /growth-retainer/ slug.
- Page-speed work.
- Deleting the off-niche pages.
- Adding more FAQ schema.

**Execution statement:** the site's structure and copy are already ahead of most competitors. What is holding it back is trust hygiene: a spam link profile, contradictory prices on the page AI engines are told to read, and no terms or reviews. Fix those four in the first week, then put all remaining effort into third-party inclusion for peptide and longevity.
