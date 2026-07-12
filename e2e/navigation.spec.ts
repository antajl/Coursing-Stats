import { test, expect } from '@playwright/test'
import {
  competitionsSegment,
  expectNoErrorTitle,
  expectNoHorizontalOverflow,
  expectNotNotFoundPage,
  themeToggle,
} from './helpers'
import { getTestData, type TestData } from './fixtures'

test.describe('Navigation', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Coursing Stats/)
    await expectNotNotFoundPage(page)
  })

  test('can navigate to competitions page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /соревнован/i }).first().click()
    await expect(page).toHaveURL('/competitions')
    await expect(competitionsSegment(page)).toBeVisible()
  })

  test('can open ranking tab on competitions', async ({ page }) => {
    await page.goto('/competitions')
    await competitionsSegment(page).getByRole('button', { name: 'Рейтинг' }).click()
    await expect(page).toHaveURL(/tab=ranking/)
    await expect(page.getByRole('group', { name: 'Рейтинг курсинга' })).toBeVisible()
  })

  test('can navigate to judges page', async ({ page }) => {
    await page.goto('/judges')
    await expect(page).toHaveURL('/judges')
    await expect(page.getByPlaceholder(/фамилия/i)).toBeVisible()
  })

  test('can navigate to speed records page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /курсинг донино|донино/i }).first().click()
    await expect(page).toHaveURL('/speed-records')
    await expect(page.getByText('Замер', { exact: true }).first()).toBeVisible()
  })

  test('can navigate to guide from nav', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /справка/i }).click()
    await expect(page).toHaveURL('/guide')
    await expect(page.getByRole('heading', { name: 'Справочник' })).toBeVisible()
  })
})
