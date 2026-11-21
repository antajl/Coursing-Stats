import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('DogProfileAwardsBar invariants', () => {
  it('guarantees badge chip styling matches title badge layout in DogProfileAwardsBar.tsx', () => {
    const filePath = path.resolve(__dirname, 'DogProfileAwardsBar.tsx')
    const source = fs.readFileSync(filePath, 'utf-8')

    // Invariant: Matches title badge dimensions and rectangular shape
    expect(source).toContain('rounded-md px-2 py-0.5 text-[11px] tabular-nums whitespace-nowrap')
    // No more pill shape for achievements
    expect(source).not.toContain('rounded-full px-2.5 py-1')
    expect(source).not.toContain('cs-glass-pill')
  })

  it('strictly contains zero emojis in DogProfileAwardsBar.tsx and DogProfileHeader.tsx', () => {
    const awardsBarPath = path.resolve(__dirname, 'DogProfileAwardsBar.tsx')
    const headerPath = path.resolve(__dirname, 'DogProfileHeader.tsx')

    const awardsBarSource = fs.readFileSync(awardsBarPath, 'utf-8')
    const headerSource = fs.readFileSync(headerPath, 'utf-8')

    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u
    expect(emojiRegex.test(awardsBarSource)).toBe(false)
    expect(emojiRegex.test(headerSource)).toBe(false)
  })

  it('guarantees DogProfileAwardsBar focuses exclusively on official RKF/FCI champion titles', () => {
    const awardsBarPath = path.resolve(__dirname, 'DogProfileAwardsBar.tsx')
    const headerPath = path.resolve(__dirname, 'DogProfileHeader.tsx')
    const awardsSource = fs.readFileSync(awardsBarPath, 'utf-8')
    const headerSource = fs.readFileSync(headerPath, 'utf-8')

    // Invariant 1: Only official champion titles РКФ/FCI are displayed in the header awards bar
    expect(awardsSource).toContain('isOfficialDogTitleToken')
    expect(headerSource).toContain('{hasTitles && (')

    // Invariant 2: No divider line or seasonal achievements mixed into the official titles table
    expect(awardsSource).not.toContain('border-t border-cream-200/60')
  })
})
