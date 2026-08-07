import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage } from './helpers'

test.describe('Guide Page', () => {
  test('loads with default titles tab', async ({ page }) => {
    await page.goto('/guide')
    await expectNotNotFoundPage(page)
    await expect(page).toHaveURL(/\/guide(?:\?|$)/)
    await expect(page.getByText('Официальные источники')).toBeVisible()
  })

  test('opens shows section via URL', async ({ page }) => {
    await page.goto('/guide?tab=shows')
    await expectNotNotFoundPage(page)
    await expect(page).toHaveURL(/tab=shows/)
    await expect(page.getByText(/Иерархия наград/)).toBeVisible()
  })

  test('opens protocol section via URL', async ({ page }) => {
    await page.goto('/guide?tab=protocol')
    await expectNotNotFoundPage(page)
    await expect(page).toHaveURL(/tab=protocol/)
    await expect(page.getByText('Ключевая норма для титула')).toBeVisible()
  })

  test('opens site section via URL', async ({ page }) => {
    await page.goto('/guide?tab=site')
    await expectNotNotFoundPage(page)
    await expect(page).toHaveURL(/tab=site/)
    await expect(page.getByText('Что такое Coursing Stats')).toBeVisible()
  })
})
