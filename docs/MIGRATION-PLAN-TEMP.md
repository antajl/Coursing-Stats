# План миграции data/v1 (временный)

> **Удалить после завершения всех фаз.** Актуальная документация: [`LOCAL-DATA.md`](LOCAL-DATA.md)

**Цель:** `data/v1/*.json` — единственный источник правды. Всё остальное (sqlite, indexes, gzip) — derived artifacts, собираются в CI.

**Приоритеты:** стабильность → скорость на проде → удобство правок.

---

## Текущая цепочка (целевая)

```
procoursing.ru / Google Sheets
        │
        ▼
   D1 (только импорт) ──export-local-data──► data/v1/*.json
        │                                              │
        │ cron speed (4×/день)                         │ npm run build-all-data
        ▼                                              ▼
   sync-speed-records                          pc-db.sqlite.gz
        │                                      indexes/*.json (фаза 2)
        └── export-donino-speed-v1 ──────────► donino/*.json
                                                       │
                                                       ▼
                                              Cloudflare Pages (CDN)
                                                       │
                                                       ▼
                                              Worker (sql.js + static JSON)
                                                       │
                                                       ▼
                                              api.coursing-stats.ru
```

| Среда | Источник |
|-------|----------|
| Dev | `data/v1/` → sqlite в памяти (better-sqlite3) |
| Prod | gzip snapshot + static JSON с Pages |
| Импорт | D1 remote/local → `export-local-data` |

---

## Фаза 1 — Закрыть sync loop ✅ в работе

**Статус:** частично сделано (CI package script, cron speed → data/v1).

| # | Задача | Файлы | Статус |
|---|--------|-------|--------|
| 1.1 | CI package без bash heredoc | `package-pages-snapshot.ts`, `deploy-frontend.yml` | ✅ |
| 1.2 | Cron speed → `data/v1/donino/` + deploy (без `[skip ci]`) | `update-speed-records.yml`, `export-donino-speed-v1.ts` | ✅ |
| 1.3 | Dev: rebuild sqlite если JSON новее снимка | `snapshot-freshness.ts`, `node-data-store.ts` | ✅ |
| 1.4 | Admin → round-trip в JSON после мутаций | `sync-sqlite-to-v1.ts`, `local-dev-server.ts` | ✅ |
| 1.5 | `ci-update-db` → `export-local-data` после D1 | `ci-update-db.ts`, `update-db.yml` | ✅ |
| 1.6 | Единая команда `build-all-data` | `build-all-data.ts`, `package.json` | ✅ |
| 1.7 | Документация + `.gitignore` | docs, `.gitignore` | ✅ |

**Критерий готовности:** push в `main` → deploy успешен → `/api/stats` ≈ 389 events, 191 speed.

---

## Фаза 2 — Precomputed indexes (производительность) ✅ в работе

**Статус:** скрипт и fast path для top/judges готовы.

| # | Задача | Файлы | Статус |
|---|--------|-------|--------|
| 2.1 | Скрипт `build-derived-indexes.ts` | новый | ✅ |
| 2.2 | `indexes/top-placement-{year}.json` | из `v_top_by_placement` | ✅ |
| 2.3 | `indexes/top-score-{year}.json` | из `v_top_by_score` | ✅ |
| 2.4 | `indexes/top-speed-{year}.json` | racing speeds | ⏳ |
| 2.5 | `indexes/judges-summary.json` | `judges.ts` fast path | ✅ |
| 2.6 | `indexes/sitemap-urls.json` | chunks для sitemap | ✅ |
| 2.7 | Routes: fast path если запрос «стандартный» | `top.ts`, `judges.ts` | ✅ |
| 2.8 | `package-pages-snapshot` копирует indexes | `package-pages-snapshot.ts` | ✅ |
| 2.9 | Тесты parity SQL vs indexes | `local-data.test.ts` | ⏳ |

**Критерий:** `/api/top/placement?year=2025` без SQL на горячем пути; cold start Worker быстрее.

---

## Фаза 3 — Упростить prod loader ✅ частично

| # | Задача | Файлы | Статус |
|---|--------|-------|--------|
| 3.1 | Donino API читает static JSON с Pages | `speed.ts`, `static-api.ts` | ✅ |
| 3.2 | Убрать `hydrateDoninoSpeedIfEmpty` | `worker-db.ts` | ⏳ (оставлен как fallback) |
| 3.3 | `build-data-snapshot` гарантирует speed в sqlite | `load-sqlite.ts` | ✅ |
| 3.4 | Cron coursing → `data/v1/donino/coursing_records.json` | cron | ⏳ |

**Критерий:** speed/coursing на проде совпадают с `data/v1/donino/*.json` без fallback.

---

## Фаза 4 — R2 (опционально)

| # | Задача |
|---|--------|
| 4.1 | R2 bucket для `pc-db-{hash}.sqlite.gz` |
| 4.2 | Deploy данных без полного rebuild фронта |
| 4.3 | Worker `DATA_SNAPSHOT_URL` → R2 |

**Когда:** если Donino/snapshot обновляется чаще, чем фронт.

---

## Фаза 5 — Парсеры напрямую в JSON (долгосрочно)

| # | Задача |
|---|--------|
| 5.1 | Парсеры пишут `competitions/{year}/{month}/{id}.json` |
| 5.2 | D1 только legacy / удалить |
| 5.3 | `export-local-data` → инкрементальный merge |

---

## Ежедневные workflow (целевые)

### Ручная правка турнира
```bash
# правка competitions/2026/04-апрель/1310-....json
npm run dev                    # подхватит свежий JSON
git commit && push             # CI → prod
```

### Обновление с procoursing
```bash
npm run reparse-2026-coursing
npm run export-local-data -- --local
git commit && push
```

### Donino (cron или вручную)
```bash
npm run export-local-data -- --fetch-donino
# cron 4×/день → commit → deploy
```

### Admin локально
```
UI → sqlite + JSON sync → git commit → push
```

### CI полный pipeline
```bash
npm run build-all-data   # snapshot + package + indexes (фаза 2)
```

---

## Чеклист перед удалением этого файла

- [ ] Фаза 1: prod stats корректны
- [ ] Фаза 2: indexes на проде, routes fast path
- [ ] Фаза 3: Donino без hydration hack
- [ ] Фаза 4: решение по R2 принято
- [ ] `LOCAL-DATA.md` обновлён
- [ ] `LOCAL-DATA-PLAN.md` архивирован или удалён

---

*Создан: 2026-07-07. Обновлять по ходу выполнения фаз.*
