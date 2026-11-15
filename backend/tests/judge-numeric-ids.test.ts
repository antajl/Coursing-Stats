import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  SHOW_JUDGE_LEGACY_TO_NUMERIC,
  SHOW_JUDGE_NUMERIC_TO_LEGACY,
  SPORT_JUDGE_LEGACY_TO_NUMERIC,
  SPORT_JUDGE_NUMERIC_TO_LEGACY,
  resolveShowJudgeNumericId,
  resolveShowJudgeLegacyId,
  resolveSportJudgeNumericId,
  resolveSportJudgeLegacyId,
} from '../../frontend/src/lib/judgeIdMap.generated'
import { buildRedirectHtml } from '../scripts/seo/prerender-html.js'

const ROOT = path.resolve(__dirname, '../..')

describe('Judge Numeric IDs and SEO Redirects', () => {
  it('assigns unique numeric IDs to all show judges with 2000-2099 safely skipped', () => {
    const showJudges = Object.keys(SHOW_JUDGE_LEGACY_TO_NUMERIC)
    expect(showJudges.length).toBeGreaterThan(2500)

    const usedIds = new Set<number>()
    for (const [legacyKey, numId] of Object.entries(SHOW_JUDGE_LEGACY_TO_NUMERIC)) {
      expect(numId).toBeGreaterThanOrEqual(1001)
      expect(numId < 2000 || numId > 2099).toBe(true)
      expect(usedIds.has(numId)).toBe(false)
      usedIds.add(numId)

      // Bijective mapping
      expect(SHOW_JUDGE_NUMERIC_TO_LEGACY[numId]).toBe(legacyKey)
    }
  })

  it('assigns unique numeric IDs to all sport judges', () => {
    const sportJudges = Object.keys(SPORT_JUDGE_LEGACY_TO_NUMERIC)
    expect(sportJudges.length).toBeGreaterThanOrEqual(32)

    const usedIds = new Set<number>()
    for (const [legacyKey, numId] of Object.entries(SPORT_JUDGE_LEGACY_TO_NUMERIC)) {
      expect(numId).toBeGreaterThanOrEqual(1)
      expect(usedIds.has(numId)).toBe(false)
      usedIds.add(numId)

      expect(SPORT_JUDGE_NUMERIC_TO_LEGACY[numId]).toBe(legacyKey)
    }
  })

  it('resolves show judge IDs from legacy string, percent-encoded string, and numeric id', () => {
    const legacyKey = 'гаврилова|я|а'
    const expectedNum = SHOW_JUDGE_LEGACY_TO_NUMERIC[legacyKey]
    expect(expectedNum).toBeDefined()

    expect(resolveShowJudgeNumericId(legacyKey)).toBe(expectedNum)
    expect(resolveShowJudgeNumericId(encodeURIComponent(legacyKey))).toBe(expectedNum)
    expect(resolveShowJudgeNumericId(String(expectedNum))).toBe(expectedNum)
    expect(resolveShowJudgeNumericId(expectedNum)).toBe(expectedNum)

    expect(resolveShowJudgeLegacyId(expectedNum)).toBe(legacyKey)
    expect(resolveShowJudgeLegacyId(String(expectedNum))).toBe(legacyKey)
    expect(resolveShowJudgeLegacyId(legacyKey)).toBe(legacyKey)
  })

  it('resolves sport judge IDs from legacy string and numeric id', () => {
    const legacyKey = 'Вронская О.В.'
    const expectedNum = SPORT_JUDGE_LEGACY_TO_NUMERIC[legacyKey]
    expect(expectedNum).toBe(1)

    expect(resolveSportJudgeNumericId(legacyKey)).toBe(expectedNum)
    expect(resolveSportJudgeNumericId(encodeURIComponent(legacyKey))).toBe(expectedNum)
    expect(resolveSportJudgeNumericId('1')).toBe(expectedNum)
    expect(resolveSportJudgeNumericId(1)).toBe(expectedNum)

    expect(resolveSportJudgeLegacyId(1)).toBe(legacyKey)
    expect(resolveSportJudgeLegacyId('1')).toBe(legacyKey)
    expect(resolveSportJudgeLegacyId(legacyKey)).toBe(legacyKey)
  })

  it('generates valid static redirect HTML with canonical and meta refresh', () => {
    const redirectHtml = buildRedirectHtml('https://coursing-stats.ru/shows/judges/1001/', 'Гаврилова Я.А.')
    expect(redirectHtml).toContain('<meta http-equiv="refresh" content="0; url=https://coursing-stats.ru/shows/judges/1001/" />')
    expect(redirectHtml).toContain('<link rel="canonical" href="https://coursing-stats.ru/shows/judges/1001/" />')
    expect(redirectHtml).toContain("window.location.replace('https://coursing-stats.ru/shows/judges/1001/');")
    expect(redirectHtml).toContain('Гаврилова Я.А.')
  })

  it('ensures sitemap-judges.xml contains purely clean numeric URLs without percent encodings or pipes', () => {
    const sitemapPath = path.join(ROOT, 'frontend/public/sitemap-judges.xml')
    expect(fs.existsSync(sitemapPath)).toBe(true)

    const content = fs.readFileSync(sitemapPath, 'utf8')
    const locMatches = [...content.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locMatches.length).toBeGreaterThan(2500)

    for (const loc of locMatches) {
      if (loc.includes('/shows/judges/')) {
        const parts = loc.split('/shows/judges/')[1].replace(/\/$/, '')
        expect(parts).toMatch(/^\d+$/)
      } else if (loc.includes('/judges/')) {
        const parts = loc.split('/judges/')[1].replace(/\/$/, '')
        expect(parts).toMatch(/^\d+$/)
      }
    }
  })
})
