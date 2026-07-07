import { test, expect } from '@playwright/test'
import { expectNoHorizontalOverflow, expectNotNotFoundPage } from './helpers'

test.describe('Home Page — desktop', () => {
  test('hero and upcoming events are visible', async ({ page }) => {
    await page.goto('/')
    await expectNotNotFoundPage(page)

    await expect(page.locator('.hero-intro h1')).toContainText('бегов борзых')
    await expect(page.locator('.hero-events')).toBeVisible()
    await expect(page.getByText('Ближайшие события')).toBeVisible()
  })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    await expectNoHorizontalOverflow(page)
  })
})

test.describe('Home Page — mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('hero fits viewport without horizontal scroll', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('.hero-intro h1')).toBeVisible()
    await expect(page.locator('.hero-events')).toBeVisible()
    await expectNoHorizontalOverflow(page)

    const heroIntroBox = await page.locator('.hero-intro').boundingBox()
    const heroEventsBox = await page.locator('.hero-events').boundingBox()
    const viewport = page.viewportSize()
    expect(heroIntroBox).not.toBeNull()
    expect(heroEventsBox).not.toBeNull()
    if (heroIntroBox && heroEventsBox && viewport) {
      expect(heroIntroBox.x + heroIntroBox.width).toBeLessThanOrEqual(viewport.width + 1)
      expect(heroEventsBox.x + heroEventsBox.width).toBeLessThanOrEqual(viewport.width + 1)
    }
  })
})
