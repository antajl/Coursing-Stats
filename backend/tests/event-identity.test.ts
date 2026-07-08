import { describe, expect, it } from 'vitest'
import {
  dedupeCalendarEvents,
  eventCompetitionName,
  eventDedupeKey,
  eventDiscipline,
} from '../lib/event-identity'

describe('eventDedupeKey', () => {
  it('merges legacy and new import of same event (1351 / 1126)', () => {
    const newer = {
      date_start: '2015-03-14',
      location: 'Московская область, деревня Левково',
      rank_label: 'Национальные сертификатные состязания по курсингу ранга CACL "Мартовский Заяц - 2015"',
      event_type: 'coursing',
      competition_kind: 'CACL',
      competition_type: 'Курсинг борзых',
      title: 'CACL (Курсинг борзых)',
    }
    const older = {
      ...newer,
      title: 'Московская область, деревня Левково',
      results_url: null,
    }
    expect(eventDedupeKey(newer)).toBe(eventDedupeKey(older))
  })

  it('merges rank_label formatting variants (1259 / 1484)', () => {
    const a = {
      date_start: '2025-04-26',
      location: 'Пермский край, Пермь',
      rank_label: 'CACL(Курсинг борзых)',
      event_type: 'coursing',
      competition_kind: 'CACL',
      competition_type: 'Курсинг борзых',
    }
    const b = {
      ...a,
      rank_label: 'CACL\n(Курсинг борзых)',
    }
    expect(eventDedupeKey(a)).toBe(eventDedupeKey(b))
  })

  it('dedupes unknown vs coursing discipline for friendly runs (1353 / 1128)', () => {
    const a = {
      date_start: '2015-08-08',
      location: 'Московская область, Сергиево-Посадский р-н',
      rank_label: 'Дружественные забеги',
      event_type: 'coursing',
      competition_kind: '',
      competition_type: '',
    }
    const b = { ...a, event_type: 'unknown' }
    expect(eventDedupeKey(a)).toBe(eventDedupeKey(b))
  })

  it('does not merge coursing and racing on same day at same place', () => {
    const coursing = {
      date_start: '2024-04-07',
      location: 'Г. Ставрополь',
      rank_label: 'CACL\n(Курсинг борзых)',
      event_type: 'coursing',
      competition_kind: 'CACL',
      competition_type: 'Курсинг борзых',
    }
    const racing = {
      date_start: '2024-04-07',
      location: 'Г. Ставрополь',
      rank_label: 'Чемпионат РКФ по бегам за механической приманкой',
      event_type: 'racing',
      competition_kind: 'Чемпионат РКФ',
      competition_type: 'Бега за механической приманкой',
    }
    expect(eventDedupeKey(coursing)).not.toBe(eventDedupeKey(racing))
  })

  it('prefers rank_label over kind/type for competition name', () => {
    expect(eventCompetitionName({
      competition_kind: 'CACL',
      competition_type: 'Курсинг борзых',
      rank_label: 'CACL (Курсинг борзых)',
    })).toBe('cacl(курсинг борзых)')
  })

  it('falls back to kind|type when rank_label empty', () => {
    expect(eventCompetitionName({
      competition_kind: 'CACL',
      competition_type: 'Курсинг борзых',
      rank_label: '',
    })).toBe('cacl|курсинг борзых')
  })

  it('merges when competition_type missing on one row (1214 / 1439)', () => {
    const a = {
      date_start: '2023-09-02',
      location: 'Вологодская обл.',
      rank_label: 'Чемпионат России по бегам борзых (рейсингу)',
      event_type: 'racing',
      competition_kind: 'Чемпионат России',
      competition_type: 'Бега борзых',
    }
    const b = {
      ...a,
      competition_type: '',
      title: 'Чемпионат России по бегам борзых (рейсингу)',
    }
    expect(eventDedupeKey(a)).toBe(eventDedupeKey(b))
  })

  it('dedupes calendar event list', () => {
    const events = [
      { id: 1351, date_start: '2015-03-14', location: 'Левково', rank_label: 'CACL', event_type: 'coursing', competition_kind: 'CACL', competition_type: 'Курсинг борзых' },
      { id: 1126, date_start: '2015-03-14', location: 'Левково', rank_label: 'CACL', event_type: 'coursing', competition_kind: 'CACL', competition_type: 'Курсинг борзых', title: 'old' },
    ]
    expect(dedupeCalendarEvents(events).map((e) => e.id)).toEqual([1351])
  })

  it('normalizes discipline from competition_type', () => {
    expect(eventDiscipline({ event_type: 'unknown', competition_type: 'БЗМП' })).toBe('bzmp')
  })
})
