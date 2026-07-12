import { describe, expect, it } from 'vitest'
import {
  formatGradeLine,
  groupResultsBySexAndClass,
  normalizeShowResults,
} from '../../frontend/src/pages/Shows/showExhibitionUtils'

describe('showExhibitionUtils grouping', () => {
  it('forward-fills empty class names', () => {
    const rows = normalizeShowResults([
      {
        breed: 'X',
        class: '1 Класс беби',
        placement: 2,
        title: '',
        dog_name: '(1) A',
        owner: '',
        judge: '',
        points: 0,
      },
      {
        breed: 'X',
        class: '',
        placement: 1,
        title: 'CW, ЛБ',
        dog_name: '(2) B',
        owner: '',
        judge: '',
        points: 0,
      },
    ])
    expect(rows[0].class).toBe('1 Класс беби')
    expect(rows[1].class).toBe('1 Класс беби')
  })

  it('groups by sex then class', () => {
    const sections = groupResultsBySexAndClass([
      {
        breed: 'X',
        class: '1 Класс беби',
        placement: 1,
        title: '',
        dog_name: '(1) A',
        owner: '',
        judge: '',
        sex: 'M',
        points: 0,
      },
      {
        breed: 'X',
        class: '2 Класс щенков',
        placement: 1,
        title: '',
        dog_name: '(3) C',
        owner: '',
        judge: '',
        sex: 'M',
        points: 0,
      },
      {
        breed: 'X',
        class: '1 Класс беби',
        placement: 1,
        title: '',
        dog_name: '(10) D',
        owner: '',
        judge: '',
        sex: 'F',
        points: 0,
      },
    ])
    expect(sections).toHaveLength(2)
    expect(sections[0].label).toBe('Кобели')
    expect(sections[0].classes).toHaveLength(2)
    expect(sections[1].label).toBe('Суки')
    expect(sections[1].classes[0].rows).toHaveLength(1)
  })

  it('formatGradeLine prefers Russian over English in parentheses', () => {
    expect(formatGradeLine('Очень перспективный (very promising)')).toBe('Очень перспективный')
    expect(formatGradeLine('Отлично (excellent)')).toBe('Отлично')
    expect(formatGradeLine('')).toBe('')
  })
})
