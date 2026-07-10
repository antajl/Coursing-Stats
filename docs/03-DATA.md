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

Код публичного слоя: `frontend/src/hooks/useStaticData.ts`.

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

## Диагностика: локально есть данные, на проде пусто

**Симптом:** календарь и события на [coursing-stats.ru](https://coursing-stats.ru) работают, а **рейтинг**, **судьи** и иногда кажется, что **Донино** — пустые. Локально (`npm run dev`) всё в порядке.

**Причина (типичная):** CI при деплое запускает `build-all-data` → `build-derived-indexes`, который читает **`data/v1/pc-db.sqlite`**. Если в snapshot **нет строк в `results`**, индексы (`indexes/top-*`, `judges-summary`, `dog-profiles/`) перезаписываются **пустыми** и уезжают на CDN — при этом HTTP 200 и валидный JSON с `"count": 0`.

Публичный сайт читает именно **индексы**, не `competitions/*.json` напрямую (рейтинг/судьи). Донино читает `donino/*.json` — они не зависят от `results` в sqlite; если Донино пусто, проверьте отдельно файл на CDN.

### Цепочка сборки (важно для ИИ)

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

### Быстрая проверка прода

```bash
# PowerShell / curl — смотреть count, не только HTTP 200
curl -s https://coursing-stats.ru/data/v1/indexes/judges-summary.json | head -c 200
curl -s https://coursing-stats.ru/data/v1/indexes/top-placement-2026.json | head -c 200
```

Ожидается `"count"` > 0 и непустые массивы `judges` / `items`.

### Быстрая проверка локально перед push

```bash
npm run build-data-snapshot    # в логе: results: > 0 (ориентир ~3000+)
npm run build-all-data         # падает, если индексы пустые
npx vitest run backend/tests/static-indexes.test.ts
```

### Защита в CI

- `build-all-data.ts` — `assertNonEmptyIndex` для `top-placement-all` и `judges-summary`
- `.github/workflows/deploy-frontend.yml` — `static-indexes.test.ts` после `build-all-data`

Подробнее: `docs/DECISIONS-LOG.md` (2026-07-09), skill `.cursor/skills/coursing-stats-dev/data-build-pipeline.md`.

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

Подробно про D1: `docs/12-DATABASE-SCHEMA.md` (схема) и `docs/13-DATABASE-WORKFLOW.md` (workflow).  
Бэкап-снимки D1: `docs/archive/02-MIGRATION-TO-STATIC-DATA.md` (`npm run export-archive`).

---

## Ключевой код

| Путь | Роль |
|------|------|
| `frontend/src/hooks/useStaticData.ts` | Публичный сайт: fetch `/data/v1/` |
| `frontend/vite.config.ts` | Dev: plugin `serveDataV1` |
| `frontend/scripts/copy-data.js` | Копирует `data/v1/` в `public/data/v1/` перед билдом |
| `frontend/package.json` | Build: `"build": "node scripts/copy-data.js && vite build"` |
| `backend/lib/local-data/` | Загрузка JSON для админки |
| `backend/src/local-dev-server.ts` | Dev API :8787 |
| `backend/scripts/build-all-data.ts` | CI pipeline |
| `backend/scripts/build-derived-indexes.ts` | `indexes/*`, sitemap |
| `backend/scripts/sync/sync-sqlite-to-v1.ts` | Админка → JSON на диск |

Worker (`backend/src/worker.ts`) **не деплоится в CI** — legacy для `npm run dev:d1`.

---

## Счётчики (актуально)

Смотреть `data/v1/manifest.json`. Ориентир (2026-07):

| Сущность | ~кол-во |
|----------|---------|
| events (календарь) | 224 |
| events с results | 94 |
| dogs | 2034 |
| results (в competitions) | ~3000 |
| donino speed / coursing | 191 / 107 |
| breeds | 86 |

Архивные HTML протоколы: `WebArchiveResults/pages/{year}/` (2022: 2 файла, 2023: 42 файла, 2024: 56 файлов).

---

## WebArchiveResults/ — Архив web.archive.org

Директория содержит скачанные данные с web.archive.org для восстановления исторических результатов procoursing.ru (2022–2024).

### Структура

```
WebArchiveResults/
├── calendars/              # Календари по годам (исходные HTML)
├── pages/                  # Страницы результатов по годам (исходные HTML)
├── parsed/                 # Распарсенные данные (JSON)
└── result-links.json       # Ссылки на результаты из календарей
```

### Назначение

- **calendars/** — исходные HTML календари с web.archive.org для парсинга
- **pages/** — исходные HTML страниц результатов для парсинга
- **parsed/** — временные JSON файлы с распарсенными данными (промежуточный формат)
- **result-links.json** — индекс ссылок на результаты для массового скачивания

### Использование

Данные используются скриптами в `backend/scripts/web-archive/` для:
- Извлечения ссылок результатов из календарей
- Скачивания страниц результатов
- Очистки HTML от баннеров web.archive.org
- Парсинга результатов существующими парсерами
- Интеграции в `data/v1/`

Подробности интеграции: см. раздел "Web Archive Integration (2026-07-08)" выше.

D1 remote может отличаться — только для импорта.

---

## Связанные документы

| Документ | Когда читать |
|----------|--------------|
| `docs/02-ARCHITECTURE.md` | Общая архитектура, компоненты |
| `docs/12-DATABASE-SCHEMA.md` | Схема D1 |
| `docs/13-DATABASE-WORKFLOW.md` | Миграции, sync |
| `docs/14-PARSING-RULES.md` | Правила парсеров procoursing.ru |
| `docs/15-PARSING-IMPLEMENTATION.md` | Детали парсеров |
| `docs/05-API-REFERENCE.md` | Эндпоинты локального API |
| `docs/09-SPEED-RECORDS.md` | Донино, Google Sheets |
| `docs/19-HISTORY.md` | Почему CDN, не Worker |

---

## Data Archive — Файловый архив данных

Локальное хранилище снимков D1 для бэкапа и импорта в `data/v1/`.

### Быстрый старт

```bash
# Экспорт с production D1 (по умолчанию)
npm run export-archive

# Из локальной D1
npm run export-archive -- --local

# Своя папка
npm run export-archive -- --output data/archive/snapshots/manual-run
```

Скрипт: `backend/scripts/export/export-data-archive.ts`

### Куда складывается

```
data/archive/snapshots/YYYY-MM-DDTHH-mm-ss/
```

Папка `data/archive/snapshots/` в `.gitignore` — **не коммитить** (большие файлы).

В git остаются:
- `data/archive/README.md` — краткая справка
- `data/archive/_schema/v1/README.md` — черновик **целевой** файловой схемы

### Структура снимка

| Путь | Назначение |
|------|------------|
| `manifest.json` | дата, счётчики, покрытие по годам |
| `README.md` | краткое описание снимка |
| `snapshot/full-dump.sql` | полный SQL-дамп D1 (восстановление) |
| `snapshot/d1-schema.sql` | копия `backend/schema.sql` на момент экспорта |
| `tables/*.json` | таблицы D1 как есть (1 файл = 1 таблица) |
| `by-year/events/{year}.json` | календарь по годам |
| `by-year/results/{year}.json` | результаты с вложенными `event` и `dog` |
| `competitions/{id}.json` | **одно соревнование = один JSON** (event + results[]) |
| `donino/speed_records.json`, `coursing_records.json` | рекорды Донино |
| `donino/speed_by_breed/`, `coursing_by_breed/` | разбивка по породам |
| `indexes/dogs-by-id.json`, `events-by-id.json` | справочники для lookup |

JSON-поля (`raw_scores_json`, `history`, `track_schemes`) разворачиваются в объекты, где возможно.

### Web Archive Integration (2026-07-08)

В июле 2026 года выполнена интеграция данных из web.archive.org для восстановления исторических результатов 2022–2024 годов.

**Источники:**
- Календари: `WebArchiveResults/calendars-cleaned/*.html` (очищенные от баннеров web.archive.org)
- Результаты: `WebArchiveResults/cleaned/{year}/` (очищенные HTML страниц результатов)
- Парсинг: существующие парсеры (coursing, bzmp, racing) с windows-1251 декодированием

**Добавленные данные:**
- **2022:** 1 событие, 33 результата
- **2023:** 22 события, 1233 результата
- **2024:** 26 событий, 1423 результата

**Итого:** 49 событий, 2689 результатов из web-archive

**Процесс интеграции:**
1. Скачаны календари и страницы результатов с web.archive.org
2. Удалены баннеры и скрипты web.archive.org из HTML
3. Протестированы существующие парсеры на очищенных файлах
4. Распарсены результаты и экспортированы в JSON по годам
5. Интегрированы в `data/v1/calendar/{year}.json` и `data/v1/competitions/{year}/{month}/`
6. Пересобраны индексы (calendar-index, top-placement/score/speed, dog-profiles)

**Скрипты интеграции:**
- `backend/scripts/web-archive/extract-results-urls.ts` — извлечение ссылок результатов из календарей
- `backend/scripts/web-archive/download-results.ts` — скачивание страниц результатов
- `backend/scripts/web-archive/clean-web-archive-html.ts` — очистка HTML от баннеров
- `backend/scripts/web-archive/test-parsers-on-web-archive.ts` — тестирование парсеров
- `backend/scripts/web-archive/parse-and-export.ts` — парсинг и экспорт в JSON
- `backend/scripts/web-archive/cleanup-2024-calendar.ts` — очистка календаря от дубликатов
- `backend/scripts/web-archive/add-missing-2024-events.ts` — добавление недостающих событий
- `backend/scripts/web-archive/clean-calendar-html.ts` — очистка календарей от баннеров

### Восстановление из SQL

```bash
npx wrangler d1 execute pc-db --local --file=data/archive/snapshots/.../snapshot/full-dump.sql --yes
```

Для remote — только осознанно, с бэкапом (`DATABASE.md`).

### Целевая схема v1 (будущее)

Черновик **новой** файловой структуры (не D1):

`data/archive/_schema/v1/README.md`

Идея:
- `competitions/{year}/{event_key}.json` — стабильный slug, не numeric id
- `dogs/by-key/{dog_key}.json` — каноническая собака
- `source.results_url` — ссылка на procoursing сохраняется как **источник**, не как зависимость UI

Текущий экспорт `competitions/{id}.json` — промежуточный формат (v0), удобен для перепарсинга и ручной проверки.

### Связь с procoursing.ru

| Что | Зависимость |
|-----|-------------|
| Показ сайта из архива / D1 | **Нет** — данные локальные |
| Обновление новых соревнований | **Да** — пока парсер ходит на procoursing |
| Полная история 2015–2024 в таблицах | **Нет** — не распарсено |
| Публичный UI календаря и протоколов | **Нет** (с 2026-07-10) — агрегаты на coursing-stats.ru; первичные протоколы на procoursing.ru |
| Встраивание в iframe | **Да** — `frontend/public/_headers`, `frame-ancestors` для procoursing.ru |
