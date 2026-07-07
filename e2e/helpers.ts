import { expect, type Page } from '@playwright/test'

/** Маршрут не попал на полноэкранный 404. */
export async function expectNotNotFoundPage(page: Page) {
  await expect(page.getByRole('heading', { name: 'Страница не найдена', level: 1 })).toHaveCount(0)
}

/** Нет блока ErrorState с указанным заголовком (h3). */
export async function expectNoErrorTitle(page: Page, title: string) {
  await expect(page.getByRole('heading', { name: title, level: 3 })).toHaveCount(0)
}

/** Нет горизонтальной прокрутки на уровне document. */
export async function expectNoHorizontalOverflow(page: Page) {
  const hasOverflow = await page.evaluate(() => {
    const root = document.documentElement
    return root.scrollWidth > root.clientWidth + 1
  })
  expect(hasOverflow).toBe(false)
}

export function competitionsSegment(page: Page) {
  return page.getByRole('group', { name: 'Разделы соревнований' })
}

export function guideSegment(page: Page) {
  return page.getByRole('group', { name: 'Разделы справочника' })
}

export function themeToggle(page: Page) {
  return page.getByRole('button', {
    name: /переключить на (светлую|тёмную) тему/i,
  })
}
