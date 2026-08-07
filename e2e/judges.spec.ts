import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage } from './helpers'
import { getTestData, type TestData } from './fixtures'

let testData: TestData

test.describe('Judges Page', () => {
  test.beforeAll(async ({ request }) => {
    testData = await getTestData(request)
  })

  test.beforeEach(async ({ page }) => {
    await page.goto('/competitions?tab=judges')
    await expectNotNotFoundPage(page)
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Coursing Stats/)
  })

  test('legacy /judges redirects to competitions judges tab', async ({ page }) => {
    await page.goto('/judges')
    await expect(page).toHaveURL(/\/competitions\?tab=judges/)
    await expect(page.getByPlaceholder(/фамилия/i)).toBeVisible()
  })

  test('search input is present and functional', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/фамилия/i)
    await expect(searchInput).toBeVisible()
    await searchInput.fill('тест')
    await expect(searchInput).toHaveValue('тест')
    await searchInput.clear()
  })

  test('shows judge cards when data exists', async ({ page }) => {
    test.skip(!testData.judgeId, 'Нет судей в data/v1')
    await expect(page.locator('a[href^="/judges/"]').first()).toBeVisible({ timeout: 15000 })
  })

  test('can open judge detail page', async ({ page }) => {
    test.skip(!testData.judgeId, 'Нет судей в data/v1')

    await expect(page.locator(`a[href="/judges/${encodeURIComponent(testData.judgeId!)}"]`).first()).toBeVisible({
      timeout: 15000,
    })
    await page.locator(`a[href="/judges/${encodeURIComponent(testData.judgeId!)}"]`).first().click()
    await expect(page).toHaveURL(new RegExp(`/judges/${encodeURIComponent(testData.judgeId!)}`))
    if (testData.judgeName) {
      await expect(page.getByText(testData.judgeName, { exact: false }).first()).toBeVisible()
    }
  })

  test('can navigate to home page', async ({ page }) => {
    await page.getByRole('link', { name: /coursing stats/i }).first().click()
    await expect(page).toHaveURL('/')
  })
})
