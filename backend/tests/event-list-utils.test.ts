import { describe, expect, it } from 'vitest'
import {
  formatRowDateParts,
  getEventHeadline,
  getEventSubtitle,
  getEventDiscipline,
  eventMatchesDiscipline,
  normalizeDisciplineLabel,
  parseRankLabelStructure,
  parseJudgeNames,
  formatCompetitionJudgesWithRoles,
} from '../../frontend/src/pages/Events/eventListUtils'

describe('calendar display utils', () => {
  it('abbreviates BZMP', () => {
    expect(normalizeDisciplineLabel('Бега за механической приманкой')).toBe('БЗМП')
  })

  it('parses collapsed rank_label with glued breeds', () => {
    expect(parseRankLabelStructure('ПЧРКФ(Курсинг борзых)УиппетСалюки')).toEqual({
      kind: 'ПЧРКФ',
      disciplines: ['Курсинг борзых'],
    })
  })

  it('unifies headline to kind · BZMP', () => {
    expect(
      getEventHeadline({
        id: 1,
        date_start: '2025-04-05',
        rank_label: 'ЧРКФ\n(Бега за механической приманкой)',
      })
    ).toBe('ЧРКФ · БЗМП')
  })

  it('unifies collapsed parentheses form', () => {
    expect(
      getEventHeadline({
        id: 1,
        date_start: '2026-04-19',
        rank_label: 'ЧРКФ(Курсинг борзых)',
      })
    ).toBe('ЧРКФ · Курсинг борзых')
  })

  it('hides breeds in calendar subtitle', () => {
    expect(
      getEventSubtitle({
        id: 1,
        date_start: '2026-06-27',
        rank_label: 'ПЧРКФ\n(Курсинг борзых)\nУиппет',
      })
    ).toBeNull()
  })

  it('stacked date layout for range', () => {
    const parts = formatRowDateParts('2026-04-26', '2026-04-27')
    expect(parts?.dayLine).toBe('26–27')
    expect(parts?.metaLine).toMatch(/–/)
    expect(parts?.month).toBe('апр')
  })

  it('short month labels are consistent (no mixed long/short)', () => {
    expect(formatRowDateParts('2026-07-18', '2026-07-19')?.month).toBe('июл')
    expect(formatRowDateParts('2026-08-01', '2026-08-02')?.month).toBe('авг')
  })

  it('handles judges as array without throwing', () => {
    expect(parseJudgeNames(['Орлова М.О.', 'Крылова Е.В.'])).toEqual(['Орлова М.О.', 'Крылова Е.В.'])
    expect(formatCompetitionJudgesWithRoles(['Орлова М.О.', 'Крылова Е.В.'])).toBe('Главный судья: Орлова М.О., судья: Крылова Е.В.')
  })


  it('matches discipline correctly including other events that are racing', () => {
    const clubDoninoRacing = {
      id: 2026004,
      date_start: '2026-08-09',
      rank_label: 'I Клубный чемпионат Донино\n(Бега борзых)',
      event_type: 'other',
      competition_kind: 'Клубный чемпионат',
      competition_type: 'Бега борзых',
      title: 'I Клубный чемпионат Донино по бегам борзых',
    }

    const officialRacing = {
      id: 1316,
      date_start: '2026-05-16',
      event_type: 'racing',
      competition_kind: 'ЧРКФ',
      title: 'Чемпионат РКФ',
    }

    const officialCoursing = {
      id: 2026002,
      date_start: '2026-08-22',
      event_type: 'coursing',
      competition_kind: 'Кубок России',
      title: 'Кубок России по курсингу борзых',
    }

    // Racing filter includes both official racing and club racing
    expect(eventMatchesDiscipline(clubDoninoRacing, 'racing')).toBe(true)
    expect(eventMatchesDiscipline(officialRacing, 'racing')).toBe(true)
    expect(eventMatchesDiscipline(officialCoursing, 'racing')).toBe(false)

    // Other filter includes club championships
    expect(eventMatchesDiscipline(clubDoninoRacing, 'other')).toBe(true)
    expect(eventMatchesDiscipline(officialRacing, 'other')).toBe(false)

    // Coursing filter
    expect(eventMatchesDiscipline(clubDoninoRacing, 'coursing')).toBe(false)
    expect(eventMatchesDiscipline(officialCoursing, 'coursing')).toBe(true)
  })

  it('maps club championships and friendly runs to other discipline', () => {
    expect(getEventDiscipline({ event_type: 'coursing' })).toBe('coursing')
    expect(getEventDiscipline({ event_type: 'racing' })).toBe('racing')
    expect(getEventDiscipline({ event_type: 'other' })).toBe('other')
    expect(getEventDiscipline({ event_type: 'racing', competition_kind: 'Клубный чемпионат' })).toBe('other')
    expect(getEventDiscipline({ event_type: 'racing', competition_kind: 'Дружественные забеги' })).toBe('other')
  })

  it('handles null and undefined judges gracefully', () => {
    expect(parseJudgeNames(null)).toEqual([])
    expect(parseJudgeNames(undefined)).toEqual([])
    expect(formatCompetitionJudgesWithRoles(null)).toBe('')
    expect(formatCompetitionJudgesWithRoles(undefined)).toBe('')
  })
})
