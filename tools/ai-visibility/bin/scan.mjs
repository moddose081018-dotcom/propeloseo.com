#!/usr/bin/env node
/**
 * Stage-one scan report.
 *
 * Reads captured DataForSEO llm_responses payloads from fixtures/ (or a
 * directory given as the first argument), parses each deterministically, and
 * prints the reportable rates.
 *
 *   node tools/ai-visibility/bin/scan.mjs [dir] [--json]
 *
 * Fetching is deliberately not part of this script. Responses are captured
 * once, stored, and parsed as many times as needed — so re-running a report
 * after a config change costs nothing and never re-queries a paid endpoint.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseResponse, rollup } from '../src/parse.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const args = process.argv.slice(2)
const asJson = args.includes('--json')
const dir = resolve(args.find((a) => !a.startsWith('--')) ?? join(root, 'fixtures'))

const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'))
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

if (!files.length) {
  console.error(`no response files in ${dir}`)
  process.exit(1)
}

const runs = files.map((f) => {
  const result = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  const parsed = parseResponse({ result, brand })
  return { file: f, promptId: result?._meta?.prompt_id ?? f.replace(/\.json$/, ''), ...parsed }
})

const summary = rollup(runs)

if (asJson) {
  console.log(JSON.stringify({ brand: brand.brandName, summary, runs }, null, 2))
  process.exit(0)
}

const pad = (s, n) => String(s).padEnd(n)
console.log(`\nAI visibility — stage one · ${brand.brandName} (${brand.ownDomain})\n`)
console.log(`  checks          ${summary.totalChecks}`)
console.log(`  mention rate    ${summary.mentionRate}%  (${summary.mentioned}/${summary.totalChecks})`)
console.log(`  citation rate   ${summary.citationRate}%  (${summary.cited}/${summary.totalChecks})`)
console.log(`  citations       ${summary.ownedCitations} owned of ${summary.totalCitations} total`)
console.log(`  spend           $${summary.costUsd.toFixed(4)}`)
if (summary.ungroundedRuns) {
  console.log(`\n  ! ${summary.ungroundedRuns} of ${summary.totalChecks} runs came back ungrounded (web_search returned false).`)
  console.log(`    Those answered from model memory with no citations. Citation rate over`)
  console.log(`    grounded runs only: ${summary.citationRateGrounded}%`)
}

console.log(`\n  Per check:`)
for (const r of runs) {
  const flags = [r.mentioned ? 'mentioned' : '—', r.citedInAnnotations ? 'cited' : '—',
                 r.webSearch ? '' : 'UNGROUNDED'].filter(Boolean).join(' / ')
  console.log(`    ${pad(r.promptId, 34)} ${pad(r.modelName ?? '?', 26)} ${flags}`)
}

if (summary.competitors.length) {
  console.log(`\n  Recommended instead of you:`)
  for (const c of summary.competitors) {
    console.log(`    ${pad(c.name, 24)} ${c.runs} check(s)   ${c.shareOfVoice}% share of voice`)
  }
}

if (summary.citedDomains.length) {
  // 145 domains is not a deliverable. Show the ones cited more than once —
  // a domain cited across several checks is a real pattern; a single hit is noise.
  const repeat = summary.citedDomains.filter((d) => d.runs > 1)
  const shown = repeat.length ? repeat : summary.citedDomains.slice(0, 20)
  console.log(`\n  Domains AI cited in more than one check (${shown.length} of ${summary.citedDomains.length} total):`)
  for (const d of shown) {
    console.log(`    ${pad(d.name, 40)} ${d.runs} check(s)`)
  }
  console.log(`\n    Full list: bin/scan.mjs --json`)
}
console.log()
