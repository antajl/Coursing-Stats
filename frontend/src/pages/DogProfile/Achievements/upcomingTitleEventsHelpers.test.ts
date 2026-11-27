import { describe, it, expect } from 'vitest'
import type { ShowRkfCalendarEntry } from '../../../lib/staticData/shows'
import { evaluateCumulativeTitles, type DogCareerData } from '../../../lib/cumulativeTitles'
import { selectUpcomingEventsForTitle, type SportCalendarEventRaw } from './upcomingTitleEventsHelpers'

const SAMPLE_SPORT: SportCalendarEventRaw[] = [
  { id: 1, date_start: '2027-04-03', title: 'ПЧРКФ — басенджи по курсинг борзых', event_type: 'coursing', competition_kind: 'ПЧРКФ — басенджи' },
  { id: 2, date_start: '2027-04-03', title: 'ПЧРКФ — салюки по курсинг борзых', event_type: 'coursing', competition_kind: 'ПЧРКФ — салюки' },
  { id: 3, date_start: '2027-05-01', title: 'Чемпионат России по курсингу борзых', event_type: 'coursing', competition_kind: 'Чемпионат России' },
  { id: 4, date_start: '2027-06-01', title: 'ЧРКФ по бегам борзых', event_type: 'racing', competition_kind: 'ЧРКФ' },
]

const SAMPLE_SHOWS: ShowRkfCalendarEntry[] = [
  { id: 10, date: '28.11.2026', title: 'Монопородная выставка клуба "РФОС"', ranks: 'КЧК в каждом классе', breeds: 'Русский той', national_breed_club_name: 'НКП РУССКИЙ ТОЙ' },
  { id: 11, date: '29.11.2026', title: 'Выставка клуба "АЛЛО"', ranks: 'CAC ЧФ' },
  { id: 12, date: '05.12.2026', title: 'Выставка 9 группы', ranks: 'CAC 9 гр.' },
  { id: 13, date: '06.12.2026', title: 'Выставка 10 группы', ranks: 'CAC 10 гр.' },
  { id: 14, date: '11.12.2026', title: 'Монопородная выставка клуба РОО "СПБ ГКСС"', ranks: 'КЧК в каждом классе', breeds: 'Салюки', national_breed_club_name: 'НКП САЛЮКИ' },
  { id: 15, date: '12.12.2026', title: 'Выставка САС без ЧР', ranks: 'ЧФ без CAC' },
]

describe('upcomingTitleEventsHelpers', () => {
  it('for ГЧР with completed ЧР and 0/4 КЧК (dog 5782), suggests ONLY mono KCHK/CC shows of the dog breed', () => {
    const dog5782: DogCareerData = {
      dogId: 5782,
      breed: 'САЛЮКИ',
      showTitles: { CAC: 7, CHRKF: 1, SS: 1 },
      showHistory: [
        { date: '06.09.2026', exhibition_id: 98739, exhibition_title: 'Монопородная выставка МОО ОЛС "Конгур"', title: 'СС' },
        { date: '05.04.2026', exhibition_id: 91852, title: 'CAC', judge: 'С1' },
        { date: '05.04.2026', exhibition_id: 91405, title: 'CAC', judge: 'С2' },
        { date: '29.03.2026', exhibition_id: 91729, title: 'CAC, ЧРКФ', judge: 'С3' },
        { date: '29.03.2026', exhibition_id: 91513, title: 'CAC', judge: 'С4' },
        { date: '22.03.2026', exhibition_id: 91762, title: 'CAC', judge: 'С5' },
        { date: '22.03.2026', exhibition_id: 91406, title: 'CAC', judge: 'С6' },
      ],
      competitions: [
        { event_id: 1, event_type: 'racing', competition_kind: 'Чемпионат России', placement: 1, status: 'finished', qualification: 'Чемпион России' },
      ],
    }

    const { inProgress } = evaluateCumulativeTitles(dog5782)
    const gchr = inProgress.find((t) => t.id === 'grand-ch-russia')!
    const achr = inProgress.find((t) => t.id === 'absolute-ch-russia')!

    const gchrRes = selectUpcomingEventsForTitle(gchr, inProgress, {
      sportEvents: SAMPLE_SPORT,
      showEvents: SAMPLE_SHOWS,
      breed: 'САЛЮКИ',
      todayIso: '2026-11-28',
    })
    expect(gchrRes.calendarKind).toBe('show')
    expect(gchrRes.matches).toHaveLength(1)
    expect(gchrRes.matches[0]?.id).toBe('show-14')

    const achrRes = selectUpcomingEventsForTitle(achr, inProgress, {
      sportEvents: SAMPLE_SPORT,
      showEvents: SAMPLE_SHOWS,
      breed: 'САЛЮКИ',
      todayIso: '2026-11-28',
    })
    expect(achrRes.calendarKind).toBe('show')
    expect(achrRes.matches).toHaveLength(1)
    expect(achrRes.matches[0]?.id).toBe('show-14')
  })

  it('for ЧР, filters out mono shows, без CAC shows, and foreign FCI group shows', () => {
    const partialChr: DogCareerData = {
      dogId: 100,
      breed: 'САЛЮКИ',
      showTitles: { CAC: 2 },
      showHistory: [
        { date: '01.02.2026', exhibition_id: 1, title: 'CAC', judge: 'С1' },
        { date: '02.02.2026', exhibition_id: 2, title: 'CAC', judge: 'С2' },
      ],
    }
    const { inProgress } = evaluateCumulativeTitles(partialChr)
    const chr = inProgress.find((t) => t.id === 'ch-russia')!

    const res = selectUpcomingEventsForTitle(chr, inProgress, {
      sportEvents: SAMPLE_SPORT,
      showEvents: SAMPLE_SHOWS,
      breed: 'САЛЮКИ',
      todayIso: '2026-11-28',
    })
    expect(res.matches.map((m) => m.id)).toEqual(['show-11', 'show-13'])
  })

  it('for ГЧР РК with racing ЧР done, suggests only Чемпионат России coursing (no ПЧРКФ, no racing)', () => {
    const sportDog: DogCareerData = {
      dogId: 200,
      breed: 'САЛЮКИ',
      competitions: [
        { event_id: 1, event_type: 'racing', competition_kind: 'Чемпионат России', placement: 1, status: 'finished', qualification: 'Чемпион России' },
      ],
    }
    const { inProgress } = evaluateCumulativeTitles(sportDog)
    const gchrSport = inProgress.find((t) => t.id === 'grand-ch-sport')!
    const res = selectUpcomingEventsForTitle(gchrSport, inProgress, {
      sportEvents: SAMPLE_SPORT,
      showEvents: SAMPLE_SHOWS,
      breed: 'САЛЮКИ',
      todayIso: '2026-11-28',
    })
    expect(res.calendarKind).toBe('sport')
    expect(res.matches.map((m) => m.id)).toEqual(['sport-3'])
  })
})
