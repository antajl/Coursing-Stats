import { test, expect } from '@playwright/test'
import { expectNoErrorTitle, expectNotNotFoundPage } from './helpers'
import { getTestData, type TestData } from './fixtures'

let testData: TestData

test.describe('Dog Profile Page', () => {
  test.beforeAll(async ({ request }) => {
    testData = await getTestData(request)
  })

  test('missing dog shows error state', async ({ page }) => {
    await page.goto('/dog/999999999')
    await expectNotNotFoundPage(page)
    await expect(page.getByRole('heading', { name: 'Собака не найдена', level: 3 })).toBeVisible()
  })

  test('loads real dog profile when data exists', async ({ page }) => {
    test.skip(!testData.dogId, 'No dogs in local D1 — run npm run sync-from-remote')

    await page.goto(`/dog/${testData.dogId}`)
    await expectNotNotFoundPage(page)
    await expectNoErrorTitle(page, 'Собака не найдена')
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 })
  })
})
