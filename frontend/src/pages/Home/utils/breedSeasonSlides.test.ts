import { describe, it, expect } from 'vitest'
import { buildTopBreedSlidesFromRows } from './breedSeasonSlides'

describe('buildTopBreedSlidesFromRows', () => {
  it('re-ranks dogs 1..k and uses breed-specific delta instead of global delta', () => {
    const rows = [
      {
        dog_id: 101,
        breed: 'УИППЕТ',
        rank: 1,
        rank_delta: 0,
        rank_delta_breed: 0,
      },
      {
        dog_id: 201,
        breed: 'РУССКАЯ ПСОВАЯ БОРЗАЯ',
        rank: 2,
        rank_delta: -1, // Global delta is -1
        rank_delta_breed: 0, // Breed delta is 0
      },
      {
        dog_id: 202,
        breed: 'РУССКАЯ ПСОВАЯ БОРЗАЯ',
        rank: 3,
        rank_delta: -7, // Global delta is -7
        rank_delta_breed: 0, // Breed delta is 0
      },
      {
        dog_id: 102,
        breed: 'УИППЕТ',
        rank: 4,
        rank_delta: 5,
        rank_delta_breed: 1,
      },
    ]

    const slides = buildTopBreedSlidesFromRows(rows, 2, 2, true)
    expect(slides.length).toBe(2)

    const rpbSlide = slides.find((s) => s.breedKey === 'РУССКАЯ ПСОВАЯ БОРЗАЯ')
    expect(rpbSlide).toBeDefined()
    expect(rpbSlide?.dogs.length).toBe(2)

    // First dog in RPB: rank should be 1 (in breed), delta should be 0 (breed delta, not -1 global)
    expect(rpbSlide?.dogs[0].rank).toBe(1)
    expect(rpbSlide?.dogs[0].rank_delta).toBe(0)

    // Second dog in RPB: rank should be 2 (in breed), delta should be 0 (breed delta, not -7 global)
    expect(rpbSlide?.dogs[1].rank).toBe(2)
    expect(rpbSlide?.dogs[1].rank_delta).toBe(0)
  })

  it('dynamically computes breed delta when rank_delta_breed is missing', () => {
    // Dog 1 was all-rank 2 (prev 2 + (-1) = 1) -> wait, rank_delta = prev - current
    // In filterUtils: prevAllRank = currentAllRank + rank_delta
    const rows = [
      {
        dog_id: 301,
        breed: 'САЛЮКИ',
        rank: 1,
        rank_delta: 2, // prevAllRank = 1 + 2 = 3
      },
      {
        dog_id: 302,
        breed: 'САЛЮКИ',
        rank: 2,
        rank_delta: -1, // prevAllRank = 2 + (-1) = 1
      },
    ]
    // In previous state: dog 302 was rank 1, dog 301 was rank 3.
    // In current state: dog 301 is rank 1, dog 302 is rank 2.
    // So dog 301 rose from 2nd in breed to 1st in breed -> breedDelta = +1.
    // Dog 302 dropped from 1st in breed to 2nd in breed -> breedDelta = -1.

    const slides = buildTopBreedSlidesFromRows(rows, 1, 2, true)
    const salukiSlide = slides[0]

    expect(salukiSlide.dogs[0].dog_id).toBe(301)
    expect(salukiSlide.dogs[0].rank).toBe(1)
    expect(salukiSlide.dogs[0].rank_delta).toBe(1)

    expect(salukiSlide.dogs[1].dog_id).toBe(302)
    expect(salukiSlide.dogs[1].rank).toBe(2)
    expect(salukiSlide.dogs[1].rank_delta).toBe(-1)
  })
})
