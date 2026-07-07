import { test, expect } from '@playwright/test'
import { expectNoHorizontalOverflow, expectNotNotFoundPage } from './helpers'

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  const pages = [
    { path: '/', name: 'home' },
    { path: '/judges', name: 'judges' },
    { path: '/speed-records', name: 'speed-records' },
    { path: '/competitions', name: 'competitions' },
    { path: '/guide', name: 'guide' },
  ] as const

  for (const { path, name } of pages) {
    test(`${name} loads without horizontal overflow`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveTitle(/Coursing Stats/)
      await expectNotNotFoundPage(page)
      await expectNoHorizontalOverflow(page)
    })
  }

  test('mobile nav menu opens', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Навигационное меню' }).click()
    await expect(page.locator('#mobile-menu')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Главная' })).toBeVisible()
  })
})
