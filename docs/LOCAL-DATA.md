# Локальная файловая база (`data/v1/`)

Каноническое хранилище для **runtime** сайта (dev и prod). Cloudflare D1 — только **импорт** (парсеры, cron).

## Архитектура (упрощённая, 2026-07)

```
  data/v1/*.json  (git — единственный источник правды)
        │
        │  npm run build-all-data  (CI при push в main)
        ▼
  frontend/public/data/v1/
        ├── manifest.json, calendar/, competitions/, dogs/, donino/
        ├── indexes/          (топы, судьи — precomputed)
        ├── pc-db.sqlite.gz   (derived: собран из JSON для API-запросов)
        └── snapshot-latest.json
        │
        ▼
  Cloudflare Pages (CDN)  ──fetch──►  Worker (api.coursing-stats.ru)
```

| Среда | Как читает данные |
|-------|-------------------|
| **Dev** | `npm run dev` → JSON с диска → better-sqlite3 в памяти |
| **Prod API** | Worker: gzip-снимок с Pages + Donino/топы/судьи из static JSON |
| **Импорт** | D1 → `export-local-data` → `data/v1/` |

**R2 не используется.**

### Почему на проде всё ещё есть sqlite.gz?

Routes написаны на SQL (профиль собаки, фильтры). Полный рефакторинг на чистый JSON — в плане.
Сейчас CI **собирает** sqlite из JSON (как локальный `build-data-snapshot`) и кладёт на Pages.
Worker при cold start скачивает **один** `pc-db.sqlite.gz` — не нужен `DATA_SNAPSHOT_HASH` в wrangler.

Donino (замеры/350м), топы по году, список судей — читаются напрямую из JSON на CDN (быстрее).

## Ваш workflow

```
1. npm run dev                    # правки локально
2. git commit && git push main    # CI: build-all-data → Pages + Worker
3. сайт обновлён
```

Первый запрос после деплоя может быть чуть медленнее (cold start Worker). Переключения на сайте — из кэша и indexes.

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
  indexes/top-placement-{year}.json
  indexes/judges-summary.json
  pc-db.sqlite                   # генерируется, в .gitignore
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
2. `git commit` + `push` в `main`
3. CI (`deploy-frontend.yml`) — автоматически

## Код

| Путь | Назначение |
|------|------------|
| `backend/lib/local-data/` | загрузка JSON, shims |
| `backend/src/local-dev-server.ts` | dev API :8787 |
| `backend/src/worker.ts` | prod: fetch с Pages |
| `backend/scripts/build-all-data.ts` | полный CI pipeline |
| `backend/scripts/ci/package-pages-snapshot.ts` | JSON + gzip на Pages |

## Связанные документы

- `docs/MIGRATION-PLAN-TEMP.md` — план фаз (временный)
- `docs/DATABASE.md` — D1 для импорта
