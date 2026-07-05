# Frontend Map — Навигация для ИИ-агентов

Краткий гид по структуре React-приложения Coursing Stats (июль 2026).

## Shell и маршрутизация

| Файл | Роль |
|------|------|
| `frontend/src/App.tsx` | Shell: `QueryProvider`, `Router`, `Nav`, `AppRoutes`, skip-link, layout |
| `frontend/src/AppRoutes.tsx` | Все top-level маршруты через `React.lazy()` + `Suspense` + `PageLoader` |
| `frontend/src/components/Nav.tsx` | Шапка: `.nav-glass`, лого слева / ссылки по центру экрана / тема+источники справа, мобильное меню |
| `frontend/src/components/ThemeToggle.tsx` | Переключатель темы; по умолчанию light |
| `frontend/vite.config.ts` | Vite (TypeScript); `manualChunks` для vendor и code-splitting |

**Нет shadcn/ui** — UI в `frontend/src/components/ui/` (`Button`, `Card`, `Badge` и др.).

## Маршруты (`AppRoutes.tsx`)

| Path | Компонент | Описание |
|------|-----------|----------|
| `/` | `Home.tsx` | Лендинг (WIP): hero, счётчики, ближайшее событие |
| `/competitions` | `Competitions.tsx` | Hub вкладок соревнований procoursing.ru |
| `/top` | `TopDogs/index.tsx` | Прямой доступ к рейтингу (`?rankingTab=score` \| `speed`; дублирует вкладку в `/competitions`) |
| `/dog/:id` | `DogProfile.tsx` | Профиль собаки из БД соревнований |
| `/event/:id` | `Events/EventResults/` | Результаты одного события (см. ниже) |
| `/speed-records` | `SpeedRecords/index.tsx` | Рекорды Донино (отдельный источник данных) |
| `/donino-dog/:name/:breed` | `DoninoDogProfile.tsx` | Профиль собаки из рекордов Донино |
| `/judges` | `Judges/index.tsx` | Список судей |
| `/judges/:judgeId` | `Judges/JudgeDetail.tsx` | Детальная статистика судьи |

## Competitions = tab hub

`Competitions.tsx` — не отдельный раздел данных, а **контейнер вкладок** для всего, что приходит с procoursing.ru:

| Вкладка (`?tab=`) | Lazy-компонент | Содержимое |
|-------------------|----------------|------------|
| `calendar` (default) | `Events/index.tsx` | Календарь событий |
| `ranking` | `TopDogs/index.tsx` | Рейтинг: места / очки / скорость (`?rankingTab=score` \| `speed`; default — места) |
| `judges` | `Judges/index.tsx` | Судьи (тот же список, что `/judges`) |

В `Nav.tsx` ссылка «Соревнования» ведёт на `/competitions`.

## SpeedRecords ≠ competitions

**Рекорды Донино** — отдельная вертикаль:

- Данные: Google Sheets → D1 `speed_records`, не procoursing.ru
- Маршрут: `/speed-records` (в Nav — «Рекорды Донино»)
- Профили: `/donino-dog/:name/:breed` (кириллические клички из таблицы)
- Не путать с `/dog/:id` (собаки из `dogs` + `results` соревнований)

## Два соглашения об именах собак

### Соревнования (procoursing.ru)

В БД и UI — **два поля**:

- `name_lat` — латиница (основное в таблицах)
- `name_ru` — кириллица (подпись вторым рядом, если есть)

Формат отображения: латиница крупно, русское ниже приглушённо. API: `/api/dogs/:id`, рейтинги, результаты событий.

### Донино (speed_records)

- Одно поле `name` — **преимущественно кириллица**
- Порода и пол в формате таблицы Google Sheets (`С`/`К`)
- Поиск и профиль: `/donino-dog/:name/:breed`

При работе с кличками всегда уточняй контекст: **competition dog** (`dog_id`) vs **Donino record** (`name` + `breed`).

## Календарь событий (`Events/`)

| Файл | Роль |
|------|------|
| `index.tsx` | Фильтры, группировка по месяцам, список |
| `EventListRow.tsx` | Одна строка события (клик → `/event/:id`) |
| `eventListUtils.ts` | Цвета дисциплин, `getEventHeadline`, `parseJudgeNames`, `groupEventsByMonth`, `getEventYear` |

**Фильтры (inline-тулбар):** поиск, год, дисциплина, вид соревнования (`FilterSelect` без подписей — подсказки в `allLabel`: «Все года», «Все дисциплины»…); пресеты «30 дней» / «Чемпионаты»; легенда дисциплин и счётчик справа в одной строке с пресетами. Сортировка фиксирована по `date_start` asc.

**Строка:** заголовок `competition_kind · competition_type`; левый бордер по дисциплине; чемпионаты — золотой фон; справа участники (в строке заголовка) + судьи (отдельная колонка, до 4 имён).

## EventResults — разбивка по дисциплинам

Папка `frontend/src/pages/Events/EventResults/`:

| Файл | Роль |
|------|------|
| `index.tsx` | Загрузка event + results, layout |
| `EventHeader.tsx` | Шапка события (судьи, схемы трасс) |
| `ResultsSection.tsx` | Группы по `breed_class` |
| `ResultCard.tsx` | `<details>` на одну собаку |
| `ResultSummary.tsx` | Строка summary (место, кличка, баллы) |
| `details/DetailPanel.tsx` | Роутер по типу детализации |
| `details/RacingDetail.tsx` | **Бега борзых** — время и скорость |
| `details/ScoringDetail.tsx` | **Курсинг + БЗМП** — общий UI оценок судей |
| `components/` | PlacementBadge (`.placement-badge-bronze` для 3-го места), DogNameLink, QualificationBadges |
| `utils.ts` | `isRacingFormat()`, группировка, parse JSON |

**Почему не 4 отдельных файла дисциплин:** курсинг и БЗМП используют одинаковую таблицу оценок (М/Р/В/П/Э, 2 забега). Racing — принципиально другой формат. «Другие» турниры — fallback без детальной панели.

## TopDogs

```
frontend/src/pages/TopDogs/
  index.tsx           — hooks, API, filtered data
  TopDogsFilters.tsx  — поиск, год, FiltersDropdown
  TopDogsTabs.tsx     — вкладки + DogStatsTable (медали в заголовках колонок, числа в ячейках)
  filterUtils.ts      — filterPlacement/Score/Speed
```

## SpeedRecords

```
frontend/src/pages/SpeedRecords/
  index.tsx              — вкладки (shell)
  useSpeedRecordsPage.ts — state, memos, handlers
  SpeedTableTab.tsx      — замер скорости (Donino)
  CoursingTableTab.tsx   — бега борзых (Donino coursing sheet)
  exportExcel.ts         — lazy xlsx export
  Stats.tsx              — (удалён) → stats/SpeedStatsView, stats/CoursingStatsView
```

**Даты и статистика 350 м:** `frontend/src/lib/recordDates.ts` — даты замеров, `dedupeByRecordDate`, `coursingTimesToStats`, `time350ToSpeedKmh`.

**Query params:** `?tab=table` | `coursing`; `?view=stats` — статистика внутри дисциплины (вариант A). `?groupBy=sex` | `year` на view=stats. Legacy `?tab=stats` → `?tab=table&view=stats`.

**Статистика (вариант A):** внутри «Замер скорости» и «Бега борзых» — переключатель **Таблица | Статистика**. Отдельной верхней вкладки «Статистика Донино» нет. Модули: `stats/SpeedStatsView.tsx`, `stats/CoursingStatsView.tsx`.

## Ключевые папки

```
frontend/src/
├── App.tsx, AppRoutes.tsx
├── components/
│   ├── Nav.tsx, PageLoader.tsx, Hero.tsx, StatCounter.tsx
│   ├── ui/              # Button, Card, Badge — кастомные, не shadcn
│   ├── FiltersDropdown.tsx, DogStatsTable.tsx, …
├── pages/
│   ├── Home.tsx           # WIP лендинг
│   ├── Competitions.tsx    # tab hub
│   ├── TopDogs/           # рейтинг
│   ├── Events/
│   │   ├── index.tsx      # календарь (фильтры + список)
│   │   ├── EventListRow.tsx
│   │   ├── eventListUtils.ts
│   │   └── EventResults/  # результаты события
│   ├── Judges/, SpeedRecords/
│   ├── DogProfile.tsx, DoninoDogProfile.tsx
├── services/api.ts        # fetch к Worker API
├── lib/
│   ├── query-client.tsx, icons.ts, recordDates.ts  # даты Донино (вкл. Excel serial)
└── hooks/
```

## API и прокси

- Dev: Vite proxy `/api` → production Worker (`vite.config.ts`)
- Пути API: `/api/competitions` (не `/api/events`)
- Ручная проверка API: `npm run smoke-api` (нужен `npm run dev`)

## См. также

- `docs/development/DEVELOPMENT.md` — npm-скрипты, сборка
- `docs/architecture/ARCHITECTURE.md` — общая архитектура
- `docs/design/DESIGN-SYSTEM.md` — цвета и компоненты
- `docs/plans/FRONTEND-VISUAL-CONSISTENCY.md` — план выравнивания UI (аудит 2026-07-03)
