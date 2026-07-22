import { test, expect } from '@playwright/test'
import { expectNoErrorTitle, expectNotNotFoundPage } from './helpers'
import { getTestData, type TestData } from './fixtures'

let testData: TestData

test.describe('Event Results Page', () => {
  test.beforeAll(async ({ request }) => {
    testData = await getTestData(request)
  })

  test('public /event URL redirects to statistics', async ({ page }) => {
    await page.goto('/event/999999999')
    await expect(page).toHaveURL(/\/competitions\?tab=ranking/)
    await expectNotNotFoundPage(page)
  })

  test('missing admin event shows error state', async ({ page }) => {
    await page.goto('/admin/event/999999999')
    await expectNotNotFoundPage(page)
    await expect(page.getByRole('heading', { name: 'Событие не найдено', level: 3 })).toBeVisible()
  })

  test('loads event with results when data exists', async ({ page }) => {
    test.skip(!testData.eventId, 'Нет событий в data/v1')

    await page.goto(`/admin/event/${testData.eventId}`)
    await expectNotNotFoundPage(page)
    await expectNoErrorTitle(page, 'Событие не найдено')

    if (testData.eventWithResults) {
      await expect(page.locator('.breed-section-card').first()).toBeVisible({ timeout: 15000 })
    }
  })
})
