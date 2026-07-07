import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage } from './helpers'

test.describe('Speed Records Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/speed-records')
    await expectNotNotFoundPage(page)
  })

  test('page loads with both donino columns', async ({ page }) => {
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expect(page.getByText('Замер', { exact: true }).first()).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Бега 350 м', { exact: true }).first()).toBeVisible()
  })

  test('can switch to statistics view', async ({ page }) => {
    await page.getByRole('group', { name: 'Режим просмотра' }).getByRole('button', { name: 'Статистика' }).click()
    await expect(page).toHaveURL(/view=stats/)
  })
})
