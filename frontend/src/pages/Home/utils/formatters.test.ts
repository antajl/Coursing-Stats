import { describe, it, expect } from 'vitest'
import {
  formatStarts,
  formatScore,
  formatIndex,
  formatSpeed,
  formatDate,
  competitionMetric,
  showHomeMetric,
} from './formatters'
import type { TopDog } from '../types'
import type { ShowHomeTopDog } from '../../../lib/staticData'

describe('formatters', () => {
  describe('formatStarts', () => {
    it('should format single start correctly', () => {
      expect(formatStarts(1)).toBe('1 старт')
    })

    it('should format 2-4 starts correctly', () => {
      expect(formatStarts(2)).toBe('2 старта')
      expect(formatStarts(3)).toBe('3 старта')
      expect(formatStarts(4)).toBe('4 старта')
    })

    it('should format 5+ starts correctly', () => {
      expect(formatStarts(5)).toBe('5 стартов')
      expect(formatStarts(20)).toBe('20 стартов')
    })

    it('should handle 11-14 correctly', () => {
      expect(formatStarts(11)).toBe('11 стартов')
      expect(formatStarts(12)).toBe('12 стартов')
      expect(formatStarts(13)).toBe('13 стартов')
      expect(formatStarts(14)).toBe('14 стартов')
    })

    it('should handle null and NaN', () => {
      expect(formatStarts(null)).toBe(null)
      expect(formatStarts(undefined)).toBe(null)
      expect(formatStarts(NaN)).toBe(null)
    })
  })

  describe('formatScore', () => {
    it('should format number to 1 decimal place', () => {
      expect(formatScore(12.345)).toBe('12.3')
      expect(formatScore(10)).toBe('10.0')
    })

    it('should handle null and NaN', () => {
      expect(formatScore(null)).toBe('—')
      expect(formatScore(undefined)).toBe('—')
      expect(formatScore(NaN)).toBe('—')
    })
  })

  describe('formatIndex', () => {
    it('should format number to 2 decimal places', () => {
      expect(formatIndex(1.2345)).toBe('1.23')
      expect(formatIndex(10)).toBe('10.00')
    })

    it('should handle null and NaN', () => {
      expect(formatIndex(null)).toBe('—')
      expect(formatIndex(undefined)).toBe('—')
      expect(formatIndex(NaN)).toBe('—')
    })
  })

  describe('formatSpeed', () => {
    it('should format speed to 1 decimal place', () => {
      expect(formatSpeed(12.345)).toBe('12.3')
      expect(formatSpeed('15.678')).toBe('15.7')
    })

    it('should handle null and NaN', () => {
      expect(formatSpeed(null)).toBe('—')
      expect(formatSpeed(undefined)).toBe('—')
      expect(formatSpeed(NaN)).toBe('—')
    })
  })

  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2026-01-15')).toBe('15 янв.')
      expect(formatDate('2026-12-25')).toBe('25 дек.')
    })

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('invalid')
      expect(formatDate('')).toBe('')
    })
  })

  describe('competitionMetric', () => {
    it('should format speed metric', () => {
      const dog: TopDog = { dog_id: 1, name_lat: 'Test', best_speed: 15.5 }
      expect(competitionMetric(dog, 'speed')).toBe('15.5 км/ч')
    })

    it('should format index metric', () => {
      const dog: TopDog = { dog_id: 1, name_lat: 'Test', rating_score: 1.23 }
      expect(competitionMetric(dog, 'placement')).toBe('1.23')
    })

    it('should use avg_judge_score as fallback', () => {
      const dog: TopDog = { dog_id: 1, name_lat: 'Test', avg_judge_score: 1.45 }
      expect(competitionMetric(dog, 'score')).toBe('1.45')
    })
  })

  describe('showHomeMetric', () => {
    it('should return best_award if available', () => {
      const dog: ShowHomeTopDog = {
        id: 1,
        name_lat: 'Test',
        breed: 'Breed',
        best_award: 'CAC'
      }
      expect(showHomeMetric(dog)).toBe('CAC')
    })

    it('should return dash if no best_award', () => {
      const dog: ShowHomeTopDog = {
        id: 1,
        name_lat: 'Test',
        breed: 'Breed'
      }
      expect(showHomeMetric(dog)).toBe('—')
    })
  })
})
