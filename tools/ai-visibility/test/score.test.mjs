import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { scoreSummary, ROOT_CAUSES, ACCURACY_LEVELS, COVERAGE_LEVELS, SENTIMENT_LEVELS } from '../src/score.mjs'

describe('score module — unit tests (no API)', () => {
  it('exports five accuracy levels', () => {
    assert.equal(ACCURACY_LEVELS.length, 5)
  })

  it('exports five coverage levels', () => {
    assert.equal(COVERAGE_LEVELS.length, 5)
  })

  it('exports five sentiment levels', () => {
    assert.equal(SENTIMENT_LEVELS.length, 5)
  })

  it('exports seven root causes including NONE', () => {
    assert.equal(Object.keys(ROOT_CAUSES).length, 7)
    assert.ok('NONE' in ROOT_CAUSES)
    assert.ok('MISSING_CONTENT' in ROOT_CAUSES)
    assert.ok('EXTERNAL_CONSENSUS_GAP' in ROOT_CAUSES)
  })

  it('scoreSummary returns null for empty array', () => {
    assert.equal(scoreSummary([]), null)
  })

  it('scoreSummary computes averages correctly', () => {
    const runs = [
      { accuracy: 80, coverage: 60, sentiment: 40, alignmentScore: 62, isRecommended: true, rootCause: 'NONE' },
      { accuracy: 20, coverage: 40, sentiment: 60, alignmentScore: 38, isRecommended: false, rootCause: 'MISSING_CONTENT' },
    ]
    const s = scoreSummary(runs)
    assert.equal(s.avgAccuracy, 50)
    assert.equal(s.avgCoverage, 50)
    assert.equal(s.avgSentiment, 50)
    assert.equal(s.avgAlignment, 50)
    assert.equal(s.recommendedCount, 1)
    assert.equal(s.recommendedRate, 50)
    assert.deepEqual(s.rootCauseCounts, { NONE: 1, MISSING_CONTENT: 1 })
  })
})
