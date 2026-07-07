# План миграции (завершён)

> **Актуальная документация:** [`LOCAL-DATA.md`](LOCAL-DATA.md)

Миграция на `data/v1/` выполнена (2026-07-07). R2 не используется.

## Статус

- [x] Фаза 1: `export-local-data` → `data/v1/`
- [x] Фаза 2: `npm run dev` без D1
- [x] Фаза 3: prod Worker читает снимок с Pages (без R2)
- [ ] Cron `update-db.yml` → перевести на export + deploy (опционально)

## Осталось по желанию

- `diff-donino` CLI
- 2 падающих теста `racing-heats.test.ts`
