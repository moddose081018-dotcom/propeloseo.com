# Security review: secrets and Cloudflare Workers (2026-09-02)

Scope: this repo (propeloseo.com static site), its full git history, and the
nine Workers deployed on the Cloudflare account. Live HTTP header checks could
not be run from the review environment and are listed as follow-ups.

## Findings

| # | Area | Result |
|---|------|--------|
| 1 | Repo working tree | No API keys, tokens, or credentials. Static HTML only. |
| 2 | Repo git history (all branches) | No credentials in any past commit. |
| 3 | Worker bundles (9) | No hardcoded credentials in any deployed bundle. |
| 4 | `moddose-checkout` | Reads `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` from `env`. Webhook signature is verified with HMAC and timing-safe compare. Correct pattern. |
| 5 | `reddit-reply` | Reads `ANTHROPIC_API_KEY` from `env`. Correct pattern. |
| 6 | KV / D1 | None exist, so nothing to leak there. |
| 7 | R2 | One bucket, `buymoda-backups`. Confirm it is not public. |

Nothing needed to be moved out of source code. The remaining risk is whether
the three `env` bindings above were created as **encrypted secrets** or as
**plaintext variables**. Plaintext vars are readable in the dashboard and via
the API; secrets are not. Cloudflare: "Do not use plaintext environment
variables to store sensitive information. Use secrets."
(https://developers.cloudflare.com/workers/configuration/environment-variables/)

## Action items

### 1. Verify bindings are secrets, not vars

```bash
wrangler secret list --name moddose-checkout   # expect STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
wrangler secret list --name reddit-reply       # expect ANTHROPIC_API_KEY
```

If a name is missing from `secret list` but the Worker still works, it is a
plaintext var. Convert it:

```bash
wrangler secret put STRIPE_SECRET_KEY --name moddose-checkout
wrangler secret put STRIPE_WEBHOOK_SECRET --name moddose-checkout
wrangler secret put ANTHROPIC_API_KEY --name reddit-reply
```

Then delete the plaintext var of the same name in Dashboard > Workers & Pages >
worker > Settings > Variables and Secrets. Rotate any key that was ever stored
as plaintext, since its value was viewable.

Declare required secrets in each Worker's `wrangler.toml` so a deploy fails if
one is missing (https://developers.cloudflare.com/workers/wrangler/configuration/#secrets-configuration-property):

```toml
[secrets]
required = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]
```

### 2. `reddit-reply` has no authentication

The only gate is the `Origin` header, which any non-browser client can set.
Anyone who finds the Worker URL can spend Anthropic credits. Options, cheapest
first:

- Add a shared bearer token as a secret (`wrangler secret put REPLY_TOKEN`) and
  reject requests without it.
- Add a Cloudflare rate-limiting rule on the Worker route.
- Put the endpoint behind Cloudflare Access if only you use it.

### 3. `moddose-checkout` origin check is skipped when `Origin` is absent

`if (origin && requestOrigin && requestOrigin !== origin)` passes any request
that omits the header. It cannot leak the Stripe key, but it lets anyone create
checkout sessions. Change to reject when `requestOrigin` is missing, or add a
rate-limiting rule.

### 4. Local secret files

`.gitignore` now excludes `.dev.vars*`, `.env*`, and `.wrangler/`, per
Cloudflare guidance (https://developers.cloudflare.com/workers/configuration/secrets/#local-development).
Apply the same `.gitignore` to each Worker's own repo.

### 5. Not verified from here (run yourself)

- Response headers on propeloseo.com, buymodareviews.com, modafinilowl.com:
  check HSTS, CSP, X-Frame-Options at https://securityheaders.com.
- `buymoda-backups` R2 bucket: confirm Public Access is off and no custom
  domain is attached (Dashboard > R2 > bucket > Settings).
- GitHub: enable secret scanning and push protection on the repo
  (Settings > Code security).

## Public identifiers seen (not secrets)

- Google Analytics measurement ID on modafinilowl.com. Safe to expose.
- Contact email on the Contact page. Not a secret, but a spam target; a form
  routed through a Worker with a Turnstile check would hide it.
