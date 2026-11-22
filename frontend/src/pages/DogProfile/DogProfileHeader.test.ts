import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { DogProfileHeader } from './DogProfileHeader'
import { DogAchievementsTab } from './DogAchievementsTab'

describe('DogProfileHeader Lightbox mobile & iOS Safari invariants', () => {
  it('exports DogProfileHeader component', () => {
    expect(typeof DogProfileHeader).toBe('function')
  })

  it('guarantees iOS Safari touch-proof backdrop button and safe area positioning', () => {
    const filePath = path.resolve(__dirname, 'DogProfileHeader.tsx')
    const source = fs.readFileSync(filePath, 'utf-8')

    // 1. Invariant: Fullscreen clickable backdrop button exists for iOS Safari WebKit click delegation
    expect(source).toContain('aria-label="Закрыть фото"')
    expect(source).toContain('tabIndex={-1}')
    expect(source).toContain('className="absolute inset-0 h-full w-full cursor-pointer bg-transparent border-none p-0 -z-10 focus:outline-hidden"')

    // 2. Invariant: Fixed close button respects Safe Area on iPhone (no negative -top-12 offsets outside viewport)
    expect(source).not.toContain('-top-12')
    expect(source).toContain('env(safe-area-inset-top')
    expect(source).toContain('env(safe-area-inset-right')

    // 3. Invariant: WCAG AA & Old Money touch target is at least 44x44px
    expect(source).toContain('min-h-[44px] min-w-[44px]')

    // 4. Invariant: Dynamic viewport height (dvh) is used to prevent Safari address/toolbar clipping
    expect(source).toContain('dvh')

    // 5. Invariant: Heavy full-screen backdrop-blur-md is omitted to avoid WebKit GPU stalls on iOS ProMotion
    expect(source).not.toContain('backdrop-blur-md')
  })

  it('guarantees share button with native Web Share and clipboard fallback', () => {
    const filePath = path.resolve(__dirname, 'DogProfileHeader.tsx')
    const source = fs.readFileSync(filePath, 'utf-8')

    // Invariant: Share button exists with proper accessibility and Old Money styling
    expect(source).toContain('Поделиться')
    expect(source).toContain('handleShare')
    expect(source).toContain('navigator.share')
    expect(source).toContain('navigator.clipboard')
    expect(source).toContain('min-h-[36px]')
  })

  it('guarantees dog passport button and modal integration', () => {
    const filePath = path.resolve(__dirname, 'DogProfileHeader.tsx')
    const source = fs.readFileSync(filePath, 'utf-8')

    expect(source).toContain('DogPassportModal')
    expect(source).toContain('passportData')
    expect(source).toContain('setIsPassportOpen')
    expect(source).toContain('Паспорт')
  })
})

describe('Dog Profile Navigation Tabs & Achievements Tab invariants', () => {
  it('exports DogAchievementsTab component', () => {
    expect(typeof DogAchievementsTab).toBe('function')
  })

  it('enforces Achievements tab between Profile and Judges and conditional Judges visibility', () => {
    const hookPath = path.resolve(__dirname, 'useDogProfileData.ts')
    const tabsPath = path.resolve(__dirname, 'useDogProfileTabs.ts')
    let hookSource = fs.readFileSync(hookPath, 'utf-8')
    if (fs.existsSync(tabsPath)) {
      hookSource += '\n' + fs.readFileSync(tabsPath, 'utf-8')
    }

    // 1. Achievements tab is strictly placed 2nd
    expect(hookSource).toContain("{ id: 'profile', label: 'Профиль' },")
    expect(hookSource).toContain("{ id: 'achievements', label: 'Достижения' },")

    // 2. Judges tab strictly requires coursing starts (no coursing = no judges tab)
    expect(hookSource).toContain('hasCoursingStarts')
    expect(hookSource).toContain("if (hasCoursingStarts && judgeStats && Array.isArray(judgeStats.judges)")

    // 3. Organizations tab strictly requires valid competition starts
    expect(hookSource).toContain('if (hasValidCompetitionStarts)')

    // 4. Fallback safe check when active tab is not in mainTabs
    expect(hookSource).toContain("if (mainTabs.length > 0 && !mainTabs.some((t) => t.id === activeMainTab))")
    expect(hookSource).toContain("setActiveMainTab('profile')")
  })

  it('guarantees zero emojis in DogAchievementsTab in accordance with Old Money design', () => {
    const achievementsPath = path.resolve(__dirname, 'DogAchievementsTab.tsx')
    const achievementsDir = path.resolve(__dirname, 'Achievements')
    let achievementsSource = fs.readFileSync(achievementsPath, 'utf-8')
    if (fs.existsSync(achievementsDir)) {
      const files = fs.readdirSync(achievementsDir).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
      for (const file of files) {
        achievementsSource += '\n' + fs.readFileSync(path.join(achievementsDir, file), 'utf-8')
      }
    }

    // Invariant: strictly zero emojis
    // Check against standard emoji ranges
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    expect(emojiRegex.test(achievementsSource)).toBe(false)

    // Key sections must exist
    expect(achievementsSource).toContain('В шаге от титула')
    expect(achievementsSource).toContain('Оформленные официальные чемпионские звания')
    expect(achievementsSource).toContain('Официальные сертификаты и квалификационные допуски')
    expect(achievementsSource).toContain('Достижения и рекорды в рейтинге CoursingStats')
  })
})
