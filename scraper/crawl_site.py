#!/usr/bin/env python3
"""Site crawler that follows internal links and scrapes every page found."""

import argparse
import json
import sys
from urllib.parse import urlparse, urljoin
from collections import deque

from scrape import fetch_page, extract_seo_data, extract_text, extract_links


def normalize_url(url):
    """Normalize URL for deduplication (strip fragment, trailing slash)."""
    parsed = urlparse(url)
    path = parsed.path.rstrip("/") or "/"
    return f"{parsed.scheme}://{parsed.netloc}{path}"


def is_internal(href, base_domain):
    """Check if a URL belongs to the same domain."""
    parsed = urlparse(href)
    if not parsed.netloc:
        return True
    return parsed.netloc == base_domain or parsed.netloc.endswith(f".{base_domain}")


def discover_links(page, base_url, base_domain):
    """Extract internal links from a page."""
    found = set()
    for a in page.css("a[href]"):
        href = a.attrib.get("href", "").strip()
        if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
            continue
        absolute = urljoin(base_url, href)
        if is_internal(absolute, base_domain):
            normalized = normalize_url(absolute)
            if normalized.startswith(("http://", "https://")):
                found.add(normalized)
    return found


def crawl(start_url, mode="basic", extract="seo", max_pages=50, max_depth=5, timeout=30):
    """Crawl a site starting from start_url, following internal links."""
    base_parsed = urlparse(start_url)
    base_domain = base_parsed.netloc
    start_normalized = normalize_url(start_url)

    visited = set()
    queue = deque([(start_normalized, 0)])
    results = []

    print(f"Starting crawl from {start_url}", file=sys.stderr)
    print(f"Domain: {base_domain} | Max pages: {max_pages} | Max depth: {max_depth}", file=sys.stderr)

    while queue and len(results) < max_pages:
        url, depth = queue.popleft()

        if url in visited:
            continue
        if depth > max_depth:
            continue

        visited.add(url)
        print(f"[{len(results)+1}/{max_pages}] (depth {depth}) {url}", file=sys.stderr)

        try:
            page = fetch_page(url, mode=mode, timeout=timeout)
        except Exception as e:
            results.append({"url": url, "depth": depth, "error": str(e)})
            print(f"  Error: {e}", file=sys.stderr)
            continue

        if extract == "seo":
            data = extract_seo_data(page)
        elif extract == "text":
            data = {"url": url, "text": extract_text(page)}
        elif extract == "links":
            data = {"url": url, "links": extract_links(page)}
        else:
            data = {"url": url, "html": page.html_content}

        data["depth"] = depth
        data["url"] = url
        results.append(data)

        new_links = discover_links(page, url, base_domain)
        for link in sorted(new_links):
            if link not in visited:
                queue.append((link, depth + 1))

        new_count = len(new_links - visited)
        if new_count:
            print(f"  Found {new_count} new internal links", file=sys.stderr)

    print(f"\nCrawl complete: {len(results)} pages scraped, {len(visited)} URLs visited", file=sys.stderr)
    return results


def main():
    parser = argparse.ArgumentParser(
        description="Crawl an entire site by following internal links"
    )
    parser.add_argument("url", help="Starting URL to crawl from")
    parser.add_argument(
        "--mode",
        choices=["basic", "stealth", "dynamic"],
        default="basic",
    )
    parser.add_argument(
        "--extract",
        choices=["seo", "text", "links", "html"],
        default="seo",
    )
    parser.add_argument(
        "--max-pages", type=int, default=50,
        help="Maximum number of pages to scrape (default: 50)",
    )
    parser.add_argument(
        "--max-depth", type=int, default=5,
        help="Maximum link depth from start URL (default: 5)",
    )
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--output", "-o", help="Output file")

    args = parser.parse_args()

    results = crawl(
        args.url,
        mode=args.mode,
        extract=args.extract,
        max_pages=args.max_pages,
        max_depth=args.max_depth,
        timeout=args.timeout,
    )

    output = json.dumps(results, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Output written to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
