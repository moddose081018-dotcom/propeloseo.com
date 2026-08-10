#!/usr/bin/env python3
"""Web scraper powered by Scrapling. Supports basic HTTP, stealth, and dynamic (browser) modes."""

import argparse
import json
import sys

def fetch_page(url, mode="basic", wait_selector=None, timeout=30):
    """Fetch a page using the specified mode.

    Modes:
        basic    - Fast HTTP fetch via curl_cffi (no JS rendering)
        stealth  - Stealth browser fetch (bypasses basic anti-bot)
        dynamic  - Full browser with JS rendering (handles SPAs, Cloudflare)
    """
    if mode == "basic":
        from scrapling import Fetcher
        return Fetcher.get(url, timeout=timeout)
    elif mode == "stealth":
        from scrapling import StealthyFetcher
        return StealthyFetcher.fetch(url, timeout=timeout * 1000)
    elif mode == "dynamic":
        from scrapling import DynamicFetcher
        kwargs = {"timeout": timeout * 1000}
        if wait_selector:
            kwargs["wait_selector"] = wait_selector
        return DynamicFetcher.fetch(url, **kwargs)
    else:
        raise ValueError(f"Unknown mode: {mode}")


def extract_seo_data(page):
    """Extract common SEO-relevant data from a page."""
    data = {
        "url": str(getattr(page, "url", "")),
        "status": getattr(page, "status", None),
        "title": "",
        "meta_description": "",
        "meta_keywords": "",
        "canonical": "",
        "h1": [],
        "h2": [],
        "h3": [],
        "links": {"internal": [], "external": []},
        "images_without_alt": [],
        "word_count": 0,
        "og_tags": {},
        "schema_markup": [],
    }

    title = page.css("title").first
    if title:
        data["title"] = title.text.strip()

    for meta in page.css("meta"):
        name = (meta.attrib.get("name") or "").lower()
        prop = (meta.attrib.get("property") or "").lower()
        content = meta.attrib.get("content", "")
        if name == "description":
            data["meta_description"] = content
        elif name == "keywords":
            data["meta_keywords"] = content
        elif prop.startswith("og:"):
            data["og_tags"][prop] = content

    canonical = page.css('link[rel="canonical"]').first
    if canonical:
        data["canonical"] = canonical.attrib.get("href", "")

    for tag in ["h1", "h2", "h3"]:
        data[tag] = [el.text.strip() for el in page.css(tag) if el.text.strip()]

    for a in page.css("a[href]"):
        href = a.attrib.get("href", "")
        if href.startswith(("http://", "https://")):
            if any(domain in href for domain in [data["url"]]):
                data["links"]["internal"].append(href)
            else:
                data["links"]["external"].append(href)
        elif href.startswith("/"):
            data["links"]["internal"].append(href)

    for img in page.css("img"):
        alt = img.attrib.get("alt", "").strip()
        if not alt:
            data["images_without_alt"].append(img.attrib.get("src", ""))

    body = page.css("body").first
    if body:
        data["word_count"] = len(body.text.split())

    for script in page.css('script[type="application/ld+json"]'):
        try:
            data["schema_markup"].append(json.loads(script.text))
        except (json.JSONDecodeError, ValueError):
            pass

    return data


def extract_text(page):
    """Extract the main text content from a page."""
    for tag in page.css("script, style, nav, footer, header"):
        tag.remove()
    body = page.css("body").first
    if body:
        return body.text.strip()
    return ""


def extract_links(page):
    """Extract all links with their text and href."""
    links = []
    for a in page.css("a[href]"):
        href = a.attrib.get("href", "")
        text = a.text.strip()
        if href:
            links.append({"text": text, "href": href})
    return links


def main():
    parser = argparse.ArgumentParser(description="Scrapling web scraper")
    parser.add_argument("url", help="URL to scrape")
    parser.add_argument(
        "--mode",
        choices=["basic", "stealth", "dynamic"],
        default="basic",
        help="Fetch mode (default: basic)",
    )
    parser.add_argument(
        "--extract",
        choices=["seo", "text", "links", "html"],
        default="seo",
        help="What to extract (default: seo)",
    )
    parser.add_argument("--selector", help="CSS selector to extract specific elements")
    parser.add_argument(
        "--wait-selector",
        help="CSS selector to wait for before extracting (dynamic mode)",
    )
    parser.add_argument(
        "--timeout", type=int, default=30, help="Timeout in seconds (default: 30)"
    )
    parser.add_argument(
        "--output", "-o", help="Output file path (default: stdout)"
    )

    args = parser.parse_args()

    try:
        page = fetch_page(
            args.url, mode=args.mode, wait_selector=args.wait_selector, timeout=args.timeout
        )
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

    if args.selector:
        elements = page.css(args.selector)
        result = [{"text": el.text.strip(), "html": str(el)} for el in elements]
    elif args.extract == "seo":
        result = extract_seo_data(page)
    elif args.extract == "text":
        result = {"text": extract_text(page)}
    elif args.extract == "links":
        result = extract_links(page)
    elif args.extract == "html":
        result = {"html": page.html_content}
    else:
        result = extract_seo_data(page)

    output = json.dumps(result, indent=2, ensure_ascii=False)
    if args.output:
        with open(args.output, "w") as f:
            f.write(output)
        print(f"Output written to {args.output}")
    else:
        print(output)


if __name__ == "__main__":
    main()
