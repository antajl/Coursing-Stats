import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  disentangleClassAndGrade,
  isBreedContinuationLine,
  isBreedFragment,
  isPlausibleJudgeName,
  parseCertificatePdf,
  parseCertificateTokens,
  parseMainRingPdf,
} from '../parsers/shows/parse-rkf-certificate-pdf'
import { parseShowTitles, splitShowTitleTokens } from '../lib/show-award-ranking'
import { formatShowGradeDisplay, parseShowGrade } from '../lib/show-grades'

const pdf = (id: number) =>
  path.join(process.cwd(), 'data/local/rkf-reports/2026', `${id}-type1.pdf`)

describe('parseCertificateTokens — RKF PDF fixtures', () => {
  it('parses 94395: 4 dogs, ЧЕМ НКП, НЯ', () => {
    const tokens = [
      'ЛЕЙКЛЕНД ТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '1',
      'ЗАВЕТНАЯ МЕЧТА АМБАССАДОР',
      '30.07.2024',
      '7186394',
      'ЮН',
      'ОТЛ',
      'ЮКЧК',
      '04.01.2026',
      'ЛЕЙКЛЕНД ТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '2',
      'Заветная Мечта Ямайка',
      '08.03.2024',
      '6868924',
      'ПРМ',
      'НЯ',
      '04.01.2026',
      'ЛЕЙКЛЕНД ТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '3',
      'Заветная Мечта Яширо',
      '08.03.2024',
      '6868923',
      'ПРМ',
      'НЯ',
      '04.01.2026',
      'ЛЕЙКЛЕНД ТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '4',
      'ЗАВЕТНАЯ МЕЧТА ШАНГРИ-ЛА',
      '04.04.2022',
      '6513384',
      'ЧЕМ НКП',
      'ОТЛ',
      '04.01.2026',
    ]
    const dogs = parseCertificateTokens(tokens)
    expect(dogs).toHaveLength(4)
    expect(dogs[1]!.grade).toBe('НЯ')
    expect(dogs[3]!.class).toBe('ЧЕМ НКП')
    expect(dogs[3]!.dog_name).toMatch(/ШАНГРИ-ЛА/)
  })

  it('parses 92449 tokens: baby class Б and award split', () => {
    const tokens = [
      'АМЕРИКАНСКИЙ ГОЛЫЙ ТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '1',
      'АЛАМЕРЕ ЕЛЬВИНА',
      '03.08.2025',
      'БКО АНТ-000044',
      'Б',
      'ОП',
      '04.01.2026',
      'АМЕРИКАНСКИЙ СТАФФОРДШИРСКИЙ ТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '3',
      'ИНФАНТ ИЗ ДОМА ЛАНКАСТЕР',
      '30.07.2024',
      '7064641',
      'ПРМ',
      'ОТЛ',
      'CAC',
      'BOB/ЛПП',
      '04.01.2026',
      'ЭРДЕЛЬТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '10',
      'Terrier Band Shangri-la Melody',
      '08.07.2025',
      'TXB 672',
      'Б',
      'ОП',
      '04.01.2026',
      'ЭРДЕЛЬТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '11',
      'TERRIER BAND CHARM OF SUMMER',
      '28.06.2025',
      'TXB 663',
      'ЩЕН',
      'НЯ',
      '04.01.2026',
      'ЭРДЕЛЬТЕРЬЕР',
      'Кармазина Елена Викторовна',
      '12',
      'TERRIER BAND FIERY KISS OF DUCHESS',
      '25.02.2025',
      '7332165',
      'ЮН',
      'ОТЛ',
      'JCAC',
      'BOB/ЛПП',
      '04.01.2026',
    ]
    const dogs = parseCertificateTokens(tokens)
    expect(dogs).toHaveLength(5)
    expect(dogs[0]!.class).toBe('Б')
    expect(dogs[1]!.title).toBe('CAC, BOB/ЛПП')
    expect(dogs.filter((d) => d.breed === 'ЭРДЕЛЬТЕРЬЕР')).toHaveLength(3)
  })
})

describe('parseCertificatePdf — real PDFs (column layout)', () => {
  it.skipIf(!fs.existsSync(pdf(100404)))(
    '100404: wrapped breed/judge, not ЛПП as judge',
    async () => {
      const r = await parseCertificatePdf(pdf(100404))
      expect(r.dogs.length).toBe(10)
      const alex = r.dogs.find((d) => d.catalog_number === 8)
      expect(alex?.breed).toMatch(/ВОСТОЧНОЕВРОПЕЙСК/)
      expect(alex?.judge).toMatch(/БАКЛУШИН/)
      expect(alex?.dog_name).toMatch(/АЛЕКС ВАГНЕР/)
      expect(alex?.title).toMatch(/CAC/)
      expect(r.dogs.every((d) => isPlausibleJudgeName(d.judge))).toBe(true)
    },
  )

  it.skipIf(!fs.existsSync(pdf(94395)))('94395: 4 dogs including НЯ and ЧЕМ НКП', async () => {
    const r = await parseCertificatePdf(pdf(94395))
    expect(r.dogs).toHaveLength(4)
    expect(r.dogs[1]!.grade).toBe('НЯ')
    expect(r.dogs[3]!.class).toMatch(/ЧЕМ/)
  })

  it.skipIf(!fs.existsSync(pdf(100051)))('100051: color stays in breed', async () => {
    const r = await parseCertificatePdf(pdf(100051))
    expect(r.dogs.length).toBe(6)
    expect(r.dogs[0]!.breed).toMatch(/РЫЖИЙ/)
    expect(r.dogs[0]!.judge).toMatch(/ВАСИЛЬЕВ/)
  })

  it.skipIf(!fs.existsSync(pdf(89105)))('89105: stops before main ring sheet', async () => {
    const r = await parseCertificatePdf(pdf(89105))
    expect(r.has_main_ring_sheet).toBe(true)
    expect(r.dogs.length).toBeGreaterThan(50)
    expect(r.dogs[0]!.breed).toBe('АВСТРАЛИЙСКАЯ ОВЧАРКА')
    expect(r.dogs[0]!.dog_name).toMatch(/REISING PRAID/)
  })

  it.skipIf(!fs.existsSync(pdf(100397)))(
    '100397: multi-line poodle breed cells stay whole',
    async () => {
      const r = await parseCertificatePdf(pdf(100397))
      expect(r.dogs.length).toBe(23)
      expect(r.dogs[0]!.breed).toBe('ПУДЕЛЬ СРЕДНИЙ КОРИЧНЕВЫЙ')
      expect(r.dogs[4]!.breed).toMatch(/^ПУДЕЛЬ МИНИАТЮРНЫЙ ДРУГИЕ ОКРАСЫ/)
      expect(r.dogs[4]!.breed).toMatch(/МНОГОЦВЕТНЫЙ\)/)
      expect(r.dogs[18]!.breed).toMatch(/^ПУДЕЛЬ ТОЙ ДРУГИЕ ОКРАСЫ/)
      expect(r.dogs[19]!.breed).toBe('ПУДЕЛЬ ТОЙ РЫЖИЙ')
      expect(r.dogs.every((d) => !isBreedFragment(d.breed))).toBe(true)
    },
  )

  it.skipIf(!fs.existsSync(pdf(91729)))(
    '91729: Italian greyhound wrap + Emul is САЛЮКИ (not shifted borzoi)',
    async () => {
      const r = await parseCertificatePdf(pdf(91729))
      const row114 = r.dogs.find((d) => d.catalog_number === 114)
      const emul = r.dogs.find((d) => /ГЕПАРД/i.test(d.dog_name))
      const afina = r.dogs.find((d) => d.catalog_number === 117)
      expect(row114?.breed).toMatch(/МАЛАЯ ИТАЛЬЯНСКАЯ.*БОРЗАЯ/)
      expect(emul?.breed).toBe('САЛЮКИ')
      expect(emul?.catalog_number).toBe(116)
      expect(afina?.breed).toBe('УИППЕТ')
    },
  )

  it.skipIf(!fs.existsSync(pdf(91406)))(
    '91406: Cyrillic «САС» in PDF becomes CAC (Latin CAC still works elsewhere)',
    async () => {
      const r = await parseCertificatePdf(pdf(91406))
      const emul = r.dogs.find((d) => /ГЕПАРД/i.test(d.dog_name))
      expect(emul?.title).toMatch(/CAC/)
      expect(emul?.title).toMatch(/ЧФ/)
      // Neighbor with Latin JCAC must not lose it
      const decabrist = r.dogs.find((d) => /ДЕКАБРИСТ|DECABRIST/i.test(d.dog_name))
      if (decabrist) expect(decabrist.title).toMatch(/JCAC|ЮЧФ/)
    },
  )
})

const bisPdf = (id: number) =>
  path.join(process.cwd(), 'data/local/rkf-reports/2026', `${id}-type3.pdf`)

describe('parseMainRingPdf — type3 BIS', () => {
  it.skipIf(!fs.existsSync(bisPdf(91729)))(
    '91729: Emul is BIS-1 and BIG-10-1',
    async () => {
      const rows = await parseMainRingPdf(bisPdf(91729))
      const emul = rows.filter((r) => /ГЕПАРД/i.test(r.dog_name))
      expect(emul.some((r) => r.competition_key === 'BIS' && r.place === 1)).toBe(true)
      expect(emul.some((r) => r.competition_key === 'BIG' && r.group === 10 && r.place === 1)).toBe(
        true,
      )
      expect(rows.some((r) => r.competition_key === 'BIS_JUNIOR')).toBe(true)
      expect(rows.some((r) => r.competition_key === 'BIS_BABY')).toBe(true)
    },
  )

  /** place@272 (wider than old ≤270), labels mid-block — Voronoi bands */
  it.skipIf(!fs.existsSync(bisPdf(100402)))(
    '100402: Favorit Krasnodar — place@272 + mid-block headers',
    async () => {
      const rows = await parseMainRingPdf(bisPdf(100402))
      expect(rows.length).toBe(7)
      const puppy = rows.filter((r) => r.competition_key === 'BIS_PUPPY')
      expect(puppy).toHaveLength(1)
      expect(puppy[0]).toMatchObject({
        place: 1,
        catalog_number: 11,
        dog_name: 'SLAVJANKA KURAZH N B',
        breed: 'СХИППЕРКЕ',
        award_badge: 'BIS-Щ',
      })
      const junior = rows.filter((r) => r.competition_key === 'BIS_JUNIOR')
      expect(junior.map((r) => r.place).sort()).toEqual([1, 2, 3])
      expect(junior.find((r) => r.place === 1)?.dog_name).toMatch(/MISTYCOR/)
      const bis = rows.filter((r) => r.competition_key === 'BIS')
      expect(bis).toHaveLength(3)
      expect(bis.find((r) => r.place === 1)).toMatchObject({
        catalog_number: 1,
        dog_name: 'GENERAL-IN-CHIEF MAGNIFICENT PRIDE',
        breed: 'АВСТРАЛИЙСКАЯ ОВЧАРКА',
        award_badge: 'BIS',
      })
      // No breed bleed across adjacent place rows
      expect(bis.every((r) => !/СХИППЕРКЕ.*МУДИ|МУДИ.*СХИППЕРКЕ/.test(r.breed))).toBe(true)
    },
  )
})

describe('normalizeCertLookalikes', () => {
  it('keeps Latin CAC and maps Cyrillic/mixed to CAC', async () => {
    const { normalizeCertLookalikes } = await import('../lib/show-award-ranking')
    expect(normalizeCertLookalikes('CAC')).toBe('CAC')
    expect(normalizeCertLookalikes('САС')).toBe('CAC')
    expect(normalizeCertLookalikes('CАС')).toBe('CAC')
    expect(normalizeCertLookalikes('ЧФ')).toBe('ЧФ')
    expect(normalizeCertLookalikes('КЧК')).toBe('КЧК')
  })
})

describe('isBreedFragment', () => {
  it('flags colour/variety orphans, keeps real breeds', () => {
    expect(isBreedFragment('(ДВУХЦВЕТНЫЙ, С ПЛАЩОМ, С')).toBe(true)
    expect(isBreedFragment('МИНИАТЮРНЫЙ')).toBe(true)
    expect(isBreedFragment('СТАНДАРТНАЯ')).toBe(true)
    expect(isBreedFragment('ОВЧАРКА')).toBe(true)
    expect(isBreedFragment('АВСТРАЛИЙСКАЯ')).toBe(true)
    expect(isBreedFragment('АМЕРИКАНСКИЙ')).toBe(true)
    expect(isBreedFragment('БОРЗАЯ')).toBe(true)
    expect(isBreedFragment('DOG')).toBe(true)
    expect(isBreedFragment('/ DACHSHUND')).toBe(true)
    expect(isBreedFragment('ПУДЕЛЬ МИНИАТЮРНЫЙ ЧЁРНЫЙ')).toBe(false)
    expect(isBreedFragment('АВСТРАЛИЙСКАЯ ОВЧАРКА')).toBe(false)
    expect(isBreedFragment('ПУДЕЛЬ')).toBe(false)
    expect(isBreedFragment('БАСЕНДЖИ')).toBe(false)
  })
})

describe('disentangleClassAndGrade', () => {
  it('recovers wrapped ЩЕН around grade ОП', () => {
    expect(disentangleClassAndGrade('', 'ЩЕ ОП Н')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'ОП',
    })
    expect(disentangleClassAndGrade('ЩЕ Н', 'ОП')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'ОП',
    })
    expect(disentangleClassAndGrade('ЩЕ', 'ОП Н')).toEqual({
      dogClass: 'ЩЕН',
      grade: 'ОП',
    })
  })

  it('glues syllable-wrapped class abbrevs Ю/Н ПР/М ЧЕ/М', () => {
    expect(disentangleClassAndGrade('Ю Н', 'ОТ Л')).toEqual({
      dogClass: 'ЮН',
      grade: 'ОТЛ',
    })
    expect(disentangleClassAndGrade('ПР М', 'ОЧ. ХО Р')).toEqual({
      dogClass: 'ПРМ',
      grade: 'ОЧ. ХОР',
    })
    expect(disentangleClassAndGrade('ЧЕ М', 'ОТЛ')).toEqual({
      dogClass: 'ЧЕМ',
      grade: 'ОТЛ',
    })
  })

  it('recovers interleaved class+grade letters from narrow PDF columns', () => {
    expect(disentangleClassAndGrade('', 'ПР ОТ М Л')).toEqual({
      dogClass: 'ПРМ',
      grade: 'ОТЛ',
    })
    expect(disentangleClassAndGrade('', 'ОТ ОТ К Л')).toEqual({
      dogClass: 'ОТК',
      grade: 'ОТЛ',
    })
    expect(disentangleClassAndGrade('', 'ЧЕ ОТ М Л')).toEqual({
      dogClass: 'ЧЕМ',
      grade: 'ОТЛ',
    })
    expect(disentangleClassAndGrade('', 'ЧН ОТ КП Л')).toEqual({
      dogClass: 'ЧЕМ НКП',
      grade: 'ОТЛ',
    })
    expect(disentangleClassAndGrade('', 'ВЕ ОТ Т Л')).toEqual({
      dogClass: 'ВЕТ',
      grade: 'ОТЛ',
    })
  })
})

describe('parseCertificatePdf — wrapped class syllables + FIO judge', () => {
  const local = pdf(100402)
  it.skipIf(!fs.existsSync(local))(
    '100402: Ю/Н→Юниоры, ПР/М, ЧЕ/М; judge ПИРОГОВА ИРАИДА ЕВГЕНЬЕВНА',
    async () => {
      const r = await parseCertificatePdf(local)
      expect(r.dogs.length).toBeGreaterThanOrEqual(10)
      const junior = r.dogs.filter((d) => d.class === 'ЮН')
      expect(junior.length).toBeGreaterThanOrEqual(3)
      expect(r.dogs.some((d) => d.class === 'ПРМ')).toBe(true)
      expect(r.dogs.some((d) => d.class === 'ЧЕМ')).toBe(true)
      expect(
        r.dogs.every((d) => /ПИРОГОВА\s+ИРАИДА\s+ЕВГЕНЬЕВНА/i.test(d.judge)),
      ).toBe(true)
      const chief = r.dogs.find((d) => d.catalog_number === 1)
      expect(chief?.grade).toMatch(/ОТЛ|ОТЛ\./i)
      expect(parseShowGrade(formatShowGradeDisplay(chief?.grade))).toBe('excellent')
    },
  )
})

describe('parseCertificatePdf — interleaved class/grade + FIO trailing letter', () => {
  const local = pdf(100352)
  it.skipIf(!fs.existsSync(local))(
    '100352: ОТК/ЮН/ПРМ + ОТЛ; judge КРЮКОВА ЕЛЕНА ВАЛЕНТИНОВНА',
    async () => {
      const r = await parseCertificatePdf(local)
      expect(r.dogs.map((d) => d.class).sort()).toEqual(['ОТК', 'ОТК', 'ПРМ', 'ЮН'].sort())
      expect(r.dogs.every((d) => d.grade === 'ОТЛ')).toBe(true)
      expect(
        r.dogs.every((d) => /КРЮКОВА\s+ЕЛЕНА\s+ВАЛЕНТИНОВНА/i.test(d.judge)),
      ).toBe(true)
      expect(r.dogs.every((d) => /ИРЛАНДСКИЙ\s+ВОЛЬФХАУНД/i.test(d.breed))).toBe(true)
      const junior = r.dogs.find((d) => d.catalog_number === 2)
      expect(junior?.title).toMatch(/ЮКЧК/i)
    },
  )
})

describe('parseCertificatePdf — wrapped puppy class', () => {
  const local = pdf(100552)
  it.skipIf(!fs.existsSync(local))(
    '100552: ЩЕ/Н wrap + ОП → class Щенки, grade ОП',
    async () => {
      const r = await parseCertificatePdf(local)
      const dog = r.dogs.find((d) => d.catalog_number === 5)
      expect(dog?.class).toBe('ЩЕН')
      expect(dog?.grade).toBe('ОП')
    },
  )
})

describe('parseCertificatePdf — breed block split', () => {
  const local = pdf(90943)
  it.skipIf(!fs.existsSync(local))(
    'keeps ПТИ БРАБАНСОН and ПУДЕЛЬ ТОЙ as separate breeds (90943)',
    async () => {
      const r = await parseCertificatePdf(local)
      const brabancon = r.dogs.find((d) => d.catalog_number === 32)
      const poodle = r.dogs.find((d) => d.catalog_number === 34)
      expect(brabancon?.breed).toBe('ПТИ БРАБАНСОН')
      expect(poodle?.breed).toMatch(/^ПУДЕЛЬ ТОЙ/)
      expect(brabancon?.breed).not.toMatch(/ПУДЕЛЬ/)
    },
  )
})

describe('isPlausibleJudgeName', () => {
  it('accepts people, rejects breeds and awards', () => {
    expect(isPlausibleJudgeName('Кармазина Елена Викторовна')).toBe(true)
    expect(isPlausibleJudgeName('БАКЛУШИН ГЕОРГИЙ ВАСИЛЬЕВИЧ')).toBe(true)
    expect(isPlausibleJudgeName('ЛПП /')).toBe(false)
    expect(isPlausibleJudgeName('ВЕЛЬШ КОРГИ ПЕМБРОК')).toBe(false)
    expect(isPlausibleJudgeName('ОЧ.Х')).toBe(false)
  })
})

describe('show grades / awards from PDF abbreviations', () => {
  it('maps НЯ and ОТЛ for display', () => {
    expect(parseShowGrade('НЯ')).toBeNull()
    expect(formatShowGradeDisplay('НЯ')).toBe('Неявка')
    expect(formatShowGradeDisplay('ОТЛ')).toBe('Отлично')
    expect(formatShowGradeDisplay('ХОР')).toBe('Хорошо')
    expect(formatShowGradeDisplay('ОП')).toBe('Очень перспективный')
  })

  it('splits CAC BOB/ЛПП into two awards', () => {
    expect(splitShowTitleTokens('CAC BOB/ЛПП')).toEqual(['CAC', 'BOB/ЛПП'])
    const t = parseShowTitles('CAC BOB/ЛПП')
    expect(t.CAC).toBe(1)
    expect(t.BOB).toBe(1)
  })
})
