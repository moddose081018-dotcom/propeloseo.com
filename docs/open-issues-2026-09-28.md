# Open issues — 2026-09-28

Items found in the repo review that could not be fixed from this repo or this
session. Fixed items are in PR #41.

| # | Issue | Why not fixed here | What to do |
|---|-------|--------------------|------------|
| 1 | No Stripe checkout: "Start the Sprint" leads to the Contact page (`index.html:766`, `:803`) | Needs your Stripe payment link | Send the link; the button change is one line |
| 2 | `_redirects` untested — risk of a redirect loop if the host matches paths case-insensitively | Cloudflare docs and propeloseo.com are blocked from this container | On the PR preview, open `/Contact/` (should redirect) and `/contact/` (should load) |
| 3 | Internal files may be publicly served (`strategy.md`, `revenue-model.md`, `pl-dashboard.html`, `prospects/creators.csv`, `outbox/`) if the host deploys the repo root | Hosting config is outside the repo | Set the Pages build output to only the site files, or move the site into its own folder |
| 4 | `reddit-reply` Worker has no auth — anyone can spend Anthropic credits | Worker code is in a separate repo | Add a bearer-token secret or rate limit (`docs/security-review-2026-09.md` §2) |
| 5 | `moddose-checkout` accepts requests with no `Origin` header | Separate repo | Reject missing `Origin` (§3) |
| 6 | Unverified: Worker keys stored as encrypted secrets, R2 `buymoda-backups` not public, GitHub secret scanning on | Needs Cloudflare/GitHub dashboard access | Run the checks in §1 and §5 |
| 7 | `--score` in `tools/ai-visibility` can't be run end-to-end | No `TYPESAFE_API_KEY` in this environment | Run it locally with the key |
| 8 | `tools/ranking-factors` can't be re-run | Needs the external `ranklens` clone and a SERP | Run locally per its README |
| 9 | `strategy.md` (creator affiliate model) disagrees with the live site ($97/mo service) | Business decision | Decide which is current and update the file |
