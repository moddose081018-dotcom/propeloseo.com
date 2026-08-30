# DocShare Setup

Reference for delivering PropeloSEO client work over [DocShare](https://github.com/Marc-Moeller/docshare) — a self-hosted document host. Push a markdown, HTML or CSV file at its API, get back a client-ready URL on our own domain and our own database.

## Why We Use It

A Growth Pack is finished when the client can open it. DocShare is the shortest path from the file we produced to a link we can paste into an email: one `curl` call, no Google Doc sharing settings to get wrong, no PDF attachment, no client account to create. Re-publishing the same slug updates the page in place, so the link we sent in week one still points at the current version in week six.

| What we send | Format | What the client sees |
|---|---|---|
| Growth Pack, content brief, fix spec | Markdown | Rendered page with TOC, anchors, syntax highlighting |
| Audit export, keyword set, crawl data | CSV | Sticky-header table plus a download link |
| Designed one-pager, proposal | HTML | The page exactly as authored, no DocShare chrome |
| Screenshots, Loom-style walkthroughs | Image / video | Hosted image or an adaptive video player |

**It is a delivery surface, not a publishing surface.** Every DocShare response carries `X-Robots-Tag: noindex, nofollow` and its `robots.txt` disallows everything. Nothing hosted there will ever rank. Anything meant to be found in search belongs on propeloseo.com.

## Read This First — Three Things That Bite

**1. An unset `API_KEY` means no authentication at all.** `apiAuth` calls `next()` when `process.env.API_KEY` is empty, so a deploy that dropped the variable leaves upload, list and delete open to anyone who finds the host. After every deploy, hit the API with no key:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://docs.example.com/api/documents   # want: 401
```

A `200` there means the key is missing from the environment. Fix it before publishing anything.

**2. A document with no folder is listed on the public `/browse` page.** `/browse` lists every document `WHERE folder_id IS NULL`. `visibility: unlisted` is supposed to drop unfoldered documents into a folder with the slug `private`, but nothing in the schema creates that folder — the lookup returns nothing, the document is left folderless, and it shows up in the public index. Two habits close this:

- Create a folder named `Private` in `/admin` once per install (the slug is derived from the name), so the fallback has somewhere to land.
- Always pass an explicit `folder` on upload. `scripts/publish-doc.sh` warns when you don't.

**3. Upsert resets visibility.** Re-publishing an existing slug writes `visibility` from the request every time; only `folder` and `password_hash` are preserved when omitted. Leave `--visibility password` off a re-publish of a locked document and it becomes unlisted — the lock screen disappears while the old password stays in the database. Keep visibility in the publish command, not in your head.

## Deploy

### Requirements

- Node.js 20+, PostgreSQL 14+
- S3 credentials (images) and Bunny Stream credentials (video) are optional; documents, CSV and forms work without either

### Docker / Dokploy

The repo's `docker-compose.yml` ships a `db` service (`postgres:17-alpine`, named volume) wired to `app` over the internal `db:5432` hostname. Set in the compose environment:

```
DB_USER, DB_PASSWORD, DB_NAME
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
```

The pool detects `sslmode=require` in the URL, so the same image runs against internal plaintext Postgres or an external Neon/Supabase instance.

### Local

```bash
git clone https://github.com/Marc-Moeller/docshare.git
cd docshare && npm install
cp .env.example .env      # fill in DATABASE_URL, API_KEY, ADMIN_PASSWORD, COOKIE_SECRET
npm run db:init
npm start
```

### Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string |
| `API_KEY` | Yes in practice | Empty disables API auth entirely — see gotcha 1 |
| `ADMIN_PASSWORD` | Yes | Password for `/admin` |
| `COOKIE_SECRET` | Yes | Signs the admin session and document unlock cookies. Rotating it logs everyone out and re-locks password-protected pages |
| `BASE_URL` | Yes | Public URL. It is what the API echoes back as `url`, so a wrong value hands clients dead links |
| `PORT` | No | Default 3000 |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION` | Media only | Image hosting |
| `BUNNY_ACCOUNT_KEY`, `BUNNY_LIBRARY_ID`, `BUNNY_LIBRARY_KEY`, `BUNNY_CDN_HOST` | Media only | Video hosting |
| `MAX_IMAGE_SIZE`, `MAX_VIDEO_SIZE` | No | Bytes; defaults 50MB / 500MB |

### Schema

Run `npm run db:init` once — it creates `folders`, `documents` and `media`. The remaining columns (`visibility`, `password_hash`, `content_type`), the media columns and the `form_responses` table are added by the server at boot with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. So: init once, start the app, and don't hand-write migrations. If the server never started successfully, an upload will fail with a 500 because those columns do not exist yet.

## Publishing From This Repo

`scripts/publish-doc.sh` wraps the upload call. It needs `curl` and nothing else.

```bash
export DOCSHARE_URL=https://docs.example.com
export DOCSHARE_API_KEY=...
```

or put the same two lines in `.docshare.env` at the repo root, which the script sources and `.gitignore` keeps out of commits.

```bash
# Growth Pack for a client, link-only
scripts/publish-doc.sh growth-pack.md --folder buymoda --slug buymoda-growth-pack-2026-08

# Same file again — the link does not change, the page updates
scripts/publish-doc.sh growth-pack.md --folder buymoda --slug buymoda-growth-pack-2026-08

# Password-locked (competitor names, pricing, anything not to be forwarded)
scripts/publish-doc.sh proposal.html --folder buymoda --visibility password --password 'octane'

# Audit export as a table
scripts/publish-doc.sh crawl-issues.csv --folder buymoda --title 'Crawl issues, August'

# See the request without sending it
scripts/publish-doc.sh growth-pack.md --folder buymoda --dry-run
```

The script prints the public URL on success and exits non-zero with the server's error body on failure. `--json` prints the raw API response instead.

Content type comes from the extension (`.md`/`.markdown`, `.html`/`.htm`, `.csv`), overridable with `--type`. Slug defaults to the filename; titles come from the first `#` heading (markdown) or `<title>` (HTML) when `--title` is omitted, and from the slug for CSV.

## Conventions

| Setting | Convention |
|---|---|
| Folder | One per client, slug = client slug (`buymoda`, `golfcorner`). Create it in `/admin` before the first publish — an unknown folder slug is silently ignored, not an error |
| Slug | `<client>-<deliverable>-<yyyy-mm>`, e.g. `buymoda-growth-pack-2026-08`. Stable slug = stable link across revisions |
| Visibility | `unlisted` for client work; `password` when the document names competitors, pricing, or anything we would not want forwarded; `public` only for things we are happy to have listed on `/browse` |
| Passwords | Matched case-insensitively (a password read off a screen arrives capitalised on a phone). Send it in a separate message from the link |
| Revisions | Re-publish the same slug. Do not date-suffix a new slug per revision — the client's old link then rots |

## Formats

| Sent as | Header / field | Stored as | Served at `/d/:slug` |
|---|---|---|---|
| Markdown | `Content-Type: text/markdown` or `{"markdown": "..."}` | `markdown` | Rendered with DocShare chrome: GFM, `[[toc]]`, anchors, highlight.js, emoji |
| HTML | `Content-Type: text/html` or `{"html": "..."}` | `html` | Byte-for-byte as sent. It must be a complete standalone document — DocShare adds nothing |
| CSV | `Content-Type: text/csv` or `{"csv": "..."}` | `csv` | Scrollable sticky-header table plus a download link |

Bodies are capped at 10 MB. `/d/:slug/raw` returns the source with a matching MIME type; CSV comes back as an attachment.

## Media

`POST /api/media` takes `multipart/form-data` with field name `file`, plus optional `slug`, `folder`, `visibility`, `password`. Images go to S3 with a generated thumbnail (`/m/:slug/thumb`), video goes to Bunny Stream and plays in an adaptive player at `/m/:slug`. The same folder and visibility rules as documents apply, including gotcha 2 — an unfoldered public image is listed on `/gallery`.

## Forms

A published document can ask its reader a question and collect the answer back into DocShare instead of ending with "email us your answers". `POST /api/forms/:formSlug` needs no API key (the person answering is the client); reading needs one:

```bash
curl "$DOCSHARE_URL/api/forms/buymoda-growth-pack-2026-08?latest=1" -H "x-api-key: $DOCSHARE_API_KEY"
curl "$DOCSHARE_URL/api/forms/buymoda-growth-pack-2026-08?format=csv" -H "x-api-key: $DOCSHARE_API_KEY"
```

Responses are append-only — a corrected answer is a new row with the original still visible — and `?latest=1` collapses to the newest answer per question key. Answers are also readable in `/admin/forms`. Submission is rate limited to 60 per IP per 10 minutes and carries a honeypot field; IPs are stored only as a salted hash. Full schema in the upstream `docs/FORMS.md`.

## Everyday Calls

```bash
curl "$DOCSHARE_URL/api/documents?limit=50" -H "x-api-key: $DOCSHARE_API_KEY"      # list
curl -X DELETE "$DOCSHARE_URL/api/documents/SLUG" -H "x-api-key: $DOCSHARE_API_KEY" # delete
curl "$DOCSHARE_URL/health"                                                          # {"status":"ok"}
```

## Troubleshooting

| Symptom | Cause |
|---|---|
| `401 Invalid API key` | Wrong or missing `x-api-key` — or the right key against a host whose `API_KEY` differs |
| No `401` when you send no key at all | `API_KEY` is unset on the server. Nothing is protected. Fix the environment |
| `500 Failed to save document` | Database unreachable, or the server has never booted successfully so the added columns are missing. Check the app log and that `npm run db:init` ran |
| `413` on upload | Body over the 10 MB limit. Split the document or upload the data as media |
| Markdown appears as literal `#` and `*` | Sent with the wrong content type, so it was stored as `html` or `csv`. Re-publish with the correct `--type` |
| Client's page shows on `/browse` | Published with no folder, or with a folder slug that does not exist. See gotcha 2 |
| Password page rejects a correct password | `COOKIE_SECRET` changed, or the document was re-published without `--visibility password` and then locked again |
| API returns `localhost` URLs | `BASE_URL` is unset or wrong on the server |
