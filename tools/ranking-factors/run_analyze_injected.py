#!/usr/bin/env python3
"""Run ranking-factor-analyzer's correlation engine on a SERP we supply ourselves.

Why this exists
---------------
`ranklens` pulls its SERP from a SERP-provider API keyed by SERP_API_KEY, or
falls back to DataForSEO's REST API keyed by DATAFORSEO_LOGIN/PASSWORD. This
container has neither: the DataForSEO account here is reachable only through an
MCP server, whose credentials never touch this process.

So we fetch the SERP through the MCP tool, freeze it to JSON, and inject it.
`ranklens.pipeline.fetch_serp` is the single call site for the live SERP; we
replace it with a function that returns the frozen Serp, and set
`serp_source="serpmaster"` so the `need_deep` branch (which would call the
credential-requiring DataForSEO client) is never taken.

Everything downstream — page fetching, the 113-factor extraction, the Spearman
correlation, the recommendations — is the upstream code, unmodified.

LLM-dependent stages (entities/EAV, topical authority, the funnel panels, the AI
narrative) are switched off: there is no LLM key here, and they would each
degrade to None anyway. What survives is the deterministic core.

Usage:
    python run_analyze_injected.py --serp serp-ai-seo-services.json \
        --target https://propeloseo.com/ --out report
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

REPO = Path(os.environ.get("RANKLENS_REPO", "/home/user/marc-moeller/ranking-factor-analyzer"))
sys.path.insert(0, str(REPO))

# ranklens.config requires a database_url only for the store; the analyze path
# never touches it, but Settings construction must not explode.
os.environ.setdefault("DATABASE_URL", "postgresql://unused/unused")

from ranklens import pipeline  # noqa: E402
from ranklens.models import AnalyzeRequest, Serp, SerpItem  # noqa: E402
from ranklens.report.html import render_analyze, save_report  # noqa: E402


def load_serp(path: Path) -> Serp:
    raw = json.loads(path.read_text())
    items = [
        SerpItem(
            rank=int(it["rank"]),
            url=it["url"],
            domain=it["domain"],
            title=it.get("title", ""),
            snippet=it.get("snippet", ""),
            displayed_url=it.get("displayed_url", ""),
        )
        for it in raw["items"]
    ]
    captured = raw.get("captured_at")
    return Serp(
        keyword=raw["keyword"],
        country=raw.get("country", "us"),
        language=raw.get("language", "en"),
        source=raw.get("source", "dataforseo-live"),
        captured_at=(
            datetime.fromisoformat(captured.replace("Z", "+00:00"))
            if captured
            else datetime.now(timezone.utc)
        ),
        items=items,
    )


async def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--serp", required=True, type=Path)
    ap.add_argument("--target", default=None)
    ap.add_argument("--out", default="report", type=str)
    ap.add_argument("--max-pages", type=int, default=None)
    args = ap.parse_args()

    serp = load_serp(args.serp)
    print(f"injected SERP: {serp.keyword!r} — {len(serp.items)} organic results", flush=True)

    async def _injected_fetch_serp(keyword, country="us", num=20, settings=None):
        return serp.model_copy(deep=True)

    pipeline.fetch_serp = _injected_fetch_serp

    request = AnalyzeRequest(
        keyword=serp.keyword,
        target_url=args.target,
        country=serp.country,
        language=serp.language,
        max_pages=args.max_pages or len(serp.items),
        serp_source="serpmaster",   # keeps need_deep False -> no DataForSEO client call
        include_authority=False,
        include_backlinks=False,
        include_brand=False,
        include_entities=False,     # LLM
        include_topical=False,      # LLM
        include_funnel=False,       # LLM
    )

    report = await pipeline.run_analyze(request, with_ai=False)

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    (out / "report.json").write_text(report.model_dump_json(indent=2))
    save_report(render_analyze(report), out / "report.html")

    print(
        f"pages fetched ok: {report.pages_fetched_ok}/{len(report.page_factors)}  "
        f"n={report.n_pages_analyzed}  |r| significance threshold: "
        f"{report.significance_threshold:.3f}",
        flush=True,
    )
    print(f"wrote {out/'report.json'} and {out/'report.html'}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
