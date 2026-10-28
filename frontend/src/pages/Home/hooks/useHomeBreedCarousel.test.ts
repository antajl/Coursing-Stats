import { describe, it, expect } from 'vitest'
import {
  carouselSlideIndex,
  HOME_BREED_SLIDE_MS,
  HOME_BREED_TRANSITION_MS,
  HOME_BREED_FADE_MS,
} from './useHomeBreedCarousel'

describe('carouselSlideIndex', () => {
  it('handles standard indices within bounds', () => {
    expect(carouselSlideIndex(0, 5)).toBe(0)
    expect(carouselSlideIndex(2, 5)).toBe(2)
    expect(carouselSlideIndex(4, 5)).toBe(4)
  })

  it('handles positive wrap-around correctly', () => {
    expect(carouselSlideIndex(5, 5)).toBe(0)
    expect(carouselSlideIndex(6, 5)).toBe(1)
    expect(carouselSlideIndex(12, 5)).toBe(2)
  })

  it('handles negative indices and reverse wrap-around correctly', () => {
    expect(carouselSlideIndex(-1, 5)).toBe(4)
    expect(carouselSlideIndex(-2, 5)).toBe(3)
    expect(carouselSlideIndex(-5, 5)).toBe(0)
    expect(carouselSlideIndex(-6, 5)).toBe(4)
  })

  it('safely handles zero or negative slide counts without crashing', () => {
    expect(carouselSlideIndex(0, 0)).toBe(0)
    expect(carouselSlideIndex(3, 0)).toBe(0)
    expect(carouselSlideIndex(2, -1)).toBe(0)
  })
})

describe('useHomeBreedCarousel timing constants', () => {
  it('has consistent timing for slide duration and transition speed', () => {
    expect(HOME_BREED_SLIDE_MS).toBe(5000)
    expect(HOME_BREED_TRANSITION_MS).toBe(320)
    expect(HOME_BREED_FADE_MS).toBe(HOME_BREED_TRANSITION_MS)
  })
})
