/**
 * Stage-one AI visibility parsing. Pure functions, no I/O, no LLM.
 *
 * Everything a client sees at this stage must be reproducible from the stored
 * response text by rerunning these functions. That is the point: mention rate
 * and citation rate are defensible line by line, not model opinion.
 */

/**
 * Hosts that wrap the real citation target in a redirect. Gemini returns every
 * grounding citation as a vertexaisearch redirect, so the URL host is useless
 * for attribution — the real domain appears only in the annotation `title`.
 */
const REDIRECT_HOSTS = new Set(['vertexaisearch.cloud.google.com'])

const BARE_DOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i

/** True when the URL only redirects to the real source. */
export function isRedirectUrl(url) {
  try {
    const u = new URL(url)
    return REDIRECT_HOSTS.has(u.hostname.toLowerCase()) || u.pathname.includes('/grounding-api-redirect/')
  } catch {
    return false
  }
}

/**
 * Resolve the domain a citation actually points at.
 *
 * For a redirect URL the hostname is the redirector, so fall back to the
 * annotation title when that title is itself a bare domain (which is what
 * Gemini supplies). Returns `{ domain, viaTitle }` so a report can disclose
 * which citations were resolved indirectly.
 */
export function resolveDomain(url, title) {
  if (isRedirectUrl(url)) {
    const t = (title ?? '').trim().toLowerCase().replace(/^www\./, '')
    if (BARE_DOMAIN_RE.test(t)) return { domain: t, viaTitle: true }
    return { domain: null, viaTitle: false }
  }
  return { domain: domainOf(url), viaTitle: false }
}

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

/**
 * Pull text out of a DataForSEO llm_responses result.
 *
 * Engines differ: ChatGPT and Gemini return one section holding the whole
 * answer, while Claude splits a single message into many contiguous fragments
 * with `annotations: null` on the unattributed ones. Fragments within an item
 * are therefore concatenated with no separator (they are one continuous
 * sentence) and separate items are joined with a blank line. Joining every
 * section with a separator would inject whitespace mid-sentence and can split
 * a brand name across the boundary.
 */
export function extractSections(result) {
  const items = []
  for (const item of result?.items ?? []) {
    const sections = []
    for (const section of item?.sections ?? []) {
      if (section?.type !== 'text' || typeof section.text !== 'string') continue
      sections.push({ text: section.text, annotations: section.annotations ?? [] })
    }
    if (sections.length) items.push(sections)
  }
  return items
}

/** Flat list of sections, for callers that do not care about item grouping. */
export function flattenSections(items) {
  return items.flat()
}

/** Reconstruct the answer text as the reader saw it. */
export function joinText(items) {
  return items.map((sections) => sections.map((s) => s.text).join('')).join('\n\n')
}

/**
 * Parse one DataForSEO response into the stage-one record.
 *
 * `brand.ownDomain` drives the owned-citation test; `brand.mentionTokens`
 * drives mention detection; `brand.competitors` and `brand.products` are
 * word-boundary matched against the answer text.
 */
export function parseResponse({ result, brand }) {
  const items = extractSections(result)
  const sections = flattenSections(items)
  const text = joinText(items)

  const citations = []
  let order = 0
  for (const s of sections) {
    for (const a of s.annotations) {
      if (!a?.url) continue
      const url = canonicalUrl(a.url)
      const { domain, viaTitle } = resolveDomain(a.url, a.title)
      citations.push({
        url,
        rawUrl: a.url,
        title: a.title ?? null,
        domain,
        domainViaTitle: viaTitle,
        isOwned: isOwnedDomain(domain, brand.ownDomain),
        startIndex: typeof a.start_index === 'number' ? a.start_index : null,
        // Encounter order, used when the engine supplies no character offsets.
        order: order++,
      })
    }
  }
  // Offsets when the engine gives them (ChatGPT, Gemini), encounter order
  // otherwise (Claude, Perplexity). Never mix the two within one response.
  const hasOffsets = citations.some((c) => c.startIndex !== null)
  citations.sort((a, b) =>
    hasOffsets ? (a.startIndex ?? 0) - (b.startIndex ?? 0) : a.order - b.order,
  )
  citations.forEach((c, i) => {
    c.position = i + 1
  })

  const ownedCitations = citations.filter((c) => c.isOwned)
  const resolvedDomains = citations.map((c) => c.domain).filter(Boolean)
  const distinctDomains = [...new Set(resolvedDomains)]
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
    unresolvedDomainCount: citations.length - resolvedDomains.length,
    citationsHaveOffsets: hasOffsets,
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
  // `web_search: true` is a REQUEST. The result reports what actually happened,
  // and an ungrounded run answers from model memory with no citations at all —
  // it measures something different and must not be pooled with grounded runs.
  const ungrounded = runs.filter((r) => !r.webSearch)

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
    ungroundedRuns: ungrounded.length,
    ungroundedIds: ungrounded.map((r) => r.promptId ?? r.modelName),
    citationRateGrounded: (() => {
      const g = runs.filter((r) => r.webSearch)
      return g.length ? Math.round((g.filter((r) => r.citedInAnnotations).length / g.length) * 1000) / 10 : null
    })(),
    totalCitations: runs.reduce((s, r) => s + r.totalCitations, 0),
    ownedCitations: runs.reduce((s, r) => s + r.citationCount, 0),
    costUsd: Math.round(runs.reduce((s, r) => s + (r.costUsd ?? 0), 0) * 10000) / 10000,
    competitors: rank(competitorCounts),
    citedDomains: rank(domainCounts),
  }
}
