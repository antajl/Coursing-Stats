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

  it('merges RKF bilingual RU / EN labels', () => {
    expect(canonicalBreed('САЛЮКИ / SALUKI')).toBe('САЛЮКИ')
    expect(canonicalBreed('салюки / Saluki')).toBe(canonicalBreed('САЛЮКИ'))
    expect(breedAliasKey('САЛЮКИ / SALUKI')).toBe('САЛЮКИ')
  })

  it('keeps Cyrillic after slash (not an EN gloss)', () => {
    expect(canonicalBreed('ВЕЛЬШ КОРГИ ПЕМБРОК / КАРДИГАН')).toBe(
      'ВЕЛЬШ КОРГИ ПЕМБРОК / КАРДИГАН',
    )
  })

  it('normalizes К Ш coat markers despite Cyrillic (no JS \\b)', () => {
    expect(canonicalBreed('ВЕНГЕРСКАЯ ВЫЖЛА К Ш')).toBe('ВЕНГЕРСКАЯ ВЫЖЛА К-Ш')
    expect(canonicalBreed('НЕМЕЦКАЯ ОВЧАРКА Д Ш')).toBe('НЕМЕЦКАЯ ОВЧАРКА Д-Ш')
  })

  it('merges confirmed FCI/RKF synonyms', () => {
    expect(canonicalBreed('Австралийский хилер')).toBe('АВСТРАЛИЙСКАЯ ПАСТУШЬЯ СОБАКА')
    expect(canonicalBreed('АВСТРАЛИЙСКАЯ ПАСТУШЬЯ СОБАКА (АВСТРАЛИЙСКИЙ ХИЛЕР)')).toBe(
      'АВСТРАЛИЙСКАЯ ПАСТУШЬЯ СОБАКА',
    )
    expect(canonicalBreed('Кеесхонд')).toBe('НЕМЕЦКИЙ ВОЛЬФШПИЦ (КЕЕСХОНД)')
    expect(canonicalBreed('Вольфшпиц')).toBe('НЕМЕЦКИЙ ВОЛЬФШПИЦ (КЕЕСХОНД)')
    expect(canonicalBreed('Финская лапландская собака')).toBe('ФИНСКИЙ ЛАППХУНД')
    expect(canonicalBreed('Голландский спаниель')).toBe('НИДЕРЛАНДСКИЙ КОЙКЕРХОНДЬЕ')
    expect(canonicalBreed('Майорский мастиф')).toBe('МАЙОРКСКИЙ МАСТИФ')
    expect(canonicalBreed('Ка де бо')).toBe('МАЙОРКСКИЙ МАСТИФ')
    expect(canonicalBreed('Абруццкая овчарка')).toBe('МАРЕММО АБРУЦКАЯ ОВЧАРКА')
    expect(canonicalBreed('Акита американская')).toBe('АМЕРИКАНСКАЯ АКИТА')
    expect(canonicalBreed('АКИТА / AMERICAN')).toBe('АМЕРИКАНСКАЯ АКИТА')
    expect(canonicalBreed('АКИТА / AKITA')).toBe('АКИТА')
    expect(canonicalBreed('Итальянская борзая (левретка)')).toBe('МАЛАЯ ИТАЛЬЯНСКАЯ БОРЗАЯ')
    expect(canonicalBreed('НЕМЕЦКАЯ ОВЧАРКА (СТАНДАРТНАЯ)')).toBe('НЕМЕЦКАЯ ОВЧАРКА СТАНДАРТНАЯ')
    expect(canonicalBreed('Бордер-колли')).toBe('БОРДЕР КОЛЛИ')
    expect(canonicalBreed('Чау-чау')).toBe('ЧАУ ЧАУ')
  })

  it('does not merge distinct FCI breeds / coats', () => {
    expect(canonicalBreed('Ланкаширский хилер')).toBe('ЛАНКАШИРСКИЙ ХИЛЕР')
    expect(canonicalBreed('АВСТРАЛИЙСКАЯ КОРОТКОХВОСТАЯ ПАСТУШЬЯ СОБАКА')).toBe(
      'АВСТРАЛИЙСКАЯ КОРОТКОХВОСТАЯ ПАСТУШЬЯ СОБАКА',
    )
    expect(canonicalBreed('ЛАПЛАНДСКАЯ ОЛЕНЕГОННАЯ СОБАКА')).toBe('ЛАПЛАНДСКАЯ ОЛЕНЕГОННАЯ СОБАКА')
    expect(canonicalBreed('Акита')).toBe('АКИТА')
    expect(canonicalBreed('КОЛЛИ К Ш')).toBe('КОЛЛИ К-Ш')
    expect(canonicalBreed('КОЛЛИ ДЛИННОШЕРСТНЫЙ')).toBe('КОЛЛИ Д-Ш')
  })
})
