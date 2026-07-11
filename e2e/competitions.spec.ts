import { test, expect } from '@playwright/test'
import { competitionsSegment, expectNotNotFoundPage } from './helpers'

test.describe('Competitions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/competitions')
    await expectNotNotFoundPage(page)
  })

  test('page loads with ranking tab by default', async ({ page }) => {
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expect(competitionsSegment(page).getByRole('button', { name: 'Рейтинг' })).toBeVisible()
    await expect(page.locator('#tab-panel-ranking')).toBeVisible()
    await expect(page.getByRole('group', { name: 'Рейтинг курсинга' })).toBeVisible()
  })

  test('does not show calendar tab', async ({ page }) => {
    await expect(competitionsSegment(page).getByRole('button', { name: 'Календарь' })).toHaveCount(0)
  })

  test('switches to judges tab', async ({ page }) => {
    await competitionsSegment(page).getByRole('button', { name: 'Судьи' }).click()
    await expect(page).toHaveURL(/tab=judges/)
    await expect(page.locator('#tab-panel-judges')).toBeVisible()
    await expect(page.getByPlaceholder(/фамилия/i)).toBeVisible()
  })

  test('legacy calendar tab URL opens ranking', async ({ page }) => {
    await page.goto('/competitions?tab=calendar')
    await expect(page.locator('#tab-panel-ranking')).toBeVisible()
    await expect(page.locator('#tab-panel-calendar')).toHaveCount(0)
  })
})
