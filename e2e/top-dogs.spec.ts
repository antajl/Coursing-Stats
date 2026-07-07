import { test, expect } from '@playwright/test'
import { expectNoErrorTitle, expectNotNotFoundPage } from './helpers'
import { getTestData, type TestData } from './fixtures'

let testData: TestData

test.describe('TopDogs Ranking', () => {
  test.beforeAll(async ({ request }) => {
    testData = await getTestData(request)
  })

  test('page loads successfully', async ({ page }) => {
    await page.goto('/top')
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expectNotNotFoundPage(page)
    await expect(page.getByRole('group', { name: 'Тип рейтинга' })).toBeVisible()
  })

  test('shows dog cards when data exists', async ({ page }) => {
    test.skip(!testData.hasDb, 'Local D1 empty — run npm run sync-from-remote')

    await page.goto('/top')
    await expect(page.locator('a[href^="/dog/"]').first()).toBeVisible({ timeout: 15000 })
  })
})
