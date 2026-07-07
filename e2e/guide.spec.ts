import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage, guideSegment } from './helpers'

test.describe('Guide Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guide')
    await expectNotNotFoundPage(page)
  })

  test('loads with default titles tab', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Справочник', level: 1 })).toBeVisible()
    await expect(page.getByText('Официальные источники')).toBeVisible()
  })

  test('switches to protocol tab', async ({ page }) => {
    await guideSegment(page).getByRole('button', { name: 'Протоколы' }).click()
    await expect(page).toHaveURL(/tab=protocol/)
    await expect(page.getByText('Ключевая норма для титула')).toBeVisible()
  })

  test('switches to site tab', async ({ page }) => {
    await guideSegment(page).getByRole('button', { name: 'О сайте' }).click()
    await expect(page).toHaveURL(/tab=site/)
    await expect(page.getByText('Что такое Coursing Stats')).toBeVisible()
  })
})
