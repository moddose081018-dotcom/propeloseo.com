# propeloseo.com

Static HTML site for FishTankFilters / propeloseo.com.

## Web Scraping

This project includes a Scrapling-based web scraper in `scraper/`.

### Quick start
```bash
pip install -r scraper/requirements.txt
scrapling install  # downloads browser dependencies
```

### Usage
- Single page: `python3 scraper/scrape.py URL [--mode basic|stealth|dynamic] [--extract seo|text|links|html]`
- Bulk/sitemap: `python3 scraper/bulk_scrape.py --sitemap URL` or `--urls URL1 URL2` or `--urls-file file.txt`
- See `.claude/skills/scrape.md` for full usage details.
