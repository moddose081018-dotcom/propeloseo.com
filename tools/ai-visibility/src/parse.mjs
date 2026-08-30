/**
 * Stage-one AI visibility parsing. Pure functions, no I/O, no LLM.
 *
 * Everything a client sees at this stage must be reproducible from the stored
 * response text by rerunning these functions. That is the point: mention rate
 * and citation rate are defensible line by line, not model opinion.
 */

/** Lowercased hostname with a leading `www.` removed, or null if unparseable. */
export function domainOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return null
  }
}

/** True when `domain` is the owned domain or a subdomain of it. */
export function isOwnedDomain(domain, ownDomain) {
  if (!domain || !ownDomain) return false
  const own = ownDomain.toLowerCase().replace(/^www\./, '')
  return domain === own || domain.endsWith(`.${own}`)
}

/**
 * Strip tracking params so the same cited page dedupes to one URL.
 * DataForSEO returns every OpenAI citation with `?utm_source=openai`.
 */
export function canonicalUrl(url) {
  try {
    const u = new URL(url)
    for (const k of [...u.searchParams.keys()]) {
      if (/^utm_/i.test(k) || k === 'ref' || k === 'source') u.searchParams.delete(k)
    }
    u.hash = ''
    return u.toString().replace(/\?$/, '')
  } catch {
    return url
  }
}

/** Case-insensitive substring match against brand name, domain and aliases. */
export function detectMention(text, tokens) {
  const lower = text.toLowerCase()
  const hits = []
  for (const t of tokens ?? []) {
    if (!t) continue
    const tok = String(t).toLowerCase().trim()
    if (!tok) continue
    if (lower.includes(tok)) hits.push(tok)
  }
  return { mentioned: hits.length > 0, matchedTokens: hits }
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Word-boundary match over a name list, longest first, returning names in
 * order of first appearance.
 *
 * Longest-first is not enough on its own: matching "AEO Collective" leaves the
 * substring "AEO" in place, so a shorter nested name matches the same text
 * twice and the answer looks like it named two competitors. Each match is
 * therefore masked out (same length, so indices stay stable) before shorter
 * names are tried. A shorter name occurring independently elsewhere still
 * matches, which is the behaviour we want.
 */
export function detectNames(text, names) {
  if (!names?.length) return []
  const sorted = [...names].sort((a, b) => b.length - a.length)
  let working = text
  const found = []
  for (const name of sorted) {
    const re = new RegExp(`\\b${escapeRe(name)}\\b`, 'gi')
    let m
    let first = null
    const spans = []
    while ((m = re.exec(working)) !== null) {
      if (first === null) first = m.index
      spans.push([m.index, m.index + m[0].length])
      if (m.index === re.lastIndex) re.lastIndex += 1
    }
    if (first === null) continue
    found.push({ name, index: first })
    for (const [start, end] of spans) {
      working = working.slice(0, start) + '\u0000'.repeat(end - start) + working.slice(end)
    }
  }
  return found.sort((a, b) => a.index - b.index).map((f) => f.name)
}

/** Pull the text sections out of a DataForSEO llm_responses result object. */
export function extractSections(result) {
  const out = []
  for (const item of result?.items ?? []) {
    for (const section of item?.sections ?? []) {
      if (section?.type !== 'text' || typeof section.text !== 'string') continue
      out.push({ text: section.text, annotations: section.annotations ?? [] })
    }
  }
  return out
}

/**
 * Parse one DataForSEO response into the stage-one record.
 *
 * `brand.ownDomain` drives the owned-citation test; `brand.mentionTokens`
 * drives mention detection; `brand.competitors` and `brand.products` are
 * word-boundary matched against the answer text.
 */
export function parseResponse({ result, brand }) {
  const sections = extractSections(result)
  const text = sections.map((s) => s.text).join('\n\n')

  const citations = []
  for (const s of sections) {
    for (const a of s.annotations) {
      if (!a?.url) continue
      const url = canonicalUrl(a.url)
      const domain = domainOf(url)
      citations.push({
        url,
        rawUrl: a.url,
        title: a.title ?? null,
        domain,
        isOwned: isOwnedDomain(domain, brand.ownDomain),
        startIndex: typeof a.start_index === 'number' ? a.start_index : null,
        endIndex: typeof a.end_index === 'number' ? a.end_index : null,
      })
    }
  }
  // Order of appearance in the answer, so position 1 is the first thing cited.
  citations.sort((a, b) => (a.startIndex ?? 0) - (b.startIndex ?? 0))
  citations.forEach((c, i) => {
    c.position = i + 1
  })

  const ownedCitations = citations.filter((c) => c.isOwned)
  const distinctDomains = [...new Set(citations.map((c) => c.domain).filter(Boolean))]
  const distinctUrls = [...new Set(citations.map((c) => c.url))]
  const { mentioned, matchedTokens } = detectMention(text, brand.mentionTokens)

  return {
    modelName: result?.model_name ?? null,
    checkDate: (result?.datetime ?? '').slice(0, 10) || null,
    webSearch: Boolean(result?.web_search),
    fanOutQueries: result?.fan_out_queries ?? [],

    mentioned,
    matchedTokens,

    citedInAnnotations: ownedCitations.length > 0,
    citationCount: ownedCitations.length,
    totalCitations: citations.length,
    distinctDomainCount: distinctDomains.length,
    distinctUrlCount: distinctUrls.length,
    citations,
    distinctDomains,

    competitorsMentioned: detectNames(text, brand.competitors),
    productsMentioned: detectNames(text, brand.products),

    inputTokens: result?.input_tokens ?? null,
    outputTokens: result?.output_tokens ?? null,
    costUsd: typeof result?.money_spent === 'number' ? result.money_spent : null,
    fullResponse: text,
  }
}

/** Roll a set of parsed runs up into the reportable rates. */
export function rollup(runs) {
  const total = runs.length
  const pct = (n) => (total ? Math.round((n / total) * 1000) / 10 : 0)
  const mentioned = runs.filter((r) => r.mentioned).length
  const cited = runs.filter((r) => r.citedInAnnotations).length

  const competitorCounts = new Map()
  for (const r of runs) {
    for (const c of r.competitorsMentioned) {
      competitorCounts.set(c, (competitorCounts.get(c) ?? 0) + 1)
    }
  }
  const domainCounts = new Map()
  for (const r of runs) {
    for (const d of r.distinctDomains) {
      domainCounts.set(d, (domainCounts.get(d) ?? 0) + 1)
    }
  }
  const rank = (m) =>
    [...m.entries()]
      .map(([name, runs]) => ({ name, runs, shareOfVoice: pct(runs) }))
      .sort((a, b) => b.runs - a.runs || a.name.localeCompare(b.name))

  return {
    totalChecks: total,
    mentioned,
    cited,
    mentionRate: pct(mentioned),
    citationRate: pct(cited),
    totalCitations: runs.reduce((s, r) => s + r.totalCitations, 0),
    ownedCitations: runs.reduce((s, r) => s + r.citationCount, 0),
    costUsd: Math.round(runs.reduce((s, r) => s + (r.costUsd ?? 0), 0) * 10000) / 10000,
    competitors: rank(competitorCounts),
    citedDomains: rank(domainCounts),
  }
}
