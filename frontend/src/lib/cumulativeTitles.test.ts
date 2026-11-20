import { describe, it, expect } from 'vitest'
import { evaluateCumulativeTitles, type DogCareerData } from './cumulativeTitles'

describe('evaluateCumulativeTitles', () => {
  it('correctly calculates express Champion of Russia (6+ CAC from distinct judges)', () => {
    const data: DogCareerData = {
      dogId: 5782,
      breed: 'САЛЮКИ',
      showTitles: { CAC: 7, CHRKF: 1, SS: 2 },
      showHistory: [
        { date: '19.02.2026', title: 'CAC', judge: 'Выгузов И.А.' },
        { date: '22.03.2026', title: 'CAC', judge: 'Крюкова Е.В.' },
        { date: '22.03.2026', title: 'CAC', judge: 'Чайковская Ф.Р.' },
        { date: '29.03.2026', title: 'CAC', judge: 'Мордвинова Т.А.' },
        { date: '29.03.2026', title: 'CAC', judge: 'Захарова Г.П.' },
        { date: '05.04.2026', title: 'CAC', judge: 'Краковская Л.В.' },
        { date: '05.04.2026', title: 'CAC', judge: 'Гаврилова Я.А.' },
      ],
      competitions: [],
    }

    const { completed, inProgress, officialShowTitles } = evaluateCumulativeTitles(data)
    const chr = completed.find((t) => t.id === 'ch-russia')
    expect(chr).toBeDefined()
    expect(chr?.status).toBe('completed')
    expect(chr?.fulfilledBasis).toContain('6+ CAC')

    const chrkf = completed.find((t) => t.id === 'ch-rkf')
    expect(chrkf).toBeDefined()
    expect(chrkf?.status).toBe('completed')

    // Grand champion is in progress
    const gchr = inProgress.find((t) => t.id === 'grand-ch-russia')
    expect(gchr).toBeDefined()
    expect(gchr?.status).toBe('in_progress')

    expect(officialShowTitles.map((t) => t.title)).toEqual(['ЧР', 'ЧРКФ'])
  })

  it('correctly calculates dog 5782 full career: coursing, racing, WGCH RKF and official titles', () => {
    const data: DogCareerData = {
      dogId: 5782,
      breed: 'САЛЮКИ',
      showTitles: { CAC: 7, CHRKF: 1 },
      showHistory: [
        { date: '19.02.2026', title: 'CAC', judge: 'Выгузов И.А.' },
        { date: '22.03.2026', title: 'CAC', judge: 'Крюкова Е.В.' },
        { date: '22.03.2026', title: 'CAC', judge: 'Чайковская Ф.Р.' },
        { date: '29.03.2026', title: 'CAC', judge: 'Мордвинова Т.А.' },
        { date: '29.03.2026', title: 'CAC', judge: 'Захарова Г.П.' },
        { date: '05.04.2026', title: 'CAC', judge: 'Краковская Л.В.' },
        { date: '05.04.2026', title: 'CAC', judge: 'Гаврилова Я.А.' },
      ],
      competitions: [
        // Racing: 1st place on Чемпионат России -> ЧР РК (ББ)
        {
          placement: 1,
          event_type: 'racing',
          competition_kind: 'Чемпионат России',
          qualification: 'Чемпион России, CACLBr, RegCACL',
          judges: 'Полякова Г.Б., Иванова Г.С., Гольдинова Л.М., Куликова Г.В.',
          status: 'finished',
          date_start: '2026-09-12',
          title: 'Чемпионат России (Сергиев Посад) по бегам борзых',
        },
        // Racing: 1st place on ЧРКФ -> ЧРКФ РК (ББ)
        {
          placement: 1,
          event_type: 'racing',
          competition_kind: 'ЧРКФ',
          qualification: 'Чемпион РКФ, RegCACL',
          judges: 'Куликова Г.В., Вронская О.В.',
          status: 'finished',
          date_start: '2026-09-26',
          title: 'Чемпионат РКФ (Донино) по бегам борзых',
        },
        // Racing: 1st place on ЧРКФ -> 2nd ЧРКФ РК (ББ) -> triggers НЧ РК (ББ) Scheme #4
        {
          placement: 1,
          event_type: 'racing',
          competition_kind: 'ЧРКФ',
          qualification: 'Чемпион РКФ, RegCACL',
          judges: 'Козлова И.В., Богаченко В.В.',
          status: 'finished',
          date_start: '2026-08-01',
          title: 'Чемпионат РКФ (Донино) по бегам борзых',
        },
        // Racing: Club championship -> лига Абсолют (не должна попадать в официальные чемпионские звания)
        {
          placement: 1,
          event_type: 'racing',
          competition_kind: 'Клубный чемпионат',
          qualification: 'Абсолют',
          status: 'finished',
          date_start: '2026-09-20',
        },
        // Coursing: 1st place on ЧРКФ -> ЧРКФ РК (КБ)
        {
          placement: 1,
          event_type: 'coursing',
          competition_kind: 'ЧРКФ',
          qualification: 'Чемпион РКФ, RegCACL',
          judges: 'Егорова М.А., Евграфова О.Н.',
          status: 'finished',
          date_start: '2026-04-19',
          title: 'Чемпионат РКФ (Радонежье) по курсингу борзых',
        },
        // Coursing: 1st place on Монопородный чемпионат -> ПЧРКФ РК (КБ)
        {
          placement: 1,
          event_type: 'coursing',
          competition_kind: 'ПЧРКФ',
          qualification: 'ПЧРКФ РК',
          judges: 'Орлова М.О., Богаченко В.В.',
          status: 'finished',
          date_start: '2026-06-20',
          title: 'Монопородный чемпионат РКФ (Донино) по курсингу борзых',
        },
        // Coursing: 2nd places with CACL -> triggers НЧ РК (КБ) Scheme #5 (1 ЧРКФ + 2 CACL)
        {
          placement: 2,
          event_type: 'coursing',
          competition_kind: 'ЧРКФ',
          qualification: 'CACL',
          judges: 'Полякова Г.Б., Иванова Г.С.',
          status: 'finished',
          date_start: '2026-10-10',
        },
        {
          placement: 2,
          event_type: 'coursing',
          competition_kind: 'ЧРКФ',
          qualification: 'CACL, RegCACL',
          status: 'finished',
          date_start: '2026-10-03',
        },
      ],
    }

    const {
      completed,
      inProgress,
      officialSportTitles,
      officialSupremeTitles,
      officialCoursingTitles,
      officialRacingTitles,
      officialShowTitles,
      titleExplanations,
    } = evaluateCumulativeTitles(data)

    // 1. WGCH RKF (ГЧРКФ РК) must be completed because dog has ЧРКФ in coursing AND in racing
    const gchrkf = completed.find((t) => t.id === 'grand-ch-rkf-sport')
    expect(gchrkf).toBeDefined()
    expect(gchrkf?.status).toBe('completed')
    expect(gchrkf?.badge).toBe('ГЧРКФ РК')
    expect(gchrkf?.fulfilledBasis).toContain('Курсинг')
    expect(gchrkf?.fulfilledBasis).toContain('Бега')

    // 2. National Champions in both disciplines
    const nchCoursing = completed.find((t) => t.id === 'national-ch-sport-coursing')
    expect(nchCoursing).toBeDefined()
    expect(nchCoursing?.badge).toBe('НЧ РК (КБ)')

    const nchRacing = completed.find((t) => t.id === 'national-ch-sport-racing')
    expect(nchRacing).toBeDefined()
    expect(nchRacing?.badge).toBe('НЧ РК (ББ)')

    // 3. Champion of Russia in racing
    const chrRacing = completed.find((t) => t.id === 'ch-russia-sport-racing')
    expect(chrRacing).toBeDefined()
    expect(chrRacing?.badge).toBe('ЧР РК (ББ)')

    // 4. Grand Champion of Russia in sport is in progress (dog has racing ЧР РК, but not coursing ЧР РК)
    const gchrSport = inProgress.find((t) => t.id === 'grand-ch-sport')
    expect(gchrSport).toBeDefined()
    expect(gchrSport?.status).toBe('in_progress')
    expect(gchrSport?.progressPercent).toBe(50)

    // 5. Official sport titles must contain all 7 sport titles partitioned by discipline
    const sportTitles = officialSportTitles.map((t) => ({ title: t.title, count: t.count }))
    expect(sportTitles).toEqual([
      { title: 'ГЧРКФ РК', count: 1 },
      { title: 'ЧР РК (ББ)', count: 1 },
      { title: 'НЧ РК (КБ)', count: 1 },
      { title: 'НЧ РК (ББ)', count: 1 },
      { title: 'ЧРКФ РК (КБ)', count: 1 },
      { title: 'ЧРКФ РК (ББ)', count: 2 },
      { title: 'ПЧРКФ РК (КБ)', count: 1 },
    ])

    // 5.0 Official supreme multi-discipline titles
    expect(officialSupremeTitles).toEqual([
      { title: 'ГЧРКФ РК', count: 1 },
    ])

    // 5.1 Official coursing titles (pure coursing without duplicate supreme or (КБ) suffix)
    expect(officialCoursingTitles).toEqual([
      { title: 'НЧ РК', count: 1 },
      { title: 'ЧРКФ РК', count: 1 },
      { title: 'ПЧРКФ РК', count: 1 },
    ])

    // 5.2 Official racing titles (pure racing without duplicate supreme or (ББ) suffix)
    expect(officialRacingTitles).toEqual([
      { title: 'ЧР РК', count: 1 },
      { title: 'НЧ РК', count: 1 },
      { title: 'ЧРКФ РК', count: 2 },
    ])

    // 6. Non-official certificates and leagues are strictly excluded
    expect(officialSportTitles.some((t) => t.title.includes('Абсолют'))).toBe(false)
    expect(officialSportTitles.some((t) => t.title.includes('CACL'))).toBe(false)
    expect(officialSportTitles.some((t) => t.title.includes('RegCACL'))).toBe(false)

    // 7. Official show titles
    expect(officialShowTitles).toEqual([
      { title: 'ЧР', count: 1 },
      { title: 'ЧРКФ', count: 1 },
    ])

    // 8. Title explanations
    expect(titleExplanations['ГЧРКФ РК']).toBeDefined()
    expect(titleExplanations['ЧР РК (ББ)']).toContain('Чемпионате России по бегам')
    expect(titleExplanations['НЧ РК (КБ)']).toContain('Схема №5')
    expect(titleExplanations['НЧ РК (ББ)']).toContain('Схема №4')
    expect(titleExplanations['ЧР']).toContain('6+ CAC')
  })

  it('correctly identifies near-complete Absolute Champion progress', () => {
    const data: DogCareerData = {
      dogId: 5782,
      breed: 'САЛЮКИ',
      showTitles: { CAC: 7, CHRKF: 1, SS: 2 },
      showHistory: [
        { date: '19.02.2026', title: 'CAC', judge: 'Выгузов И.А.' },
        { date: '22.03.2026', title: 'CAC', judge: 'Крюкова Е.В.' },
        { date: '22.03.2026', title: 'CAC', judge: 'Чайковская Ф.Р.' },
        { date: '29.03.2026', title: 'CAC', judge: 'Мордвинова Т.А.' },
        { date: '29.03.2026', title: 'CAC', judge: 'Захарова Г.П.' },
        { date: '05.04.2026', title: 'CAC', judge: 'Краковская Л.В.' },
        { date: '05.04.2026', title: 'CAC', judge: 'Гаврилова Я.А.' },
      ],
      competitions: [
        {
          placement: 1,
          event_type: 'racing',
          competition_kind: 'Чемпионат России',
          qualification: 'Чемпион России',
          status: 'finished',
        },
      ],
    }

    const { inProgress } = evaluateCumulativeTitles(data)
    const abs = inProgress.find((t) => t.id === 'absolute-ch-russia')
    expect(abs).toBeDefined()
    expect(abs?.status).toBe('in_progress')
    expect(abs?.progressPercent).toBeGreaterThanOrEqual(50)
  })

  it('correctly classifies Grand Champion of Russia (ГЧР) under supreme titles, not under regular show titles', () => {
    const data: DogCareerData = {
      dogId: 5727,
      breed: 'УИППЕТ',
      showTitles: { CAC: 6, CHRKF: 2, YCHRKF: 4, KCHK: 4, GCHR: 1 },
      showHistory: [
        { date: '19.02.2025', title: 'CAC', judge: 'Судья 1' },
        { date: '22.03.2025', title: 'CAC', judge: 'Судья 2' },
        { date: '29.03.2025', title: 'CAC', judge: 'Судья 3' },
        { date: '05.04.2025', title: 'CAC', judge: 'Судья 4' },
        { date: '12.04.2025', title: 'CAC', judge: 'Судья 5' },
        { date: '19.04.2025', title: 'CAC', judge: 'Судья 6' },
      ],
      competitions: [
        {
          placement: 1,
          event_type: 'coursing',
          competition_kind: 'Чемпионат России',
          qualification: 'Чемпион России',
          status: 'finished',
          date_start: '2025-05-10',
        },
      ],
    }

    const { completed, officialSupremeTitles, officialShowTitles, titleExplanations } =
      evaluateCumulativeTitles(data)

    // GCHR must be classified as supreme
    const gchr = completed.find((t) => t.id === 'grand-ch-russia')
    expect(gchr).toBeDefined()
    expect(gchr?.status).toBe('completed')
    expect(gchr?.domain).toBe('supreme')

    // Absolute Champion must also be earned because dog has GCHR + CHR RK
    const abs = completed.find((t) => t.id === 'absolute-ch-russia')
    expect(abs).toBeDefined()
    expect(abs?.status).toBe('completed')

    // Supreme titles row must have both ACH and GCHR
    expect(officialSupremeTitles.map((t) => t.title)).toEqual(['АЧР', 'ГЧР'])

    // Regular show titles must NOT contain GCHR (only regular show titles like CHR, CHRKF, YCHRKF)
    expect(officialShowTitles.some((t) => t.title === 'ГЧР')).toBe(false)
    expect(officialShowTitles.map((t) => t.title)).toContain('ЧР')
    expect(officialShowTitles.map((t) => t.title)).toContain('ЧРКФ')
    expect(officialShowTitles.map((t) => t.title)).toContain('ЮЧРКФ')

    // Explanation for supreme:ГЧР must be present
    expect(titleExplanations['supreme:ГЧР']).toBeDefined()
    expect(titleExplanations['supreme:ГЧР']).toContain('Гранд чемпион России по красоте')
  })
})
