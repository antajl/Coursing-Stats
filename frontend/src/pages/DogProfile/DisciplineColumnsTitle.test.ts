import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { extractCompetitionKind } from '../../../../backend/parsers/calendar/scrape-year-page'

describe('Discipline columns competition title fallback invariant', () => {
  it('guarantees CoursingColumn falls back to event.title when competition_kind is missing', () => {
    const coursingPath = path.resolve(__dirname, 'CoursingColumn.tsx')
    const source = fs.readFileSync(coursingPath, 'utf-8')

    // Invariant: DogEvent has title property
    expect(source).toContain('title?: string | null')
    // Invariant: Headline computation falls back to event.title
    expect(source).toContain('event.competition_kind || event.title')
  })

  it('guarantees RacingColumn falls back to event.title when competition_kind is missing', () => {
    const racingPath = path.resolve(__dirname, 'RacingColumn.tsx')
    const source = fs.readFileSync(racingPath, 'utf-8')

    // Invariant: DogEvent has title property
    expect(source).toContain('title?: string | null')
    // Invariant: Headline computation falls back to event.title
    expect(source).toContain('event.competition_kind || event.title')
  })

  it('extracts competition kind from full titles and textual variations', () => {
    expect(extractCompetitionKind('Чемпионат РКФ (Суханово)\n(Курсинг борзых)')).toBe('ЧРКФ')
    expect(extractCompetitionKind('Монопородный чемпионат РКФ (Михайловское)')).toBe('ПЧРКФ')
    expect(extractCompetitionKind('Чемпионаты РКФ Br по курсингу')).toBe('ЧРКФ')
    expect(extractCompetitionKind('ЧР - CACL по курсингу')).toBe('Чемпионат России')
    expect(extractCompetitionKind('КР по курсингу')).toBe('Кубок России')
    expect(extractCompetitionKind('Состязания CACL (Ставрополь)')).toBe('CACL')
  })

  it('verifies dog 7261 has valid competition kinds across all history', () => {
    const packPath = path.resolve(process.cwd(), 'data/v1/indexes/dog-profiles/pack-093.json')
    if (fs.existsSync(packPath)) {
      const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'))
      const dog = pack.byId?.['7261']
      expect(dog).toBeDefined()
      expect(Array.isArray(dog.competitions)).toBe(true)

      for (const comp of dog.competitions) {
        const headline = (comp.competition_kind || comp.title || '').trim()
        expect(headline.length).toBeGreaterThan(0)
      }
    }
  })
})
