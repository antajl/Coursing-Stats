import { describe, expect, it } from 'vitest'
import {
  collectJudgeNamesForBreedClean,
  sanitizeExhibitionBreeds,
  stripTrailingJudgeFromBreed,
} from '../lib/show-breed-judge-clean'
import { canonicalBreed, breedAliasKey } from '../src/lib/breed-mapping'

describe('show-breed-judge-clean', () => {
  it('strips trailing known judge (longest match, case-insensitive)', () => {
    const judges = ['Горан ГЛАДИЧ', 'ГЛАДИЧ'].sort((a, b) => b.length - a.length)
    const r = stripTrailingJudgeFromBreed('БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА Горан ГЛАДИЧ', judges)
    expect(r.stripped).toBe(true)
    expect(r.breed).toBe('БЕЛАЯ ШВЕЙЦАРСКАЯ ОВЧАРКА')
    expect(r.recoveredJudge).toBe('Горан ГЛАДИЧ')
  })

  it('does not strip ПЕМБРОК as if it were a judge', () => {
    const judges = ['ПЕМБРОК']
    const r = stripTrailingJudgeFromBreed('ВЕЛЬШ КОРГИ ПЕМБРОК', judges)
    expect(r.stripped).toBe(false)
    expect(r.breed).toBe('ВЕЛЬШ КОРГИ ПЕМБРОК')
  })

  it('harvests repeated person suffixes and sanitizes catalog+results', () => {
    const exhibitions = [
      {
        judges: ['Тибор КИШ'],
        breed_catalog: [
          { breed: 'БОРДЕР КОЛЛИ Горан ГЛАДИЧ', breed_judge: '' },
          { breed: 'БРИАР Горан ГЛАДИЧ', breed_judge: '' },
          { breed: 'ВЕЛЬШ КОРГИ ПЕМБРОК', breed_judge: '' },
        ],
        results: [
          { breed: 'БОРДЕР КОЛЛИ Горан ГЛАДИЧ', breed_judge: '', judge: '' },
          { breed: 'ВЕЛЬШ КОРГИ ПЕМБРОК Мстислав Поливанов', breed_judge: '', judge: '' },
          { breed: 'ВЕЛЬШ КОРГИ КАРДИГАН Мстислав Поливанов', breed_judge: '', judge: '' },
        ],
      },
    ]
    const judges = collectJudgeNamesForBreedClean(exhibitions)
    expect(judges.some((j) => /гладич/i.test(j))).toBe(true)
    expect(judges.some((j) => /поливанов/i.test(j))).toBe(true)

    const n = sanitizeExhibitionBreeds(exhibitions[0]!, judges)
    expect(n).toBeGreaterThanOrEqual(4)
    expect(exhibitions[0]!.breed_catalog![0]!.breed).toBe('БОРДЕР КОЛЛИ')
    expect(exhibitions[0]!.breed_catalog![0]!.breed_judge).toMatch(/гладич/i)
    expect(exhibitions[0]!.breed_catalog![2]!.breed).toBe('ВЕЛЬШ КОРГИ ПЕМБРОК')
    expect(exhibitions[0]!.results![0]!.breed).toBe('БОРДЕР КОЛЛИ')
    expect(exhibitions[0]!.results![1]!.breed).toBe('ВЕЛЬШ КОРГИ ПЕМБРОК')
  })

  it('strips Surname I.O. initials glued to breed', () => {
    const r = stripTrailingJudgeFromBreed('БИГЛЬ Александров В.А.', [])
    expect(r.stripped).toBe(true)
    expect(r.breed).toBe('БИГЛЬ')
    expect(r.recoveredJudge).toBe('Александров В.А.')
  })
})

describe('breed-mapping unspecified coats', () => {
  it('maps bare vizsla to unspecified, not К-Ш', () => {
    expect(canonicalBreed('Выжла')).toBe('ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)')
    expect(canonicalBreed('ВЕНГЕРСКАЯ ВЫЖЛА')).toBe('ВЕНГЕРСКАЯ ВЫЖЛА (ТИП НЕ УКАЗАН)')
    expect(canonicalBreed('венгерская выжла к-ш')).toBe('ВЕНГЕРСКАЯ ВЫЖЛА К-Ш')
  })

  it('maps bare GSD to unspecified; keeps combined (Д-Ш, К-Ш)', () => {
    expect(canonicalBreed('Немецкая овчарка')).toBe('НЕМЕЦКАЯ ОВЧАРКА (ТИП НЕ УКАЗАН)')
    expect(canonicalBreed('НЕМЕЦКАЯ ОВЧАРКА (Д Ш, К Ш)')).toBe('НЕМЕЦКАЯ ОВЧАРКА (Д-Ш, К-Ш)')
    expect(canonicalBreed('НЕМЕЦКАЯ ОВЧАРКА К-Ш')).toBe('НЕМЕЦКАЯ ОВЧАРКА К-Ш')
  })

  it('alias keys are case-insensitive', () => {
    expect(breedAliasKey('левретка')).toBe(breedAliasKey('ЛЕВРЕТКА'))
    expect(canonicalBreed('левретка')).toBe('МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ')
  })

  it('normalizes К Ш coat markers despite Cyrillic (no JS \\b)', () => {
    expect(canonicalBreed('ВЕНГЕРСКАЯ ВЫЖЛА К Ш')).toBe('ВЕНГЕРСКАЯ ВЫЖЛА К-Ш')
    expect(canonicalBreed('НЕМЕЦКАЯ ОВЧАРКА Д Ш')).toBe('НЕМЕЦКАЯ ОВЧАРКА Д-Ш')
  })
})
