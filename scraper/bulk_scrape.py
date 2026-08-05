#!/usr/bin/env python3
"""Bulk scraper using Scrapling's Spider framework for crawling multiple URLs or sitemaps."""

import argparse
import json
import sys
from urllib.parse import urlparse


def scrape_urls(urls, mode="basic", extract="seo", timeout=30):
    """Scrape a list of URLs and return results."""
    from scrape import fetch_page, extract_seo_data, extract_text, extract_links

    results = []
    for i, url in enumerate(urls, 1):
        print(f"[{i}/{len(urls)}] Scraping: {url}", file=sys.stderr)
        try:
            page = fetch_page(url, mode=mode, timeout=timeout)
            if extract == "seo":
                data = extract_seo_data(page)
            elif extract == "text":
                data = {"url": url, "text": extract_text(page)}
            elif extract == "links":
                data = {"url": url, "links": extract_links(page)}
            else:
                data = {"url": url, "html": page.html}
            results.append(data)
        except Exception as e:
            results.append({"url": url, "error": str(e)})
            print(f"  Error: {e}", file=sys.stderr)
    return results


def scrape_sitemap(sitemap_url, mode="basic", extract="seo", limit=None, timeout=30):
    """Scrape URLs from a sitemap."""
    from scrape import fetch_page

    print(f"Fetching sitemap: {sitemap_url}", file=sys.stderr)
    page = fetch_page(sitemap_url, mode="basic", timeout=timeout)

    urls = []
    for loc in page.css("loc"):
        urls.append(loc.text().strip())

    if limit:
        urls = urls[:limit]

    print(f"Found {len(urls)} URLs in sitemap", file=sys.stderr)
    return scrape_urls(urls, mode=mode, extract=extract, timeout=timeout)


def main():
    parser = argparse.ArgumentParser(description="Bulk scraper")
    parser.add_argument("--urls", nargs="+", help="URLs to scrape")
    parser.add_argument("--urls-file", help="File with one URL per line")
    parser.add_argument("--sitemap", help="Sitemap URL to crawl")
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
    parser.add_argument("--limit", type=int, help="Max URLs to scrape from sitemap")
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--output", "-o", help="Output file")

    args = parser.parse_args()

    if args.sitemap:
        results = scrape_sitemap(
            args.sitemap, mode=args.mode, extract=args.extract,
            limit=args.limit, timeout=args.timeout,
        )
    elif args.urls_file:
        with open(args.urls_file) as f:
            urls = [line.strip() for line in f if line.strip()]
        results = scrape_urls(urls, mode=args.mode, extract=args.extract, timeout=args.timeout)
    elif args.urls:
        results = scrape_urls(args.urls, mode=args.mode, extract=args.extract, timeout=args.timeout)
    else:
        parser.error("Provide --urls, --urls-file, or --sitemap")

    output = json.dumps(results, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Output written to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
