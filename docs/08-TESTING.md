# Testing — Тестирование

## Unit тесты

### Парсеры
```bash
npm run test-parser-fixtures
```
Smoke-скрипт на фикстурах из `backend/tests/fixtures/`.

Golden assertions (scores / judges / counts) — в vitest:
```bash
npx vitest run backend/tests/parser-fixtures.test.ts
```

### Backend API
```bash
npm run test
```
Запускает vitest тесты из `backend/tests/`.

### Ручная проверка API
```bash
npm run smoke-api
```
Проверяет основные endpoints API (требует запущенный `npm run dev`).

## E2E тесты (Playwright)

### E2E с проверкой реальных профилей/событий

Нужны файлы в `data/v1/` (обычно уже в репозитории после clone):

```bash
npm run test:e2e
```

Без данных в `data/v1/` тесты на «дым» (title, 404, навигация) проходят; тесты с `test.skip(!testData…)` пропускаются.

### Запуск

```bash
npm run test:e2e
```
Автоматически запускает `npm run dev` (local-dev-server :8787 + Vite :5173, `data/v1/`).

```bash
npm run test:e2e:ui
```
Интерактивный Playwright UI.

### Структура

| Файл | Покрытие |
|------|----------|
| `e2e/helpers.ts` | Общие проверки (404, overflow, сегменты) |
| `e2e/fixtures.ts` | ID события/собаки/судьи из API `127.0.0.1:8787` |
| `e2e/home.spec.ts` | Hero, ближайшие события, overflow 375px |
| `e2e/guide.spec.ts` | `/guide`, вкладки справочника |
| `e2e/navigation.spec.ts` | Навигация по разделам |
| `e2e/competitions.spec.ts` | Раздел «Статистика»: рейтинг (default) и судьи, без календаря |
| `e2e/top-dogs.spec.ts` | `/top`, карточки собак |
| `e2e/judges.spec.ts` | Поиск, карточки, детальная страница |
| `e2e/speed-records.spec.ts` | Донино: колонки, режим статистики |
| `e2e/dog-profile.spec.ts` | Профиль собаки, error state |
| `e2e/event-results.spec.ts` | Редирект `/event/:id`; протоколы на `/admin/event/:id` (dev) |
| `e2e/mobile.spec.ts` | 375px, overflow, бургер-меню |
| `e2e/dark-theme.spec.ts` | Переключатель темы (desktop + mobile) |

### CI

Workflow `.github/workflows/e2e.yml`:
- `npm ci` + Playwright chromium
- `npm run test:e2e` с `CI=true` (данные из checkout `data/v1/`)

Workflow `.github/workflows/deploy-frontend.yml` (после `build-all-data`):
- `npx vitest run backend/tests/static-indexes.test.ts` — индексы не пустые (рейтинг, судьи)
- `npx vitest run backend/tests/breedarchive.test.ts` — маппинг пород, URL builder, exact match поиска (mock fetch)

### Добавление новых тестов

```typescript
import { test, expect } from '@playwright/test'
import { expectNotNotFoundPage } from './helpers'

test.describe('Page Name', () => {
  test('example', async ({ page }) => {
    await page.goto('/your-page')
    await expectNotNotFoundPage(page)
    // содержимое, не только title
  })
})
```

**Не полагайтесь только на** `toHaveTitle(/Coursing Stats/)` — 404 и error state тоже содержат этот title.

## Фикстуры парсеров

```bash
npm run download-fixtures
```

Структура: `backend/tests/fixtures/{coursing,bzmp,racing}/`
