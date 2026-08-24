# Screaming Frog SEO Spider MCP Setup

Reference for connecting Screaming Frog SEO Spider to Claude Desktop (or LM Studio) via its built-in MCP server.

## Requirements

| Requirement | Detail |
|---|---|
| SEO Spider version | 24.0+ |
| Licence | Paid (will not work on free version) |
| Storage mode | Database (`File > Settings > Storage Mode`) |
| Node.js | Required for Streamable HTTP mode; optional but recommended for STDIO |
| Licence expiry | 31 Aug 2026 (username: `moddose`) |

## Architecture

Screaming Frog's MCP server runs **locally on the machine where the SEO Spider is installed**. It is not a cloud service. Two modes are available:

### STDIO Mode

- Claude Desktop launches the Spider headless (no visible UI).
- Communication via stdin/stdout streams.
- User must prompt the LLM to load a crawl explicitly.
- Install via the `.mcpb` extension file from Screaming Frog.

### Streamable HTTP Mode

- The SEO Spider runs in UI mode with crawl data visible.
- MCP Server activated via `MCP` top-level menu (status shows "MCP Server Active" in bottom-left).
- Exposes endpoint at `http://localhost:11435/mcp`.
- Actions triggered via MCP are visible in the UI.

## Client Configuration

### Streamable HTTP (recommended for interactive use)

**Prerequisites:**
1. Open SEO Spider with a valid paid licence.
2. Ensure Database storage mode is active (`File > Settings > Storage Mode`).
3. Enable Node.js runtime (`File > Settings > MCP Server` > accept Node.js RE).
4. Start the MCP server (`MCP` menu > `Start MCP Server`).
5. Install Node.js on the machine (required for the Streamable shim).

**Claude Desktop setup:**
1. Download the Streamable MCP extension: `spider-streamable-mcp.mcpb` from Screaming Frog's website.
2. In Claude Desktop: `Settings > Extensions > Advanced Settings > Install Extension`.
3. Select the downloaded `.mcpb` file and click Install.
4. Fully quit and reopen Claude Desktop (on Windows, close from the system tray, not just the window).

The `.mcpb` file assumes the default install path (`C:\Program Files (x86)\` on Windows, `/Applications/` on macOS). Edit the file if your install path differs.

**Equivalent manual config** (for `claude_desktop_config.json` or LM Studio's `mcp.json`):

```json
{
  "mcpServers": {
    "screaming-frog-mcp-server": {
      "url": "http://localhost:11435/mcp"
    }
  }
}
```

### STDIO (headless, no UI)

**Prerequisites:**
1. Enable Node.js runtime (`File > Settings > MCP Server` > accept Node.js RE).

**Claude Desktop setup:**
1. Download the STDIO MCP extension: `spider-stdio-mcp.mcpb` from Screaming Frog's website.
2. In Claude Desktop: `Settings > Extensions > Advanced Settings > Install Extension`.
3. Select the downloaded `.mcpb` file and click Install.
4. Fully quit and reopen Claude Desktop.

The `.mcpb` assumes the default install path. Edit if your install path differs.

## Verification

After setup, the extension should appear under `Settings > Developer` in Claude Desktop with a "running" status.

**Quick test prompt:**

> List my recent Screaming Frog crawls.

This calls `sf_list_crawls` and returns the 10 most recent crawls with IDs and status. No crawl is started.

## Available MCP Tools

### Crawl Management
| Tool | Purpose |
|---|---|
| `sf_crawl` | Start a crawl with optional config |
| `sf_pause_crawl` | Pause a running crawl |
| `sf_resume_crawl` | Resume a paused crawl |
| `sf_clear_crawl` | Clear a paused crawl |
| `sf_crawl_progress` | Get progress of a running crawl |
| `sf_list_crawls` | List recent crawl jobs (default: 10) |
| `sf_load_crawl` | Load a crawl by ID |
| `sf_export_crawl` | Export the loaded crawl |

### Data Export
| Tool | Purpose |
|---|---|
| `sf_generate_report` | Generate a report by category |
| `sf_generate_bulk_export` | Generate a bulk export by category |
| `sf_bulk_export_page_content` | Export page content (raw HTML or visible text) |
| `sf_export_seo_element_urls` | Export URLs for a specific SEO element and filter |
| `sf_export_embeddings` | Export URL embeddings as CSV |

### URL Inspection
| Tool | Purpose |
|---|---|
| `sf_url_info` | JSON report on a specific URL |
| `sf_url_content` | Get content of a crawled URL |
| `sf_url_links` | List inlinks/outlinks for a URL |
| `sf_get_url_screenshot` | Get stored screenshot of a crawled page |
| `sf_open_url_in_browser` | Open URL in external browser |

### Discovery
| Tool | Purpose |
|---|---|
| `sf_list_available_reports` | List all available reports |
| `sf_list_available_bulk_exports` | List all available bulk exports |
| `sf_list_available_filters_for_seo_element` | List filters for an SEO element |
| `sf_list_available_data_fields_for_seo_element_and_filter` | List data fields for an element + filter |

### Node.js & Filesystem
| Tool | Purpose |
|---|---|
| `sf_run_node_js_script` | Run a Node.js script |
| `sf_npm_install` | Install an npm package |
| `sf_read_text_file` | Read a text file |
| `sf_write_text_file` | Write a text file |
| `sf_list_allowed_base_directory` | Show the allowed base directory |
| `sf_list_directories` | List files/dirs in a path |
| `sf_create_directory` | Create a directory |

## SEO Elements for `sf_export_seo_element_urls`

`JavaScript`, `H1`, `H2`, `Internal`, `External`, `AMP`, `Canonicals`, `Content`, `Custom Extraction`, `Custom Search`, `Custom JavaScript`, `Directives`, `Analytics`, `Search Console`, `Hreflang`, `Images`, `Link Metrics`, `Meta Description`, `Meta Keywords`, `PageSpeed`, `Pagination`, `Response Codes`, `Security`, `Sitemaps`, `Structured Data`, `Page Titles`, `URL`, `Change Detection`, `Links`, `Validation`, `Mobile`, `AI`, `Accessibility`

## Limitations

- **Localhost only.** The MCP server binds to `127.0.0.1:11435`. It cannot be reached from Claude Code on the web or any remote session.
- **Single proxy not supported for MCP.** The proxy setting (`File > Settings > Proxy`) applies to crawl HTTP requests, not the MCP server endpoint.
- **Context window.** LLMs can exceed their context window with large exports. Use `file_path` parameters to save data to disk instead of returning it inline, or generate Node.js scripts to process data externally.
- **One crawl at a time.** The SEO Spider can only have one crawl loaded. `sf_load_crawl` replaces the current crawl.

## Example Prompts

```
Crawl www.propeloseo.com with Screaming Frog and summarise the top issues found.
```

```
Bulk Export the client error broken links, combine against the Internal tab
considering Search Console Clicks and Unique Inlinks to prioritise fixes.
```

```
Open up the last two crawls to www.propeloseo.com, compare the top issues,
and summarise the most important items that have changed.
```

```
Export all images over 100kb and generate an HTML page showing them in a grid
with links and descriptions. Open it in a browser.
```

## Integration with PropeloSEO Workflow

Screaming Frog complements the other MCP-connected data sources in the PropeloSEO stack:

| Source | Connected via | What it provides |
|---|---|---|
| **Screaming Frog** | Local MCP (Claude Desktop) | Technical crawl data, on-page issues, structured data, screenshots |
| **Ahrefs** | Cloud MCP (this session) | Backlinks, organic keywords, domain metrics |
| **DataForSEO** | Cloud MCP (this session) | SERP data, keyword volumes, on-page analysis |
| **SE Ranking** | Cloud MCP (this session) | Rank tracking, site audit, competitor analysis |

Screaming Frog crawl data can be exported and referenced alongside Ahrefs/DataForSEO/SE Ranking data pulled in Claude Code web sessions, but the Screaming Frog MCP itself only runs from a local Claude Desktop instance.
