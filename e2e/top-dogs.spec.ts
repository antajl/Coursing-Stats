import { test, expect } from '@playwright/test'
import { expectNoErrorTitle, expectNotNotFoundPage } from './helpers'
import { getTestData, type TestData } from './fixtures'

let testData: TestData

test.describe('TopDogs Ranking', () => {
  test.beforeAll(async ({ request }) => {
    testData = await getTestData(request)
  })

  test('page loads successfully', async ({ page }) => {
    await page.goto('/competitions?tab=ranking')
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expectNotNotFoundPage(page)
    await expect(page.getByRole('group', { name: 'Рейтинг курсинга' })).toBeVisible()
  })

  test('legacy /top redirects to competitions ranking', async ({ page }) => {
    await page.goto('/top')
    await expect(page).toHaveURL(/\/competitions\?tab=ranking/)
    await expect(page.getByRole('group', { name: 'Рейтинг курсинга' })).toBeVisible()
  })

  test('shows dog cards when data exists', async ({ page }) => {
    test.skip(!testData.hasDb, 'Нет data/v1 — нужен checkout с данными')

    await page.goto('/competitions?tab=ranking')
    await expect(page.locator('a[href^="/dog/"]').first()).toBeVisible({ timeout: 15000 })
  })
})
