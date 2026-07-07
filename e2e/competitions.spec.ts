import { test, expect } from '@playwright/test'
import { competitionsSegment, expectNotNotFoundPage } from './helpers'

test.describe('Competitions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/competitions')
    await expectNotNotFoundPage(page)
  })

  test('page loads with calendar tab by default', async ({ page }) => {
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expect(competitionsSegment(page).getByRole('button', { name: 'Календарь' })).toBeVisible()
    await expect(page.locator('#tab-panel-calendar')).toBeVisible()
  })

  test('switches to ranking tab', async ({ page }) => {
    await competitionsSegment(page).getByRole('button', { name: 'Рейтинг' }).click()
    await expect(page).toHaveURL(/tab=ranking/)
    await expect(page.locator('#tab-panel-ranking')).toBeVisible()
    await expect(page.getByRole('group', { name: 'Тип рейтинга' })).toBeVisible()
  })

  test('switches to judges tab', async ({ page }) => {
    await competitionsSegment(page).getByRole('button', { name: 'Судьи' }).click()
    await expect(page).toHaveURL(/tab=judges/)
    await expect(page.locator('#tab-panel-judges')).toBeVisible()
    await expect(page.getByPlaceholder(/фамилия/i)).toBeVisible()
  })
})
