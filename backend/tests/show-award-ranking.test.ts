import { describe, expect, it } from 'vitest'
import {
  bestShowAward,
  compareShowDogs,
  EMPTY_SHOW_TITLES,
  glueWrappedTitleAbbrev,
  glueWrappedTitleParts,
  matchShowAwardToken,
  mergeShowTitles,
  parseShowTitles,
  presentShowAwards,
  showRankScore,
  splitShowTitleTokens,
} from '../lib/show-award-ranking'

describe('matchShowAwardToken', () => {
  it('maps aliases and Russian labels', () => {
    expect(matchShowAwardToken('ЛПП (BOB)')).toBe('BOB')
    expect(matchShowAwardToken('ЛППП (BOS)')).toBe('BOS')
    expect(matchShowAwardToken('BOB/ЛПП')).toBe('BOB')
    expect(matchShowAwardToken('ЛЩ')).toBe('LSH')
    expect(matchShowAwardToken('R.JCAC')).toBe('R_JCAC')
    expect(matchShowAwardToken('П "России"')).toBe('P_RUSSIA')
    expect(matchShowAwardToken('ЮП Москвы')).toBe('YP_MOSCOW')
  })

  it('distinguishes show-level BIS Junior from breed LYU', () => {
    expect(matchShowAwardToken('BEST IN SHOW JUNIOR')).toBe('BIS_JUNIOR')
    expect(matchShowAwardToken('ЛУЧШИЙ ЮНИОР / BEST IN SHOW JUNIOR')).toBe('BIS_JUNIOR')
    expect(matchShowAwardToken('BIS-Ю')).toBe('BIS_JUNIOR')
    expect(matchShowAwardToken('BEST JUNIOR')).toBe('LYU')
    expect(matchShowAwardToken('BEST IN SHOW BABY')).toBe('BIS_BABY')
    expect(matchShowAwardToken('BEST IN SHOW PUPPY')).toBe('BIS_PUPPY')
  })

  it('uses Russian badges for BOB/BOS', async () => {
    const { SHOW_AWARD_BADGE, displayShowAwardToken } = await import('../lib/show-award-ranking')
    expect(SHOW_AWARD_BADGE.BOB).toBe('ЛПП')
    expect(SHOW_AWARD_BADGE.BOS).toBe('ЛППП')
    expect(displayShowAwardToken('BOB/ЛПП')).toBe('ЛПП')
  })

  it('accepts Latin and Cyrillic CAC family (and mixed)', () => {
    expect(matchShowAwardToken('CAC')).toBe('CAC')
    expect(matchShowAwardToken('САС')).toBe('CAC')
    expect(matchShowAwardToken('CАС')).toBe('CAC')
    expect(matchShowAwardToken('САC')).toBe('CAC')
    expect(matchShowAwardToken('JCAC')).toBe('JCAC')
    expect(matchShowAwardToken('JСАС')).toBe('JCAC')
    expect(matchShowAwardToken('CACIB')).toBe('CACIB')
    expect(matchShowAwardToken('САСIB')).toBe('CACIB')
    expect(matchShowAwardToken('R.CAC')).toBe('R_CAC')
    expect(matchShowAwardToken('R.САС')).toBe('R_CAC')
    expect(parseShowTitles('САС, ЧФ').CAC).toBe(1)
    expect(parseShowTitles('CAC, ЧФ').CAC).toBe(1)
  })
})

describe('glueWrappedTitleAbbrev', () => {
  it('glues PDF-wrapped club titles ЮКЧ+К / ВКЧ+П / КЧ+К', () => {
    expect(glueWrappedTitleAbbrev('ЮКЧ К')).toBe('ЮКЧК')
    expect(glueWrappedTitleAbbrev('ЮКЧ П')).toBe('ЮКЧП')
    expect(glueWrappedTitleAbbrev('ВКЧ К')).toBe('ВКЧК')
    expect(glueWrappedTitleAbbrev('ВКЧ П')).toBe('ВКЧП')
    expect(glueWrappedTitleAbbrev('КЧ К')).toBe('КЧК')
    expect(glueWrappedTitleAbbrev('КЧ П')).toBe('КЧП')
    expect(glueWrappedTitleParts(['ЮКЧ', 'К', 'СС'])).toEqual(['ЮКЧК', 'СС'])
    expect(glueWrappedTitleParts(['ЮКЧ', 'К'])).toEqual(['ЮКЧК'])
  })

  it('does not collapse legitimate spaced diplomas', () => {
    expect(glueWrappedTitleAbbrev('П России')).toBeNull()
    expect(glueWrappedTitleAbbrev('ЮП Москвы')).toBeNull()
  })

  it('splitShowTitleTokens recovers wrapped titles for search/filters', () => {
    expect(splitShowTitleTokens('ЮКЧ К')).toEqual(['ЮКЧК'])
    expect(parseShowTitles('ЮКЧ К').YKCHK).toBe(1)
    expect(parseShowTitles('CAC, ЮКЧ К').YKCHK).toBe(1)
  })
})

describe('parseShowTitles', () => {
  it('parses CAC without double-counting CACIB / JCAC / R.CAC', () => {
    expect(parseShowTitles('CAC').CAC).toBe(1)
    expect(parseShowTitles('CAC').CACIB).toBe(0)
    expect(parseShowTitles('CACIB').CACIB).toBe(1)
    expect(parseShowTitles('CACIB').CAC).toBe(0)
    expect(parseShowTitles('JCAC').JCAC).toBe(1)
    expect(parseShowTitles('JCAC').CAC).toBe(0)
    expect(parseShowTitles('R.CAC').R_CAC).toBe(1)
    expect(parseShowTitles('R.CAC').CAC).toBe(0)
  })

  it('parses full protocol lines from exhibition results', () => {
    const t = parseShowTitles(
      'CW, CAC , КЧП, ЧРКФ, П "России", П Москвы, ЛПП (BOB)',
    )
    expect(t.CW).toBe(1)
    expect(t.CAC).toBe(1)
    expect(t.KCHP).toBe(1)
    expect(t.CHRKF).toBe(1)
    expect(t.P_RUSSIA).toBe(1)
    expect(t.P_MOSCOW).toBe(1)
    expect(t.BOB).toBe(1)
    expect(presentShowAwards(t)[0]).toBe('BOB')
  })

  it('parses junior reserve line', () => {
    const t = parseShowTitles('R.JCAC , ЮСС')
    expect(t.R_JCAC).toBe(1)
    expect(t.YSS).toBe(1)
    expect(t.CAC).toBe(0)
  })
})

describe('showRankScore', () => {
  it('weights BIS above BOB and CAC', () => {
    const bisOnly = showRankScore({ ...EMPTY_SHOW_TITLES, BIS: 1 })
    const manyCac = showRankScore({ ...EMPTY_SHOW_TITLES, CAC: 50 })
    expect(bisOnly).toBeGreaterThan(manyCac)
  })
})

describe('bestShowAward', () => {
  it('returns highest tier with count > 0', () => {
    expect(bestShowAward({ ...EMPTY_SHOW_TITLES, BOB: 1, CACIB: 2, CAC: 3 })).toBe('BOB')
    expect(bestShowAward({ ...EMPTY_SHOW_TITLES, BIS: 1, BOB: 1 })).toBe('BIS')
    expect(bestShowAward({ ...EMPTY_SHOW_TITLES })).toBeNull()
  })
})

describe('presentShowAwards', () => {
  it('orders diplomas before CW / reserves', () => {
    const keys = presentShowAwards({
      ...EMPTY_SHOW_TITLES,
      CW: 1,
      CHRKF: 1,
      R_JCAC: 1,
      CAC: 1,
      BOB: 1,
    })
    expect(keys).toEqual(['BOB', 'CAC', 'CHRKF', 'CW', 'R_JCAC'])
  })
})

describe('classifyCompetitionTitle', () => {
  it('classifies prestige, certificate, cumulative', async () => {
    const { classifyCompetitionTitle } = await import('../../frontend/src/lib/awardCategories')
    expect(classifyCompetitionTitle('ЧР РК')).toBe('prestige')
    expect(classifyCompetitionTitle('ПКР РК')).toBe('prestige')
    expect(classifyCompetitionTitle('ЧРКФ РК')).toBe('prestige')
    expect(classifyCompetitionTitle('CACL')).toBe('certificate')
    expect(classifyCompetitionTitle('CACIL')).toBe('certificate')
    expect(classifyCompetitionTitle('CACLBr')).toBe('certificate')
    expect(classifyCompetitionTitle('НЧ РК')).toBe('cumulative')
    expect(classifyCompetitionTitle('ГЧР РК')).toBe('cumulative')
  })
})

describe('compareShowDogs', () => {
  it('sorts by rank_score then tie-breakers', () => {
    const dogs = [
      { titles: { ...EMPTY_SHOW_TITLES, CAC: 5 }, total_shows: 3 },
      { titles: { ...EMPTY_SHOW_TITLES, BOB: 1, CAC: 3 }, total_shows: 3 },
    ]
    dogs.sort(compareShowDogs)
    expect(dogs[0].titles.BOB).toBe(1)
  })
})

describe('mergeShowTitles', () => {
  it('sums counts', () => {
    const merged = mergeShowTitles(parseShowTitles('CAC'), parseShowTitles('BOB'))
    expect(merged.CAC).toBe(1)
    expect(merged.BOB).toBe(1)
  })
})
