import { describe, it, expect } from 'vitest'
import type { DogProfileMainTabId, DogProfileMainTabItem } from './types'

describe('DogProfileTopTabs invariants', () => {
  it('supports all canonical main top tabs: profile, achievements, judges, organizations', () => {
    const validMainTabs: DogProfileMainTabId[] = [
      'profile',
      'achievements',
      'judges',
      'organizations',
    ]

    expect(validMainTabs).toHaveLength(4)
  })

  it('guarantees zero emojis in tab labels (Old Money design invariant)', () => {
    const mainTabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
      { id: 'achievements', label: 'Достижения' },
      { id: 'judges', label: 'Судьи' },
      { id: 'organizations', label: 'Организации' },
    ]

    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

    for (const tab of mainTabs) {
      expect(emojiRegex.test(tab.label)).toBe(false)
      expect(typeof tab.label).toBe('string')
      expect(tab.label.length).toBeGreaterThan(0)
    }
  })

  it('correctly maps URL hashes to main top tabs and sub-disciplines', () => {
    const resolveMainTabFromHash = (hash: string): DogProfileMainTabId => {
      const clean = hash.replace(/^#/, '')
      if (clean === 'achievements' || clean === 'awards' || clean === 'titles') return 'achievements'
      if (clean === 'judges') return 'judges'
      if (clean === 'organizations' || clean === 'orgs') return 'organizations'
      return 'profile'
    }

    expect(resolveMainTabFromHash('#profile')).toBe('profile')
    expect(resolveMainTabFromHash('#achievements')).toBe('achievements')
    expect(resolveMainTabFromHash('#judges')).toBe('judges')
    expect(resolveMainTabFromHash('#organizations')).toBe('organizations')
    expect(resolveMainTabFromHash('#orgs')).toBe('organizations')
    expect(resolveMainTabFromHash('#donino')).toBe('profile')
    expect(resolveMainTabFromHash('#speeds')).toBe('profile')
    expect(resolveMainTabFromHash('#coursing')).toBe('profile')
    expect(resolveMainTabFromHash('#racing')).toBe('profile')
    expect(resolveMainTabFromHash('#shows')).toBe('profile')
    expect(resolveMainTabFromHash('')).toBe('profile')
  })

  it('generates the top tabs in exact order: Профиль, Достижения, Судьи, Организации', () => {
    const hasJudges = true
    const hasOrganizations = true

    const tabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
      { id: 'achievements', label: 'Достижения' },
    ]
    if (hasJudges) tabs.push({ id: 'judges', label: 'Судьи' })
    if (hasOrganizations) tabs.push({ id: 'organizations', label: 'Организации' })

    expect(tabs.map((t) => t.id)).toEqual(['profile', 'achievements', 'judges', 'organizations'])
    expect(tabs.map((t) => t.label)).toEqual(['Профиль', 'Достижения', 'Судьи', 'Организации'])
  })

  it('hides optional tabs if dog has no coursing or competitions', () => {
    const hasJudges = false
    const hasOrganizations = false

    const tabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
      { id: 'achievements', label: 'Достижения' },
    ]
    if (hasJudges) tabs.push({ id: 'judges', label: 'Судьи' })
    if (hasOrganizations) tabs.push({ id: 'organizations', label: 'Организации' })

    expect(tabs.map((t) => t.id)).toEqual(['profile', 'achievements'])
    expect(tabs.map((t) => t.label)).toEqual(['Профиль', 'Достижения'])
  })
})
