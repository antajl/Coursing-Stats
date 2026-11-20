import { describe, expect, it } from 'vitest'
import {
  formatOrgsCount,
  formatAllOrgsButton,
  formatWinsCount,
  formatStartsCount,
  formatOrgDisplayName,
  normalizeOrgName,
  computeDogOrganizationStats,
} from './DogOrganizationsSection'

describe('formatOrgsCount', () => {
  it('correctly inflects for 1 (nominative singular)', () => {
    expect(formatOrgsCount(1)).toBe('1 организация')
    expect(formatOrgsCount(21)).toBe('21 организация')
    expect(formatOrgsCount(31)).toBe('31 организация')
  })

  it('correctly inflects for 2-4 (genitive singular)', () => {
    expect(formatOrgsCount(2)).toBe('2 организации')
    expect(formatOrgsCount(3)).toBe('3 организации')
    expect(formatOrgsCount(4)).toBe('4 организации')
    expect(formatOrgsCount(22)).toBe('22 организации')
  })

  it('correctly inflects for 5-20 and 0 (genitive plural)', () => {
    expect(formatOrgsCount(0)).toBe('0 организаций')
    expect(formatOrgsCount(5)).toBe('5 организаций')
    expect(formatOrgsCount(11)).toBe('11 организаций')
    expect(formatOrgsCount(20)).toBe('20 организаций')
    expect(formatOrgsCount(25)).toBe('25 организаций')
  })
})

describe('formatAllOrgsButton', () => {
  it('correctly formats button text', () => {
    expect(formatAllOrgsButton(5)).toBe('Показать все 5 организаций')
    expect(formatAllOrgsButton(11)).toBe('Показать все 11 организаций')
    expect(formatAllOrgsButton(21)).toBe('Показать 21 организацию')
    expect(formatAllOrgsButton(22)).toBe('Показать все 22 организаций')
  })
})

describe('formatWinsCount and formatStartsCount', () => {
  it('inflects wins correctly', () => {
    expect(formatWinsCount(1)).toBe('1 золотая награда')
    expect(formatWinsCount(2)).toBe('2 золотые награды')
    expect(formatWinsCount(5)).toBe('5 золотых наград')
    expect(formatWinsCount(21)).toBe('21 золотая награда')
  })

  it('inflects starts correctly', () => {
    expect(formatStartsCount(1)).toBe('1 старт')
    expect(formatStartsCount(2)).toBe('2 старта')
    expect(formatStartsCount(5)).toBe('5 стартов')
    expect(formatStartsCount(21)).toBe('21 старт')
  })
})

describe('normalizeOrgName and formatOrgDisplayName', () => {
  it('normalizes known legacy titles and locations', () => {
    expect(normalizeOrgName(null, 'Мартовский Заяц — Чемпионат РКФ', 'Московская обл.')).toBe('ОООК КЦ «Элита» (РАЛББ)')
    expect(normalizeOrgName(null, 'Чемпионат РКФ (Михайловское)', 'д. Михайловское')).toBe('Курсинг в Михайловском')
    expect(normalizeOrgName(null, 'Осенний марафон', 'д. Донино')).toBe('Курсинг в Донино')
    expect(normalizeOrgName('МОРОО «Федерация спортивно-прикладного собаководства»', '', '')).toBe('МОРОО «Федерация спортивно-прикладного собаководства»')
  })

  it('formats display names into clean abbreviations', () => {
    expect(formatOrgDisplayName('МОРОО «Федерация спортивно-прикладного собаководства»').primary).toBe('МОРОО «ФСПС»')
    expect(formatOrgDisplayName('РООКО Кинологический союз «Арта»').primary).toBe('РООКО «Арта»')
    expect(formatOrgDisplayName('ОО «Региональное кинологическое общество Ставропольского края «Альянс»').primary).toBe('РКО СК «Альянс» (Ставрополь)')
    expect(formatOrgDisplayName('ВГООКС «Сириус»').primary).toBe('ВГООКС «Сириус»')
  })
})

describe('computeDogOrganizationStats', () => {
  it('returns null for empty or invalid competitions', () => {
    expect(computeDogOrganizationStats([])).toBeNull()
    expect(computeDogOrganizationStats([{ title: 'Event', placement: null }])).toBeNull()
  })

  it('computes accurate win rates and categorizes into higher and lower vs career', () => {
    const competitions = [
      // Клуб А: 3 старта, 3 победы (100% побед)
      { event_id: 1, host_club: 'ВГООКС «Сириус»', placement: 1, total_score: 350, date_start: '2026-05-01' },
      { event_id: 2, host_club: 'ВГООКС «Сириус»', placement: 1, total_score: 352, date_start: '2026-06-01' },
      { event_id: 3, host_club: 'ВГООКС «Сириус»', placement: 1, total_score: 355, date_start: '2026-07-01' },
      // Клуб Б: 2 старта, 1 победа (50% побед)
      { event_id: 4, host_club: 'МОРОО «Федерация спортивно-прикладного собаководства»', placement: 1, total_score: 340, date_start: '2026-04-01' },
      { event_id: 5, host_club: 'МОРОО «Федерация спортивно-прикладного собаководства»', placement: 2, total_score: 338, date_start: '2026-04-15' },
      // Клуб В: 2 старта, 0 побед (0% побед)
      { event_id: 6, host_club: 'СПГОО «Общество любителей животных «Радонежье»', placement: 3, total_score: 330, date_start: '2026-03-01' },
      { event_id: 7, host_club: 'СПГОО «Общество любителей животных «Радонежье»', placement: 4, total_score: 325, date_start: '2026-03-15' },
    ]

    const stats = computeDogOrganizationStats(competitions)
    expect(stats).not.toBeNull()
    if (!stats) return

    // Всего 7 стартов, 4 победы -> 4 / 7 = 57% карьерный Win Rate
    expect(stats.total_starts).toBe(7)
    expect(stats.total_wins).toBe(4)
    expect(stats.career_win_rate).toBe(57)
    expect(stats.orgs_count).toBe(3)

    // «Сириус»: 100% (выше 57%) -> higher_than_career
    expect(stats.higher_than_career).toHaveLength(1)
    expect(stats.higher_than_career[0].short_name).toBe('ВГООКС «Сириус»')
    expect(stats.higher_than_career[0].win_rate).toBe(100)
    expect(stats.higher_than_career[0].delta_vs_career).toBe(43) // 100 - 57
    expect(stats.higher_than_career[0].wins_count).toBe(3)

    // «ФСПС»: 50% (ниже 57%) и «Радонежье»: 0% (ниже 57%) -> lower_than_career
    expect(stats.lower_than_career).toHaveLength(2)
    const orgNamesLower = stats.lower_than_career.map((o) => o.short_name)
    expect(orgNamesLower).toContain('МОРОО «ФСПС»')
    expect(orgNamesLower).toContain('СПГОО «Радонежье»')

    // Внутри «Радонежья» 0 побед при 2 стартах
    const radonezhye = stats.lower_than_career.find((o) => o.short_name === 'СПГОО «Радонежье»')
    expect(radonezhye?.win_rate).toBe(0)
    expect(radonezhye?.wins_count).toBe(0)
    expect(radonezhye?.starts_count).toBe(2)
  })
})
