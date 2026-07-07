# Локальная файловая база (`data/v1/`)

Каноническое хранилище для **runtime** сайта (dev и prod). Cloudflare D1 остаётся только для **скриптов импорта** (парсеры, cron, reparse).

## Архитектура

```
                    ┌─────────────────────────────────────┐
  procoursing.ru    │  Скрипты (D1): scrape, reparse,     │
  Google Sheets     │  export-local-data, ci-update-db    │
        │           └──────────────┬──────────────────────┘
        ▼                          ▼
   D1 (pc-db)              data/v1/*.json
   импорт/legacy                   │
        │                          │ npm run build-data-snapshot
        │                          ▼
        │                   pc-db.sqlite (~12 МБ)
        │                          │
   dev:d1 (legacy)                 ├── npm run dev → память (Node)
        │                          │
        │                          └── Pages static → Worker fetch (prod)
        ▼
   api.coursing-stats.ru
```

| Среда | Источник | Команда |
|-------|----------|---------|
| **Dev** | `data/v1/` на диске | `npm run dev` |
| **Prod API** | `https://coursing-stats.ru/data/v1/pc-db-{hash}.sqlite.gz` (sql.js в Worker) | deploy (CI) |
| **Импорт** | D1 remote/local | `export-local-data`, парсеры |

**R2 не используется** — снимок отдаётся бесплатно через Cloudflare Pages.

## Структура `data/v1/`

```
data/v1/
  manifest.json           # счётчики, дата сборки
  breeds.json
  calendar/{year}.json    # has_results, results_file → competitions/
  competitions/{year}/{month}/{id}-{slug}.json
  dogs/by-id/{id}.json
  dogs/by-key/{dog_key}.json
  donino/speed_records.json
  donino/coursing_records.json
  donino/dogs/{dog_key}/speed.json | coursing.json
  indexes/calendar-index.json, dogs-index.json, events-by-id.json
  pc-db.sqlite              # генерируется, в .gitignore
```

`dog_key` = `slug(name_lat)--slug(breed)`.

### Поиск для ИИ

| Задача | Файл |
|--------|------|
| Оглавление | `manifest.json` |
| Турнир по id | `indexes/events-by-id.json` → `competitions/...` |
| Собака | `indexes/dogs-index.json` → `dogs/by-key/` |
| Календарь года | `calendar/2026.json` |
| Донино скорость / 350 м | `donino/speed_records.json` / `coursing_records.json` — **не смешивать** |

## Команды

```bash
# Выгрузка D1 → JSON (+ snapshot)
npm run sync-from-remote              # опционально
npm run export-local-data -- --local
npm run export-local-data -- --fetch-donino   # + Google Sheets → D1 → v1

# Снимок для Worker
npm run build-data-snapshot

# Dev
npm run dev                           # файлы, без D1
npm run dev:d1                        # legacy: wrangler + D1

# Проверка
npm run smoke-api
```

## Обновление прода

1. Правка JSON в `data/v1/` (или `export-local-data`)
2. `npm run build-data-snapshot`
3. `git commit` + `push` в `main`
4. CI (`deploy-frontend.yml`): `build-data-snapshot` → `package-pages-snapshot` → `frontend/public/data/v1/` → Pages + Worker

CI кладёт на Pages:
- `pc-db.sqlite.gz` и `pc-db-{hash}.sqlite.gz` (версионированный URL для Worker)
- `snapshot-latest.json` — `{ hash, exported_at, counts, gzip_bytes }`
- `manifest.json`, `donino/speed_records.json`

Worker читает снимок по `DATA_SNAPSHOT_HASH` (из CI) или `snapshot-latest.json`.

### Cron Донино (speed)

`update-speed-records.yml` (4×/день): Google Sheets → D1 → `data/speed-records.json` + `data/v1/donino/speed_records.json`.
Коммит с `[skip ci]` — **деплой не запускается**; для прода нужен отдельный push в `main` (или убрать `[skip ci]` и настроить path filters).

## Админка

| Среда | Сохранение |
|-------|------------|
| Локально (`npm run dev`) | `data/v1/pc-db.sqlite` после POST/PUT/DELETE |
| Прод | только чтение; правки → локально → git push |

## Код

| Путь | Назначение |
|------|------------|
| `backend/lib/local-data/` | загрузка JSON/SQLite, D1-shim, sql.js |
| `backend/src/local-dev-server.ts` | dev API :8787 |
| `backend/src/worker.ts` | prod: sql.js + fetch снимка с Pages |
| `backend/scripts/export/export-local-data-v1.ts` | D1 → data/v1/ |
| `backend/scripts/build-data-snapshot.ts` | JSON → pc-db.sqlite |
| `backend/scripts/ci/package-pages-snapshot.ts` | gzip + snapshot-latest.json для Pages (CI) |

## Связанные документы

- `docs/LOCAL-DATA-PLAN.md` — чеклист миграции (исторический)
- `docs/DATA-ARCHIVE.md` — снимки D1 в `data/archive/snapshots/` (бэкап)
- `docs/DATABASE.md` — D1 для импорта
