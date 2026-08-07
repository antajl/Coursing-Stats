import { test, expect } from '@playwright/test'
import { expectNoHorizontalOverflow, expectNotNotFoundPage } from './helpers'

test.describe('Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  const pages = [
    { path: '/', name: 'home' },
    { path: '/competitions?tab=ranking', name: 'competitions-ranking' },
    { path: '/competitions?tab=judges', name: 'judges' },
    { path: '/competitions?tab=calendar', name: 'competitions-calendar' },
    { path: '/shows?tab=ranking', name: 'shows-ranking' },
    { path: '/shows?tab=judges', name: 'shows-judges' },
    { path: '/shows?tab=calendar', name: 'shows-calendar' },
    { path: '/speed-records', name: 'speed-records' },
    { path: '/speed-records?view=stats', name: 'speed-records-stats' },
    { path: '/guide', name: 'guide' },
    { path: '/dog/182', name: 'dog-profile' },
    { path: '/judges/%D0%9A%D0%B0%D1%80%D0%B5%D0%BB%D0%B8%D0%BD%D0%B0%20%D0%9D.%D0%92.', name: 'judge-detail' },
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
