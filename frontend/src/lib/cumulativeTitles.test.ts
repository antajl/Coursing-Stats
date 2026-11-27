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

    // Grand champion is in progress with concrete remaining КЧК advice
    const gchr = inProgress.find((t) => t.id === 'grand-ch-russia')
    expect(gchr).toBeDefined()
    expect(gchr?.status).toBe('in_progress')
    expect(gchr?.nextStepAdvice).toContain('3 КЧК')
    expect(gchr?.evidence?.length).toBeGreaterThan(0)

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

  it('accurately separates JCAC from CAC, evaluates ЮЧР, and guarantees ЮЧРКФ explanations for dog 10742 (BEL ETUAL KAYALA)', () => {
    const data: DogCareerData = {
      dogId: 10742,
      breed: 'САЛЮКИ',
      showTitles: { BOB: 6, CAC: 2, JCAC: 6, YCHRKF: 2 },
      showHistory: [
        { date: '06.09.2026', exhibition_id: 98739, exhibition_title: 'Монопородная выставка клуба МОО ОЛС "Конгур"', title: '', grade: 'ОТЛ' },
        { date: '25.07.2026', exhibition_id: 101427, exhibition_title: 'Выставка клуба РОО "КОМПАНЬОН"', title: 'ЛПП, JCAC, ЮЧФ', grade: 'ОТЛ' },
        { date: '25.07.2026', exhibition_id: 101239, exhibition_title: 'Выставка клуба МКОО "Золотое Сечение"', title: 'ЛПП, JCAC, ЮЧФ', grade: 'ОТЛ' },
        { date: '25.07.2026', exhibition_id: 92307, exhibition_title: 'Выставка клуба РОО "КОМПАНЬОН"', title: 'ЛПП, CAC, ЧФ', grade: 'ОТЛ' },
        { date: '19.07.2026', exhibition_id: 92385, exhibition_title: 'Выставка клуба РОО КК "СТОЛИЦА"', title: 'JCAC, ЮЧРКФ', grade: 'ОТЛ' },
      ],
      competitions: [
        { event_id: 2026003, event_type: 'coursing', competition_kind: 'ЧРКФ', placement: 1, qualification: 'Чемпион РКФ, RegCACL', status: 'finished', judges: 'Судья А' },
        { event_id: 2022003, event_type: 'coursing', competition_kind: 'ЧРКФ', placement: 1, qualification: 'Чемпион РКФ, RegCACL', status: 'finished', judges: 'Судья Б' },
        { event_id: 2022002, event_type: 'racing', competition_kind: 'ЧРКФ', placement: 2, qualification: 'CACL, RegCACL', status: 'finished', judges: 'Куликова Г.В.' },
        { event_id: 2022000, event_type: 'racing', competition_kind: 'Чемпионат России', placement: 2, qualification: 'CACL, RegCACL', status: 'attended', judges: 'Полякова Г.Б.' },
      ],
    }

    const res = evaluateCumulativeTitles(data)

    // JCAC must NOT leak into adult CAC
    expect(res.certificates.cacShowEvents).toHaveLength(1)
    expect(res.certificates.jcacShowEvents).toHaveLength(3)

    // ЮЧР must be completed from 3 JCAC on 3 distinct shows, while adult ЧР must remain in_progress (1 CAC)
    expect(res.officialShowTitles.map((t) => t.title)).toContain('ЮЧР')
    expect(res.officialShowTitles.map((t) => t.title)).not.toContain('ЧР')
    expect(res.inProgress.find((t) => t.id === 'ch-russia')).toBeDefined()

    // ЮЧРКФ must be ×2 (1 ЮЧРКФ + 2 ЮЧФ) and MUST have a non-empty explanation for both keys
    const ychrkf = res.officialShowTitles.find((t) => t.title === 'ЮЧРКФ')
    expect(ychrkf?.count).toBe(2)
    expect(res.titleExplanations['ЮЧРКФ']).toBeTruthy()
    expect(res.titleExplanations['show:ЮЧРКФ']).toBeTruthy()

    // Title evidence must trace exact exhibitions and competitions
    expect(res.titleEvidence?.['show:ЮЧРКФ']).toHaveLength(3)
    expect(res.titleEvidence?.['show:ЮЧР']).toHaveLength(3)
    expect(res.titleEvidence?.['coursing:ЧРКФ РК']).toHaveLength(2)
    expect(res.titleEvidence?.['coursing:НЧ РК']).toHaveLength(2)

    // Coursing НЧ РК completed via Scheme 4, Racing НЧ РК in progress with 2 CACL and evidence
    expect(res.officialCoursingTitles.map((t) => t.title)).toContain('НЧ РК')
    const racingNch = res.inProgress.find((t) => t.id === 'national-ch-sport-racing')
    expect(racingNch).toBeDefined()
    expect(racingNch?.evidence).toHaveLength(2)
    expect(racingNch?.nextStepAdvice).toBeTruthy()
  })

  it('supports ЧР exemption with ЮЧР (4 CAC without 1-year span), ЮГЧР, ВЧР, and all 6 НЧ РК schemes + ПЧ РК', () => {
    const data: DogCareerData = {
      dogId: 99999,
      breed: 'УИППЕТ',
      showTitles: { YKCHK: 3, VKCHK: 3 },
      showHistory: [
        { date: '01.02.2025', exhibition_id: 1, title: 'JCAC', judge: 'Судья 1' },
        { date: '10.02.2025', exhibition_id: 2, title: 'JCAC', judge: 'Судья 2' },
        { date: '20.02.2025', exhibition_id: 3, title: 'JCAC', judge: 'Судья 3' },
        { date: '01.06.2025', exhibition_id: 4, title: 'CAC', judge: 'Судья 1' },
        { date: '10.06.2025', exhibition_id: 5, title: 'CAC', judge: 'Судья 2' },
        { date: '20.06.2025', exhibition_id: 6, title: 'CAC', judge: 'Судья 3' },
        { date: '30.06.2025', exhibition_id: 7, title: 'CAC', judge: 'Судья 4' },
        { date: '01.08.2025', exhibition_id: 8, title: 'VCAC', judge: 'Судья 5' },
        { date: '10.08.2025', exhibition_id: 9, title: 'VCAC', judge: 'Судья 6' },
        { date: '20.08.2025', exhibition_id: 10, title: 'VCAC', judge: 'Судья 7' },
      ],
      competitions: [
        // Coursing: Scheme 6 (5 CACL in 5 RF subjects under 4 judges) + 3 CACLBr (ПЧ РК)
        { event_id: 1, event_type: 'coursing', status: 'finished', qualification: 'CACL', judges: 'Судья А', location: 'Московская область, д. Донино' },
        { event_id: 2, event_type: 'coursing', status: 'finished', qualification: 'CACL', judges: 'Судья Б', location: 'Ярославская область, с. Первитино' },
        { event_id: 3, event_type: 'coursing', status: 'finished', qualification: 'CACL', judges: 'Судья В', location: 'Свердловская область, с. Кадниково' },
        { event_id: 4, event_type: 'coursing', status: 'finished', qualification: 'CACL', judges: 'Судья Г', location: 'Ленинградская область' },
        { event_id: 5, event_type: 'coursing', status: 'finished', qualification: 'CACL', judges: 'Судья А', location: 'Ставропольский край, Ставрополь' },
        { event_id: 6, event_type: 'coursing', status: 'finished', qualification: 'CACLBr', judges: 'Судья Д' },
        { event_id: 7, event_type: 'coursing', status: 'finished', qualification: 'CACL Br', judges: 'Судья Е' },
        { event_id: 8, event_type: 'coursing', status: 'finished', qualification: 'CACLBr', judges: 'Судья Д' },
        // Racing: Scheme 1 (ПКР + ЧРКФ) + R.CACL must NOT trigger CACL
        { event_id: 9, event_type: 'racing', competition_kind: 'Кубок России', placement: 1, status: 'finished', qualification: 'Победитель Кубка России', judges: 'Судья 1' },
        { event_id: 10, event_type: 'racing', competition_kind: 'ЧРКФ', placement: 1, status: 'finished', qualification: 'Чемпион РКФ', judges: 'Судья 2' },
        { event_id: 11, event_type: 'racing', status: 'finished', qualification: 'R.CACL', judges: 'Судья 3' },
      ],
    }

    const res = evaluateCumulativeTitles(data)

    expect(res.officialShowTitles.map((t) => t.title)).toContain('ЮЧР')
    expect(res.officialShowTitles.map((t) => t.title)).toContain('ЧР')
    expect(res.officialShowTitles.map((t) => t.title)).toContain('ВЧР')
    expect(res.officialSupremeTitles.map((t) => t.title)).toContain('ЮГЧР')
    expect(res.officialSupremeTitles.map((t) => t.title)).toContain('ВГЧР')

    expect(res.completed.find((t) => t.id === 'national-ch-sport-coursing')?.fulfilledBasis).toContain('Схема №6')
    expect(res.completed.find((t) => t.id === 'national-ch-sport-racing')?.fulfilledBasis).toContain('Схема №1')
    expect(res.officialCoursingTitles.map((t) => t.title)).toContain('ПЧ РК')
    expect(res.certificates.caclEventsRacing).toHaveLength(0)
  })

  it('hides incomplete Junior titles (ЮЧР/ЮЧРКФ/ЮЧНКП) for adult or veteran dogs while keeping them for active juniors', () => {
    const adultWithOldJcac: DogCareerData = {
      dogId: 88801,
      breed: 'БОРЗАЯ',
      referenceDate: '2026-11-27',
      showTitles: { JCAC: 1, YKCHK: 1, CAC: 2, YCHF: 1 },
      showHistory: [
        { date: '15.05.2023', exhibition_id: 1, title: 'JCAC, ЮЧФ, ЮКЧК', judge: 'Судья 1' },
        { date: '20.06.2024', exhibition_id: 2, title: 'CAC', judge: 'Судья 2' },
        { date: '10.05.2026', exhibition_id: 3, title: 'CAC', judge: 'Судья 3' },
      ],
      competitions: [
        { event_id: 2025001, event_type: 'coursing', status: 'finished', date_start: '2025-08-10', placement: 1, qualification: 'CACL' },
      ],
    }

    const adultRes = evaluateCumulativeTitles(adultWithOldJcac)
    expect(adultRes.inProgress.some((t) => t.badge.startsWith('Ю'))).toBe(false)
    expect(adultRes.inProgress.some((t) => t.id === 'ch-russia')).toBe(true)

    const veteranWithOldJcac: DogCareerData = {
      dogId: 88802,
      breed: 'САЛЮКИ',
      referenceDate: '2026-11-27',
      showTitles: { JCAC: 2, VCAC: 1 },
      showHistory: [
        { date: '01.11.2026', exhibition_id: 10, title: 'JCAC', judge: 'Судья 1' },
        { date: '15.11.2026', exhibition_id: 11, title: 'VCAC', judge: 'Судья 2' },
      ],
      competitions: [],
    }

    const vetRes = evaluateCumulativeTitles(veteranWithOldJcac)
    expect(vetRes.inProgress.some((t) => t.id === 'jch-russia')).toBe(false)

    const youngActiveJunior: DogCareerData = {
      dogId: 88803,
      breed: 'УИППЕТ',
      referenceDate: '2026-11-27',
      showTitles: { JCAC: 1, YCHF: 1 },
      showHistory: [
        { date: '01.10.2026', exhibition_id: 20, title: 'JCAC, ЮЧФ', judge: 'Судья 1' },
      ],
      competitions: [],
    }

    const youngRes = evaluateCumulativeTitles(youngActiveJunior)
    expect(youngRes.inProgress.some((t) => t.id === 'jch-russia')).toBe(true)
    expect(youngRes.inProgress.some((t) => t.id === 'jch-rkf')).toBe(true)
  })
})
