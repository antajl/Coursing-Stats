import { describe, expect, it } from 'vitest'
import {
  aggregateQualificationTitles,
  competitionTitleDisplayName,
  competitionTitleKey,
  compareCompetitionTitles,
} from '../lib/competition-titles'

describe('competitionTitleKey', () => {
  it('keeps CACLBr separate from CACL', () => {
    expect(competitionTitleKey('CACLBr')).toBe('caclbr')
    expect(competitionTitleKey('CACL')).toBe('cacl')
    expect(competitionTitleKey('RegCACL')).toBe('regcacl')
  })

  it('keeps R.CACL separate from CACL (and R.CACIL from CACIL)', () => {
    expect(competitionTitleKey('R.CACL')).toBe('rcacl')
    expect(competitionTitleKey('R.CACL')).not.toBe('cacl')
    expect(competitionTitleDisplayName('R.CACL')).toBe('R.CACL')
    expect(competitionTitleKey('R.CACIL')).toBe('rcacil')
    expect(competitionTitleDisplayName('R.CACIL')).toBe('R.CACIL')
    expect(competitionTitleKey('CACL')).toBe('cacl')
    expect(competitionTitleDisplayName('CACL')).toBe('CACL')
  })

  it('does not merge R.CACL into CACL when aggregating', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'CACL' },
      { qualification: 'R.CACL' },
      { qualification: 'R.CACL' },
    ])
    expect(titles).toEqual([
      { title: 'CACL', count: 1 },
      { title: 'R.CACL', count: 2 },
    ])
  })

  it('maps working Russia champion full name', () => {
    expect(competitionTitleKey('Чемпион России по рабочим качествам собак')).toBe('champion_russia')
  })

  it('does not collapse grand/national into day Champion of Russia', () => {
    expect(competitionTitleKey('Гранд чемпион России по рабочим качествам')).toBe('grand_champion_russia')
    expect(competitionTitleKey('ГЧР РК')).toBe('grand_champion_russia')
    expect(competitionTitleKey('Национальный чемпион по рабочим качествам')).toBe('national_champion')
    expect(competitionTitleKey('Породный чемпион по рабочим качествам')).toBe('breed_champion')
  })

  it('uses official short badges', () => {
    expect(competitionTitleDisplayName('Чемпион РКФ')).toBe('ЧРКФ РК')
    expect(competitionTitleDisplayName('Чемпион РКФ в породе')).toBe('ПЧРКФ РК')
    expect(competitionTitleDisplayName('Чемпион России по рабочим качествам собак')).toBe('ЧР РК')
  })

  it('maps Cup of Russia winner in nominative and genitive', () => {
    expect(competitionTitleKey('Победитель Кубка России')).toBe('cup_russia')
    expect(competitionTitleKey('Победитель Кубок России')).toBe('cup_russia')
    expect(competitionTitleKey('ПКР РК')).toBe('cup_russia')
    expect(competitionTitleDisplayName('Победитель Кубка России')).toBe('ПКР РК')
  })
})

describe('aggregateQualificationTitles', () => {
  it('counts comma-separated titles per start', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'CACL, RegCACL' },
      { qualification: 'CACL' },
      { qualification: 'Чемпион РКФ' },
      { qualification: null },
      { qualification: '' },
    ])

    expect(titles).toEqual([
      { title: 'ЧРКФ РК', count: 1 },
      { title: 'CACL', count: 2 },
      { title: 'RegCACL', count: 1 },
    ])
  })

  it('canonicalizes Победитель Кубка России to ПКР РК', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'Победитель Кубка России' },
      { qualification: 'Победитель Кубка России' },
      { qualification: 'Победитель Кубка России' },
    ])
    expect(titles).toEqual([{ title: 'ПКР РК', count: 3 }])
  })

  it('does not merge CACLBr into CACL', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'Чемпион России по рабочим качествам собак,CACLBr,RegCACL' },
      { qualification: 'CACL, RegCACL' },
      { qualification: 'CACL' },
    ])

    expect(titles).toEqual([
      { title: 'ЧР РК', count: 1 },
      { title: 'CACL', count: 2 },
      { title: 'CACLBr', count: 1 },
      { title: 'RegCACL', count: 2 },
    ])
  })

  it('sorts from highest to lowest rank', () => {
    const titles = aggregateQualificationTitles([
      { qualification: 'CACL' },
      { qualification: 'CACL' },
      { qualification: 'CACL' },
      { qualification: 'CACL' },
      { qualification: 'RegCACL' },
      { qualification: 'RegCACL' },
      { qualification: 'Чемпион РКФ' },
    ])

    expect(titles.map((t) => `${t.title}${t.count > 1 ? ` X${t.count}` : ''}`)).toEqual([
      'ЧРКФ РК',
      'CACL X4',
      'RegCACL X2',
    ])
  })
})

describe('compareCompetitionTitles', () => {
  it('orders prestige before certificates', () => {
    const parts = [
      'CACLBr',
      'RegCACL',
      'Чемпион России по рабочим качествам собак',
    ].sort(compareCompetitionTitles)

    expect(parts[0]).toContain('Чемпион России')
    expect(parts.slice(1)).toEqual(['CACLBr', 'RegCACL'])
  })

  it('orders career grands above day titles and CACIL above CACL', () => {
    const parts = [
      'RegCACL',
      'CACL',
      'CACIL',
      'Чемпион РКФ',
      'Чемпион России',
      'Гранд чемпион России',
      'International Champion',
    ].sort(compareCompetitionTitles)

    expect(parts.map((p) => competitionTitleDisplayName(p))).toEqual([
      'ГЧР РК',
      'C.I.C.',
      'ЧР РК',
      'ЧРКФ РК',
      'CACIL',
      'CACL',
      'RegCACL',
    ])
  })
})
