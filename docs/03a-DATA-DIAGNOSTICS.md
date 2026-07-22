# Диагностика данных — пустой рейтинг/судьи на проде

> **Канон по структуре данных:** [`03-DATA.md`](03-DATA.md).  
> **Runbook деплоя:** [`20-OPERATIONS.md`](20-OPERATIONS.md).  
> **Симптом → fix:** [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md).

---

## Симптом

Календарь и события на [coursing-stats.ru](https://coursing-stats.ru) работают, а **рейтинг**, **судьи** и иногда кажется, что **Донино** — пустые. Локально (`npm run dev`) всё в порядке.

## Причина (типичная)

CI при деплое запускает `build-all-data` → `build-derived-indexes`, который читает **`data/v1/pc-db.sqlite`**. Если в snapshot **нет строк в `results`**, индексы (`indexes/top-*`, `judges-summary`, `dog-profiles/`) перезаписываются **пустыми** и уезжают на CDN — при этом HTTP 200 и валидный JSON с `"count": 0`.

Публичный сайт читает именно **индексы**, не `competitions/*.json` напрямую (рейтинг/судьи). Донино читает `donino/*.json` — они не зависят от `results` в sqlite; если Донино пусто, проверьте отдельно файл на CDN ([`09a-DONINO-PIPELINE.md`](09a-DONINO-PIPELINE.md)).

## Цепочка сборки (важно для ИИ)

```
data/v1/competitions/*.json  (results[] внутри файлов)
        │
        ▼  build-data-snapshot  →  load-sqlite.ts  →  pc-db.sqlite
        │
        ▼  build-derived-indexes.ts  (SQL по results)
        │
        ▼  data/v1/indexes/*.json  →  CI  →  coursing-stats.ru/data/v1/
```

**Критично:** `backend/lib/local-data/load-sqlite.ts` → `loadCompetitions()` должен загружать **`results`** из каждого `competitions/...json` (поля `dog_id`, `event_id`, вложенный `dog`). Без этого snapshot на CI имеет `results: 0`.

## Быстрая проверка прода

```bash
# PowerShell / curl — смотреть count, не только HTTP 200
curl -s https://coursing-stats.ru/data/v1/indexes/judges-summary.json | head -c 200
curl -s https://coursing-stats.ru/data/v1/indexes/top-placement-2026.json | head -c 200
```

Ожидается `"count"` > 0 и непустые массивы `judges` / `items`.

## Быстрая проверка локально перед push

```bash
npm run build-data-snapshot    # в логе: results: > 0 (ориентир ~3000+)
npm run build-all-data         # падает, если индексы пустые
npx vitest run backend/tests/static-indexes.test.ts
```

## Защита в CI

- `build-all-data.ts` — `assertNonEmptyIndex` для `top-placement-all` и `judges-summary`
- `.github/workflows/deploy-frontend.yml` — `static-indexes.test.ts` после `build-all-data`

Подробнее: skill `.cursor/skills/coursing-stats-dev/data-build-pipeline.md` (или `.devin/skills/coursing-stats-dev/SKILL.md`).

## См. также

| Документ | Когда |
|----------|--------|
| [`03-DATA.md`](03-DATA.md) | Структура `data/v1/`, workflow |
| [`20-OPERATIONS.md`](20-OPERATIONS.md) | Деплой, чеклисты |
| [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md) | Симптом → fix |
