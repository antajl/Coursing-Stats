# Frontend — карта UI и компонентов

> **ИИ:** [`README.md`](README.md) → [`00-AI-GUIDE.md`](00-AI-GUIDE.md) → [`03-DATA.md`](03-DATA.md). Скрипты и деплой — [`04-DEVELOPMENT.md`](04-DEVELOPMENT.md).

## Содержание

- [Code Splitting](#code-splitting)
- [PageToolbar](#pagetoolbar--единый-паттерн-фильтров)
- [Главная страница](#главная-страница-hometsx)
- [Профили собак](#профили-собак--соревнования-vs-донино)
- [Мобильная адаптивность](#мобильная-адаптивность)
- [Frontend Map](#frontend-map--навигация-для-ии-агентов)

---

## Code Splitting

### Статус (2026-07): основное сделано

- ✅ `AppRoutes.tsx` — все top-level страницы через `React.lazy()` + `Suspense`
- ✅ `Competitions.tsx` — вкладки mount по `activeTab`
- ✅ `Nav.tsx` вынесен из `App.tsx`
- ✅ `vite.config.ts` — `manualChunks`

Подробнее о маршрутах: [Frontend Map](#frontend-map--навигация-для-ии-агентов)

---

## PageToolbar — единый паттерн фильтров

**Файлы:** `frontend/src/components/toolbar/`, стили в `frontend/src/lib/toolbar.ts`

| Компонент | Назначение |
|-----------|------------|
| `PageToolbar` | Обёртка: строка фильтров, активные чипы; prop **`bare`** — без `TOOLBAR_PANEL` |
| `ToolbarFiltersDropdown` | Кнопка «Фильтры», панель, «Сбросить» / «Готово» |
| `ToolbarSegmentControl` | Переключатель вкладок (медали/очки/скорость) |
| `ViewToggle` | Записи \| Статистика (Донино) |
| `ToolbarSearch` | Поиск в тулбаре |
| `ToolbarActiveFilters` | Сбрасываемые чипы |
| `MultiFilterDropdown` | Легаси |
| `RecordsListToolbar` | Легаси |

**Стили:** `TOOLBAR_FILTER_SECTION_LABEL`, `TOOLBAR_FILTER_CHECKBOX_ROW`, `TOOLBAR_NUMBER_INPUT` в `lib/toolbar.ts`.

### Макет одной строки

```tsx
<PageToolbar bare filters={
  <>
    <ToolbarSearch className="!w-auto min-w-[200px] flex-1 max-w-lg" … />
    <ToolbarFiltersDropdown active={hasPanelFilters} onReset={clearPanelFilters}>
      {/* секции: TOOLBAR_FILTER_SECTION_LABEL + чекбоксы */}
    </ToolbarFiltersDropdown>
    <div className="ml-auto shrink-0">
      <ToolbarSegmentControl … />
    </div>
  </>
} />
```

**`bare`:** `TopDogsFilters`, `Judges/index`, `DoninoPageToolbar`. **Framed:** `Events/index.tsx` (календарь, dev).

Канон паттернов: [`18-CODE-PATTERNS.md`](18-CODE-PATTERNS.md) · Changelog: [`19-CHANGELOG.md`](19-CHANGELOG.md)

---

## Главная страница (`Home.tsx`)

- **Hero:** `hero-dashboard` — intro + ближайшие события (`HomeEventRow`)
- **StatsStrip:** кликабельные чипы
- **Топ сезона:** `ToolbarSegmentControl` + подиум
- **Донино:** две колонки (`donino-home-columns`)
- **Стили:** `index.css` (`.hero-dashboard`, `.pod-card`, `.donino-home-*`)

---

## Профили собак — соревнования vs Донино

| | `/dog/:id` | `/donino-dog/:name/:breed` |
|---|------------|----------------------------|
| Данные | `dogs` + `results` | `speed_records` + `coursing_records` |
| Дисциплины | Курсинг/БЗМП, бега | Замер (warm-blue), 350 м (forest) |
| Breed Archive | chip при `pedigree_url` | — |

**Owner marks:** `ownerMarks.ts` — только фронтенд; см. ADR в [`19-HISTORY.md`](19-HISTORY.md).

---

## Мобильная адаптивность

Tailwind `md:` брейкпоинты. `App.tsx`: `pt-3 pb-5 md:pt-4`, `px-2 sm:px-4 md:px-6 lg:px-8`.

Ключевые страницы: `Events/index`, `TopDogs`, `SpeedRecords`, `DogProfile`, `Judges`, `Competitions`.

- Таблицы → карточки на мобиле (`md:hidden` / `hidden md:block`)
- `DogProfile`: chip «Breed Archive» при `pedigree_url`
- `SpeedRecords`: две колонки, стек на мобиле

Дизайн-токены: [`06-DESIGN-SYSTEM.md`](06-DESIGN-SYSTEM.md)

---

## Frontend Map — Навигация для ИИ-агентов

### Shell и маршрутизация

| Файл | Роль |
|------|------|
| `App.tsx` | Shell: QueryProvider, Router, Nav, AppRoutes |
| `AppRoutes.tsx` | Lazy routes + Suspense |
| `Nav.tsx` | Шапка, мобильное меню |
| `vite.config.ts` | manualChunks |

**Нет shadcn/ui** — UI в `components/ui/`.

### Маршруты

| Path | Компонент | Описание |
|------|-----------|----------|
| `/` | `Home.tsx` | Лендинг |
| `/competitions` | `Competitions.tsx` | Hub «Статистика» |
| `/top` | `TopDogs/index.tsx` | Прямой рейтинг |
| `/dog/:id` | `DogProfile.tsx` | Профиль собаки |
| `/event/:id` | — | Redirect → рейтинг |
| `/admin/calendar` | `AdminCalendar.tsx` | Dev only |
| `/admin/event/:id` | `EventResults/` | Dev only |
| `/speed-records` | `SpeedRecords/index.tsx` | Донино |
| `/donino-dog/:name/:breed` | `DoninoDogProfile.tsx` | Профиль Донино |
| `/judges` | `Judges/index.tsx` | Судьи |
| `/judges/:judgeId` | `JudgeDetail.tsx` | Детали судьи |

### Competitions = tab hub

| Вкладка | Компонент |
|---------|-----------|
| `ranking` | `TopDogs/index.tsx` |
| `judges` | `Judges/index.tsx` |

`ProcoursingAttribution` — на `/competitions` вверху карточки.

### SpeedRecords ≠ competitions

Отдельный источник (Google Sheets → `donino/*.json`). Не путать с `/dog/:id`.

### Имена собак

- **Соревнования:** `name_lat` + опционально `name_ru`
- **Донино:** поле `name` (кириллица)

### TopDogs

```
TopDogs/index.tsx, TopDogsFilters.tsx, TopDogsTabs.tsx, filterUtils.ts
lib/competingBreeds.ts  — deriveCompetingBreeds (dogs-index)
```

Фильтр пород: `useCompetingBreeds()`. Год: `''` = все годы → `top-*-all.json`.

### SpeedRecords

```
index.tsx, useSpeedRecordsPage.ts, DoninoPageToolbar.tsx
DoninoRecordsColumns.tsx, DoninoStatsColumns.tsx, toolbarFilters.ts
stats/doninoStatsUtils.ts, exportExcel.ts
```

**Утилиты:** `recordDates.ts` — `expandCoursingTimeline`, `dedupeByRecordDate`.

### EventResults

`Events/EventResults/` — `index`, `EventHeader`, `ResultsSection`, `ResultCard`, `details/RacingDetail`, `details/ScoringDetail`.

---

## См. также

- [`04-DEVELOPMENT.md`](04-DEVELOPMENT.md) — npm, backend scripts, deployment
- [`06-DESIGN-SYSTEM.md`](06-DESIGN-SYSTEM.md) — цвета, тема
- [`18-CODE-PATTERNS.md`](18-CODE-PATTERNS.md) — паттерны кода
- [`05-API-REFERENCE.md`](05-API-REFERENCE.md) — локальный API админки
