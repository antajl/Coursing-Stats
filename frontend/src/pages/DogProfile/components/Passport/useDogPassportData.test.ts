import { describe, expect, it } from 'vitest'
import { buildDogPassportData } from './useDogPassportData'

describe('buildDogPassportData invariants', () => {
  it('correctly aggregates dog identity, titles, coursing, racing, donino, and show metrics', () => {
    const data = buildDogPassportData({
      dog: {
        id: '1234',
        name_lat: 'Al-Zubeyr Hurayrah',
        name_ru: 'Аль-Зубейр Хурайра',
        breed: 'Салюки',
        sex: 'M',
        photo_url: 'https://saluki.breedarchive.com/photo/download/82564',
        coursing_stats: {
          total_starts: 12,
          gold: 4,
          silver: 3,
          bronze: 2,
          best_score: 356,
          avg_judge_score: 88,
        },
        racing_stats: {
          total_starts: 2,
          gold: 1,
          silver: 0,
          bronze: 0,
          best_speed: 54.2,
          avg_speed: 52.1,
        },
        ranks: {
          coursing: { breedRank: 2, yearBreedRank: 1 },
          racing: { breedRank: 3, yearBreedRank: 2 },
        },
      },
      events: [
        {
          placement: 1,
          title: 'Чемпионат РКФ по курсингу',
          total_score: 356,
          event_type: 'coursing',
          event_date: '2026-05-10',
        },
        {
          placement: 2,
          title: 'Кубок России по курсингу',
          total_score: 342,
          event_type: 'coursing',
          event_date: '2026-08-20',
        },
      ],
      supremeTitles: [{ title: 'Supreme Champion', date: '2026-05-01' }],
      coursingTitles: [{ title: 'ЧРКФ РК (КБ)', date: '2025-10-10' }],
      speedStats: {
        bestSpeed: 57.8,
        avgSpeed: 55.4,
        breedRank: 2,
        breedTotal: 34,
      },
      coursingStats: {
        bestTime: 22.84,
        avgTime: 23.5,
        breedRank: 1,
        breedTotal: 28,
      },
      showDog: {
        id: 9999,
        total_shows: 8,
        best_grade: 'ОТЛ',
        history: [
          { exhibition_id: 1, title: 'BIS-1, BOB', grade: 'ОТЛ' },
          { exhibition_id: 2, title: 'BIG-2', grade: 'ОТЛ' },
        ],
      },
    })

    // 1. Identity & Name Case (Русская кличка в приоритете)
    expect(data.id).toBe('1234')
    expect(data.namePrimary).toBe('Аль-Зубейр Хурайра')
    expect(data.nameSecondary).toBe('Al-Zubeyr Hurayrah')
    expect(data.breedPrimary).toBe('Салюки')
    expect(data.sex).toBe('M')
    expect(data.photoUrl).toBe('https://saluki.breedarchive.com/photo/download/82564')

    // 2. Titles formatted
    const badges = data.titles.map((t) => t.badge)
    expect(badges).toContain('Supreme Champion')
    expect(badges).toContain('ЧРКФ РК')

    // 3. Coursing stats
    expect(data.coursing.hasData).toBe(true)
    expect(data.coursing.totalStarts).toBe(12)
    expect(data.coursing.gold).toBe(4)
    expect(data.coursing.silver).toBe(3)
    expect(data.coursing.bronze).toBe(2)
    expect(data.coursing.bestScore).toBe(356)
    expect(data.coursing.yearBreedRank).toBe(1)

    // 4. Racing stats
    expect(data.racing.hasData).toBe(true)
    expect(data.racing.totalStarts).toBe(2)
    expect(data.racing.gold).toBe(1)
    expect(data.racing.bestSpeed).toBe(54.2)
    expect(data.racing.yearBreedRank).toBe(2)

    // 5. Highlights extracted from events
    expect(data.highlights.length).toBe(2)
    expect(data.highlights[0].placement).toBe(1)
    expect(data.highlights[0].title).toBe('Чемпионат РКФ по курсингу')
    expect(data.highlights[0].score).toBe('356 б.')

    // 6. Donino speed & sprint
    expect(data.donino.hasData).toBe(true)
    expect(data.donino.bestSpeed).toBe(57.8)
    expect(data.donino.speedRank).toBe(2)
    expect(data.donino.bestTime).toBe(22.84)
    expect(data.donino.timeRank).toBe(1)

    // 7. Shows
    expect(data.shows.hasData).toBe(true)
    expect(data.shows.totalShows).toBe(8)
    expect(data.shows.bestGrade).toBe('ОТЛ')

    // 8. Verification metadata
    expect(data.dogUrl).toContain('/dog/1234')
    expect(data.issueDate.length).toBeGreaterThan(0)
  })

  it('gracefully handles dogs with no sport or show history', () => {
    const data = buildDogPassportData({
      dog: {
        id: '5678',
        name_lat: 'Empty Runner',
        breed: 'Уиппет',
      },
    })

    expect(data.id).toBe('5678')
    expect(data.namePrimary).toBe('Empty Runner')
    expect(data.nameSecondary).toBeNull()
    expect(data.coursing.hasData).toBe(false)
    expect(data.racing.hasData).toBe(false)
    expect(data.donino.hasData).toBe(false)
    expect(data.shows.hasData).toBe(false)
    expect(data.highlights).toEqual([])
    expect(data.titles).toEqual([])
  })
})
