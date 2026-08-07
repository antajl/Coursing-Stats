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

test.describe('Dark Theme — pages load', () => {
  test.use({ colorScheme: 'dark' })

  const pages = [
    '/',
    '/competitions?tab=ranking',
    '/competitions?tab=judges',
    '/speed-records',
    '/guide',
    '/dog/182',
  ] as const

  for (const path of pages) {
    test(`${path} stays in dark mode`, async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('theme', 'dark')
        document.documentElement.classList.add('dark')
      })
      await page.goto(path)
      await expectNotNotFoundPage(page)
      await expect(page.locator('html')).toHaveClass(/dark/)
    })
  }
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
