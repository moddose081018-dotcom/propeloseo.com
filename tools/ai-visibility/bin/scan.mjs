#!/usr/bin/env node
/**
 * AI visibility scan report.
 *
 * Stage one: deterministic mention + citation detection (always runs).
 * Stage two: TypeSafe Jev scoring + gap classification (with --score).
 *
 *   node tools/ai-visibility/bin/scan.mjs [dir] [--json] [--score]
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseResponse, rollup } from '../src/parse.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const args = process.argv.slice(2)
const asJson = args.includes('--json')
const withScore = args.includes('--score')
const dir = resolve(args.find((a) => !a.startsWith('--')) ?? join(root, 'fixtures'))

const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'))
const prompts = JSON.parse(readFileSync(join(root, 'prompts.json'), 'utf8'))
const promptMap = Object.fromEntries(prompts.prompts.map((p) => [p.id, p]))
const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()

if (!files.length) {
  console.error(`no response files in ${dir}`)
  process.exit(1)
}

const runs = files.map((f) => {
  const result = JSON.parse(readFileSync(join(dir, f), 'utf8'))
  const promptId = result?._meta?.prompt_id ?? f.replace(/\.json$/, '')
  const prompt = promptMap[promptId]
  const parsed = parseResponse({ result, brand })
  return { file: f, promptId, promptText: prompt?.text ?? null, ...parsed }
})

const summary = rollup(runs)

if (withScore) {
  const { scoreAll, scoreSummary } = await import('../src/score.mjs')
  console.error('Scoring with TypeSafe Jev...')
  const scored = await scoreAll(runs, brand)
  const scoreSums = scoreSummary(scored)

  if (asJson) {
    console.log(JSON.stringify({ brand: brand.brandName, summary, scoreSummary: scoreSums, runs: scored }, null, 2))
    process.exit(0)
  }

  printStageOne(summary, runs)
  printStageTwo(scoreSums, scored)
  process.exit(0)
}

if (asJson) {
  console.log(JSON.stringify({ brand: brand.brandName, summary, runs }, null, 2))
  process.exit(0)
}

printStageOne(summary, runs)

function printStageOne(summary, runs) {
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
    const repeat = summary.citedDomains.filter((d) => d.runs > 1)
    const shown = repeat.length ? repeat : summary.citedDomains.slice(0, 20)
    console.log(`\n  Domains AI cited in more than one check (${shown.length} of ${summary.citedDomains.length} total):`)
    for (const d of shown) {
      console.log(`    ${pad(d.name, 40)} ${d.runs} check(s)`)
    }
    console.log(`\n    Full list: bin/scan.mjs --json`)
  }
  console.log()
}

function printStageTwo(scoreSums, scored) {
  const pad = (s, n) => String(s).padEnd(n)
  console.log(`AI visibility — stage two · TypeSafe Jev scores\n`)
  console.log(`  avg accuracy    ${scoreSums.avgAccuracy}/100`)
  console.log(`  avg coverage    ${scoreSums.avgCoverage}/100`)
  console.log(`  avg sentiment   ${scoreSums.avgSentiment}/100`)
  console.log(`  avg alignment   ${scoreSums.avgAlignment}/100  (acc×0.4 + cov×0.3 + sen×0.3)`)
  console.log(`  recommended     ${scoreSums.recommendedRate}%  (${scoreSums.recommendedCount}/${scoreSums.totalScored})`)

  console.log(`\n  Root causes:`)
  for (const [cause, count] of Object.entries(scoreSums.rootCauseCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${pad(cause, 28)} ${count}`)
  }

  console.log(`\n  Per check:`)
  for (const r of scored) {
    console.log(`    ${pad(r.promptId, 34)} ${pad(r.modelName ?? '?', 20)} acc=${pad(r.accuracy, 4)} cov=${pad(r.coverage, 4)} sen=${pad(r.sentiment, 4)} align=${pad(r.alignmentScore, 4)} ${r.isRecommended ? 'REC' : '---'}  ${r.rootCause}`)
  }
  console.log()
}
