# Operations — Runbook

Единая точка входа: локальная разработка, сборка данных, деплой, диагностика «локально ок — на проде нет».

**Канон по данным:** [`03-DATA.md`](03-DATA.md) · **Симптомы:** [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md)

---

## Быстрый старт

```bash
npm install && cd frontend && npm install && cd ..
npm run dev                    # :5173 + admin API :8787
```

Первый раз: `data/v1/` уже в git. При необходимости: `npm run build-all-data`

Подробнее: [`01-GETTING-STARTED.md`](01-GETTING-STARTED.md)

---

## Ежедневный workflow

```
1. npm run dev
2. Правки (админка / файлы data/v1/ / код)
3. npm run build-all-data          # обязательно после правок data/v1/
4. Проверка на http://localhost:5173
5. git commit && git push main     # только по просьбе пользователя
   → CI: build-all-data → Pages deploy
```

---

## Перед push (чеклист)

```bash
npm run build-data-snapshot        # в логе: results > 0
npm run build-all-data             # не падает; индексы не пустые
npx vitest run backend/tests/static-indexes.test.ts
```

Если `results: 0` или `top-placement-all.json` с `"count": 0` — **не пушить** до исправления. См. «Пустой рейтинг на проде» ниже.

---

## Деплой

| Что | Как |
|-----|-----|
| Прод-сайт | Push в `main` → `.github/workflows/deploy-frontend.yml` |
| Хостинг | Cloudflare Pages `coursingstats` |
| Данные на CDN | `frontend/public/data/v1/` (генерируется CI, не в git) |
| Worker | **Не деплоится** в CI (legacy) |
| Donino cron | `update-speed-records.yml` — 4×/день, **только** `speed_records.json` |

Windows: `scripts/deploy-to-github.bat` (перед push: `git pull --rebase`; при конфликте в `donino/` — предпочитать локальный/свежий Sheets, не remote CI).

**Коммиты и push — только по явной просьбе пользователя.**

---

## Донино: локальный экспорт → прод

```bash
scripts\update-donino.bat     # speed + coursing 350 м → data/v1/donino/
scripts\deploy-to-github.bat  # иначе прод не увидит изменения
```

`npm run export-donino` = обе таблицы. Cron обновляет только замер скорости.

Симптом «локально новые, на проде старые»: [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md).

---

## Кэш фронта (без Ctrl+F5 у пользователей)

| Слой | Политика |
|------|----------|
| HTML (`/`, `/index.html`, prerender hubs) | `no-cache` — всегда свежий shell с новыми хэшами JS |
| `/assets/*-[stamp]-[hash].*` | `no-cache, must-revalidate` (не immutable): при гонке деплоя SPA может отдать HTML на URL чанка — браузер не должен держать это часами |
| Missing `/assets/*` | На Pages rewrite 404 в `_redirects` **нельзя**. Не добавлять корневой `404.html` (ломает SPA). |
| Сбой чанка после деплоя | авто-`reload` + **build-stamp** в Vite banner → новые хэши vendor на каждый CI |

Не возвращать unhashed имена чанков (`MedalTally.js`) и не ставить SPA-fallback на `/assets/*`.

---

## build-all-data

```bash
npm run build-all-data
```

- Пересобирает `data/v1/indexes/`, sitemap
- CI запускает при каждом deploy
- **Fatal**, если `top-placement-all` или `judges-summary` пустые

Skill (Cursor): `.cursor/skills/coursing-stats-dev/data-build-pipeline.md`  
Skill (Devin): `.devin/skills/coursing-stats-dev/SKILL.md`

---

## Breed Archive (pedigree_url)

```bash
npm run enrich-breedarchive-urls              # все без ссылки
npm run enrich-breedarchive-urls -- --dry-run
npm run enrich-breedarchive-urls -- --dog-id 5652
npm run build-all-data                        # обязательно
```

Прод показывает ссылку только если:
1. `pedigree_url` в `indexes/dog-profiles/{id}.json`
2. Задеплоены фронт (`DogProfile.tsx`) и данные

Канон: [`03-DATA.md`](03-DATA.md) → «Breed Archive и pedigree_url»

---

## Пустой рейтинг / судьи на проде

Симптом: локально ок, на coursing-stats.ru пусто; CDN `200` с `"count": 0`.

```bash
npm run build-data-snapshot    # results > 0
npm run build-all-data
npx vitest run backend/tests/static-indexes.test.ts
```

**Канон процедуры** (цепочка сборки, curl, `loadCompetitions`): [`03a-DATA-DIAGNOSTICS.md`](03a-DATA-DIAGNOSTICS.md). Симптом → index: [`16-TROUBLESHOOTING.md`](16-TROUBLESHOOTING.md).

---

## Локально ок, на проде старый UI / фильтры

- Проверить, что изменения **закоммичены и запушены**
- Фронт деплоится отдельно от локального `npm run dev`
- Hard refresh / инкognito (кэш CDN)

---

## Импорт из remote D1 (legacy, редко)

Скрипты `sync-from-remote` / `export-local-data` в текущем `package.json` **отсутствуют**.
Актуальный путь: правки `data/v1/` или `npm run sync-sqlite-to-v1` после локального парсинга → `npm run build-all-data`.

Исторический D1 workflow: [`13-DATABASE-WORKFLOW.md`](13-DATABASE-WORKFLOW.md) (частично устарел).

---

## Бэкап D1 / архив

```bash
npm run export-archive
```

Снимки: `data/archive/snapshots/`. Канон архива: [`03-DATA.md`](03-DATA.md) → «Data Archive».


---

## Связанные документы

| Задача | Документ |
|--------|----------|
| npm-скрипты, backend scripts | [`11-DEVELOPMENT.md`](11-DEVELOPMENT.md) |
| Админка | [`17-ADMIN-WORKFLOW.md`](17-ADMIN-WORKFLOW.md) |
| Парсеры | [`14-PARSING-RULES.md`](14-PARSING-RULES.md) |
| Тесты | [`08-TESTING.md`](08-TESTING.md) |
