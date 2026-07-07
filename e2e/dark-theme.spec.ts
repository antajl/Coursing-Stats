import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage, themeToggle } from './helpers'

test.describe('Dark Theme — desktop', () => {
  test('can toggle dark theme', async ({ page }) => {
    await page.goto('/')
    await expectNotNotFoundPage(page)

    const toggle = themeToggle(page).first()
    await expect(toggle).toBeVisible()

    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await toggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('page loads with default light theme', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})

test.describe('Dark Theme — mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('theme toggle works in mobile header', async ({ page }) => {
    await page.goto('/')
    const toggle = themeToggle(page).first()
    await expect(toggle).toBeVisible()

    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await toggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})
