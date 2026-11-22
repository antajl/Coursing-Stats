import { describe, expect, it } from 'vitest'
import { buildDogPassportData } from './useDogPassportData'

describe('buildDogPassportData invariants', () => {
  it('correctly aggregates dog identity, titles, sport, speed, and show metrics', () => {
    const data = buildDogPassportData({
      dog: {
        id: '1234',
        name_lat: 'Al-Zubeyr Hurayrah',
        name_ru: 'Аль-Зубейр Хурайра',
        breed: 'Салюки',
        sex: 'M',
        photo_url: 'https://example.com/photo.jpg',
      },
      supremeTitles: [{ title: 'Supreme Champion', date: '2026-05-01' }],
      coursingTitles: [{ title: 'Чемпион РКФ по курсингу', date: '2025-10-10' }],
      coursing: {
        total_starts: 12,
        gold: 4,
        silver: 3,
        bronze: 2,
        best_judge_score: 356,
        avg_judge_score: 342,
      },
      racing: {
        total_starts: 2,
        gold: 1,
        silver: 0,
        bronze: 0,
        best_speed: 54.2,
      },
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
      ranks: {
        coursing: { rank: 1, points: 150 },
      },
    })

    // 1. Identity & Name Case
    expect(data.id).toBe('1234')
    expect(data.namePrimary).toBe('Al-Zubeyr Hurayrah')
    expect(data.nameSecondary).toBe('Аль-Зубейр Хурайра')
    expect(data.breedPrimary).toBe('Салюки')
    expect(data.sex).toBe('M')
    expect(data.photoUrl).toBe('https://example.com/photo.jpg')

    // 2. Titles deduplicated
    expect(data.titles).toContain('Supreme Champion')
    expect(data.titles).toContain('Чемпион РКФ по курсингу')

    // 3. Sport aggregation (coursing + racing)
    expect(data.sport.hasData).toBe(true)
    expect(data.sport.totalStarts).toBe(14) // 12 + 2
    expect(data.sport.gold).toBe(5) // 4 + 1
    expect(data.sport.silver).toBe(3)
    expect(data.sport.bronze).toBe(2)
    expect(data.sport.bestScore).toBe(356)
    expect(data.sport.bestSpeed).toBe(54.2)
    expect(data.sport.rank).toBe(1)

    // 4. Donino speed & sprint
    expect(data.donino.hasData).toBe(true)
    expect(data.donino.bestSpeed).toBe(57.8)
    expect(data.donino.speedRank).toBe(2)
    expect(data.donino.bestTime).toBe(22.84)
    expect(data.donino.timeRank).toBe(1)

    // 5. Shows
    expect(data.shows.hasData).toBe(true)
    expect(data.shows.totalShows).toBe(8)
    expect(data.shows.bestGrade).toBe('ОТЛ')

    // 6. Verification metadata
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
    expect(data.sport.hasData).toBe(false)
    expect(data.donino.hasData).toBe(false)
    expect(data.shows.hasData).toBe(false)
    expect(data.titles).toEqual([])
  })
})
