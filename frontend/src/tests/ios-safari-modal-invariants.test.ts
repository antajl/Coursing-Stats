import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('iOS Safari & Mobile Modal/Backdrop Invariants Audit', () => {
  const root = path.resolve(__dirname, '..')

  it('guarantees QuickSearchModal has iOS-friendly backdrop button and mobile close button', () => {
    const filePath = path.join(root, 'components/nav/QuickSearchModal.tsx')
    const source = fs.readFileSync(filePath, 'utf-8')

    // Backdrop button for WebKit click delegation
    expect(source).toContain('aria-label="Закрыть поиск"')
    expect(source).toContain('cursor-pointer')
    // Mobile close button in search bar
    expect(source).toContain('Закрыть')
    // Uses dvh for dynamic viewport handling
    expect(source).toContain('dvh')
  })

  it('guarantees NavMobile overlay has touch/pointer delegation for iOS Safari', () => {
    const filePath = path.join(root, 'components/nav/NavMobile.tsx')
    const source = fs.readFileSync(filePath, 'utf-8')

    expect(source).toContain('role="button"')
    expect(source).toContain('cursor-pointer')
    expect(source).toContain('touch-manipulation')
    expect(source).toContain('onClick={onCloseMobileMenu}')
  })

  it('guarantees all ProtocolBuilder portals use clickable buttons for backdrop dismissal', () => {
    const portalDir = path.join(root, 'pages/ProtocolBuilder/portals')
    const files = fs.readdirSync(portalDir).filter((f) => f.endsWith('.tsx'))

    for (const file of files) {
      const source = fs.readFileSync(path.join(portalDir, file), 'utf-8')
      // No raw <div className="fixed inset-0" onClick={...} />
      expect(source).not.toMatch(/<div[^>]*fixed inset-0[^>]*onClick/i)
      // Must use button with cursor-pointer
      expect(source).toMatch(/<button[^>]*fixed inset-0[^>]*cursor-pointer/i)
    }
  })

  it('guarantees Toolbar filters and select dropdown backdrops have cursor-pointer and touch-manipulation', () => {
    const filtersPath = path.join(root, 'components/toolbar/ToolbarFiltersDropdown.tsx')
    const filtersSource = fs.readFileSync(filtersPath, 'utf-8')
    expect(filtersSource).toContain('fixed inset-0 z-40 bg-charcoal-900/40 md:hidden cursor-pointer touch-manipulation')

    const selectPath = path.join(root, 'components/toolbar/ToolbarSelectDropdown.tsx')
    const selectSource = fs.readFileSync(selectPath, 'utf-8')
    expect(selectSource).toContain('fixed inset-0 z-40 bg-charcoal-900/40 md:hidden cursor-pointer touch-manipulation')
  })

  it('guarantees NotFound 404 page provides a reachable "На главную" navigation button', () => {
    const notFoundPath = path.join(root, 'pages/NotFound.tsx')
    const source = fs.readFileSync(notFoundPath, 'utf-8')

    expect(source).toContain('Link')
    expect(source).toContain('to="/"')
    expect(source).toContain('На главную')
    expect(source).toContain('min-h-[44px]')
  })

  it('guarantees FavoritesCapsule closes on outside click with useClickOutside', () => {
    const favPath = path.join(root, 'components/nav/FavoritesCapsule.tsx')
    const source = fs.readFileSync(favPath, 'utf-8')

    expect(source).toContain('useClickOutside')
    expect(source).toContain('containerRef')
  })

  it('guarantees HomeDogSearch handles touchstart for mobile dismissal', () => {
    const searchPath = path.join(root, 'components/HomeDogSearch.tsx')
    const source = fs.readFileSync(searchPath, 'utf-8')

    expect(source).toContain("document.addEventListener('touchstart'")
    expect(source).toContain("document.removeEventListener('touchstart'")
  })

  it('guarantees index.html has viewport-fit=cover, telephone format-detection disabled, and Apple web app meta tags', () => {
    const indexPath = path.resolve(root, '../index.html')
    const source = fs.readFileSync(indexPath, 'utf-8')

    expect(source).toContain('viewport-fit=cover')
    expect(source).toContain('format-detection')
    expect(source).toContain('telephone=no')
    expect(source).toContain('apple-mobile-web-app-capable')
  })

  it('guarantees global CSS prevents tap highlight flash, landscape text inflation, and mobile input auto-zoom', () => {
    const cssPath = path.join(root, 'index.css')
    const source = fs.readFileSync(cssPath, 'utf-8')

    expect(source).toContain('-webkit-tap-highlight-color: transparent')
    expect(source).toContain('-webkit-text-size-adjust: 100%')
    expect(source).toContain('touch-action: manipulation')
    expect(source).toContain('font-size: 16px !important')
  })

  it('guarantees ToolbarSelectDropdown respects safe-area-inset-bottom and App uses min-h-dvh', () => {
    const selectPath = path.join(root, 'components/toolbar/ToolbarSelectDropdown.tsx')
    const selectSource = fs.readFileSync(selectPath, 'utf-8')
    expect(selectSource).toContain('env(safe-area-inset-bottom)')

    const appPath = path.join(root, 'App.tsx')
    const appSource = fs.readFileSync(appPath, 'utf-8')
    expect(appSource).toContain('min-h-dvh')
  })
})
