# Screaming Frog SEO Spider MCP Setup

Reference for connecting Screaming Frog SEO Spider to Claude Desktop (or LM Studio) via its built-in MCP server.

## Which Claude Surface Can Use It

**Read this first — it is the most common source of confusion.** Claude Desktop and Claude Code on the web are separate clients with separate MCP configuration. An extension installed in one is invisible to the other, so "we've had Screaming Frog connected for months" and "Screaming Frog isn't connected in this session" can both be true at the same time.

| Surface | Where its MCP config lives | Screaming Frog |
|---|---|---|
| **Claude Desktop** (local app) | Installed `.mcpb` extension / `claude_desktop_config.json` | Available — this is the setup documented below |
| **LM Studio** (local app) | `mcp.json` | Available |
| **Claude Code CLI**, run on the Frog machine | `.mcp.json` / `claude mcp add` | Should work (same localhost), though not vendor-documented |
| **Claude Code on the web** / any cloud session | claude.ai account connectors | Never available |

The rule is **same machine or nothing**. The MCP server binds to `127.0.0.1:11435`, so any MCP client running on the same machine as the SEO Spider can reach it. Cloud sessions run in ephemeral containers with no network route to your localhost — `curl http://127.0.0.1:11435/mcp` from one returns connection refused.

Screaming Frog publishes no hosted or remote MCP server, so it will never appear in the claude.ai connector list alongside Ahrefs, DataForSEO, or SE Ranking. Its absence there is expected, not a broken connection.

### Do not tunnel it

Exposing the endpoint publicly (ngrok, Cloudflare Tunnel, router port-forward) so a cloud session can reach it is not a supported workaround and is actively unsafe. The tool surface includes `sf_run_node_js_script`, `sf_npm_install`, and `sf_write_text_file` — arbitrary code execution and filesystem writes on the host. Bound to localhost that is fine. Published to the internet with no authentication in front of it, it is a remote code execution endpoint on your workstation.

### Getting Frog data into a cloud session

1. Run the crawl in Claude Desktop (or the SEO Spider UI) on the local machine.
2. Export the tabs and reports you need as CSV.
3. Commit them to this repo, or upload to Google Drive — that connector *is* available in cloud sessions.
4. The cloud session can then read and analyse the exports directly.

For audit work that does not specifically need Frog, the Ahrefs and SE Ranking site audit tools are available in cloud sessions and cover status codes, canonicals, indexability, and titles/meta. What they do not replace is Frog's custom extraction, JavaScript rendering configuration, and crawl-to-crawl comparison.

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
4. Start the MCP server (`MCP` menu > `Start MCP Server`). Tick **Auto-start MCP Server on application launch** in `File > Settings > MCP Server` so it comes up with the app from then on.
5. Install Node.js on the machine (required for the Streamable shim).

**Claude Desktop setup:**
1. Download the Streamable MCP extension: <https://download.screamingfrog.co.uk/products/seo-spider/spider-streamable-mcp.mcpb>
2. In Claude Desktop: `Settings > Extensions > Advanced Settings > Install Extension`.
3. Select the downloaded `.mcpb` file and click Install.
4. Fully quit and reopen Claude Desktop (on Windows, close from the system tray, not just the window).

The `.mcpb` file assumes the default install path (`C:\Program Files (x86)\` on Windows, `/Applications/` on macOS). Edit the file if your install path differs.

**LM Studio config** (`mcp.json` — `Developer > Local Server > mcp.json`):

```json
{
  "mcpServers": {
    "screaming-frog-mcp-server": {
      "url": "http://localhost:11435/mcp"
    }
  }
}
```

> **This is for LM Studio only. Do not put it in `claude_desktop_config.json`.**
>
> Screaming Frog documents the bare `url` form solely under its LM Studio instructions. Claude Desktop installs MCP servers through the `.mcpb` extension mechanism above, and silently ignores a `url` entry in `claude_desktop_config.json` — the server simply never appears under `Settings > Developer`, with no error to explain why. Substituting an `npx mcp-remote` shim in that file does not work either. Use the extension.

### STDIO (headless, no UI)

**Prerequisites:**
1. Enable Node.js runtime (`File > Settings > MCP Server` > accept Node.js RE).

**Claude Desktop setup:**
1. Download the STDIO MCP extension: <https://download.screamingfrog.co.uk/products/seo-spider/spider-stdio-mcp.mcpb>
2. In Claude Desktop: `Settings > Extensions > Advanced Settings > Install Extension`.
3. Select the downloaded `.mcpb` file and click Install.
4. Fully quit and reopen Claude Desktop.

The `.mcpb` assumes the default install path. Edit if your install path differs.

## Verification

After setup, the extension should appear under `Settings > Developer` in Claude Desktop with a "running" status.

**Quick test prompt:**

> List my recent Screaming Frog crawls.

This calls `sf_list_crawls` and returns the 10 most recent crawls with IDs and status. No crawl is started.

## Keeping the Connection Working

Screaming Frog is core to the audit process, so treat the connection as something to verify, not assume. The MCP server can start itself — tick **Auto-start MCP Server on application launch** in `File > Settings > MCP Server`, which is the single best setting for keeping the connection up. Nothing else here self-heals.

### Licence renewal — the biggest single risk

**Current licence expires 31 Aug 2026 (username: `moddose`).**

MCP is a paid-only feature. The day the licence lapses, every `sf_*` tool stops working — no warning inside Claude, just failures. Renew at least a week before expiry and update the date in the Requirements table above whenever it changes.

### Preflight checklist

Run this before any client audit that depends on Frog. Takes about thirty seconds.

1. SEO Spider is open (required for Streamable HTTP mode).
2. Bottom-left of the Spider reads **MCP Server Active**.
3. `File > Settings > Storage Mode` is set to **Database**.
4. Licence is current (`Licence > Enter Licence Key` shows a future expiry date).
5. Claude Desktop `Settings > Developer` lists the extension as **running**.
6. Ask: *"List my recent Screaming Frog crawls."* A list comes back, nothing is crawled.

If step 6 works, the connection is good. If it fails, the table below covers every failure mode seen so far.

### Failure modes

| Symptom | Likely cause | Fix |
|---|---|---|
| All `sf_*` tools fail after working fine | Licence expired | Renew, then restart the Spider |
| Tools missing from Claude Desktop entirely | Extension disabled or removed by an app update | Re-install the `.mcpb`, fully quit and reopen Claude Desktop |
| Server never appears under `Settings > Developer`, no error shown | Configured by hand in `claude_desktop_config.json` instead of installing the `.mcpb`. Claude Desktop ignores both a `url` entry and an `npx mcp-remote` shim there, silently | Remove the entry from the config file and install the `.mcpb` extension instead |
| "MCP Server Active" absent from the Spider | Server not running, and **Auto-start MCP Server on application launch** is unticked in `File > Settings > MCP Server` | Tick auto-start so it comes up with the app; start it now via the `MCP` menu > Start MCP Server |
| Connection refused on port 11435 | Spider closed, or another process holds the port | Reopen the Spider; check for a port conflict |
| MCP options greyed out in settings | Storage mode reverted to RAM | Switch to Database storage, restart the Spider |
| Extension installs but never starts | Node.js runtime not accepted, or Node.js missing | `File > Settings > MCP Server` > accept the Node.js RE; install Node.js |
| Worked before a Frog upgrade, broken after | Install path changed, so the `.mcpb` points at nothing | Edit the `.mcpb` to the new install path, or re-download it |
| Tools present but every call errors in a cloud session | Wrong surface — see [Which Claude Surface Can Use It](#which-claude-surface-can-use-it) | Use Claude Desktop on the Frog machine |

### After any upgrade

Re-run the preflight checklist after upgrading either the SEO Spider or Claude Desktop. Both have broken the connection before: Spider upgrades can move the install path the `.mcpb` references, and Claude Desktop updates can disable extensions. Neither reports the failure until a tool call fails mid-audit.

### Do not let it become a silent dependency

Even with auto-start enabled, the SEO Spider itself must be open for the MCP server to be reachable, so a Frog-dependent audit can still fail at the worst moment. For recurring client work, either run the preflight checklist first, or export the crawl to CSV up front so the analysis no longer depends on a live connection.

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
