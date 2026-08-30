#!/usr/bin/env bash
#
# Publish a deliverable to DocShare and print the client URL.
#
#   scripts/publish-doc.sh growth-pack.md --folder buymoda --slug buymoda-growth-pack-2026-08
#
# Needs DOCSHARE_URL and DOCSHARE_API_KEY in the environment, or in a
# .docshare.env file at the repo root. See docs/docshare-setup.md.
#
# Requires curl. Uses jq when present so a --password never reaches the
# query string (and so the server's access log).

set -euo pipefail

MAX_BYTES=$((10 * 1024 * 1024))   # DocShare caps request bodies at 10mb

usage() {
  cat <<'USAGE'
Usage: publish-doc.sh FILE [options]

Options:
  --slug SLUG            URL slug. Default: the filename, slugified.
                         Re-publishing an existing slug updates that page in place.
  --title TITLE          Default: first '# heading' (markdown), <title> (html), slug (csv).
  --folder SLUG          Client folder. Must already exist in /admin — an unknown
                         slug is silently ignored, and an unfoldered document is
                         listed on the public /browse page.
  --visibility MODE      public | unlisted | password. Default: unlisted.
                         Sent on every publish: omitting it on a re-publish would
                         reset the page to unlisted.
  --password PASS        Required with --visibility password. Matched case-insensitively.
  --type md|html|csv     Override the content type inferred from the extension.
  --base-url URL         Default: $DOCSHARE_URL
  --dry-run              Show what would be sent; send nothing.
  --json                 Print the raw API response instead of just the URL.
  -h, --help             This text.

Environment:
  DOCSHARE_URL           e.g. https://docs.example.com
  DOCSHARE_API_KEY       API key for the x-api-key header
USAGE
}

die() { printf 'publish-doc: %s\n' "$1" >&2; exit "${2:-1}"; }
warn() { printf 'publish-doc: %s\n' "$1" >&2; }

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
env_file="$script_dir/../.docshare.env"
# shellcheck disable=SC1090
[ -f "$env_file" ] && . "$env_file"

file=""
slug=""
title=""
folder=""
visibility="unlisted"
password=""
type=""
dry_run=0
raw_json=0
base_url="${DOCSHARE_URL:-}"
api_key="${DOCSHARE_API_KEY:-}"

need_value() { [ -n "${2:-}" ] || die "$1 needs a value"; }

while [ $# -gt 0 ]; do
  arg="$1"
  val=""
  case "$arg" in
    --*=*) val="${arg#*=}"; arg="${arg%%=*}"; shift ;;
    --slug|--title|--folder|--visibility|--password|--type|--base-url)
      need_value "$arg" "${2:-}"; val="$2"; shift 2 ;;
    *) shift ;;
  esac
  case "$arg" in
    --slug)       slug="$val" ;;
    --title)      title="$val" ;;
    --folder)     folder="$val" ;;
    --visibility) visibility="$val" ;;
    --password)   password="$val" ;;
    --type)       type="$val" ;;
    --base-url)   base_url="$val" ;;
    --dry-run)    dry_run=1 ;;
    --json)       raw_json=1 ;;
    -h|--help)    usage; exit 0 ;;
    --*)          die "unknown option: $arg" ;;
    *)            [ -z "$file" ] || die "only one file at a time (got '$file' and '$arg')"
                  file="$arg" ;;
  esac
done

# ── Validate ──
[ -n "$file" ] || { usage >&2; exit 1; }
[ -f "$file" ] || die "no such file: $file"
[ -r "$file" ] || die "cannot read: $file"
[ -s "$file" ] || die "file is empty: $file"
[ -n "$base_url" ] || die "set DOCSHARE_URL (or pass --base-url)"
[ -n "$api_key" ] || die "set DOCSHARE_API_KEY"
command -v curl >/dev/null 2>&1 || die "curl is required"

base_url="${base_url%/}"

case "$visibility" in
  public|unlisted|password) ;;
  *) die "--visibility must be public, unlisted or password (got '$visibility')" ;;
esac
if [ "$visibility" = password ] && [ -z "$password" ]; then
  die "--visibility password needs --password"
fi
if [ -n "$password" ] && [ "$visibility" != password ]; then
  warn "--password is ignored unless --visibility password; not locking this document"
  password=""
fi

if [ -z "$type" ]; then
  case "${file##*.}" in
    md|markdown|MD) type=md ;;
    html|htm|HTML)  type=html ;;
    csv|CSV)        type=csv ;;
    *) die "cannot tell the content type of '$file' — pass --type md|html|csv" ;;
  esac
fi
case "$type" in
  md|markdown) type=md;  mime='text/markdown'; json_key=markdown ;;
  html)                  mime='text/html';     json_key=html ;;
  csv)                   mime='text/csv';      json_key=csv ;;
  *) die "--type must be md, html or csv (got '$type')" ;;
esac

if [ -z "$slug" ]; then
  slug=$(basename -- "$file")
  slug="${slug%.*}"
  slug=$(printf '%s' "$slug" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '-' | tr -s '-')
  slug="${slug#-}"; slug="${slug%-}"
  [ -n "$slug" ] || die "could not derive a slug from '$file' — pass --slug"
fi
[ "${#slug}" -le 200 ] || die "slug is longer than the 200-character column: $slug"

if [ -z "$folder" ] && [ "$visibility" != public ]; then
  warn "no --folder: this document will be listed on the public /browse page (see docs/docshare-setup.md)"
fi

size=$(wc -c < "$file" | tr -d ' ')
[ "$size" -le "$MAX_BYTES" ] || die "file is ${size} bytes; DocShare rejects bodies over ${MAX_BYTES}"

# ── Build the request ──
urlencode() {
  local s="$1" out="" c i
  for (( i = 0; i < ${#s}; i++ )); do
    c="${s:i:1}"
    case "$c" in
      [A-Za-z0-9.~_-]) out="$out$c" ;;
      *) out="$out$(printf '%%%02X' "'$c")" ;;
    esac
  done
  printf '%s' "$out"
}

use_json=0
if command -v jq >/dev/null 2>&1 && jq -n --rawfile x /dev/null . >/dev/null 2>&1; then
  use_json=1
elif [ -n "$password" ]; then
  warn "jq not available: the password will travel in the query string, where server logs may keep it"
fi

url="$base_url/api/documents"
if [ "$use_json" -eq 0 ]; then
  query="slug=$(urlencode "$slug")&visibility=$(urlencode "$visibility")"
  [ -n "$title" ]    && query="$query&title=$(urlencode "$title")"
  [ -n "$folder" ]   && query="$query&folder=$(urlencode "$folder")"
  [ -n "$password" ] && query="$query&password=$(urlencode "$password")"
  url="$url?$query"
  content_type="$mime"
else
  content_type='application/json'
fi

if [ "$dry_run" -eq 1 ]; then
  shown_url="$url"
  [ -n "$password" ] && shown_url="${shown_url//$(urlencode "$password")/REDACTED}"
  printf 'POST %s\n' "$shown_url"
  printf '  Content-Type: %s\n' "$content_type"
  printf '  x-api-key:    %s\n' "$(printf '%s' "$api_key" | cut -c1-4)... (${#api_key} chars)"
  printf '  body:         %s (%s bytes, %s)\n' "$file" "$size" "$type"
  [ "$use_json" -eq 1 ] && printf '  fields:       slug=%s visibility=%s%s%s%s\n' \
    "$slug" "$visibility" \
    "${title:+ title=$title}" "${folder:+ folder=$folder}" "${password:+ password=REDACTED}"
  printf '  would return: %s/d/%s\n' "$base_url" "$slug"
  exit 0
fi

# ── Send ──
if [ "$use_json" -eq 1 ]; then
  body=$(jq -n --rawfile content "$file" --arg key "$json_key" \
              --arg slug "$slug" --arg visibility "$visibility" \
              --arg title "$title" --arg folder "$folder" --arg password "$password" \
    '{ ($key): $content, slug: $slug, visibility: $visibility }
       + (if $title    == "" then {} else { title: $title }       end)
       + (if $folder   == "" then {} else { folder: $folder }     end)
       + (if $password == "" then {} else { password: $password } end)')
  response=$(printf '%s' "$body" | curl -sS -X POST "$url" \
    -H "Content-Type: application/json" -H "x-api-key: $api_key" \
    --data-binary @- -w '\n%{http_code}') || die "request failed" 2
else
  response=$(curl -sS -X POST "$url" \
    -H "Content-Type: $mime" -H "x-api-key: $api_key" \
    --data-binary "@$file" -w '\n%{http_code}') || die "request failed" 2
fi

status="${response##*$'\n'}"
payload="${response%$'\n'*}"

if [ "$status" != 200 ] && [ "$status" != 201 ]; then
  printf 'publish-doc: DocShare returned HTTP %s\n%s\n' "$status" "$payload" >&2
  [ "$status" = 401 ] && warn "check DOCSHARE_API_KEY against this host"
  exit 2
fi

if [ "$raw_json" -eq 1 ]; then
  printf '%s\n' "$payload"
  exit 0
fi

if command -v jq >/dev/null 2>&1; then
  doc_url=$(printf '%s' "$payload" | jq -r '.url // empty')
else
  doc_url=$(printf '%s' "$payload" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
fi
[ -n "$doc_url" ] || { printf '%s\n' "$payload"; die "no url in the response" 2; }

printf '%s\n' "$doc_url"
