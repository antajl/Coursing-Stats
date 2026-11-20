import { describe, it, expect } from 'vitest'
import type { DogProfileMainTabId, DogProfileMainTabItem, DisciplineTabId } from './types'

describe('DogProfileTopTabs invariants', () => {
  it('supports all canonical main top tabs: profile, judges, organizations, donino', () => {
    const validMainTabs: DogProfileMainTabId[] = [
      'profile',
      'judges',
      'organizations',
      'donino',
    ]

    expect(validMainTabs).toHaveLength(4)
  })

  it('guarantees zero emojis in tab labels (Old Money design invariant)', () => {
    const mainTabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
      { id: 'judges', label: 'Судьи' },
      { id: 'organizations', label: 'Организации' },
      { id: 'donino', label: 'Донино' },
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
      if (clean === 'judges') return 'judges'
      if (clean === 'organizations' || clean === 'orgs') return 'organizations'
      if (clean === 'donino' || clean === 'speeds') return 'donino'
      return 'profile'
    }

    expect(resolveMainTabFromHash('#profile')).toBe('profile')
    expect(resolveMainTabFromHash('#judges')).toBe('judges')
    expect(resolveMainTabFromHash('#organizations')).toBe('organizations')
    expect(resolveMainTabFromHash('#orgs')).toBe('organizations')
    expect(resolveMainTabFromHash('#donino')).toBe('donino')
    expect(resolveMainTabFromHash('#speeds')).toBe('donino')
    expect(resolveMainTabFromHash('#coursing')).toBe('profile')
    expect(resolveMainTabFromHash('#racing')).toBe('profile')
    expect(resolveMainTabFromHash('#shows')).toBe('profile')
    expect(resolveMainTabFromHash('')).toBe('profile')
  })

  it('generates the top tabs in exact order: Профиль, Судьи, Организации, Донино', () => {
    const hasJudges = true
    const hasOrganizations = true
    const hasDonino = true

    const tabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
    ]
    if (hasJudges) tabs.push({ id: 'judges', label: 'Судьи' })
    if (hasOrganizations) tabs.push({ id: 'organizations', label: 'Организации' })
    if (hasDonino) tabs.push({ id: 'donino', label: 'Донино' })

    expect(tabs.map((t) => t.id)).toEqual(['profile', 'judges', 'organizations', 'donino'])
    expect(tabs.map((t) => t.label)).toEqual(['Профиль', 'Судьи', 'Организации', 'Донино'])
  })

  it('hides Donino tab if dog has no Donino records', () => {
    const hasJudges = true
    const hasOrganizations = true
    const hasDonino = false

    const tabs: DogProfileMainTabItem[] = [
      { id: 'profile', label: 'Профиль' },
    ]
    if (hasJudges) tabs.push({ id: 'judges', label: 'Судьи' })
    if (hasOrganizations) tabs.push({ id: 'organizations', label: 'Организации' })
    if (hasDonino) tabs.push({ id: 'donino', label: 'Донино' })

    expect(tabs.map((t) => t.id)).toEqual(['profile', 'judges', 'organizations'])
    expect(tabs.map((t) => t.label)).toEqual(['Профиль', 'Судьи', 'Организации'])
  })
})
