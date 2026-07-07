# План миграции (завершён)

> **Актуальная документация:** [`LOCAL-DATA.md`](LOCAL-DATA.md)

Миграция на `data/v1/` выполнена (2026-07-07). R2 не используется.

## Статус

- [x] Фаза 1: `export-local-data` → `data/v1/`
- [x] Фаза 2: `npm run dev` без D1
- [x] Фаза 3: prod Worker читает снимок с Pages (без R2)
- [ ] Cron `update-db.yml` → export-local-data + deploy (опционально; сейчас только `workflow_dispatch` → D1)
- [ ] Cron speed: после обновления `data/v1/` — автодеплой или отдельный pipeline

## Осталось по желанию

- `diff-donino` CLI
- 2 падающих теста `racing-heats.test.ts`
