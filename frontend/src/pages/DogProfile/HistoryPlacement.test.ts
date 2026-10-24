import { describe, expect, it } from 'vitest'
import React from 'react'
import {
  getStatusCategory,
  HistoryPlacement,
} from './HistoryPlacement'

describe('getStatusCategory', () => {
  it('identifies DQ and DNF statuses', () => {
    expect(getStatusCategory('disqualified')).toBe('dq')
    expect(getStatusCategory('dnf')).toBe('dq')
    expect(getStatusCategory('withdrawn')).toBe('dq')
    expect(getStatusCategory('dismissed')).toBe('dq')
    expect(getStatusCategory('eliminated')).toBe('dq')
    expect(getStatusCategory('DNF')).toBe('dq')
    expect(getStatusCategory('DISQUALIFIED')).toBe('dq')
  })

  it('identifies DNS statuses', () => {
    expect(getStatusCategory('dns')).toBe('dns')
    expect(getStatusCategory('absent')).toBe('dns')
    expect(getStatusCategory('DNS')).toBe('dns')
  })

  it('identifies DQ from statusReason keyword even when status is generic', () => {
    expect(getStatusCategory(null, 'Сошёл')).toBe('dq')
    expect(getStatusCategory(null, 'Дисквалификация')).toBe('dq')
    expect(getStatusCategory(null, 'Снят ветеринаром')).toBe('dq')
    expect(getStatusCategory(null, 'Травма')).toBe('dq')
    expect(getStatusCategory(null, 'Отстранение')).toBe('dq')
  })

  it('identifies DNS from statusReason keyword', () => {
    expect(getStatusCategory(null, 'Неявка')).toBe('dns')
    expect(getStatusCategory(null, 'Неявка на старт')).toBe('dns')
  })

  it('returns null for finished runs without disqualification reason', () => {
    expect(getStatusCategory('finished', null)).toBe(null)
    expect(getStatusCategory(null, null)).toBe(null)
    expect(getStatusCategory('', '')).toBe(null)
  })
})

describe('HistoryPlacement', () => {
  it('returns red cross element for dnf status with reason', () => {
    const el = HistoryPlacement({ placement: null, status: 'dnf', statusReason: 'Сошёл' })
    expect(React.isValidElement(el)).toBe(true)
    // Verify it passes label 'Сошёл'
    expect(el?.props.label).toBe('Сошёл')
  })

  it('returns red cross element for disqualified status', () => {
    const el = HistoryPlacement({ placement: null, status: 'disqualified', statusReason: null })
    expect(React.isValidElement(el)).toBe(true)
    expect(el?.props.label).toBe('Дисквалификация')
  })

  it('returns gray cross element for dns status', () => {
    const el = HistoryPlacement({ placement: null, status: 'dns' })
    expect(React.isValidElement(el)).toBe(true)
    expect(el?.props.label).toBe('Неявка')
  })

  it('returns rank mark for 1st-10th place', () => {
    const el = HistoryPlacement({ placement: 2 })
    expect(React.isValidElement(el)).toBe(true)
    expect(el?.props.place).toBe(2)
  })

  it('returns text label for place > 10', () => {
    const el = HistoryPlacement({ placement: 15 })
    expect(React.isValidElement(el)).toBe(true)
    expect(el?.props['aria-label']).toBe('15-е место')
  })

  it('returns null when placement is null and no status', () => {
    const el = HistoryPlacement({ placement: null, status: null })
    expect(el).toBe(null)
  })
})
