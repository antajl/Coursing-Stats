import { describe, expect, it } from 'vitest'
import {
  formatExpertsCount,
  formatAllExpertsButton,
} from './DogJudgesSection'

describe('formatExpertsCount', () => {
  it('correctly inflects for 1 (nominative singular)', () => {
    expect(formatExpertsCount(1)).toBe('1 эксперт')
    expect(formatExpertsCount(21)).toBe('21 эксперт')
    expect(formatExpertsCount(31)).toBe('31 эксперт')
    expect(formatExpertsCount(101)).toBe('101 эксперт')
  })

  it('correctly inflects for 2-4 (genitive singular)', () => {
    expect(formatExpertsCount(2)).toBe('2 эксперта')
    expect(formatExpertsCount(3)).toBe('3 эксперта')
    expect(formatExpertsCount(4)).toBe('4 эксперта')
    expect(formatExpertsCount(22)).toBe('22 эксперта')
    expect(formatExpertsCount(23)).toBe('23 эксперта')
    expect(formatExpertsCount(24)).toBe('24 эксперта')
    expect(formatExpertsCount(102)).toBe('102 эксперта')
  })

  it('correctly inflects for 5-20 and 0 (genitive plural)', () => {
    expect(formatExpertsCount(0)).toBe('0 экспертов')
    expect(formatExpertsCount(5)).toBe('5 экспертов')
    expect(formatExpertsCount(6)).toBe('6 экспертов')
    expect(formatExpertsCount(10)).toBe('10 экспертов')
    expect(formatExpertsCount(11)).toBe('11 экспертов')
    expect(formatExpertsCount(12)).toBe('12 экспертов')
    expect(formatExpertsCount(13)).toBe('13 экспертов')
    expect(formatExpertsCount(14)).toBe('14 экспертов')
    expect(formatExpertsCount(15)).toBe('15 экспертов')
    expect(formatExpertsCount(19)).toBe('19 экспертов')
    expect(formatExpertsCount(20)).toBe('20 экспертов')
    expect(formatExpertsCount(25)).toBe('25 экспертов')
    expect(formatExpertsCount(111)).toBe('111 экспертов')
    expect(formatExpertsCount(112)).toBe('112 экспертов')
  })
})

describe('formatAllExpertsButton', () => {
  it('correctly formats "всех N экспертов / эксперта"', () => {
    expect(formatAllExpertsButton(5)).toBe('Показать всех 5 экспертов')
    expect(formatAllExpertsButton(11)).toBe('Показать всех 11 экспертов')
    expect(formatAllExpertsButton(21)).toBe('Показать всех 21 эксперта')
    expect(formatAllExpertsButton(22)).toBe('Показать всех 22 экспертов')
    expect(formatAllExpertsButton(25)).toBe('Показать всех 25 экспертов')
  })
})
