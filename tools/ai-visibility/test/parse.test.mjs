import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  canonicalUrl, detectMention, detectNames, domainOf,
  isOwnedDomain, parseResponse, rollup,
} from '../src/parse.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const brand = JSON.parse(readFileSync(join(root, 'brand.json'), 'utf8'))
const fixture = JSON.parse(
  readFileSync(join(root, 'fixtures/chat_gpt--best-affordable-ai-seo-services.json'), 'utf8'),
)

test('domainOf strips www and lowercases', () => {
  assert.equal(domainOf('https://WWW.Example.com/x?y=1'), 'example.com')
  assert.equal(domainOf('not a url'), null)
})

test('isOwnedDomain matches the domain and its subdomains, not lookalikes', () => {
  assert.equal(isOwnedDomain('propeloseo.com', 'propeloseo.com'), true)
  assert.equal(isOwnedDomain('blog.propeloseo.com', 'propeloseo.com'), true)
  assert.equal(isOwnedDomain('notpropeloseo.com', 'propeloseo.com'), false)
  assert.equal(isOwnedDomain('propeloseo.com.evil.net', 'propeloseo.com'), false)
  assert.equal(isOwnedDomain(null, 'propeloseo.com'), false)
})

test('canonicalUrl drops utm params so one page dedupes to one URL', () => {
  assert.equal(
    canonicalUrl('https://posirank.com/blog/x?utm_source=openai'),
    'https://posirank.com/blog/x',
  )
})

test('detectMention is case-insensitive and reports which token hit', () => {
  const r = detectMention('We rate PropeloSEO highly.', brand.mentionTokens)
  assert.equal(r.mentioned, true)
  assert.deepEqual(r.matchedTokens, ['propeloseo'])
  assert.equal(detectMention('nothing here', brand.mentionTokens).mentioned, false)
})

test('detectNames prefers the longest name and returns appearance order', () => {
  const names = ['AEO', 'AEO Collective']
  assert.deepEqual(detectNames('AEO Collective is good', names), ['AEO Collective'])
  assert.deepEqual(detectNames('Arvow beats Posirank', ['Posirank', 'Arvow']), ['Arvow', 'Posirank'])
})

test('detectNames does not match inside a longer word', () => {
  assert.deepEqual(detectNames('Semrushing is not a word', ['Semrush']), [])
})

test('parses the real DataForSEO payload', () => {
  const r = parseResponse({ result: fixture, brand })

  // Ten annotations, but posirank.com is cited twice -> 9 distinct URLs.
  assert.equal(r.totalCitations, 10)
  assert.equal(r.distinctUrlCount, 9)

  // PropeloSEO is absent from this answer. That is the honest baseline.
  assert.equal(r.mentioned, false)
  assert.equal(r.citedInAnnotations, false)
  assert.equal(r.citationCount, 0)

  // Competitors the answer recommends instead.
  assert.deepEqual(r.competitorsMentioned, ['Posirank', 'AEO Collective', 'Arvow', 'AIO Copilot', 'ZeroRank'])

  // Citations carry position, ordered by where they appear in the answer.
  assert.equal(r.citations[0].position, 1)
  assert.equal(r.citations[0].domain, 'cashrank.net')
  assert.ok(r.citations.every((c, i) => c.position === i + 1))

  assert.equal(r.costUsd, 0.0266497)
  assert.equal(r.checkDate, '2026-08-30')
})

test('rollup computes rates and share of voice', () => {
  const parsed = parseResponse({ result: fixture, brand })
  const s = rollup([parsed])
  assert.equal(s.totalChecks, 1)
  assert.equal(s.mentionRate, 0)
  assert.equal(s.citationRate, 0)
  assert.equal(s.competitors[0].shareOfVoice, 100)
  assert.equal(s.totalCitations, 10)
})

test('an owned citation is counted and flips the cited flag', () => {
  const withOwn = structuredClone(fixture)
  withOwn.items[0].sections[0].annotations.push({
    title: 'PropeloSEO', url: 'https://propeloseo.com/?utm_source=openai',
    start_index: 3100, end_index: 3120,
  })
  withOwn.items[0].sections[0].text += ' PropeloSEO is another option.'
  const r = parseResponse({ result: withOwn, brand })
  assert.equal(r.mentioned, true)
  assert.equal(r.citedInAnnotations, true)
  assert.equal(r.citationCount, 1)
  assert.equal(r.totalCitations, 11)
})
