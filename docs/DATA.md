# Данные — `data/v1/` (канонический документ)

**Runtime сайта** (dev и prod) = JSON в `data/v1/`, отдаётся с CDN.  
**D1** = только импорт (парсеры, cron). **Админка** = только локально.

---

## Ментальная модель (30 секунд)

```
procoursing.ru / Google Sheets
        │
        ▼
   D1 (импорт) ──export-local-data──► data/v1/*.json  ◄── git, источник правды
        │                                    │
        │                                    ├─ build-derived-indexes → indexes/
        │                                    │
        │                                    ▼  CI: npm run build-all-data
        │                              frontend/public/data/v1/
        │                                    │
        ├─ npm run dev (админка)             ▼
        │   localhost:5173/admin             Cloudflare Pages CDN
        │   → API :8787                      coursing-stats.ru
        └─ dev:d1 (legacy)                   React → fetch /data/v1/*.json
```

| Кто читает | Откуда |
|------------|--------|
| **Посетитель (prod)** | `https://coursing-stats.ru/data/v1/` — без Worker, без D1 |
| **Посетитель (dev)** | Vite отдаёт `data/v1/` с диска на `/data/v1/*` |
| **Админка (dev)** | `/api` → proxy → `local-dev-server.ts` :8787 |
| **Импорт** | D1 → `npm run export-local-data` → `data/v1/` |

Код публичного слоя: `frontend/src/lib/staticData.ts`.

---

## Дерево `data/v1/`

```
data/v1/
├── manifest.json              # счётчики (частично обновляется админкой)
├── breeds.json                # список пород
├── calendar/{year}.json       # календарь года (без results)
├── competitions/{year}/{month}/{id}-{slug}.json   # турнир + results[]
├── dogs/
│   ├── by-id/{id}.json        # карточка собаки
│   └── by-key/{dog_key}.json  # тот же payload, второй индекс
├── donino/
│   ├── speed_records.json     # замер, км/ч
│   └── coursing_records.json  # бега 350 м, сек
├── indexes/                   # ⚠️ генерируется, не править вручную
│   ├── years.json
│   ├── top-placement-*.json, top-score-*.json, top-speed-*.json
│   ├── judges-summary.json, judges-raw-rows.json
│   ├── judge-details/{key}.json
│   ├── dog-profiles/{id}.json
│   └── events-by-id.json
└── pc-db.sqlite               # для dev-админки; не источник правды для прода
```

**Судьи** — отдельных файлов для правки нет. Данные судей внутри `competitions/` (поля event/results).  
`indexes/judge-details/` — производный индекс.

**Результаты** — не отдельные файлы, а массив `results` внутри `competitions/...json`.

---

## Что редактировать | Что не трогать

### ✏️ Редактируемые файлы (git)

| Тип | Путь | Как |
|-----|------|-----|
| Турниры + результаты | `competitions/...json` | Админка или JSON вручную |
| Собаки | `dogs/by-id/`, `dogs/by-key/` | Админка или JSON вручную |
| Календарь | `calendar/{year}.json` | JSON вручную или парсер календаря |
| Донино | `donino/*.json` | JSON или `fetch-speed-records` / cron |
| Породы | `breeds.json` | JSON вручную |

### 🚫 Не редактировать вручную (пересборка)

| Путь | Команда |
|------|---------|
| `indexes/*` | `npm run build-all-data` |
| `manifest.json` (полностью) | `build-all-data` / `export-local-data` |
| `frontend/public/sitemap.xml` | `build-derived-indexes` |

После правки `competitions/` или `dogs/` **обязательно** `npm run build-all-data` — иначе профили, топы, судьи на сайте устареют.

---

## Workflow: правка → прод

```
1. npm run dev                         # или scripts/start-servers.bat
2. Правки:
   • UI:  http://localhost:5173/admin
   • API: http://127.0.0.1:8787  (через proxy /api)
   • или напрямую файлы в data/v1/
3. npm run build-all-data              # пересобрать indexes (обязательно!)
4. Проверка на http://localhost:5173
5. git commit && git push main         # или scripts/deploy-to-github.bat
   → CI снова запустит build-all-data и задеплоит Pages
```

### Что делает админка при сохранении

Автоматически (POST/PUT/DELETE `/api/admin/*`):

- `competitions/...`
- `dogs/by-id/`, `dogs/by-key/`
- счётчики в `manifest.json`

**Не обновляет автоматически:** `calendar/`, `indexes/`, `breeds.json`.  
Для календаря после правки метаданных турнира — обновите `calendar/*.json` отдельно или `export-local-data`.

### Админка

| | |
|--|--|
| UI | `http://localhost:5173/admin` |
| API | `http://127.0.0.1:8787` |
| Auth | заголовок `X-Admin-Token` = `ADMIN_API_TOKEN` (пустой локально = без пароля) |
| Код | `backend/src/local-dev-server.ts` → `sync-sqlite-to-v1.ts` |

D1 в рантайме админки **не используется** — sqlite в памяти, загруженный из `data/v1/`.

---

## Workflow: импорт из D1

```
npm run sync-from-remote              # опционально: свежая remote D1
npm run export-local-data -- --local  # D1 → data/v1/
npm run build-all-data
git commit && push
```

Подробно про D1: `docs/DATABASE.md`.  
Бэкап-снимки D1: `docs/DATA-ARCHIVE.md` (`npm run export-archive`).

---

## Ключевой код

| Путь | Роль |
|------|------|
| `frontend/src/lib/staticData.ts` | Публичный сайт: fetch `/data/v1/` |
| `frontend/vite.config.ts` | Dev: plugin `serveDataV1` |
| `backend/lib/local-data/` | Загрузка JSON для админки |
| `backend/src/local-dev-server.ts` | Dev API :8787 |
| `backend/scripts/build-all-data.ts` | CI pipeline |
| `backend/scripts/build-derived-indexes.ts` | `indexes/*`, sitemap |
| `backend/scripts/ci/package-pages-snapshot.ts` | Копия в `frontend/public/data/v1/` |
| `backend/scripts/sync/sync-sqlite-to-v1.ts` | Админка → JSON на диск |

Worker (`backend/src/worker.ts`) **не деплоится в CI** — legacy для `npm run dev:d1`.

---

## Счётчики (актуально)

Смотреть `data/v1/manifest.json`. Ориентир (2026-07):

| Сущность | ~кол-во |
|----------|---------|
| events (календарь) | 389 |
| competitions с results | 56 |
| dogs | 1532 |
| results | 2958 |
| donino speed / coursing | 191 / 107 |
| breeds | 86 |

D1 remote может отличаться — только для импорта.

---

## Связанные документы

| Документ | Когда читать |
|----------|--------------|
| `docs/ARCHITECTURE.md` | Общая архитектура, компоненты |
| `docs/DATABASE.md` | Схема D1, миграции, sync |
| `docs/PARSING.md` | Парсеры procoursing.ru |
| `docs/API-REFERENCE.md` | Эндпоинты локального API |
| `docs/SPEED-RECORDS.md` | Донино, Google Sheets |
| `docs/DECISIONS-LOG.md` | Почему CDN, не Worker |
