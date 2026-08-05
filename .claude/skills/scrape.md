# Web Scraper Skill (Scrapling)

## Description
Scrape web pages and extract SEO data, text content, links, or raw HTML using the Scrapling library.

## Usage
When the user asks to scrape a URL, extract data from a website, analyze a competitor's page, check SEO elements, or crawl a sitemap, use the scraper scripts in the `scraper/` directory.

## Setup (first-time only)
```bash
pip install -r scraper/requirements.txt
scrapling install
```

## Single URL Scraping
```bash
# SEO analysis (title, meta, headings, links, schema markup)
python3 scraper/scrape.py "https://example.com" --extract seo

# Extract text content only
python3 scraper/scrape.py "https://example.com" --extract text

# Extract all links
python3 scraper/scrape.py "https://example.com" --extract links

# Extract specific CSS selector
python3 scraper/scrape.py "https://example.com" --selector "h1, h2, h3"

# Get raw HTML
python3 scraper/scrape.py "https://example.com" --extract html
```

## Fetch Modes
```bash
# Basic HTTP (fast, no JS) - default
python3 scraper/scrape.py "https://example.com" --mode basic

# Stealth (bypasses basic anti-bot)
python3 scraper/scrape.py "https://example.com" --mode stealth

# Dynamic (full browser, renders JS, handles Cloudflare)
python3 scraper/scrape.py "https://example.com" --mode dynamic

# Dynamic with wait for element to appear
python3 scraper/scrape.py "https://example.com" --mode dynamic --wait-selector ".content-loaded"
```

## Crawl an Entire Site
```bash
# Crawl a site starting from a URL, following all internal links
python3 scraper/crawl_site.py "https://example.com"

# Limit to 20 pages
python3 scraper/crawl_site.py "https://example.com" --max-pages 20

# Limit crawl depth (how many clicks from the start page)
python3 scraper/crawl_site.py "https://example.com" --max-depth 3

# Crawl with stealth mode and save results
python3 scraper/crawl_site.py "https://example.com" --mode stealth --output site_data.json

# Extract just text from every page
python3 scraper/crawl_site.py "https://example.com" --extract text --max-pages 100
```

## Bulk / Sitemap Scraping
```bash
# Scrape multiple URLs
python3 scraper/bulk_scrape.py --urls "https://example.com" "https://example.com/about"

# Scrape from a file (one URL per line)
python3 scraper/bulk_scrape.py --urls-file urls.txt --extract seo

# Crawl a sitemap
python3 scraper/bulk_scrape.py --sitemap "https://example.com/sitemap.xml" --extract seo

# Limit sitemap crawl
python3 scraper/bulk_scrape.py --sitemap "https://example.com/sitemap.xml" --limit 10
```

## Save Output
All commands accept `--output filename.json` to write results to a file instead of stdout.

## Tips
- Use `crawl_site.py` to scrape an entire site automatically (follows internal links)
- Use `bulk_scrape.py` when you already have specific URLs or a sitemap
- Use `scrape.py` for a single page
- Use `--mode basic` for most sites (fastest)
- Use `--mode stealth` if a site blocks basic requests
- Use `--mode dynamic` for JavaScript-heavy SPAs or sites with Cloudflare protection
- The SEO extract gives you title, meta description, headings, internal/external links, images without alt text, word count, Open Graph tags, and JSON-LD schema markup
