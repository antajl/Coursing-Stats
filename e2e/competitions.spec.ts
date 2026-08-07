import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage } from './helpers'

test.describe('Competitions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/competitions')
    await expectNotNotFoundPage(page)
  })

  test('page loads with ranking tab by default', async ({ page }) => {
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expect(page.locator('#tab-panel-ranking')).toBeVisible()
    await expect(page.getByRole('group', { name: 'Рейтинг курсинга' })).toBeVisible()
  })

  test('calendar tab is available in local nav dropdown only', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Меню раздела Соревнования' }).click()
    await expect(page.getByRole('link', { name: 'Календарь' }).first()).toBeVisible()
    await page.goto('/competitions?tab=ranking')
    await expect(page.getByRole('group', { name: 'Разделы соревнований' })).toHaveCount(0)
  })

  test('switches to judges tab via URL', async ({ page }) => {
    await page.goto('/competitions?tab=judges')
    await expect(page).toHaveURL(/tab=judges/)
    await expect(page.locator('#tab-panel-judges')).toBeVisible()
    await expect(page.getByPlaceholder(/фамилия/i)).toBeVisible()
  })

  test('calendar tab URL opens calendar in local dev', async ({ page }) => {
    await page.goto('/competitions?tab=calendar')
    await expect(page.locator('#tab-panel-calendar')).toBeVisible()
    await expect(page.locator('#tab-panel-ranking')).toHaveCount(0)
  })
})
