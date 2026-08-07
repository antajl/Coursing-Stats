# Large Files Optimization (≥600 LOC) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Убрать/сжать/разбить **все** исходные файлы ≥600 строк (полный инвентарь ниже), начиная с самых крупных. Приоритет действий: **delete → shrink → split** (не дробить то, что можно выкинуть).

**Architecture:** code-simplification + triage. Сначала удаляем one-shot dumps и мёртвый CSS/компоненты старой Home. Затем режем живые god-files по ответственности/домену. Не меняем формулы рангов, PDF-токены, CDN-пути, UI-копию живых страниц.

**Tech Stack:** React 19 + Vite, TypeScript, Vitest, Cheerio parsers, pdfjs-dist, Tailwind + custom CSS, CDN `data/v1`.

## Coverage (ответ на «все или некоторые?»)

План покрывает **все 11 файлов ≥600 LOC** в исходниках (вне `data/`, `node_modules`, `.vite`).  
Не включены (ниже порога, но рядом): `bot/src/api.ts` (578), `Judges/JudgeDetail.tsx` (571), `bot/handlers/commands.ts` (522), `admin/results.ts` (521) — отдельный backlog после закрытия ≥600.

## Global Constraints

- **Порог:** ≥600 **строк** (не символов).
- **Порядок работ:** от большего LOC к меньшему внутри выбранной стратегии (delete/shrink/split).
- **Preserve behavior** для живого UI/парсеров: те же URL, CDN paths, Turso fallback, fixture outputs.
- **Не смешивать домены:** competition `dog_id` ≠ show id; судьи соревнований ≠ судьи выставок.
- **Медали ≠ CS очки**; **`total_score` = grand_total**.
- **Package manager:** yarn@1.22.22; PowerShell: `;` не `&&`.
- **Коммиты:** только по явной просьбе пользователя.
- **Цель после оптимизации:** активные модули ideally ≤400 LOC; dense award tables ≤500 ок.

---

## Как сейчас устроена система (карта связей)

```
CDN /data/v1/
  calendar/{year}.json          → Events (соревнования)
  shows/calendar-rkf/{year}.json → ShowCalendar
  shows/indexes/*               → ShowRanking / judges / home
  shows/exhibitions/*.json      → ShowExhibitionDetail (LC) + Turso fallback
  competitions/*/…json          → parsers (coursing row-parsers) → indexes

Frontend loaders
  staticData/shows.ts  ──┬── ShowCalendar / ShowRanking / ShowJudges
                         ├── ShowExhibitionDetail (getShowExhibition)
                         └── ShowJudgeDetail / DogProfile (show dogs)

Backend domain
  show-award-ranking.ts ←── PDF parser + build-show-indexes + frontend ranking
  parse-rkf-certificate-pdf.ts ←── yarn parse-rkf-reports
  coursing/row-parsers.ts ←── parsers/coursing/index.ts ←── fixtures

Styles
  index.css ←── почти все страницы (home v2, donino, nav, page-shell)
```

**Полный инвентарь ≥600 LOC (2026-08-06) + triage:**

| LOC | Path | Зачем существует | Вердикт | Почему |
|-----|------|------------------|---------|--------|
| 1822 | `frontend/src/index.css` | Глобальные стили сайта | **SHRINK → SPLIT** | Часть — мёртвый CSS старой Home (`hero-dashboard`, `home-podium*`); живое — home-v2 + donino + shell. Сначала вырезать мёртвое (~сотни строк), потом `@import` split |
| 1442 | `backend/scripts/generate-donino-1550.ts` | One-shot: встроенный dump ~50 results + генератор JSON события 1550 | **DELETE** | Нет в `package.json`; никто не импортирует; результат уже в `data/v1/competitions/2026/08-август/1550-*.json`. ~1200 LOC — данные, не логика. История git сохранит |
| 1245 | `backend/parsers/shows/parse-rkf-certificate-pdf.ts` | Живой RKF PDF parser (`yarn parse-rkf-reports`) | **SPLIT** | Нужен; тесты есть; дробить по breed/columns/catalog/main-ring |
| 1221 | `backend/scripts/import/import-1545-donino-pdf.ts` | ONE-OFF PDF→HTML→parse для event 1545 | **DELETE** (или archive) | Явно ONE-OFF в шапке; локальный `D:\Downloads\…`; результат в `data/v1/.../1545-*.json`. Повторять незачем, пока PDF снова не понадобится (тогда — из git) |
| 1098 | `frontend/.../ShowExhibitionDetail.tsx` | Страница протокола выставки | **SPLIT** | God-component; 15+ локальных компонентов — живой UI |
| 824 | `frontend/.../staticData/shows.ts` | CDN/Turso loaders выставок | **SPLIT** | Живой data layer; не удалять |
| 815 | `frontend/.../ShowCalendar.tsx` | Календарь выставок | **SPLIT** | Живой UI (`showCalendarGroup.ts` уже частично вынесен) |
| 644 | `backend/parsers/coursing/row-parsers.ts` | Парсинг строк курсинга | **SPLIT** (осторожно) | Живой + fixtures; не сокращать логику |
| 629 | `frontend/.../Events/index.tsx` | Календарь соревнований | **SPLIT** | Живой UI; utils уже вынесены |
| 616 | `frontend/.../ShowJudgeDetail.tsx` | Карточка судьи выставок | **SPLIT** | Живой UI |
| 614 | `backend/lib/show-award-ranking.ts` | Словарь титулов + rank_score | **KEEP / лёгкий SPLIT** | Не «жир», а таблицы домена. Удалять нельзя. Split только если мешает навигации; иначе оставить после удаления dumps |

### Сопутствующий dead code (не ≥600, но режет CSS)

| Path | Вердикт | Доказательство |
|------|---------|----------------|
| `frontend/src/components/Hero.tsx` — `HeroIntro`, `HeroStatsBar` | **SHRINK**: оставить только `HeroStats` / `HeroShowStats` types (или перенести types в `MetricsWidget` / `types`) | Home использует `HomeHeroStage` + `MetricsWidget`; `HeroIntro`/`HeroStatsBar` нигде не импортируются |
| CSS `.hero-dashboard`, `.home-podium*` | **DELETE** вместе с неиспользуемыми правилами | Классы встречаются только в `index.css`, не в TSX |

### Порядок выполнения (самые крупные первыми)

```
1. DELETE  generate-donino-1550.ts          (−1442)
2. DELETE  import-1545-donino-pdf.ts        (−1221)  [или archive/]
3. SHRINK  index.css dead home CSS + Hero.tsx types-only
4. SPLIT   parse-rkf-certificate-pdf.ts     (1245 → modules)
5. SPLIT   ShowExhibitionDetail.tsx         (1098)
6. SPLIT   staticData/shows.ts              (824)
7. SPLIT   ShowCalendar.tsx                 (815)
8. SPLIT   coursing/row-parsers.ts          (644)
9. SPLIT   Events/index.tsx                 (629)
10. SPLIT  ShowJudgeDetail.tsx              (616)
11. DECIDE show-award-ranking.ts            (614) — split only if still painful
```

После шагов 1–2 из «проблемы больших файлов» сразу исчезает ~2660 LOC без рефакторинга.

---

## Целевая структура файлов (что должно получиться)

### Shows UI

```
frontend/src/pages/Shows/
  ShowExhibitionDetail.tsx          # ≤200: route, query, data fetch, layout
  ShowExhibitionDetail/
    ExhibitionHeader.tsx
    MainRingSection.tsx             # + MainRingResultsTable, groupMainRing
    CatalogResultsSection.tsx       # accordion + award filter
    LegacyResultsSection.tsx
    BreedResultsPanel.tsx
    ClassResultsTable.tsx
    TitleChips.tsx
    ExhibitionDogNameLink.tsx
    exhibitionDetailUtils.ts        # paths, labels, grouping helpers
  ShowCalendar.tsx                  # ≤250: state + toolbar + month list
  ShowCalendar/
    OutboundLinks.tsx
    ShowCalendarRow.tsx             # optional if row JSX >80 lines
    showCalendarDate.ts             # parse/format/notStarted (рядом с showCalendarGroup.ts)
  ShowJudgeDetail.tsx               # ≤250: page shell + tabs
  ShowJudgeDetail/
    judgeDetailAggregates.ts        # emptyGrades, sum*, buildStrictness
    JudgeDetailHeader.tsx           # optional
    JudgeBreedList.tsx / JudgeExhibitionList.tsx
```

### Events (competitions calendar)

```
frontend/src/pages/Events/
  index.tsx                         # ≤250: orchestration
  EventsToolbar.tsx                 # filters / URL sync / chips
  EventsMonthList.tsx               # month groups + reveal
  # eventListUtils.ts, EventListRow.tsx — уже есть, не ломать
```

### staticData + award lib

```
frontend/src/lib/staticData/
  shows.ts                          # thin re-export barrel (или удалить после update imports)
  shows/
    calendar.ts                     # RKF + LC + getShowCalendar + getShowExhibition
    ranking.ts                      # dog ranking / search / detail / ranks
    judges.ts                       # judges list/detail/strictness
    home.ts                         # hero stats + home top
    types.ts                        # shared Show* interfaces if needed

backend/lib/
  show-award-ranking.ts             # re-export barrel (public API stable)
  show-awards/
    order.ts                        # ORDER, WEIGHTS, BADGE, LABELS, CATEGORY, EMPTY
    normalize.ts                    # normalizeCertLookalikes, glueWrapped*
    match.ts                        # matchShowAwardToken, splitShowTitleTokens
    score.ts                        # parse/merge/rank/compare/present/expand
```

### RKF PDF parser

```
backend/parsers/shows/
  parse-rkf-certificate-pdf.ts      # re-export public API (stable for scripts/tests)
  rkf-cert/
    types.ts
    breed-carry.ts                  # isBreedContinuationLine, isBreedFragment, merge…
    columns.ts                      # detectColBounds, catalog anchors
    class-grade.ts                  # glueWrappedClassAbbrev, disentangleClassAndGrade
    catalog-dogs.ts                 # parseCertificateTokens + parseCertificatePdf
    main-ring.ts                    # parseMainRingPdf
    bis.ts                          # parseBisPdf
```

### Coursing row parsers

```
backend/parsers/coursing/
  row-parsers.ts                    # parseDogRow + parseNonArrivedRow (router)
  row-parsers-1judge.ts
  row-parsers-2judges.ts
```

### CSS

```
frontend/src/
  index.css                         # @tailwind + @import слоёв only (≤80)
  styles/
    tokens-zindex.css               # medal colors, z-index (начало файла)
    page-shell.css                  # .cs-page-shell / blobs
    responsive.css                  # breakpoints helpers
    home-hero.css                   # HERO DASHBOARD + home section
    home-v2.css                     # Home v2 stage / search / scale (~1020–end)
    donino.css                      # DONINO HOME + DONINO LIST
    motion-reveal.css               # GSAP riseIn, list reveal, skeleton
    filters-native.css              # filter panels + native select dark
```

Vite/PostCSS: `@import` внутри `index.css` поддерживается; не подключать CSS из JSX без нужды.

### Explicit archive/delete (не SPLIT)

| File | Зачем был | Действие |
|------|-----------|----------|
| `backend/scripts/generate-donino-1550.ts` | Сгенерировал `1550-*.json` (dump внутри TS) | **Удалить** — JSON уже в `data/v1` |
| `backend/scripts/import/import-1545-donino-pdf.ts` | ONE-OFF импорт PDF 1545 | **Удалить** (предпочтительно) или `backend/scripts/archive/` + README; JSON уже в `data/v1` |

Если пользователь хочет страховку перед delete: один коммит «archive» в `backend/scripts/archive/README.md` со ссылкой на commit hash / путь JSON.

---

## Phase 0: Delete one-shots (самые крупные «ложные» файлы)

### Task 0a: Удалить `generate-donino-1550.ts`

**Files:**
- Delete: `backend/scripts/generate-donino-1550.ts`
- Verify: `data/v1/competitions/2026/08-август/1550-чркф-бега-борзых.json` exists

- [ ] **Step 1: Подтвердить артефакт**

```powershell
Test-Path "D:\Site\CoursingStats\data\v1\competitions\2026\08-август\1550-чркф-бега-борзых.json"
```

Expected: `True`

- [ ] **Step 2: Grep references**

```powershell
cd D:\Site\CoursingStats; rg "generate-donino-1550|donino-1550" -g "!docs/superpowers/**"
```

Expected: нет runtime/package ссылок

- [x] **Step 3: Delete file** — done 2026-08-06; JSON `1550-*.json` verified present

### Task 0b: Удалить `import-1545-donino-pdf.ts`

**Files:**
- Delete: `backend/scripts/import/import-1545-donino-pdf.ts`
- Optional Modify: docs mentioning ONE-OFF 1545 → «исторический импорт, скрипт удалён; данные в data/v1»

- [ ] **Step 1: Подтвердить артефакт**

```powershell
Test-Path "D:\Site\CoursingStats\data\v1\competitions\2026\06-июнь\1545-пчркф-курсинг-борзых-фараонова-собака-уиппет-сал.json"
```

Expected: `True`

- [ ] **Step 2: Grep + delete** (нет в package.json)

---

## Phase 0c: Shrink CSS / dead Hero UI (крупнейший живой файл)

### Task 0c: Вырезать мёртвые стили старой Home + упростить Hero.tsx

**Files:**
- Modify: `frontend/src/index.css` — удалить неиспользуемые `.hero-dashboard`, `.home-podium*`, связанные dark/media (после rg по TSX)
- Modify: `frontend/src/components/Hero.tsx` — оставить types (+ то что реально нужно MetricsWidget); удалить `HeroIntro` / `HeroStatsBar` если rg подтверждает zero imports
- Modify: импорты types при переносе

- [ ] **Step 1: Список кандидатов на удаление CSS** — rg каждый класс в `frontend/src/**/*.{tsx,ts}`; удалять только 0 hits (кроме самого css)

- [ ] **Step 2: Упростить Hero.tsx**

- [ ] **Step 3: Smoke** `/` light+dark, MetricsWidget на home

- [ ] **Step 4: Затем** (Phase 5 ниже) split оставшегося CSS на `@import` — уже по меньшему объёму

---

## Phase 1: Shows detail pages (P0 UX god-components)

### Task 1: Вынести utils + TitleChips / dog link из ShowExhibitionDetail

**Status:** DONE 2026-08-06 — page ~178 LOC + `ShowExhibitionDetail/*` (8 modules)

**Files:**
- Create: `frontend/src/pages/Shows/ShowExhibitionDetail/exhibitionDetailUtils.ts`
- Create: `frontend/src/pages/Shows/ShowExhibitionDetail/TitleChips.tsx`
- Create: `frontend/src/pages/Shows/ShowExhibitionDetail/ExhibitionDogNameLink.tsx`
- Modify: `frontend/src/pages/Shows/ShowExhibitionDetail.tsx`

**Interfaces:**
- Consumes: types `ShowExhibition`, breed/title row types already in file or `staticData`
- Produces:
  - `exhibitionDogProfilePath(dogName: string, breed: string): string | null`
  - `TitleChips`, `ExhibitionDogNameLink`, `BreedTitleRowView` (можно в том же NameLink файле)

- [ ] **Step 1: Создать `exhibitionDetailUtils.ts`** — перенести без правок логики: `exhibitionDogProfilePath`, `mainRingTabShortLabel`, `groupMainRing`

- [ ] **Step 2: Вынести `TitleChips` + `ExhibitionDogNameLink` + `BreedTitleRowView` в компоненты**

- [ ] **Step 3: Обновить импорты в `ShowExhibitionDetail.tsx`; удалить дубликаты**

- [ ] **Step 4: Smoke**

Run:

```powershell
cd D:\Site\CoursingStats\frontend; yarn exec tsc --noEmit -p tsconfig.json 2>&1 | Select-Object -First 40
```

Expected: нет новых ошибок по Shows.

Manual: `/shows/exhibition/:id` — chips титулов, ссылки на show-dog профили.

### Task 2: Вынести MainRing + Catalog/Legacy секции

**Files:**
- Create: `…/MainRingSection.tsx` (включая table + StatPill если только там)
- Create: `…/CatalogResultsSection.tsx` (+ `BreedAccordionItem`, `ExhibitionAwardFilter`, `BreedResultsPanel`, `ClassResultsTable` — либо соседние файлы если >300)
- Create: `…/LegacyResultsSection.tsx`
- Create: `…/ExhibitionHeader.tsx`
- Modify: `ShowExhibitionDetail.tsx` → остаётся default export + data wiring

**Produces:** default page ≤200–250 LOC; секции принимают props из уже загруженного `ShowExhibition`.

- [ ] **Step 1: Перенести MainRing\* без изменения JSX-классов**

- [ ] **Step 2: Перенести Catalog\* + filters + accordion**

- [ ] **Step 3: Перенести Legacy + Header**

- [ ] **Step 4: Verify** — страница протокола: main ring tabs, фильтр наград, accordion пород, back button.

### Task 3: Разбить ShowJudgeDetail

**Status:** DONE 2026-08-06 — page ~222 LOC + `ShowJudgeDetail/*`

**Files:**
- Create: `frontend/src/pages/Shows/ShowJudgeDetail/judgeDetailAggregates.ts`
- Create: `frontend/src/pages/Shows/ShowJudgeDetail/JudgeBreedPanel.tsx`
- Create: `frontend/src/pages/Shows/ShowJudgeDetail/JudgeExhibitionPanel.tsx`
- Modify: `ShowJudgeDetail.tsx`

**How it works today:** страница `/shows/judges/:judgeId` грузит `useShowJudgeDetails` + baseline strictness; агрегирует оценки по породам/выставкам; табы `breeds | exhibitions`; фильтр grade.

**Target:** aggregates в `.ts`; два panel-компонента; page = SEO + toolbar/tabs + panel switch.

- [ ] **Step 1: Перенести `formatDate`, `exhibitionYear`, `emptyGrades`, `sumGradeCounts`, `sumBreedCounts`, `buildStrictness` → `judgeDetailAggregates.ts`**

- [ ] **Step 2: Вырезать JSX списков пород/выставок в panels**

- [ ] **Step 3: Smoke** `/shows/judges/:id` — смена таба, фильтр оценки, ссылки на exhibition.

---

## Phase 2: Calendars (Shows + Competitions) — похожий паттерн, разные домены

### Task 4: Дочистить ShowCalendar

**Status:** DONE 2026-08-06 — page ~265 LOC + `ShowCalendar/*` + `showCalendarDate.ts`

**Files:**
- Create: `frontend/src/pages/Shows/showCalendarDate.ts` (parse/format/isShowNotStartedYet/monthLabel)
- Create: `frontend/src/pages/Shows/ShowCalendar/OutboundLinks.tsx`
- Modify: `ShowCalendar.tsx`
- Keep: `showCalendarGroup.ts` (уже вынесен merge RKF mono)

**How it works:** `getShowCalendar` / years → merge groups (`showCalendarGroup`) → month accordion → row с rank chips + OutboundLinks (RKF / protocol). URL search params для year/search/filters.

- [ ] **Step 1: Вынести date helpers → `showCalendarDate.ts`**

- [ ] **Step 2: Вынести `OutboundLinks` + `exhibitionRkfUrl` + button class constants**

- [ ] **Step 3: Если default export всё ещё >500 — вынести month section / row в `ShowCalendarMonth.tsx`**

- [ ] **Step 4: Smoke** `/shows?tab=calendar` — фильтры, ссылки, mono-merge chips.

### Task 5: Разбить Events/index.tsx

**Status:** DONE 2026-08-06 — index ~256 LOC + EventsToolbar + EventsMonthList

**Files:**
- Create: `frontend/src/pages/Events/EventsToolbar.tsx`
- Create: `frontend/src/pages/Events/EventsMonthList.tsx`
- Modify: `frontend/src/pages/Events/index.tsx`
- Keep: `eventListUtils.ts`, `EventListRow.tsx`

**How it works:** competition calendar; state ↔ `useSearchParams` (year/month/discipline/kind/championships/protocol/search); `useEvents` + `groupEventsByMonth`; list reveal animation.

**Не делать:** общий компонент с ShowCalendar (разные типы/легенды/домены). Допустимо только копировать *идею* разбиения toolbar/list.

- [ ] **Step 1: Вынести toolbar (dropdowns, chips, legend tip) → `EventsToolbar.tsx`** с props: filter state + setters + options

- [ ] **Step 2: Вынести список месяцев → `EventsMonthList.tsx`**

- [ ] **Step 3: `index.tsx` только: hooks, URL sync effect, compose Toolbar+List**

- [ ] **Step 4: Smoke** `/competitions` или Events route — URL params round-trip, championships preset, protocol filter.

---

## Phase 3: Shows data layer + award domain lib

### Task 6: Разбить `staticData/shows.ts`

**Status:** DONE 2026-08-06 — barrel + `shows/{calendar,ranking,judges,home}.ts`

**Files:**
- Create: `frontend/src/lib/staticData/shows/calendar.ts`
- Create: `frontend/src/lib/staticData/shows/ranking.ts`
- Create: `frontend/src/lib/staticData/shows/judges.ts`
- Create: `frontend/src/lib/staticData/shows/home.ts`
- Modify: `frontend/src/lib/staticData/shows.ts` → re-export всё публичное
- Modify: `frontend/src/lib/staticData/index.ts` — импорты могут остаться через `shows.ts` barrel

**How it works:**
- Calendar: RKF year files + LC exhibitions list + unified `getShowCalendar` + `getShowExhibition` (CDN then Turso)
- Ranking: year shards, page0 first paint, search index, dog detail shards, rank helpers
- Judges: list/page0/detail/strictness baseline
- Home: hero stats + home top slides

**Правило:** публичные имена функций **не менять** (весь UI импортирует из `staticData`).

- [ ] **Step 1: Перенести calendar+exhibition loaders → `shows/calendar.ts`**

- [ ] **Step 2: Ranking+search+detail → `shows/ranking.ts`**

- [ ] **Step 3: Judges → `shows/judges.ts`; home → `shows/home.ts`**

- [ ] **Step 4: `shows.ts` = только `export * from './shows/…'`**

- [ ] **Step 5: Grep** что снаружи не импортируют глубокие пути (или обновить barrel only)

```powershell
cd D:\Site\CoursingStats; rg "staticData/shows/" frontend/src -g "*.ts*" 
```

Expected: только внутри `staticData/` или осознанные deep imports.

### Task 7: Разбить `show-award-ranking.ts` с стабильным barrel

**Files:**
- Create: `backend/lib/show-awards/order.ts`
- Create: `backend/lib/show-awards/normalize.ts`
- Create: `backend/lib/show-awards/match.ts`
- Create: `backend/lib/show-awards/score.ts`
- Modify: `backend/lib/show-award-ranking.ts` → `export *` from submodules

**How it works:** единый словарь титулов выставок (BIS/BIG/CAC…) → веса `rank_score` → парсинг строк титулов из PDF/протоколов → compare собак для ranking indexes. Импортируется и backend build-scripts, и frontend (`shows.ts` ranking).

**Критично:** path `backend/lib/show-award-ranking.ts` сохранить как public entry (frontend уже импортирует относительным путём).

- [ ] **Step 1: Вынести константы ORDER/WEIGHTS/BADGE/LABELS/CATEGORY → `order.ts`**

- [ ] **Step 2: normalize + glue → `normalize.ts`**

- [ ] **Step 3: `matchShowAwardToken` + `splitShowTitleTokens` → `match.ts`**

- [ ] **Step 4: parse/merge/score/compare/expand → `score.ts`; barrel re-export**

- [ ] **Step 5: Tests**

```powershell
cd D:\Site\CoursingStats; yarn test --run backend/tests/qualification-titles.test.ts
```

Expected: PASS.

---

## Phase 4: RKF certificate PDF parser

### Task 8: Модульный split `parse-rkf-certificate-pdf.ts`

**Status:** DONE 2026-08-06 — barrel + `rkf-cert/*`; vitest 10 passed / 13 skipped

**Files:**
- Create: `backend/parsers/shows/rkf-cert/*.ts` (types, breed-carry, columns, class-grade, catalog-dogs, main-ring, bis)
- Modify: `backend/parsers/shows/parse-rkf-certificate-pdf.ts` → thin re-exports
- Test: `backend/tests/parse-rkf-certificate-pdf.test.ts` (импорты с того же path)

**How it works:**
1. pdfjs извлекает text items с X/Y
2. `detectColBounds` строит колонки каталога
3. breed-carry склеивает переносы породы
4. `parseCertificateTokens` / `parseCertificatePdf` → lean dog rows
5. отдельно `parseMainRingPdf` / `parseBisPdf` для главного ринга (2025–2026)

Вызывается из `yarn run parse-rkf-reports` → indexes/Turso pipeline.

- [ ] **Step 1: Вынести types + breed-carry exports (`isBreedContinuationLine`, `isBreedFragment`, …)**

- [ ] **Step 2: columns + class-grade**

- [ ] **Step 3: catalog parse (`parseCertificateTokens`, `parseCertificatePdf`)**

- [ ] **Step 4: main-ring + bis**

- [ ] **Step 5: root file только re-export публичного API**

- [ ] **Step 6: Tests**

```powershell
cd D:\Site\CoursingStats; yarn test --run backend/tests/parse-rkf-certificate-pdf.test.ts
```

Expected: PASS без правок ассертов (только если path импорта тот же).

---

## Phase 5: CSS monolith

### Task 9: Разрезать `index.css` на `@import` модули

**Status:** DONE 2026-08-06 — entry 14 LOC + `frontend/src/styles/*` (home-v2.css still large as feature module)

**Files:**
- Create: `frontend/src/styles/*.css` (см. целевую структуру)
- Modify: `frontend/src/index.css`

**How it works:** единый entry для Vite; Tailwind directives остаются в `index.css`; кастомные `@layer components` / page styles уезжают в файлы по фиче. **Не** конвертировать в Tailwind arbitrary classes в этом плане (только file split).

Порядок `@import` должен сохранить каскад (tokens → shell → feature → home-v2 поверх).

- [ ] **Step 1: Вынести page-shell + z-index/medal tokens**

- [ ] **Step 2: Вынести home-hero + donino list styles**

- [ ] **Step 3: Вынести motion/reveal + filters**

- [ ] **Step 4: Вынести home-v2 блок (~строки 1020–1822)**

- [ ] **Step 5: `index.css` = tailwind + imports; LOC ≤100**

- [ ] **Step 6: Visual smoke** — `/`, `/speed-records`, `/shows`, dark mode toggle: shell blobs, home stage, donino rows.

---

## Phase 6: Coursing row-parsers (осторожно)

### Task 10: Разделить 1-judge / 2-judge parsers

**Status:** DONE 2026-08-06 — `row-parsers-1judge.ts` / `row-parsers-2judges.ts` + router; `test-parser-fixtures` PASS

**Files:**
- Create: `backend/parsers/coursing/row-parsers-1judge.ts`
- Create: `backend/parsers/coursing/row-parsers-2judges.ts`
- Modify: `backend/parsers/coursing/row-parsers.ts` — оставить `parseDogRow`, `parseNonArrivedRow` + re-export helpers if needed
- Test: `yarn run test-parser-fixtures` (и/или существующие parser tests)

**How it works:** `parseDogRow` смотрит число судей → делегирует в `parseDogRow1Judge` / `parseDogRow2Judges`; читает HTML ячейки procoursing (windows-1251 уже декодирован выше по pipeline). **Не** объединять с bzmp/racing `row-parsers.ts` — разные форматы.

- [ ] **Step 1: Перенести `parseDogRow1Judge` as-is**

- [ ] **Step 2: Перенести `parseDogRow2Judges` as-is**

- [ ] **Step 3: Router `parseDogRow` импортирует оба**

- [ ] **Step 4: Fixtures**

```powershell
cd D:\Site\CoursingStats; yarn run test-parser-fixtures
```

Expected: PASS.

---

## Phase 7: Verification gate

### Task 11: Финальный audit + regression

- [ ] **Step 1: Пересчитать LOC** — ни один *активный* файл из инвентаря (кроме skip) не должен остаться ≥600, кроме допустимых barrel-исключений (если barrel тонкий — ок).

```powershell
# тот же snippet что Task 0; плюс новые папки Shows/, styles/, rkf-cert/, show-awards/
```

- [ ] **Step 2: Полный релевантный test set**

```powershell
cd D:\Site\CoursingStats
yarn test --run backend/tests/parse-rkf-certificate-pdf.test.ts backend/tests/qualification-titles.test.ts
yarn run test-parser-fixtures
cd frontend; yarn exec tsc --noEmit
```

- [ ] **Step 3: Manual checklist**

| Route | Что проверить |
|-------|----------------|
| `/shows?tab=calendar` | года, mono merge, outbound |
| `/shows/exhibition/:id` | main ring, catalog, legacy |
| `/shows/judges/:id` | tabs, strictness |
| Events/competitions calendar | URL filters |
| `/` + dark | home-v2 + shell |
| `/speed-records` | donino list CSS |

- [ ] **Step 4: Обновить canvas audit** (optional) — пересчитать топ LOC в `large-files-optimization.canvas.tsx`

---

## Порядок выполнения (зависимости) — largest first

```
Phase 0a/0b  DELETE one-shot scripts          (−2.6k LOC instantly)
Phase 0c     SHRINK dead CSS + Hero           (index.css вниз до split)
    ↓
Phase 4      SPLIT RKF PDF parser             (был #3 по размеру)
Phase 1      SPLIT ShowExhibitionDetail
Phase 3      SPLIT staticData/shows (+ optional award lib)
Phase 2      SPLIT ShowCalendar + Events
Phase 6      SPLIT coursing row-parsers
Phase 1b     SPLIT ShowJudgeDetail
Phase 5      SPLIT оставшийся index.css @import
Phase 7      gate / LOC audit
```

**Параллельно можно:** Phase 0c ∥ подготовка Phase 4; UI Phases 1–2 после deletes.

---

## Out of scope (явно)

- Уменьшение размера JSON в `data/v1` / CDN sharding (отдельный perf plan)
- Объединение ShowCalendar + Events в shared calendar kit
- Смена Turso schema / reparse всех PDF
- CS/Elo formula changes
- Визуальный редизайн
- Файлы 500–599 LOC (bot api, JudgeDetail competitions, …) — backlog после ≥600

---

## Success criteria

1. One-shot Donino scripts удалены; `data/v1` 1545/1550 на месте. **DONE**
2. Мёртвый CSS старой Home + неиспользуемые Hero UI exports убраны. **DONE**
3. Файлы из инвентаря ≤600 LOC (включая `show-award-ranking` barrel + `home-v2-*`). **DONE** 2026-08-06
4. Публичные import paths barrel’ов стабильны; тесты PDF/fixtures/titles green. **DONE**
5. Shows/Events/Home/Donino Vite build OK. **DONE**

---

## Self-review (writing-plans)

| Требование | Task |
|------------|------|
| Все ≥600 LOC разобраны | Inventory + Phase 0–6 |
| Назначение каждого файла | секции «How it works» / таблицы |
| Целевая структура | «Целевая структура файлов» |
| Skip one-shots | Phase 0 + таблица skip |
| Preserve behavior | Global Constraints + test steps |
| Shows domain rules | не merge с competitions calendar |
| Verification | Phase 7 |

Placeholder scan: нет TBD/TODO без действия.
