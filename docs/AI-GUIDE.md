# AI Guide — инструкция для агента

**Пользователю:** скажите агенту: «Прочитай `docs/README.md` и `docs/AI-GUIDE.md`, следуй `.cursor/rules/`.»

---

## Порядок чтения

1. `docs/README.md` — карта документов  
2. **`docs/DATA.md`** — данные, админка, деплой данных  
3. `docs/ARCHITECTURE.md` — архитектура  
4. По задаче: `PARSING.md` | `DEVELOPMENT.md` | `DATABASE.md` | …

---

## Ментальная модель проекта

1. **Публичный сайт** читает только `data/v1/*.json` с CDN — `frontend/src/lib/staticData.ts`, **без Worker и без D1**.
2. **`data/v1/` в git** — источник правды для прода.
3. **D1** — импорт: парсеры → D1 → `export-local-data` → `data/v1/`.
4. **Админка** — только локально: UI `localhost:5173/admin`, API `:8787`, пишет в `data/v1/` через sqlite.
5. **`build-all-data`** — пересобирает `indexes/`, sitemap; CI запускает при push.
6. **Два топа** — медали и очки, **не смешивать**.
7. **`total_score`** = `grand_total` как есть, **не делить** на число судей.
8. **API путь** `/api/competitions`, не `/api/events` (uBlock).
9. **Донино:** `speed_records` (км/ч) и `coursing_records` (сек) — разные источники.
10. **procoursing.ru** — windows-1251, `fetch-win1251.ts`, не `fetch().text()`.

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
| Правка результатов | Админка → `DATA.md`; код: `routes/admin/results.ts` |
| Правка UI главной | `frontend/src/pages/Home.tsx` |
| Парсер | `backend/parsers/`, `docs/PARSING.md`, `npm run test-parser` |
| Деплой | `git push main`, `docs/DATA.md`, skill `coursing-stats-dev` |
| Новая страница | `AppRoutes.tsx`, `SEO.tsx`, `build-derived-indexes.ts` (sitemap) |
| Донино | `docs/SPEED-RECORDS.md`, `donino/*.json` |
| Где лежит папка / архив HTML | `docs/REPOSITORY-STRUCTURE.md`, `data/archive/README.md` |

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

Полная карта файлов: `docs/DEVELOPMENT.md`.

---

## Данные (счётчики)

Актуальные числа: `data/v1/manifest.json`. Не хардкодить устаревшие значения в код без проверки.

---

## Парсинг — критично

- Кодировка **windows-1251** на procoursing.ru  
- Перед изменением парсера: `npm run test-parser` + `npm run test-parser-fixtures`  
- Сохранять `raw_text` при парсинге  
- БЗМП и racing — отдельные форматы, не копировать курсинг  

Подробно: `docs/PARSING.md`, memory в этом файле раньше дублировала — теперь только там.

---

## После значимых изменений

Обновить: релевантный `docs/*.md`, при смене workflow — `GETTING-STARTED.md`, `.cursor/rules/`, skills.

**Дата:** 2026-07-07
