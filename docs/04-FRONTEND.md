# Frontend — карта UI и компонентов

> **ИИ:** [`README.md`](README.md) → [`00-AI-GUIDE.md`](00-AI-GUIDE.md) → [`03-DATA.md`](03-DATA.md). Скрипты и деплой — [`11-DEVELOPMENT.md`](11-DEVELOPMENT.md).

## Содержание

- [Public surface](#public-surface--ui-flags-календари)
- [Code Splitting](#code-splitting)
- [PageToolbar](#pagetoolbar--единый-паттерн-фильтров)
- [Главная страница](#главная-страница-hometsx)
- [Профили собак](#профили-собак--соревнования-vs-донино)
- [Мобильная адаптивность](#мобильная-адаптивность)
- [Frontend Map](#frontend-map--навигация-для-ии-агентов)

---

## Public surface / ui-flags, календари

**Канон публичного UI** (вариант A + временные исключения). SEO: не обещать «всегда открытый календарь» без флага — [`07-SEO.md`](07-SEO.md).

| Что | Прод | Локально (`npm run dev` / `isLocalDev`) |
|-----|------|----------------------------------------|
| Рейтинг, судьи, профили, Донино, `/guide` | всегда | всегда |
| Календарь соревнований `/competitions?tab=calendar` | `data/v1/ui-flags.json` → `publicCalendars.competitions` | всегда в nav |
| Календарь выставок `/shows?tab=calendar` | `publicCalendars.shows` | всегда в nav |
| Протокол `/event/:id` | нет → redirect на hub | да |
| Протокол `/shows/exhibition/:id` | нет → `/shows` | да |

**Флаги:** `frontend/src/lib/uiFlags.ts`, хук `usePublicCalendarVisible`. Переключение: `scripts/show-calendar-*.bat` / `hide-calendar-*.bat`, затем deploy.

**Строки календаря соревнований:** `Events/EventListRow.tsx` → `ProcoursingEventLink` (прод: `results_url` на procoursing.ru; **не** `return null` при `localEventPath === null`). Локально — `/event/:id`.

**Временная плашка** (пока procoursing.ru недоступен): `TemporaryCompetitionsCalendarBanner` на `/competitions?tab=calendar` (dismiss → `localStorage` `cs-dismiss-competitions-calendar-temp-notice`). Не путать с календарём выставок.

Выставки (PDF / CDN): [`SHOWS.md`](SHOWS.md).

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
| `ToolbarFiltersDropdown` | Кнопка «Фильтры» (+ `activeCount`), desktop-карточка / mobile sheet, «Сбросить» / «Готово» |
| `ToolbarSegmentControl` | Переключатель вкладок (медали → очки → скорость) |
| `ViewToggle` | Записи \| Статистика (Донино) — компонент есть; переключение сейчас в `Nav` |
| `ToolbarSearch` | Поиск в тулбаре |
| `ToolbarActiveFilters` | Сбрасываемые чипы |

**Стили:** `TOOLBAR_FILTER_SECTION_LABEL`, `TOOLBAR_FILTER_YEAR_CHIP`, `TOOLBAR_FILTER_OPTION_ROW*`, `TOOLBAR_FILTER_SEARCH`, `TOOLBAR_NUMBER_INPUT` в `lib/toolbar.ts`. Рейтинг: `TopDogsFilters` — чипы года, поиск породы, пороги в `<details>`.

### Макет одной строки

```tsx
<PageToolbar bare filters={
  <>
    <ToolbarSearch className="!w-auto min-w-[200px] flex-1 max-w-lg" … />
    <ToolbarFiltersDropdown active={hasPanelFilters} activeCount={n} onReset={clearPanelFilters}>
      {/* секции: год-чипы / порода / … */}
    </ToolbarFiltersDropdown>
    <div className="ml-auto shrink-0">
      <ToolbarSegmentControl … />
    </div>
  </>
} />
```

**`bare`:** `TopDogsFilters`, `Judges/index`, `DoninoPageToolbar`. **Framed:** `Events/index.tsx` (календарь соревнований; на проде — `publicCalendars.competitions`).

Канон паттернов: [`18-CODE-PATTERNS.md`](18-CODE-PATTERNS.md)


---

## Главная страница (`Home.tsx`)

Редизайн 2026-07 (классы `.home-v2*` в `index.css`). **Не** `hero-dashboard` / старый `HeroIntro` на `/`.

| Блок | Что |
|------|-----|
| **Hero** | `HomeHeroStage` — full-bleed фото из `frontend/public/images/home/**` (скан Vite-плагином → `homePhotos.generated.ts`), shuffle + слайдшоу ~7 с |
| **Settle** | Старт: ровно 1 экран под nav (`home-hero-locked`, body скрыт); первый скролл/стрелка/фокус поиска → сжатие высоты stage. Около середины settle (~48%) — `home-v2--revealed` и каскад блоков (`data-home-reveal`); скролл разблокируется в конце. Шов фото→контент: короткая маска + `::after` цветом `--home-fade` (light `#faf8f4`, dark `#2a2a2a`). **z-index:** `.home-v2-stage-copy` (7) выше `.home-v2-body` (6), иначе listbox поиска уходит под «Ближайшие события»; шов `::after` остаётся z=4 под body |
| **Поиск** | `HomeDogSearch` → `dogs-index.json`; bilingual RU/LAT (`dogNameMatchesQuery`); только id с живым `dog-profiles/{id}.json`; дедуп дублей; `.home-v2-search-list` — absolute listbox |
| **События** | две колонки-панели (`.home-v2-events-col`): соревнования (`HomeEventRow`) + выставки (`HomeShowEventRow`); месяц — `formatMonthShortRu` (3 буквы); внутри панели строки **плоские** (без своих рамок — только left-accent + divider); футер колонки — `.home-v2-external` (полоса-CTA, стрелка через `::after`) |
| **Масштаб** | `.home-v2-scale` **вариант A**: 2 hero-цифры (выставки + записи на ринге, count-up) → chips спорта (соревнования / результаты / собаки). Без eyebrow (годы уже в hero), без судей и пород. Подписи-смысл под hero |
| **Топ сезона / Донино** | колонки `.home-v2-col` — те же панели с camel-шапкой; списки `.donino-home-list` / `HomeSeasonTopRow` / `DoninoHomeRecordRow` |
| **Топ сезона** | соревнования (табы **Медали → Очки → Скорость**, default «Медали») + выставки (`home-top-{year}.json`) |
| **Донино** | Замер \| Бега 350 м (`DoninoHomeRecordRow`) |
| **Секции** | `SectionHead`: иконка + H2; camel-черта `.home-v2-section-title::after`; ссылка «Весь рейтинг» / «Все рекорды» — `.home-v2-section-link` (кнопка с обводкой, стрелка `::after`) |
| **Футер** | дисклеймер + email `antajl@yandex.ru` |

**Фото hero:** клади файлы в `frontend/public/images/home/` или в любые подпапки (`bzmp/`, `show/`, …). Vite-плагин `vite-plugin-home-photos.ts` сканирует jpg/png/webp/avif при `dev`/`build` → `src/lib/homePhotos.generated.ts`. Имена файлов не хардкодить. Не коммитить сырой dump `/фото/`.

**Поиск кличек (везде):** канон `frontend/src/lib/dogName.ts` — `dogNameMatchesQuery` / `dogNameSearchText` (транслит + V↔W). Использовать и в рейтинге выставок (`ShowRanking.tsx`), не сырой `includes` по одной раскладке.

Стили: `index.css` → `.home-v2*`, `.donino-home-*`, `.home-ranking-tabs`, `.home-event-row` (в панели — overrides под `.home-v2-events-col`). На `/` у `main` сброшен горизонтальный inset (`main:has(.home-v2)`).

**Не возвращать:** «голые» колонки без панелей на топе/событиях/Донино; вложенные карточки event-row внутри панели; plain-text CTA вместо `.home-v2-external` / `.home-v2-section-link`.

---

## Профили собак — соревнования vs Донино

| | `/dog/:id` | `/donino-dog/:name/:breed` |
|---|------------|----------------------------|
| Данные | `dogs` + `results` | `speed_records` + `coursing_records` |
| Дисциплины | Курсинг/БЗМП, бега | Замер (warm-blue), 350 м (forest) |
| Breed Archive | chip при `pedigree_url` | — |

**Owner marks:** `ownerMarks.ts` — только фронтенд (локальные пометки владельца, не в CDN).

---

## Мобильная адаптивность

Tailwind `md:` брейкпоинты. `App.tsx`: `pt-3 pb-5 md:pt-4`, `px-2 sm:px-4 md:px-6 lg:px-8` — **на `/` сброшено** через `main:has(.home-v2)` (full-bleed hero).

Ключевые страницы: `Home`, `Events/index`, `TopDogs`, `SpeedRecords`, `DogProfile`, `Judges`, `Competitions`.

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
| `/competitions` | `Competitions.tsx` | Hub: рейтинг + судьи (`?tab=`) |
| `/top` | → redirect | legacy → `/competitions?tab=ranking` |
| `/judges` | → redirect | legacy → `/competitions?tab=judges` |
| `/judges/:judgeId` | `JudgeDetail.tsx` | Профиль судьи соревнований (шапка + год; вкладки Породы / Старты / Критерии) |
| `/shows` | `Shows.tsx` | Hub выставок: рейтинг + судьи + календарь |
| `/shows/judges/:judgeId` | `Shows/ShowJudgeDetail.tsx` | Профиль судьи выставок (строгость, `?year=` / `?grade=`) |
| `/dog/:id` | `DogProfile/` (через `UnifiedDogProfile`) | Единый профиль: курсинг / бега / выставки (3 колонки) |
| `/event/:id` | `Events/EventResults/` | **Только Vite DEV** (`isLocalDev`); на проде → `/competitions?tab=ranking` |
| `/competitions?tab=calendar` | `Events/index.tsx` | Прод: `publicCalendars.competitions`; локально всегда |
| `/shows?tab=calendar` | `Shows/ShowCalendar.tsx` | Прод: `publicCalendars.shows`; локально всегда |
| `/shows/exhibition/:id` | `Shows/ShowExhibitionDetail.tsx` | **Только Vite DEV**; на проде → `/shows` |
| `/admin/calendar`, `/admin/event/:id` | redirect | Legacy → calendar / `/event/:id` (DEV) или hub (prod) |
| `/speed-records` | `SpeedRecords/index.tsx` | Донино |
| `/donino-dog/:name/:breed` | `DoninoDogProfile.tsx` | Профиль Донино |

### Competitions = tab hub

| Вкладка | Компонент |
|---------|-----------|
| `ranking` | `TopDogs/index.tsx` |
| `judges` | `Judges/index.tsx` |
| `calendar` | `Events/index.tsx` (прод: ui-flags; см. [Public surface](#public-surface--ui-flags-календари)) |

`ProcoursingAttribution` — на `/competitions` вверху карточки.

### SpeedRecords ≠ competitions

Отдельный источник (Google Sheets → `donino/*.json`). Не путать с `/dog/:id`.

### Имена собак

- **Соревнования:** `name_lat` + опционально `name_ru`
- **Донино:** поле `name` (кириллица)

### TopDogs

```
TopDogs/index.tsx, TopDogsFilters.tsx, TopDogsColumns.tsx, filterUtils.ts
lib/competingBreeds.ts  — deriveCompetingBreeds (dogs-index, sort by dog count)
CoursingRatingHint.tsx  — ⓘ в сегменте «очки»
```

Фильтр пород: `useCompetingBreeds()`, порядок по числу собак. Год: `''` = все годы → `top-*-all.json`. Default вкладка рейтинга: **медали** (`rankingTab=score` в URL только для «очки»).

**Отображение породы:** `displayBreed()` из `lib/breedMapping.ts` — в UI **только чип** (`primary`); полное/официальное имя — в `title` при наведении (`secondary`). Канон фильтров — UPPERCASE; UI — sentence case. Подробнее: [`03-DATA.md`](03-DATA.md) → «Канон и отображение».

### Home

```
Home.tsx
HomeHeroStage.tsx      — фон-фото + settle + слайдшоу
HomeDogSearch.tsx      — typeahead (dogs-index + проверка profile)
HomeShowEventRow.tsx   — выставки в блоке событий
HomeSeasonTopRow.tsx, HomeRankingTabs.tsx
StatCounter.tsx        — count-up при IntersectionObserver; без разделителей тысяч (`lib/motion.animateCount`)
lib/homePhotos.ts      — re-export + shuffle; список из homePhotos.generated.ts
lib/homePhotos.generated.ts — AUTO (vite-plugin-home-photos), скан public/images/home/**
lib/dogName.ts         — bilingual поиск кличек
```

Две колонки топа: соревнования (табы **Медали → Очки → Скорость**, default «Медали») и выставки (`shows/indexes/home-top-{year}.json`). Стили: `.home-v2*` (панели `.home-v2-col` / `.home-v2-events-col`, CTA `.home-v2-external` / `.home-v2-section-link`, масштаб `.home-v2-scale`), `.donino-home-*`.

### Guide

```
Guide/index.tsx     — titles | shows | protocol | rating | site
constants.ts        — соревнования (курсинг/бега)
showConstants.ts    — выставки (conformation)
components/
  TitlesTab.tsx     — вкладка «Соревнования»
  ShowsTab.tsx      — вкладка «Выставки»
  ProtocolTab.tsx   — протоколы
  RatingTab.tsx     — формула CS (кратко)
  SiteTab.tsx       — о проекте
  GuideUi.tsx       — общие SectionCard, иерархия, сетки, AbbrTag
```

Канон структуры и правил редактирования: [`10-GUIDE.md`](10-GUIDE.md).

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

- [`11-DEVELOPMENT.md`](11-DEVELOPMENT.md) — npm, backend scripts, deployment
- [`06-DESIGN-SYSTEM.md`](06-DESIGN-SYSTEM.md) — цвета, тема
- [`18-CODE-PATTERNS.md`](18-CODE-PATTERNS.md) — паттерны кода
- [`05-API-REFERENCE.md`](05-API-REFERENCE.md) — локальный API админки
