# Архитектурный анализ Coursing Stats

## Обзор проекта

Coursing Stats — агрегатор статистики собак с procoursing.ru (курсинг, БЗМП, бега), 2015–2026.

**Ключевая архитектурная особенность:** Публичный сайт работает полностью на статических JSON файлах без Worker/D1 в runtime.

---

## Архитектура данных

### Поток данных (High-Level)

```
procoursing.ru / Google Sheets
        │
        ▼
   D1 (импорт) ──export-local-data──► data/v1/*.json  ◄── git, источник правды
        │                                    │
        │                                    ├─ build-derived-indexes → indexes/
        │                                    │
        │                                    ▼  CI: build-all-data
        │                              frontend/public/data/v1/
        │                                    │
        ├─ npm run dev (админка)             ▼
        │   local-dev-server :8787     Cloudflare Pages CDN
        │   better-sqlite3 in-memory         │
        └─ dev:d1 (legacy)                   ▼
                                    coursing-stats.ru
                                    React SPA → fetch /data/v1/*.json
                                    (frontend/src/hooks/useStaticData.ts)
                                    (без Worker)
```

### Источник правды

**`data/v1/` в git** — это единственный источник правды для публичного сайта.

- D1 используется только для импорта данных
- Runtime публичного сайта не читает D1
- Актуальные счётчики: `data/v1/manifest.json`

### Структура data/v1/

```
data/v1/
├── manifest.json              # счётчики (частично обновляется админкой)
├── breeds.json                # список пород
├── calendar/{year}.json       # календарь года (без results)
├── competitions/{year}/{month}/{id}-{slug}.json   # турнир + results[]
├── dogs/
│   ├── by-id/{id}.json        # карточка собаки
│   └── by-key/{dog_key}.json  # тот же payload, второй индекс
├── donino/
│   ├── speed_records.json     # замер, км/ч
│   └── coursing_records.json  # бега 350 м, сек
├── indexes/                   # генерируется, не править вручную
│   ├── years.json
│   ├── top-placement-*.json, top-score-*.json, top-speed-*.json
│   ├── judges-summary.json, judges-raw-rows.json
│   ├── judge-details/{key}.json
│   ├── dog-profiles/{id}.json
│   └── events-by-id.json
└── pc-db.sqlite               # для dev-админки; не источник правды для прода
```

---

## Компоненты системы

### 1. Backend

#### Local Dev Server
**Файл:** `backend/src/local-dev-server.ts`
**Порт:** 8787
**Назначение:** API для админки (только локально)

**Особенности:**
- Читает `data/v1/` напрямую (без D1)
- Использует better-sqlite3 in-memory
- Делегирует в `backend/src/app.ts`
- CORS с wildcard

**Routes:**
- `/api/competitions` — события и результаты
- `/api/dogs/:id` — профили собак
- `/api/judges` — статистика судей
- `/api/speed-records` — рекорды скорости
- `/api/top/*` — рейтинги собак
- `/api/admin/*` — админские endpoints (с авторизацией)

#### Worker (Legacy)
**Файл:** `backend/src/worker.ts`
**Назначение:** Опциональный запуск через `npm run dev:d1`
**Статус:** Не деплоится в CI с 2026-07-07

#### Парсеры

**Версии парсеров:**

| Версия | Путь | Использование |
|--------|------|---------------|
| v1 | `parse-results-coursing.ts`, `parse-results-bzmp.ts`, `parse-results-racing.ts` | CLI, legacy-скрипты |
| v2 | `coursing/index.ts`, `bzmp/index.ts`, `racing/index.ts`, `unique/` | `reparse-by-year.ts`, `test-parser-fixtures` |

**Критические правила парсинга:**
- procoursing.ru использует windows-1251 без charset
- Использовать `iconv-lite` для декодирования (`fetch-win1251.ts`)
- НЕ доверять `fetch().text()` — декодировать из байт вручную
- `total_score` = `grand_total` как есть, НЕ делить на число судей
- Сохранять `raw_text` при парсинге

### 2. Frontend

#### Технологический стек
- React 19
- Vite 8
- TailwindCSS
- React Router 7
- React Query (@tanstack/react-query)
- Lucide React (иконки)
- GSAP (анимации)

#### Ключевые файлы

**Shell и маршрутизация:**
- `frontend/src/App.tsx` — Shell: QueryProvider, Router, Nav, AppRoutes
- `frontend/src/AppRoutes.tsx` — Lazy routes (code-split pages)
- `frontend/src/components/Nav.tsx` — Шапка с навигацией

**Загрузка данных:**
- `frontend/src/hooks/useStaticData.ts` — Публичный прод: fetch `/data/v1/`
- `frontend/src/hooks/useApi.ts` — Админка: API calls
- `frontend/src/lib/staticData.ts` — Утилиты для статических данных

**Vite конфигурация:**
- `frontend/vite.config.ts` — Plugin `serveDataV1` отдаёт `data/v1/` в dev/preview
- `manualChunks` для code-splitting (vendor-react, vendor-router, vendor-query, vendor-xlsx)

**Build process:**
- `frontend/scripts/copy-data.js` — Копирует `data/v1/` в `public/data/v1/` перед билдом
- `frontend/package.json` — `"build": "node scripts/copy-data.js && vite build"`

#### Маршруты

| Path | Компонент | Описание |
|------|-----------|----------|
| `/` | `Home.tsx` | Лендинг |
| `/competitions` | `Competitions.tsx` | Hub вкладок (календарь, рейтинг, судьи) |
| `/top` | `TopDogs/index.tsx` | Рейтинг собак |
| `/dog/:id` | `DogProfile.tsx` | Профиль собаки из БД соревнований |
| `/event/:id` | `Events/EventResults/` | Результаты события |
| `/speed-records` | `SpeedRecords/index.tsx` | Рекорды Донино |
| `/donino-dog/:name/:breed` | `DoninoDogProfile.tsx` | Профиль собаки из рекордов Донино |
| `/judges` | `Judges/index.tsx` | Список судей |
| `/judges/:judgeId` | `Judges/JudgeDetail.tsx` | Детальная статистика судьи |

---

## Скрипты

### Оркестрация данных

**`build-all-data.ts`** — Основной pipeline для CI
```bash
npm run build-all-data
```
Выполняет:
1. `rebuild-calendar-index.ts` — перестройка индекса календаря
2. `build-data-snapshot.ts` — создание снимка данных
3. `build-derived-indexes.ts` — построение индексов (топы, судьи, профили)
4. `package-pages-snapshot.ts` — копирование в `frontend/public/data/v1/`

**`package-pages-snapshot.ts`** — Подготовка данных для Pages
- Копирует `data/v1/` в `frontend/public/data/v1/`
- Создаёт сжатую версию для быстрой загрузки
- **Исправлено (2026-07-09):** Теперь копирует все файлы рекурсивно, включая подкаталоги

### Скрипты импорта

**`export-local-data.ts`** — D1 → data/v1/
```bash
npm run export-local-data -- --local
```

**`sync-sqlite-to-v1.ts`** — Админка → data/v1/
```bash
npm run sync-sqlite-to-v1
```

### Скрипты парсинга

**Скрапинг календаря:**
```bash
npm run scrape-index
```

**Парсинг результатов:**
```bash
npm run parse-coursing
npm run parse-bzmp
npm run parse-racing
```

**Перепарсинг по годам:**
```bash
npm run reparse-2026
npm run reparse-2026-coursing
npm run reparse-2026-bzmp
npm run reparse-2026-racing
```

### Скрипты Донино

**Загрузка рекордов скорости:**
```bash
npm run fetch-speed-records
```

---

## GitHub Actions Workflows

### deploy-frontend.yml

**Триггеры:**
- Push в `main`
- Manual dispatch

**Процесс:**
1. Checkout кода
2. Setup Node.js 22
3. Install root dependencies
4. `npm run build-all-data` — построение индексов и упаковка данных
5. Install frontend dependencies
6. Build frontend (с автоматическим копированием данных)
7. Deploy на Cloudflare Pages

**Важно:** Worker НЕ деплоится в CI

### update-db.yml

**Триггер:** Manual dispatch только

**Процесс:**
1. Checkout кода
2. Setup Node.js 22
3. Install dependencies
4. `ci-update-db.ts` — инкремент текущего года → remote D1

### update-speed-records.yml

**Триггеры:**
- Cron: 4 раза в день (08:00, 14:00, 20:00, 23:30 МСК)
- Manual dispatch

**Процесс:**
1. Checkout кода
2. Setup Node.js 22
3. Install dependencies
4. `export-speed-from-sheets.ts` — экспорт из Google Sheets
5. Commit изменений в `data/v1/donino/speed_records.json`
6. Push (если есть изменения)

**Важно:** Push триггерит deploy-frontend.yml

---

## Деплой

### Локальная разработка

```bash
npm run dev
```

Запускает:
- Vite dev server на :5173
- Local dev server на :8787

### Деплой в прод

```bash
git push origin main
```

Автоматически:
1. GitHub Actions запускает `deploy-frontend.yml`
2. Строятся индексы и пакуются данные
3. Билдится фронтенд
4. Деплоится на Cloudflare Pages

### Cloudflare Pages

**Проект:** `coursingstats`
**Домен:** coursing-stats.ru
**Build output:** `frontend/dist`
**Статика:** `frontend/public/data/v1/` включается в деплой

---

## Критические правила

### Парсинг
1. procoursing.ru — windows-1251, всегда декодировать через `iconv-lite`
2. `total_score` = исходная `grand_total`, НЕ делить на количество судей
3. Два отдельных рейтинга: по местам и по очкам
4. Перед изменением парсера: `npm run test-parser` и `npm run test-parser-fixtures`

### API
1. Путь `/api/competitions`, не `/api/events` (uBlock блокирует слово "events")
2. Админка только локально с `X-Admin-Token`

### Данные
1. `data/v1/` — источник правды для прода
2. После правок данных: `npm run build-all-data`
3. Актуальные счётчики: `data/v1/manifest.json`

### Не менять без явного запроса
- Все породы и архив 2015–2026 в UI
- Два отдельных рейтинга (места vs очки)
- Родословные — ссылка наружу, не парсим PDF
- Не ребрендить procoursing.ru
- Не деплоить Worker в CI

---

## Тестирование

### Парсеры
```bash
npm run test-parser              # v1 synthetic tests
npm run test-parser-fixtures     # v2 modular on fixtures
npm run download-fixtures        # refresh fixtures
```

### API
```bash
npm run smoke-api                # manual check (needs dev server)
```

### E2E
```bash
npm run test:e2e                 # Playwright
npm run test:e2e:ui              # interactive UI
```

---

## Секреты GitHub Actions

- `CLOUDFLARE_API_TOKEN` — API токен Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` — ID аккаунта Cloudflare

---

## Резюме

**Архитектурный паттерн:** Static-first CDN deployment

1. **Данные:** Импорт из внешних источников → D1 → `data/v1/` (git) → CDN
2. **Фронтенд:** React SPA → fetch статических JSON с CDN → без Worker/D1 в runtime
3. **Админка:** Локально → API → запись в `data/v1/` → commit → deploy
4. **Автоматизация:** GitHub Actions для деплоя и обновления рекордов

**Преимущества:**
- Надёжность: данные в git, не зависят от Worker/D1
- Скорость: статические файлы с CDN
- Простота: нет необходимости деплоить Worker
- Отказоустойчивость: если Worker упадёт, сайт продолжит работать
