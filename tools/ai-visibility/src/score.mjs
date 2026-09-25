/**
 * Stage-two AI visibility scoring — TypeSafe Jev judgments.
 *
 * Takes a parsed Stage 1 run + brand facts and returns accuracy, coverage,
 * sentiment scores plus gap classification. All questions are asked in a
 * single systemOne call so they run in parallel.
 */
import { TypeSafeClient, score, noul, choice } from '@typesafe-ai/sdk'

let _client
function client() {
  if (!_client) _client = new TypeSafeClient()
  return _client
}

const SCORE_LEVELS = 5

function buildState(run, brand) {
  return JSON.stringify({
    brandName: brand.brandName,
    brandDomain: brand.ownDomain,
    brandProducts: brand.products,
    brandFacts: brand.brandFacts ?? [],
    promptText: run.promptText ?? null,
    aiResponse: run.fullResponse,
    mentioned: run.mentioned,
    matchedTokens: run.matchedTokens,
    citedInAnnotations: run.citedInAnnotations,
    citationCount: run.citationCount,
    totalCitations: run.totalCitations,
    competitorsMentioned: run.competitorsMentioned,
    productsMentioned: run.productsMentioned,
    modelName: run.modelName,
  })
}

const ACCURACY_LEVELS = [
  'The AI response contains factual errors about `brandName`, attributes incorrect capabilities, or confuses it with another brand.',
  'The response mentions `brandName` but makes vague or unverifiable claims — nothing outright wrong, but nothing grounded in real attributes either.',
  'The response accurately describes one or two real attributes of `brandName` but omits or misstates others.',
  'The response is largely accurate about `brandName` — most stated facts align with `brandFacts` and `brandProducts`, with only minor imprecision.',
  'Every claim about `brandName` in the response is factually correct and attributable to real brand facts, products, or domain.',
]

const COVERAGE_LEVELS = [
  '`brandName` is not mentioned at all — none of `brandProducts` or `brandFacts` appear in the response.',
  '`brandName` is mentioned briefly or in a generic list with no detail about its products, pricing, or differentiators.',
  'The response covers one or two of `brandProducts` or differentiators but misses the majority of what the brand offers.',
  'The response covers several of `brandProducts` and differentiators — a reader would understand the core offering but miss nuances.',
  'The response thoroughly covers `brandProducts`, pricing, differentiators, and unique value — a reader would get a comprehensive picture.',
]

const SENTIMENT_LEVELS = [
  'The response frames `brandName` negatively — warns against it, highlights weaknesses, or positions competitors as clearly superior.',
  'The response is neutral-to-dismissive about `brandName` — listed without endorsement, or mentioned with hedging language.',
  'The response is neutral — `brandName` appears alongside competitors without any positioning advantage or disadvantage.',
  'The response positions `brandName` favourably — highlights strengths, uses positive language, or lists it among top recommendations.',
  'The response strongly recommends `brandName` — leads with it, uses superlative language, or positions it as the clear best choice for the query.',
]

const ROOT_CAUSES = {
  MISSING_CONTENT: 'The brand has no content that answers this query — the AI has nothing to draw from.',
  COMPETITOR_DOMINANCE: 'Competitors are named, cited, or positioned more strongly in the response.',
  ENTITY_GAP: 'The AI does not recognise the brand as a relevant entity in this category.',
  FACTUAL_ERROR: 'The response states something incorrect about the brand.',
  NEGATIVE_COVERAGE: 'Weak or negative sentiment suppresses recommendation of the brand.',
  EXTERNAL_CONSENSUS_GAP: 'Third-party citations favour competitors — the fix is off-site link building, not on-page content.',
  NONE: 'The brand is well-represented — no gap detected.',
}

/**
 * Score a single parsed run using TypeSafe Jev.
 *
 * Returns { accuracy, coverage, sentiment, alignmentScore, isRecommended,
 *           rootCause, confidence, usage }.
 */
export async function scoreRun(run, brand) {
  const state = buildState(run, brand)

  const { answers, usage } = await client().systemOne({
    state,
    questions: {
      accuracy: score(
        'How factually accurate is this AI response about `brandName`? Judge against `brandFacts` and `brandProducts`. If the brand is not mentioned, score the lowest level.',
        ACCURACY_LEVELS,
      ),
      coverage: score(
        'How thoroughly does this AI response cover `brandName` products, pricing, and differentiators from `brandProducts` and `brandFacts`?',
        COVERAGE_LEVELS,
      ),
      sentiment: score(
        'How favourably does this AI response position `brandName` relative to competitors mentioned? If the brand is absent, score the neutral-to-dismissive level.',
        SENTIMENT_LEVELS,
      ),
      isRecommended: noul(
        'Does this AI response explicitly recommend `brandName` as a choice the reader should consider, try, or use?',
      ),
      rootCause: choice(
        'If `brandName` is absent, under-represented, or poorly positioned in this response, what is the primary root cause? If the brand is well-represented, choose NONE.',
        ROOT_CAUSES,
      ),
    },
  })

  const acc100 = normalize(answers.accuracy.score, SCORE_LEVELS)
  const cov100 = normalize(answers.coverage.score, SCORE_LEVELS)
  const sen100 = normalize(answers.sentiment.score, SCORE_LEVELS)
  const alignmentScore = Math.round(acc100 * 0.4 + cov100 * 0.3 + sen100 * 0.3)

  return {
    accuracy: acc100,
    coverage: cov100,
    sentiment: sen100,
    alignmentScore,
    isRecommended: answers.isRecommended.noul > 0.5,
    isRecommendedProbability: round2(answers.isRecommended.noul),
    rootCause: answers.rootCause.choice,
    rootCauseConfidence: round2(answers.rootCause.confidence),
    rootCauseProbabilities: answers.rootCause.probabilities,
    accuracyConfidence: round2(answers.accuracy.confidence),
    coverageConfidence: round2(answers.coverage.confidence),
    sentimentConfidence: round2(answers.sentiment.confidence),
    usage,
  }
}

/**
 * Score all runs in a batch. Returns scored runs + aggregate stats.
 */
export async function scoreAll(runs, brand) {
  const results = []
  for (const run of runs) {
    const scored = await scoreRun(run, brand)
    results.push({ ...run, ...scored })
  }
  return results
}

export function scoreSummary(scoredRuns) {
  const n = scoredRuns.length
  if (!n) return null
  const avg = (key) => Math.round(scoredRuns.reduce((s, r) => s + r[key], 0) / n)
  const rootCauseCounts = {}
  for (const r of scoredRuns) {
    rootCauseCounts[r.rootCause] = (rootCauseCounts[r.rootCause] ?? 0) + 1
  }
  const recommended = scoredRuns.filter((r) => r.isRecommended).length
  return {
    avgAccuracy: avg('accuracy'),
    avgCoverage: avg('coverage'),
    avgSentiment: avg('sentiment'),
    avgAlignment: avg('alignmentScore'),
    recommendedCount: recommended,
    recommendedRate: Math.round((recommended / n) * 1000) / 10,
    rootCauseCounts,
    totalScored: n,
  }
}

function normalize(raw, levels) {
  return clamp(Math.round((raw / (levels - 1)) * 100))
}

function clamp(v) {
  return Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0))
}

function round2(v) {
  return Math.round(v * 100) / 100
}

export { ROOT_CAUSES, ACCURACY_LEVELS, COVERAGE_LEVELS, SENTIMENT_LEVELS }
