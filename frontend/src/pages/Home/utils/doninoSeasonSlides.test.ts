import { describe, it, expect } from 'vitest'
import {
  buildDoninoSpeedSlides,
  buildDoninoCoursingSlides,
} from './doninoSeasonSlides'
import type { SpeedRecord, CoursingRecord } from '../types'

describe('doninoSeasonSlides', () => {
  it('builds speed slides, dedupes dogs taking best speed, sorts DESC, assigns rank', () => {
    const rawRecords: SpeedRecord[] = [
      { name: 'Драм', breed: 'Уиппет', speed_km_h: 60 },
      { name: 'Драм', breed: 'Уиппет', speed_km_h: 64 }, // better
      { name: 'Зизи', breed: 'Уиппет', speed_km_h: 63 },
      { name: 'Каро', breed: 'Уиппет', speed_km_h: 61 },
      { name: 'Барс', breed: 'Уиппет', speed_km_h: 58 },
      { name: 'Флёна', breed: 'РПБ', speed_km_h: 56 }, // РПБ alias
    ]

    const slides = buildDoninoSpeedSlides(rawRecords, ['УИППЕТ', 'РУССКАЯ ПСОВАЯ БОРЗАЯ'])
    expect(slides).toHaveLength(2)

    // Уиппет
    const whippetSlide = slides[0]
    expect(whippetSlide.breedLabel).toBe('Уиппет')
    expect(whippetSlide.dogCount).toBe(4) // Драм, Зизи, Каро, Барс
    expect(whippetSlide.dogs).toHaveLength(3) // top 3
    expect(whippetSlide.dogs[0].name).toBe('Драм')
    expect(whippetSlide.dogs[0].speed_km_h).toBe(64)
    expect(whippetSlide.dogs[0].rank).toBe(1)
    expect(whippetSlide.dogs[1].name).toBe('Зизи')
    expect(whippetSlide.dogs[1].rank).toBe(2)
    expect(whippetSlide.dogs[2].name).toBe('Каро')
    expect(whippetSlide.dogs[2].rank).toBe(3)

    // РПБ
    const rpbSlide = slides[1]
    expect(rpbSlide.breedLabel).toBe('Русская псовая борзая')
    expect(rpbSlide.dogCount).toBe(1)
    expect(rpbSlide.dogs[0].name).toBe('Флёна')
    expect(rpbSlide.dogs[0].rank).toBe(1)
  })

  it('builds coursing slides, dedupes dogs taking best time, sorts ASC, assigns rank', () => {
    const rawRecords: CoursingRecord[] = [
      { name: 'Таир', breed: 'Уиппет', time_seconds: 24.5 },
      { name: 'Таир', breed: 'Уиппет', time_seconds: 22.74 }, // better
      { name: 'Драми', breed: 'Уиппет', time_seconds: 22.8 },
      { name: 'Зарук', breed: 'Уиппет', time_seconds: 23.03 },
      { name: 'Свеча', breed: 'Уиппет', time_seconds: 23.5 },
    ]

    const slides = buildDoninoCoursingSlides(rawRecords, ['УИППЕТ'])
    expect(slides).toHaveLength(1)

    const whippetSlide = slides[0]
    expect(whippetSlide.dogCount).toBe(4)
    expect(whippetSlide.dogs).toHaveLength(3)
    expect(whippetSlide.dogs[0].name).toBe('Таир')
    expect(whippetSlide.dogs[0].time_seconds).toBe(22.74)
    expect(whippetSlide.dogs[0].rank).toBe(1)
    expect(whippetSlide.dogs[1].name).toBe('Драми')
    expect(whippetSlide.dogs[1].rank).toBe(2)
    expect(whippetSlide.dogs[2].name).toBe('Зарук')
    expect(whippetSlide.dogs[2].rank).toBe(3)
  })
})
