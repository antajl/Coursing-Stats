# SEO Indexation (Google + Яндекс, RU) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать так, чтобы Google и Яндекс индексировали все публичные сущности сайта (рейтинги, календарь, результаты `/event/:id`, профили собак, судей спорта и выставок, выставки, Донино) с уникальными title/description/canonical и crawlable HTML — без переезда на Next.js.

**Architecture:** Остаёмся на Vite SPA + Cloudflare Pages. Источник правды — статический HTML из `yarn run prerender-seo` после `frontend build`. Критичный фикс: SPA-fallback больше не должен отдавать meta/canonical главной. Sitemap собирается при `build-all-data` из тех же индексов, что читает UI. Клиентский `SEO`/`JsonLd` остаётся для гидрации и соцпревью после загрузки JS.

**Tech Stack:** Vite, React 19, `react-helmet-async`, Cloudflare Pages `_redirects`, `backend/scripts/seo/prerender-*.ts`, `backend/scripts/build-derived/sitemap.ts`, vitest, yarn@1.22.22.

## Global Constraints

- Не деплоить Worker runtime для публичных данных; CDN `/data/v1` остаётся источником.
- Не мерджить medals и CS points в SEO-текстах; писать раздельно.
- Три домена: соревнования / выставки / Донино — не путать id в URL и текстах.
- PowerShell: команды через `;`, не `&&`.
- Коммиты только по явной просьбе пользователя.
- Cloudflare Pages: static file (`/path/index.html`) имеет приоритет над SPA fallback; fallback нужен для клиентских маршрутов без prerender.
- Лимит файлов Pages: не включать full dump show-only dogs (`PRERENDER_SHOW_ONLY`) без явного решения.
- Язык сниппетов и H1: русский; бренд в title: `| Coursing Stats` (бренд не русифицируем — см. Brand).
- Аккаунты уже есть: Яндекс.Вебмастер, Метрика, Google Search Console, GA — задачи ниже только настройка/проверка, не регистрация.

## Decisions (user 2026-08-09)

| Тема | Решение |
|------|---------|
| Объём | Сначала **всё основное** (хабы, собаки, судьи спорта, Донино, sitemap, spa-shell). |
| Спорт `/event` | Prerender **все** с `results_file` (~163), не только 2026 (~18). Это секунды, не часы. |
| Выставки | В sitemap — URL с реальным протоколом на сайте. Prerender — **все exhibition JSON**, которые реально открываются в UI (~5k файлов, ~десятки MB HTML, минуты CI — не «всё 9k строк календаря»). Календарные карточки без протокола **не** prerender. |
| Судьи выставок | Sitemap все (~2243). Prerender все, если CI/deploy ок; иначе cap 500 по `total_judged` и добить во 2-й итерации. |
| Ключевые слова (RU) | Ядро: курсинг, рейсинг, бега борзых, результаты, рекорды, статистика, награды, рейтинг + породы. В title/description — естественно, без stuffing. |
| Бренд | Оставить **Coursing Stats**. Левая часть title — по-русски и по сущности; справа бренд. |

### Почему «всё» по спорту недолго

| Пакет | Страниц | Оценка времени записи HTML | Доп. размер (shell ~5 KB) |
|-------|---------|----------------------------|---------------------------|
| Events all years | ~163 | < 5 с | ~1 MB |
| Sport judges | ~40 | < 1 с | ~0.2 MB |
| Donino | ~236 | < 5 с | ~1 MB |
| Exhibition protocols | ~5k | ~1–3 мин | ~25–40 MB |
| Show judges | ~2.2k | ~1 мин | ~10–15 MB |
| Dogs (уже есть) | ~2.5k | уже в CI | — |

Узкое место — **upload Cloudflare Pages**, не генерация. Календарь выставок 2024–2026 = 8–9k строк **не** равен числу страниц сайта: у большинства нет LC-протокола (в 2026 `has_lc_protocol` ≈ 34).

## GSC Coverage snapshot (экспорт 2026-08-09)

Источник: `D:\Downloads\coursing-stats.ru-Coverage-2026-08-09.zip`

**Диаграмма (на 2026-08-05):** не проиндексировано **1276**, проиндексировано **1500**, показы в этот день 7.  
Скачок индексации ~2026-07-10→11: 253 → 1311 проиндексированных (после появления большого sitemap/dogs).

**Критические причины:**

| Причина | Страниц | Комментарий для плана |
|---------|---------|------------------------|
| Обнаружена, не проиндексирована | **929** | Главный сигнал: URL в sitemap, Google не хочет индексировать (часто thin/JS/дубли). Лечится уникальным HTML + правильный canonical (Tasks 1, 3, 5–7). |
| Страница с переадресацией | 193 | Ожидаемо: `/top`, `/judges` list → `/competitions?tab=…`. Не тащить legacy в sitemap как приоритет. |
| Не найдено (404) | 141 | Разобрать после деплоя (старые id, битые ссылки). Отдельный follow-up, не блокер Tasks 1–5. |
| Просканирована, пока не проиндексирована | 6 | Очередь Google. |
| Canonical / soft 404 / noindex / duplicate | 1–4 | Мелочь; проверить после spa-shell fix. |

**Метаданные:** Sitemap = «Все обработанные страницы» — sitemap Google уже съел; проблема не в «не отправили», а в качестве/уникальности URL.

## Brand

Проблемы в `| Coursing Stats` нет. Для RU-аудитории важнее **русская левая часть** («Результаты…», «Рейтинг уиппетов…»), а не перевод бренда. «Курсинг Статс» выглядит хуже. Выставки уже отражать в hub title/description («курсинг, бега и выставки РКФ»), не переименовывая бренд.

## Scope snapshot (проверено 2026-08-09)

| Сущность | URL | В sitemap сейчас | Prerender HTML сейчас | Порядок величины |
|----------|-----|------------------|------------------------|------------------|
| Хабы | `/`, `/competitions`, `/shows`, `/speed-records`, `/guide` | да | да | 5 |
| Собаки спорта | `/dog/:id` | да (~2551) | да | ~2.5k |
| Судьи спорта | `/judges/:judgeId` | да (~44) | **нет** | ~40 |
| Донино | `/donino-dog/:name/:breed` | да (~236) | **нет** | ~236 |
| Результаты | `/event/:id` | **0** | **нет** | ~163 с `results_file` в `events-by-id.json` |
| Выставки | `/shows/exhibition/:id` | **0** | **нет** + нет `<SEO>` в page | ~тысячи (источник URL = календарь UI) |
| Судьи выставок | `/shows/judges/:id` | **0** | **нет** (есть клиентский SEO) | ~2243 |
| Auth/admin | `/login`, `/admin`, … | не должно быть | noindex | — |

**Прод-баг:** `/event/*`, `/judges/*`, `/donino-dog/*`, `/shows/exhibition/*` отдают HTML главной (title/description/canonical → `https://coursing-stats.ru/`).

---

### Task 1: Neutral SPA shell + отдельный home prerender (критичный canonical-fix)

**Files:**
- Modify: `frontend/public/_redirects`
- Modify: `backend/scripts/seo/prerender-pages.ts`
- Modify: `backend/scripts/seo/prerender-html.ts` (OG helpers — можно начать здесь или в Task 4)
- Test: `backend/tests/prerender-seo.test.ts`
- Create: `backend/tests/spa-fallback-redirects.test.ts` (проверка содержимого `_redirects` как текста)

**Interfaces:**
- Consumes: существующий `HUB_PAGES`, `applyMetaToSpaShell`
- Produces: `frontend/dist/spa-shell.html` (нейтральный shell без canonical на `/`); `frontend/dist/index.html` = prerender главной; `_redirects` правило `/* /spa-shell.html 200` **после** исключений для статики

**Problem:** Сейчас `prerenderHubs` пишет home в `dist/index.html`, а `/* /index.html 200` отдаёт этот файл на все неизвестные URL → ложный canonical на главную.

- [ ] **Step 1: Write failing test for redirects file**

```ts
// backend/tests/spa-fallback-redirects.test.ts
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const redirects = path.resolve(__dirname, '../../frontend/public/_redirects')

describe('SPA fallback redirects', () => {
  it('falls back to spa-shell.html, not index.html', () => {
    const text = fs.readFileSync(redirects, 'utf8')
    expect(text).toMatch(/\/\* \/spa-shell\.html 200/)
    expect(text).not.toMatch(/\/\* \/index\.html 200/)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run backend/tests/spa-fallback-redirects.test.ts`
Expected: FAIL — правило ещё на `index.html`

- [ ] **Step 3: Update `_redirects`**

Заменить SPA fallback на:

```
# Static bot banners (Telegram sendPhoto) — must not fall through to SPA
/bot/* /bot/:splat 200

# BIMI logo
/bimi/* /bimi/:splat 200
/.well-known/bimi/* /.well-known/bimi/:splat 200

# Client routes without a prerendered /path/index.html
/* /spa-shell.html 200
```

- [ ] **Step 4: Change prerender CLI**

В `prerender-pages.ts`:
1. Прочитать Vite `dist/index.html` **до** патча home → сохранить как `dist/spa-shell.html`.
2. В `spa-shell.html` гарантировать: нет `<link rel="canonical">` на home; title/description = общий сайтный дефолт из `frontend/index.html` (не H1 «главная» в `#root`).
3. Затем как сейчас патчить home в `dist/index.html`.

Псевдокод:

```ts
const spaHtml = fs.readFileSync(DIST_INDEX, 'utf8')
writeHtml(path.join(DIST, 'spa-shell.html'), spaHtml) // neutral copy first
// then prerenderHubs(spaHtml) which overwrites DIST_INDEX for `/`
```

- [ ] **Step 5: Extend unit test**

Добавить в `prerender-seo.test.ts` кейс: shell без home-canonical; home HTML с canonical `/`.

- [ ] **Step 6: Run tests**

Run: `npx vitest run backend/tests/spa-fallback-redirects.test.ts backend/tests/prerender-seo.test.ts`
Expected: PASS

- [ ] **Step 7: Manual local check after build+prerender**

```powershell
cd frontend; yarn run build
cd ..; yarn run prerender-seo
# curl.exe file:// не всегда удобен — проверить файлы:
Select-String -Path frontend/dist/spa-shell.html -Pattern 'canonical'
Select-String -Path frontend/dist/index.html -Pattern 'canonical'
Test-Path frontend/dist/competitions/index.html
```

Expected: `spa-shell` без home-canonical (или без canonical); `index.html` с `https://coursing-stats.ru/`; `/competitions/index.html` существует.

- [ ] **Step 8: Commit** (только если пользователь просит)

```bash
git add frontend/public/_redirects backend/scripts/seo/prerender-pages.ts backend/tests/spa-fallback-redirects.test.ts backend/tests/prerender-seo.test.ts
git commit -m "fix(seo): SPA fallback uses neutral shell instead of home HTML"
```

---

### Task 2: Static `robots.txt`

**Files:**
- Create: `frontend/public/robots.txt`
- Modify: `backend/tests/static-indexes.test.ts` (или новый `backend/tests/robots-txt.test.ts`)

**Interfaces:**
- Produces: публичный `https://coursing-stats.ru/robots.txt` с `Content-Type: text/plain`

- [ ] **Step 1: Write failing existence test**

```ts
it('robots.txt exists in frontend/public', () => {
  expect(fs.existsSync(path.join(ROOT, 'frontend/public/robots.txt'))).toBe(true)
})
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Create `frontend/public/robots.txt`**

```txt
User-agent: *
Allow: /

Disallow: /admin
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /account
Disallow: /forgot-password
Disallow: /reset-password
Disallow: /verify-email

Sitemap: https://coursing-stats.ru/sitemap.xml
```

Не блокировать `/assets/`, `/data/`, JS/CSS — иначе Яндекс/Google не смогут рендерить.

- [ ] **Step 4: Run test — PASS**

- [ ] **Step 5: Commit** (по просьбе)

```bash
git commit -m "feat(seo): add robots.txt for Google and Yandex crawlers"
```

---

### Task 3: Expand sitemap (events, exhibitions, show judges) + sitemap index if needed

**Files:**
- Modify: `backend/scripts/build-derived/sitemap.ts`
- Modify: `backend/scripts/build-show-indexes.ts` (сейчас только append show-only `/dog/` — согласовать, чтобы не дублировать логику)
- Optional: `frontend/public/sitemap.xml` генерируется в build; при >50k URL — `sitemap-index.xml` + чанки (сейчас ~3–10k → один файл ок)
- Test: `backend/tests/sitemap-build.test.ts` (новый) на чистых фикстурах или на существующих indexes с skipIfMissing

**Interfaces:**
- Consumes:
  - `data/v1/indexes/events-by-id.json` → `/event/{id}` только если `results_file` или `has_results`
  - `data/v1/indexes/judges-summary.json` → `/judges/{encodeURIComponent(name or id)}` (как в UI `JudgeDetail`)
  - show calendar source, который использует UI для ссылок (`lc_exhibition_id` / `id`) → `/shows/exhibition/{id}`
  - `data/v1/shows/indexes/judges.json` → `/shows/judges/{encodeURIComponent(id)}`
  - существующие dogs / donino
- Produces: `frontend/public/sitemap.xml` (+ опционально `data/v1/indexes/sitemap-urls.json` расширенный schema)

**URL rules (не выдумывать):**
- Event: ключ из `events-by-id.json` (пример `1250`), не calendar `YYYYMMDD`, если оба есть — в sitemap только id, по которому открывается протокол.
- Exhibition: только id, которые реально линкует календарь выставок.
- Show judge: `judge.id` как в `ShowJudgeDetail` canonical.

- [ ] **Step 1: Write failing test**

```ts
it('sitemap includes event, exhibition and show-judge locs when fixtures present', () => {
  // либо unit-тест чистой функции collectSitemapUrls(fixtures)
  const urls = collectSitemapUrls(fixtureIndexes)
  expect(urls.some((u) => u.startsWith('/event/'))).toBe(true)
  expect(urls.some((u) => u.startsWith('/shows/exhibition/'))).toBe(true)
  expect(urls.some((u) => u.startsWith('/shows/judges/'))).toBe(true)
  expect(urls.every((u) => !u.startsWith('/admin'))).toBe(true)
})
```

Вынести сбор URL в чистую функцию `collectSitemapUrls(...)` в `sitemap.ts` (или `sitemap-urls.ts`), XML — тонкая обёртка.

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement `collectSitemapUrls` + XML writer**

Приоритеты (ориентир):
- `/` 1.0, hubs 0.9–0.8
- `/event/:id` 0.7
- `/dog/:id` 0.6
- `/shows/exhibition/:id` 0.55
- judges / donino 0.5

`events: []` в `sitemap-urls.json` заполнить реальными путями.

- [ ] **Step 4: Wire into `build-derived-indexes` / show-index append**

Убедиться, что `build-all-data` → sitemap содержит новые типы. Show-only dog append не ломает XML.

- [ ] **Step 5: Run tests**

```powershell
npx vitest run backend/tests/sitemap-build.test.ts backend/tests/static-indexes.test.ts
```

- [ ] **Step 6: Local regenerate check**

```powershell
yarn run build-all-data
# или точечно: npx tsx backend/scripts/build-derived-indexes.ts
Select-String -Path frontend/public/sitemap.xml -Pattern '/event/' | Measure-Object
Select-String -Path frontend/public/sitemap.xml -Pattern '/shows/exhibition/' | Measure-Object
```

Expected: `/event/` > 0; exhibitions > 0; show judges > 0.

- [ ] **Step 7: Commit** (по просьбе)

```bash
git commit -m "feat(seo): include events, exhibitions and show judges in sitemap"
```

---

### Task 4: Prerender meta completeness (OG + JSON-LD) for existing hubs/dogs

**Files:**
- Modify: `backend/scripts/seo/prerender-html.ts` — `applyMetaToSpaShell`
- Modify: `frontend/src/components/SEO.tsx` — синхронизировать поведение (absolute canonical always)
- Test: `backend/tests/prerender-seo.test.ts`

**Interfaces:**
- Extends `ApplyMetaOptions` with optional `ogImage?: string`
- `applyMetaToSpaShell` MUST replace/insert:
  - `og:title`, `og:description`, `og:url`, `og:locale=ru_RU`
  - `twitter:title`, `twitter:description`
  - keep existing title/description/canonical/jsonLd/body

- [ ] **Step 1: Failing test — OG updated**

```ts
it('applyMetaToSpaShell updates og:title and og:description', () => {
  const shell = SPA_SHELL.replace(
    '</head>',
    '<meta property="og:title" content="Old OG" />\n<meta property="og:description" content="Old OD" />\n</head>',
  )
  const html = applyMetaToSpaShell(shell, {
    title: 'Новый title | Coursing Stats',
    description: 'Новое описание',
    canonicalUrl: 'https://coursing-stats.ru/dog/1',
    bodyHtml: '<main></main>',
  })
  expect(html).toContain('property="og:title" content="Новый title | Coursing Stats"')
  expect(html).toContain('property="og:description" content="Новое описание"')
  expect(html).toContain('property="og:url" content="https://coursing-stats.ru/dog/1"')
})
```

- [ ] **Step 2: Implement replace helpers for OG/Twitter**

- [ ] **Step 3: Fix relative canonical in `ShowDogProfile`**

Сейчас: `canonicalUrl={`/shows/dog/${showDogId}`}` — сделать абсолютный `https://coursing-stats.ru/...` (как в остальных страницах).

- [ ] **Step 4: Add missing canonical on EventResults + JudgeDetail**

```tsx
canonicalUrl={`https://coursing-stats.ru/event/${id}`}
// judges:
canonicalUrl={`https://coursing-stats.ru/judges/${encodeURIComponent(judgeId)}`}
```

- [ ] **Step 5: Tests PASS + Commit** (по просьбе)

---

### Task 5: Prerender events + sport judges + donino dogs (Phase A — всё основное по спорту)

**Scope lock:** все `/event/:id` с `results_file` (~163, все годы), не только 2026.

**Files:**
- Modify: `backend/scripts/seo/prerender-html.ts` — builders:
  - `buildEventBodyHtml`, `eventMetaFromIndex`
  - `buildJudgeBodyHtml`, `judgeMetaFromSummary`
  - `buildDoninoBodyHtml`, `doninoMetaFromRecord`
- Modify: `backend/scripts/seo/prerender-pages.ts` — `prerenderEvents`, `prerenderSportJudges`, `prerenderDoninoDogs`
- Test: `backend/tests/prerender-seo.test.ts`

**Interfaces:**
- Event source: `data/v1/indexes/events-by-id.json` + опционально чтение competition JSON для `result_count` / location
- Judge source: `data/v1/indexes/judges-summary.json` (поле `name` / `id` — как в роуте)
- Donino: те же пары name/breed, что sitemap
- Output paths:
  - `dist/event/{id}/index.html`
  - `dist/judges/{encodeURIComponent(id)}/index.html` (файловая система: безопасный encode; URL в canonical = UI URL)
  - `dist/donino-dog/{encodeURIComponent(name)}/{encodeURIComponent(breed)}/index.html`

**Copy templates (RU):**
- Event title: `{headline} — {date} | Coursing Stats`
- Event description: `Результаты: {kind} {date}, {location}. {n} участников. Протокол на Coursing Stats.`
- Event H1 + paragraph в `#root` + ссылки на `/competitions?tab=calendar` и 3–5 имён собак если есть
- Judge: `{name} — статистика судьи | Coursing Stats`
- Donino: `{name} ({breed}) — рекорды Донино | Coursing Stats`

- [ ] **Step 1: Unit tests for meta builders (fail first)**

- [ ] **Step 2: Implement builders**

- [ ] **Step 3: Wire CLI + log counts**

```
[prerender-seo] hubs=… dogs=… events=… judges=… donino=…
```

- [ ] **Step 4: Run prerender locally, spot-check**

```powershell
yarn run prerender-seo
Select-String -Path frontend/dist/event/*/index.html -Pattern '<title>' | Select-Object -First 3
```

Expected: title не главной; canonical `/event/...`.

- [ ] **Step 5: Commit** (по просьбе)

---

### Task 6: Exhibition pages — SEO component + prerender Phase B

**Files:**
- Modify: `frontend/src/pages/Shows/ShowExhibitionDetail.tsx` — добавить `<SEO>` + optional JsonLd BreadcrumbList
- Modify: `backend/scripts/seo/prerender-pages.ts` — `prerenderExhibitions`
- Data: show calendar indexes (тот же id, что `ShowCalendarRow`)

**Policy (user 2026-08-09):**
- Sitemap + prerender: только выставки, для которых на сайте есть открываемый протокол (UI id / `data/v1/shows/exhibitions/*`), **не** все 9k строк RKF-календаря без протокола.
- Default = all protocol pages (~5k). Если CI upload упрётся в лимит — временно `PRERENDER_EXHIBITION_YEARS=2026` или cap, sitemap при этом остаётся полным по протоколам.
- Не индексировать «пустые» calendar-only карточки без контента.

- [ ] **Step 1: Add client SEO on exhibition detail** (title/description/canonical) — даже до prerender помогает после JS; для Яндекса недостаточен один.

- [ ] **Step 2: Prerender subset with unique meta + H1 + short paragraph + link to `/shows`**

- [ ] **Step 3: Test + manual curl after deploy**

- [ ] **Step 4: Commit** (по просьбе)

---

### Task 7: Show judges prerender Phase C

**Files:**
- Modify: `backend/scripts/seo/prerender-pages.ts`
- Source: `data/v1/shows/indexes/judges.json` (`id` slug вроде `гаврилова|я|а`)

**Policy:**
- Default cap `PRERENDER_SHOW_JUDGES_MAX=500` (сортировка по `total_judged` desc)
- Sitemap: все (~2243)
- Full: `PRERENDER_SHOW_JUDGES_MAX=0` means unlimited (document in comment)

- [ ] **Step 1: Meta builder + tests**

- [ ] **Step 2: Write `dist/shows/judges/{id}/index.html`**

На Windows/CI: id содержит `|` — проверить, что Cloudflare принимает такие пути; если нет — обсудить encode стратегии **без смены публичного URL** (файл = encodeURIComponent, CF декодирует). Зафиксировать выбранный encode в тесте.

- [ ] **Step 3: Commit** (по просьбе)

---

### Task 8: Auth/admin noindex + remove dead SEO props

**Files:**
- Modify: `frontend/src/pages/LoginPage.tsx`, `RegisterPage.tsx`, `Account/**`, `NotFound.tsx` — `noIndex`
- Modify: `frontend/src/pages/DogProfile/index.tsx` — убрать несуществующие `enableAIGeneration` / `aiGenerationData` у `<SEO>` (сейчас props нет в компоненте)
- Optional: не трогать `seoGenerator.ts` Worker, пока не нужен

- [ ] **Step 1: Add `<SEO … noIndex />` на auth**

- [ ] **Step 2: Clean DogProfile SEO props**

- [ ] **Step 3: Commit** (по просьбе)

---

### Task 9: CI / deploy wiring

**Files:**
- Modify: `.github/workflows/deploy-frontend.yml` (уже есть `prerender-seo` — проверить порядок: build → prerender → deploy; убедиться что `spa-shell.html` попадает в dist)
- Optional env in workflow for exhibition/judge caps

- [ ] **Step 1: Confirm artifact contains `spa-shell.html`, `robots.txt`, expanded `sitemap.xml`, sample `event/*/index.html`**

Можно добавить шаг:

```yaml
- name: Verify SEO artifacts
  run: |
    test -f frontend/dist/spa-shell.html
    test -f frontend/dist/robots.txt
    test -f frontend/public/sitemap.xml
    grep -q '/event/' frontend/public/sitemap.xml
```

(после copy sitemap into dist — Vite копирует `public/` → `dist/` на build; sitemap должен существовать **до** `frontend build`. Сейчас sitemap пишет `build-all-data` в `frontend/public` **до** frontend build в workflow — ок.)

- [ ] **Step 2: If sitemap generated after frontend public copy timing drifts — document order in sheet 07**

Order must be: `build-all-data` (writes `frontend/public/sitemap.xml`) → `frontend yarn build` (copies public) → `prerender-seo`.

---

### Task 10: On-page RU copy pass (high-traffic hubs only)

**Files:**
- Modify: hub paragraphs in `HUB_PAGES` (`prerender-html.ts`)
- Modify: visible intro blurb on `Competitions.tsx` / `Shows.tsx` / `SpeedRecords` **только если** сейчас пусто для пользователей (не дублировать огромные SEO-стены)

**Rules:**
- 1 H1, 1 короткий абзац (2–3 предложения)
- Ключи естественно: «курсинг», «бега борзых», «выставки РКФ», «рекорды Донино», «рейтинг собак», «статистика судей»
- Не keyword stuffing

- [ ] **Step 1: Align prerender hub text ↔ visible UI text** (бот и юзер видят одно и то же по смыслу)

- [ ] **Step 2: Commit** (по просьбе)

---

### Task 11: Operator checklist (Яндекс + Google) — после деплоя

Не код. Делает владелец аккаунтов (пользователь) + агент подсказывает по скринам/цифрам.

- [ ] **Step 1: GSC**
  - Sitemaps → удалить/переотправить `https://coursing-stats.ru/sitemap.xml`
  - URL Inspection: `/`, `/competitions`, `/event/{known-id}`, `/dog/{id}`, `/judges/{name}`, `/shows/exhibition/{id}`, `/donino-dog/...`
  - Смотреть «HTML с сервера / rendered» — title и H1 должны быть сущности, не главной

- [ ] **Step 2: Яндекс.Вебмастер**
  - Индексирование → Файлы Sitemap → добавить/обновить sitemap
  - Индексирование → **Рендеринг JavaScript**: пока нет полного prerender всех страниц — оставить «на усмотрение робота» или явно разрешить; **после** полного prerender важных URL — можно запретить рендеринг (экономия), если «Проверка страницы» без JS уже видит контент
  - Проверка страницы на `/event/...` **без JS**: должен быть H1 мероприятия
  - robots.txt анализ — Allow, Sitemap ok

- [ ] **Step 3: Метрика / GA**
  - Не для индексации; проверить что цели не ломаются после `_redirects` change

- [ ] **Step 4: Monitor 2–4 недели**
  - Покрытие / «Исключённые страницы» / дубли canonical
  - `site:coursing-stats.ru` в Яндексе и Google (ориентир, не точная метрика)

---

## Out of scope (явно)

- Миграция на Next.js / SSR Workers
- Индексация `/admin` и личных кабинетов
- Full prerender всех show-only dogs (`PRERENDER_SHOW_ONLY`) без отдельного решения по лимиту файлов
- Смена CS formula / merge рейтингов
- AI-генерация description через Workers как обязательный путь

## Self-review

1. **Spec coverage:** canonical-bug, robots, sitemap gaps, prerender events/judges/donino/exhibitions/show-judges, OG, auth noindex, CI, webmaster ops — у каждой есть task.
2. **Placeholders:** нет TBD; env caps заданы числами.
3. **Consistency:** event IDs = `events-by-id` keys; show judge IDs = `judges.json.id`; exhibition IDs = calendar link targets.

## What we need from the user (blocking / helpful)

См. ответ в чате — без этого Task 11 и приоритеты Phase B/C уточняются наугад.
