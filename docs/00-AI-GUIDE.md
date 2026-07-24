# AI Guide — инструкция для агента

Универсальный вход для **любого** ИИ-агента (Cursor, Devin/Cascade, Claude Code и др.). Не читай всю папку `docs/` подряд — только то, что нужно по задаче.

**Дата:** 2026-07-24

---

## 1. Конфигурация агента (rules + skills)

В репозитории **два набора** правил и skills — для разных сред. Используй **тот, который поддерживает твоя среда**:

| Среда | Rules | Skills |
|-------|-------|--------|
| **Devin / Cascade** | `.devin/rules/` (все `.mdc`) | `.devin/skills/` (все `SKILL.md`) |
| **Cursor** | `.cursor/rules/` (все `.mdc`) | `.cursor/skills/` (все `SKILL.md`) |

Содержание перекрывается (архитектура, парсеры, data-build). Если доступны оба — **Cursor-агент читает `.cursor/`**, Devin-агент — **`.devin/`**. Не смешивай и не дублируй чтение.

**Критичные rules (в любой среде):** `coursing-stats-core`, `coursing-stats-parsers`; в Cursor дополнительно `coursing-stats-data-build`, `local-data`.

**Критичные skills:** `coursing-stats-dev` (+ `data-build-pipeline.md`), `coursing-stats-parsers`.

---

## 2. Порядок чтения docs/

1. **`docs/README.md`** — карта документов по задаче
2. **`docs/00-AI-GUIDE.md`** — этот файл
3. **`docs/03-DATA.md`** — runtime `data/v1/`, workflow
4. **`docs/02-ARCHITECTURE.md`** — компоненты и стек (при архитектурных вопросах)
5. **По задаче** — один файл из таблицы в README (не все подряд)

**Runbook (деплой, прод сломан):** [`20-OPERATIONS.md`](20-OPERATIONS.md)  
**Пустой рейтинг на проде:** [`03a-DATA-DIAGNOSTICS.md`](03a-DATA-DIAGNOSTICS.md)  
**Донино пайплайн:** [`09a-DONINO-PIPELINE.md`](09a-DONINO-PIPELINE.md)

---

## 3. Правило документирования (без дублей)

| Тип информации | Канонический файл | В других файлах |
|----------------|-------------------|-----------------|
| Данные, enrich, indexes | `03-DATA.md` | 1–3 строки + ссылка |
| Диагностика пустых indexes | `03a-DATA-DIAGNOSTICS.md` | ссылка |
| Деплой, чеклисты | `20-OPERATIONS.md` | ссылка |
| SEO | `07-SEO.md` | ссылка |
| Донино модель/UI | `09-SPEED-RECORDS.md` | ссылка |
| Донино Sheets→CDN | `09a-DONINO-PIPELINE.md` | ссылка |
| Выставки | `SHOWS.md` | кратко в `03-DATA.md` |
| UI, маршруты, public surface / ui-flags | `04-FRONTEND.md` | ссылка |
| UI-паттерны кода | `18-CODE-PATTERNS.md` | ссылка |
| Симптом → fix | `16-TROUBLESHOOTING.md` | процедура в каноне, здесь кратко |
| Backend scripts / npm | `11-DEVELOPMENT.md` | ссылка |
| D1 схема/workflow | stubs `12` / `13` → `docs/archive/` — **LEGACY** | |

При значимых изменениях обновляй **канон**, не копируй абзацы.

---

## 4. Ментальная модель проекта

1. **Публичный сайт** читает только `data/v1/*.json` с CDN — `frontend/src/lib/staticData.ts`, **без Worker и без D1**.
2. **`data/v1/` в git** — источник правды для прода.
3. **Импорт данных:** парсеры → локальная SQLite (`node-data-store`) → `npm run sync-sqlite-to-v1` → `data/v1/` → `npm run build-all-data`. D1 в runtime **не используется**.
4. **Админка** — только локально: UI `:5173/admin`, API `:8787`.
5. **`build-all-data`** — пересобирает competition `indexes/`, sitemap; CI при push. Snapshot: **`results > 0`**, иначе пустой рейтинг на проде → [`03a-DATA-DIAGNOSTICS.md`](03a-DATA-DIAGNOSTICS.md), [`20-OPERATIONS.md`](20-OPERATIONS.md). Show-индексы (`shows/indexes/`) в CI **не** пересобираются без `data/local/shows/exhibitions-rkf` — иначе рейтинг без BIS (только ЛПП). Канон: [`SHOWS.md`](SHOWS.md).
6. **Два топа** — медали и очки, **не смешивать**. Очки: сортировка по **`rating_score` (индекс CS)**, не по `best_score`.
7. **`total_score`** = `grand_total` как есть, **не делить** на число судей.
8. **API путь** `/api/competitions`, не `/api/events` (uBlock).
9. **Донино:** `speed_records` (км/ч) и `coursing_records` (сек) — разные источники. Модель: [`09-SPEED-RECORDS.md`](09-SPEED-RECORDS.md); пайплайн: [`09a-DONINO-PIPELINE.md`](09a-DONINO-PIPELINE.md).
10. **procoursing.ru** — windows-1251, `fetch-win1251.ts`.
11. **Публичный UI (вариант A):** канон — [`04-FRONTEND.md`](04-FRONTEND.md) → «Public surface». Кратко: календари на проде по `ui-flags.json`; протоколы `/event/:id` только DEV; временная плашка `TemporaryCompetitionsCalendarBanner` на `/competitions?tab=calendar`. Выставки: [`SHOWS.md`](SHOWS.md).
12. **Выставки RKF PDF:** `ingest-rkf-calendar` → `download-rkf-reports` → `parse-rkf-reports` → `build-show-indexes`; годы с **2026 вниз**; column-aware парсер (`parse-rkf-certificate-pdf.ts`); type3 главный ринг — только 2025–2026 (`main_ring`, бейджи BIS/BIG…); часть type3 даёт пустой `main_ring` (layout); type1-embedded BIS без type3 — ещё не парсим. Список судей: % «отлично» при ≥30 оценках, сортировка с toggle ↑/↓. Детали и долги — [`SHOWS.md`](SHOWS.md). ~74k PDF на 2019–2026.
---

## 5. Не менять без явного запроса

- Все породы и архив 2015–2026 в UI
- Два отдельных рейтинга (медали vs очки); UI-лейбл вкладки — **«медали»** (не «места»), default — медали
- Родословные — ссылка наружу, не парсим PDF
- Не ребрендить procoursing.ru
- Не деплоить Worker в CI
- Не коммитить без просьбы пользователя

---

## 6. Типовые задачи → куда идти

| Задача | Файлы / docs |
|--------|----------------|
| Правка результатов | `17-ADMIN-WORKFLOW.md`; `routes/admin/results.ts` |
| Правка UI главной | `04-FRONTEND.md` → Home; `Home.tsx`, `HomeHeroStage`, `HomeDogSearch`, `public/images/home/**` (+ vite-plugin-home-photos), `lib/dogName.ts` |
| Парсер (правила) | `14-PARSING-RULES.md`, `backend/parsers/` |
| Парсер (детали) | `15-PARSING-IMPLEMENTATION.md` |
| Тест парсера | `npm run test-parser-fixtures` |
| Деплой / прод сломан | [`20-OPERATIONS.md`](20-OPERATIONS.md) |
| Пустой рейтинг/судьи | [`03a-DATA-DIAGNOSTICS.md`](03a-DATA-DIAGNOSTICS.md); `16-TROUBLESHOOTING.md` |
| D1 схема (legacy) | stub `12-DATABASE-SCHEMA.md` → `archive/` |
| D1 workflow (legacy) | stub `13-DATABASE-WORKFLOW.md` → `archive/` |
| Новая страница | `04-FRONTEND.md`; `AppRoutes.tsx`, `SEO.tsx`, `build-derived-indexes.ts`; SEO: `07-SEO.md` |
| Донино | `09-SPEED-RECORDS.md`, `09a-DONINO-PIPELINE.md`, `donino/*.json` |
| Выставки | `SHOWS.md` |
| Breed Archive | `03-DATA.md` → «Breed Archive»; `npm run enrich-breedarchive-urls` |
| Фильтр пород в рейтинге | `03-DATA.md` → «Породы в UI»; `useCompetingBreeds` |
| Карта фронтенда / public UI | [`04-FRONTEND.md`](04-FRONTEND.md) |
| Скрипты, npm | [`11-DEVELOPMENT.md`](11-DEVELOPMENT.md) |
| Паттерны кода | `18-CODE-PATTERNS.md` |

---

## 7. Команды (частые)

```bash
npm run dev                 # Vite :5173 + admin :8787
npm run build-all-data      # indexes + copy в frontend/public/data/v1
npm run sync-sqlite-to-v1   # локальная SQLite → data/v1/ (после парсинга)
npm run enrich-breedarchive-urls  # pedigree_url → dogs/by-id (затем build-all-data)
npm run smoke-api           # нужен dev
npm run test-parser-fixtures
npm test
```

Windows: `scripts/start-servers.bat`, `scripts/deploy-to-github.bat`, `scripts/update-donino.bat`

---

## 8. Структура кода (минимум)

```
backend/src/local-dev-server.ts   # dev API
backend/src/routes/               # events.ts → /api/competitions
backend/parsers/
backend/scripts/build-all-data.ts
frontend/src/lib/staticData.ts
frontend/src/pages/
data/v1/
```

Полная карта: [`04-FRONTEND.md`](04-FRONTEND.md), [`11-DEVELOPMENT.md`](11-DEVELOPMENT.md).

---

## 9. Данные (счётчики)

Актуальные числа: `data/v1/manifest.json`. Не хардкодить устаревшие значения без проверки.

---

## 10. Парсинг — критично

- Кодировка **windows-1251** на procoursing.ru
- Перед изменением: `npm run test-parser` + `npm run test-parser-fixtures`
- Сохранять `raw_text`
- БЗМП и racing — отдельные форматы

Подробно: `14-PARSING-RULES.md`, `15-PARSING-IMPLEMENTATION.md`.

---

## 11. После значимых изменений

Обновить канонический `docs/*.md`; при смене workflow — `01-GETTING-STARTED.md`, `20-OPERATIONS.md`, rules/skills **своей** среды (`.cursor/` или `.devin/`).
