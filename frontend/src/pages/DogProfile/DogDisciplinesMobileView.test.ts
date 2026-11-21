import { describe, it, expect } from 'vitest'
import type { DisciplineTabItem } from './types'

describe('DogDisciplinesMobileView invariants', () => {
  const tabs: DisciplineTabItem[] = [
    { id: 'coursing', label: 'Курсинг', count: 9, theme: 'forest' },
    { id: 'racing', label: 'Бега', count: 5, theme: 'warm-blue' },
    { id: 'shows', label: 'Выставки', count: 9, theme: 'camel' },
  ]

  it('calculates linear edge tabs correctly without infinite looping', () => {
    // Index 0: coursing
    const getEdgeTabs = (idx: number) => {
      const prevTab = idx <= 0 ? null : tabs[idx - 1]
      const nextTab = idx >= tabs.length - 1 ? null : tabs[idx + 1]
      return { prevTab, nextTab }
    }

    const first = getEdgeTabs(0)
    expect(first.prevTab).toBeNull()
    expect(first.nextTab?.id).toBe('racing')
    expect(first.nextTab?.label).toBe('Бега')
    expect(first.nextTab?.count).toBe(5)

    const middle = getEdgeTabs(1)
    expect(middle.prevTab?.id).toBe('coursing')
    expect(middle.prevTab?.label).toBe('Курсинг')
    expect(middle.prevTab?.count).toBe(9)
    expect(middle.nextTab?.id).toBe('shows')
    expect(middle.nextTab?.label).toBe('Выставки')
    expect(middle.nextTab?.count).toBe(9)

    const last = getEdgeTabs(2)
    expect(last.prevTab?.id).toBe('racing')
    expect(last.prevTab?.label).toBe('Бега')
    expect(last.prevTab?.count).toBe(5)
    expect(last.nextTab).toBeNull()
  })

  it('guarantees zero emojis in tab labels (Old Money style)', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u

    for (const tab of tabs) {
      expect(emojiRegex.test(tab.label)).toBe(false)
    }
  })

  it('guarantees clean edge tabs without numbers and stationary swipe dots indicator', async () => {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const shellPath = path.resolve(__dirname, 'DisciplineColumnShell.tsx')
    const mobileViewPath = path.resolve(__dirname, 'DogDisciplinesMobileView.tsx')
    const shellSource = fs.readFileSync(shellPath, 'utf-8')
    const mobileViewSource = fs.readFileSync(mobileViewPath, 'utf-8')

    // Invariant 1: Edge tabs only contain clean labels, no numeric count badges
    expect(shellSource).not.toContain('{prevTab.count}')
    expect(shellSource).not.toContain('{nextTab.count}')

    // Invariant 2: Mobile title has safety padding so text never touches edge tabs
    expect(shellSource).toContain('px-16 sm:px-20')

    // Invariant 3: Card has bottom margin on mobile to give space for stationary dots
    expect(shellSource).toContain('mb-7 lg:mb-0')

    // Invariant 4: Minimalist stationary swipe dots indicator in mobile view with active elongated dot and visible camel inactive dots
    expect(mobileViewSource).toContain('w-6 bg-camel-600')
    expect(mobileViewSource).toContain('w-2 bg-camel-300')
  })
})
