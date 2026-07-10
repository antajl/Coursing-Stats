# AI Guide — инструкция для агента

⚠️ **КРИТИЧЕСКИ ВАЖНО:** Cascade ДОЛЖЕН прочитать `.devin/rules/` и `.devin/skills/` ПЕРЕД docs/!

**Если пользователь говорит "прочитай docs" или "прочитай документацию":**
1. СНАЧАЛА прочитай `.devin/rules/` (все .mdc файлы)
2. ЗАТЕМ прочитай `.devin/skills/` (все SKILL.md файлы)
3. ПОТОМ прочитай ВСЕ файлы docs/ (прочитай каждый .md файл в папке docs/, НЕ пропускай ни одного)
4. ПОСЛЕ ЧТЕНИЯ ВСЕЙ ДОКУМЕНТАЦИИ проанализируй её
5. ЗАДАЙ ВОПРОС ПОЛЬЗОВАТЕЛЮ: "Я прочитал .devin/rules/, .devin/skills/ и docs/. Правильно ли я понял, что нужно:
   1. Создать memories по критическим архитектурным правилам, правилам парсинга, структуре проекта и ключевым командам?
   2. Использовать rules и skills из .devin/ как рабочую среду для этого проекта?"
6. ЖДИ ПОДТВЕРЖДЕНИЯ ПОЛЬЗОВАТЕЛЯ перед созданием memories

**Пользователю:** скажите агенту: «Прочитай `.devin/rules/` и `.devin/skills/`, затем `docs/README.md` и `docs/00-AI-GUIDE.md`.»

---

## Порядок чтения

1. **`.devin/rules/`** — критические правила проекта (всегда сначала)
   - coursing-stats-core.mdc (архитектура)
   - coursing-stats-parsers.mdc (правила парсинга)
   - cascade-instructions.mdc (инструкции для Cascade)
2. **`.devin/skills/`** — доступные workflow
   - coursing-stats-dev/SKILL.md
   - coursing-stats-parsers/SKILL.md
   - cloudflare-deploy/SKILL.md
   - d1-operations/SKILL.md
   - parser-testing/SKILL.md
   - donino-records/SKILL.md
   - e2e-testing/SKILL.md
3. `docs/README.md` — карта документов
4. **`docs/00-AI-GUIDE.md`** — этот файл
5. **Прочитай ВСЕ остальные .md файлы в docs/ (НЕ пропускай ни одного)**
6. По задаче: см. таблицу ниже

---

## Создание Memories

После чтения всей документации Cascade должен создать memories для:

### Критическая архитектура
- Публичный сайт читает ТОЛЬКО из /data/v1/ CDN (без Worker, без D1)
- D1 — только для импорта (парсеры, cron jobs)
- data/v1/ — источник правды
- Два отдельных рейтинга: по местам и по очкам
- total_score = original grand_total (НЕ делить на число судей)

### Критические правила парсинга
- ВСЕГДА использовать fetchWin1251 для procoursing.ru (windows-1251)
- НИКОГДА не использовать fetch().text()
- ВСЕГДА сохранять raw_text
- Coursing ≠ BZMP ≠ Racing (разные форматы)
- Donino: speed_records (км/ч) ≠ coursing_records (350м сек)

### Структура проекта
- Frontend: React + Vite + TailwindCSS
- Backend: Hono + better-sqlite3 (только локальная админка)
- Data: data/v1/ (runtime), data/archive/ (backups)
- Deployment: Cloudflare Pages (static CDN)

### Ключевые команды
- npm run dev — local-dev-server + Vite (читает data/v1/)
- npm run build-all-data — пересобрать data/v1/indexes/
- npm run export-local-data — экспорт D1 в data/v1/
- npm run test-parser-fixtures — тест v2 парсеров
- npm run test:e2e — Playwright E2E тесты

---

## Ментальная модель проекта

1. **Публичный сайт** читает только `data/v1/*.json` с CDN — `frontend/src/lib/staticData.ts`, **без Worker и без D1**.
2. **`data/v1/` в git** — источник правды для прода.
3. **D1** — импорт: парсеры → D1 → `export-local-data` → `data/v1/`.
4. **Админка** — только локально: UI `localhost:5173/admin`, API `:8787`, пишет в `data/v1/` через sqlite.
5. **`build-all-data`** — пересобирает `indexes/`, sitemap; CI запускает при push. **Проверка:** snapshot должен содержать `results > 0`, иначе индексы на проде будут пустыми (см. `docs/03-DATA.md` → «Диагностика»).
6. **Два топа** — медали и очки, **не смешивать**.
7. **`total_score`** = `grand_total` как есть, **не делить** на число судей.
8. **API путь** `/api/competitions`, не `/api/events` (uBlock).
9. **Донино:** `speed_records` (км/ч) и `coursing_records` (сек) — разные источники.
10. **procoursing.ru** — windows-1251, `fetch-win1251.ts`, не `fetch().text()`.
11. **Публичный UI (вариант A):** на проде нет календаря и `/event/:id` — только рейтинг/судьи/профили; протоколы → procoursing.ru; локально `/admin/calendar`, `/admin/event/:id`. См. `docs/19-HISTORY.md` (2026-07-10).

---

## Не менять без явного запроса

- Все породы и архив 2015–2026 в UI  
- Два отдельных рейтинга (места vs очки)  
- Родословные — ссылка наружу, не парсим PDF  
- Не ребрендить procoursing.ru  
- Не деплоить Worker в CI  
- Не коммитить без просьбы пользователя  

---

## Типовые задачи → куда идти

| Задача | Файлы / docs |
|--------|----------------|
| Правка результатов | Админка → `17-ADMIN-WORKFLOW.md`; код: `routes/admin/results.ts` |
| Правка UI главной | `frontend/src/pages/Home.tsx` |
| Парсер (правила) | `backend/parsers/`, `docs/14-PARSING-RULES.md` |
| Парсер (детали) | `backend/parsers/`, `docs/15-PARSING-IMPLEMENTATION.md` |
| Тест парсера | `npm run test-parser-fixtures` |
| Деплой | `git push main`, `docs/03-DATA.md` |
| Пустой рейтинг/судьи на проде | `docs/03-DATA.md` → «Диагностика» или `docs/16-TROUBLESHOOTING.md` |
| D1 схема (таблицы, views) | `docs/12-DATABASE-SCHEMA.md` |
| D1 workflow (импорт, sync) | `docs/13-DATABASE-WORKFLOW.md` |
| Новая страница | `AppRoutes.tsx`, `SEO.tsx`, `build-derived-indexes.ts` (sitemap) |
| Донино | `docs/09-SPEED-RECORDS.md`, `donino/*.json` |
| Где лежит папка / архив HTML | `docs/02-ARCHITECTURE.md`, `data/archive/README.md` |
| Паттерны кода | `docs/18-CODE-PATTERNS.md` |
| История изменений | `docs/19-HISTORY.md` |

---

## Команды (частые)

```bash
npm run dev                 # Vite :5173 + admin :8787
npm run build-all-data      # indexes + package для Pages
npm run export-local-data -- --local
npm run smoke-api           # нужен dev
npm run test-parser
npm run test-parser-fixtures
npm test
```

Windows: `scripts/start-servers.bat`, `scripts/deploy-to-github.bat`

---

## Структура кода (минимум)

```
backend/src/local-dev-server.ts   # dev API
backend/src/routes/               # API modules (events.ts → /api/competitions)
backend/parsers/                  # v1 + v2 modular
backend/scripts/build-all-data.ts
frontend/src/lib/staticData.ts    # прод-данные
frontend/src/pages/               # страницы
data/v1/                          # runtime JSON
```

Полная карта файлов: `docs/04-DEVELOPMENT.md`.

---

## Данные (счётчики)

Актуальные числа: `data/v1/manifest.json`. Не хардкодить устаревшие значения в код без проверки.

---

## Парсинг — критично

- Кодировка **windows-1251** на procoursing.ru  
- Перед изменением парсера: `npm run test-parser` + `npm run test-parser-fixtures`  
- Сохранять `raw_text` при парсинге  
- БЗМП и racing — отдельные форматы, не копировать курсинг  

Подробно: `docs/14-PARSING-RULES.md`, `docs/15-PARSING-IMPLEMENTATION.md`.

---

## После значимых изменений

Обновить: релевантный `docs/*.md`, при смене workflow — `GETTING-STARTED.md`, `.cursor/rules/`, skills.

**Дата:** 2026-07-07
