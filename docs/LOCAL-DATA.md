# Локальная файловая база (`data/v1/`)

Каноническое хранилище для **runtime** сайта (dev и prod). Cloudflare D1 — только **импорт** (парсеры, cron).

## Архитектура (2026-07): публичный сайт без Worker

Посетители **не ходят в Worker**. React SPA читает JSON статики прямо с Cloudflare Pages CDN — мгновенно, без cold start.
Worker/D1 остаются только для **локальной админки** (`npm run dev` → `local-dev-server` на `:8787`).

```
Prod visitor:  coursing-stats.ru → React SPA + fetch /data/v1/*.json  (Pages CDN, без Worker)
Dev visitor:   localhost:5173    → тот же /data/v1/  (Vite отдаёт repo data/v1)
Dev admin:     /api → proxy → local-dev-server :8787  (без изменений, только локально)
```

```
  data/v1/*.json  (git — единственный источник правды)
        │
        │  npm run build-all-data  (CI при push в main)
        ▼
  frontend/public/data/v1/
        ├── manifest.json, breeds.json, calendar/, competitions/, dogs/, donino/
        └── indexes/          (топы по местам/очкам/скорости, судьи, dog-profiles/, sitemap.xml)
        │
        ▼
  Cloudflare Pages (CDN)  ──fetch──►  frontend/src/lib/staticData.ts (React SPA)
```

| Среда | Как читает данные |
|-------|-------------------|
| **Dev (публичные страницы)** | Vite plugin отдаёт `data/v1/*` с диска на `/data/v1/*` |
| **Prod (публичные страницы)** | `frontend/src/lib/staticData.ts` → `fetch('/data/v1/...')` на Pages CDN, без Worker |
| **Dev admin** | `/api` → Vite proxy → `local-dev-server.ts` (`:8787`, JSON с диска + better-sqlite3) |
| **Prod admin** | не деплоится; при необходимости — локально или через `npm run dev:d1` |
| **Импорт** | D1 → `export-local-data` → `data/v1/` |

**Worker (`backend/src/worker.ts`) не деплоится в CI** (см. `.github/workflows/deploy-frontend.yml`) — код оставлен в репозитории на случай, если понадобится снова включить прод-admin API. **R2 не используется.**

### Precomputed индексы вместо SQL на проде

Раньше часть routes (профиль собаки, судьи с фильтрами, топы) требовала SQL-запросов к `pc-db.sqlite` в Worker.
Теперь всё, что нужно публичному сайту, **предвычисляется в CI** (`backend/scripts/build-derived-indexes.ts`) и лежит готовыми JSON в `data/v1/indexes/`:

- `top-placement-{year|all}.json`, `top-score-{year|all}.json`, `top-speed-{year|all}.json`
- `judges-summary.json`, `judge-details/{key}.json`, `judges-raw-rows.json` (для клиентской фильтрации по породе/дисциплине)
- `dog-profiles/{id}.json` (~1500 файлов — полный профиль собаки: coursing/racing статистика, титулы, история стартов)
- `years.json`, `sitemap.xml` (пишется в `frontend/public/`)

Клиентская фильтрация/сортировка (порода, минимум стартов, судейские очки) портирована в `frontend/src/lib/` (`staticData.ts`, `breedMapping.ts`, `judgeStats.ts`) — зеркалирует логику backend (`backend/lib/local-data/static-data.ts`, `backend/src/lib/judge-stats.ts`).

## Ваш workflow

```
1. npm run dev                    # правки локально (админка на :8787)
2. npm run build-all-data         # пересобрать data/v1/indexes/ после правок данных
3. git commit && git push main    # CI: build-all-data → Deploy Pages (Worker не деплоится)
4. сайт обновлён мгновенно — новый запрос сразу получает свежий /data/v1/*.json с CDN
```

## Структура `data/v1/`

```
data/v1/
  manifest.json
  breeds.json
  calendar/{year}.json
  competitions/{year}/{month}/{id}-{slug}.json
  dogs/by-id/{id}.json
  donino/speed_records.json      # отдельно от coursing_records.json
  donino/coursing_records.json
  indexes/
    years.json
    top-placement-{year|all}.json
    top-score-{year|all}.json
    top-speed-{year|all}.json
    judges-summary.json
    judges-raw-rows.json
    judge-details/{key}.json
    dog-profiles/{id}.json
    events-by-id.json
  pc-db.sqlite                   # генерируется, в .gitignore — только для dev admin
```

## Команды

```bash
npm run dev                       # локально, без D1
npm run build-all-data            # как CI: snapshot + indexes + package
npm run export-local-data -- --local
npm run smoke-api
```

## Обновление прода

1. Правка JSON в `data/v1/` (или `export-local-data`)
2. `npm run build-all-data` — пересобрать индексы локально (проверить перед push)
3. `git commit` + `push` в `main`
4. CI (`deploy-frontend.yml`) — `build-all-data` → Deploy Pages, автоматически

## Код

| Путь | Назначение |
|------|------------|
| `frontend/src/lib/staticData.ts` | прод: fetch JSON с CDN, вся публичная логика без Worker |
| `frontend/src/lib/breedMapping.ts`, `judgeStats.ts` | клиентские порты фильтрации/агрегации из backend |
| `backend/lib/local-data/` | загрузка JSON, shims (dev admin) |
| `backend/src/local-dev-server.ts` | dev admin API :8787 |
| `backend/src/worker.ts` | не деплоится в прод; код для опционального dev admin API |
| `backend/scripts/build-all-data.ts` | полный CI pipeline |
| `backend/scripts/build-derived-indexes.ts` | генерация всех `indexes/*.json` + `sitemap.xml` |
| `backend/scripts/ci/package-pages-snapshot.ts` | JSON на Pages |

## Связанные документы

- `docs/MIGRATION-PLAN-TEMP.md` — план фаз (временный)
- `docs/DATABASE.md` — D1 для импорта
