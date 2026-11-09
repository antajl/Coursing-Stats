import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { DogProfileHeader } from './DogProfileHeader'

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
})
