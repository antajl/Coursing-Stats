---
title: Frontend
verified: 2026-11-08
---

# 07 — Frontend

## Purpose

React 19 + Vite + Tailwind SPA (деплой на Yandex Object Storage). Данные: static JSON с CDN (без рантайм базы данных). **Light theme only** (dark mode removed 2026-09-22, CSS reduced by 23%).

## Truth table

| Факт | |
|------|--|
| Entry routes | `frontend/src/AppRoutes.tsx` |
| Static data | `frontend/src/lib/staticData/*`, `hooks/useStaticData.ts` |
| Sport dog profile | `dogs.ts` → `indexes/dog-profiles/pack-XXX.json` (`byId`) |
| Show judge detail | `shows/judges.ts` → `judge-details/pack-XXX.json` (`byKey`) |
| Calendars gate | `data/v1/ui-flags.json` + `usePublicCalendarVisible` — local всегда видно |
| Shows lists | React Query (`staleTime` ~5 min) → CDN |
| Exhibition detail | S3 CDN `shows/protocols/${id}.json` (gzip) |
| Design | PageToolbar, SALUKI theme, Home Hero & Contextual Logo — см. [14-design-system.md](14-design-system.md) |
| Years dropdown | `indexes/years.json`; hooks: `useApi` `['api','years']` ≠ `useStaticData` `['staticData','years']` |
| iframe | `frontend/public/_headers` frame-ancestors |

### Main routes

`/`, `/competitions`, `/shows`, `/speed-records`, `/guide`, `/guide/breed-speeds/:breed`, `/about`, `/dog/:id`, `/event/:id`, `/donino-dog/:name/:breed`, `/shows/exhibition/:id`, `/shows/dog/…`, `/judges/:judgeId`, `/shows/judges/:judgeId`

## Key files

- `frontend/vite.config.ts`
- `frontend/src/index.css` — Tailwind + `@import` → `frontend/src/styles/*` (nav, shell, donino, home-v2-*)
- `frontend/src/pages/**` — крупные страницы разбиты: `Shows/ShowExhibitionDetail/`, `ShowCalendar/`, `ShowJudgeDetail/`, `Events/{EventsToolbar,EventsMonthList}`
- `frontend/src/lib/judgeUiUtils.ts` — инициалы для монограмм судей, бейджи строгости и утилиты отображения
- `frontend/src/lib/staticData/*` — доменные barrels (`shows.ts` → `shows/…`)
- `frontend/src/components/toolbar/**`
- `frontend/.env.example` — параметры сборки фронтенда

## Workflows

```bash
yarn run dev                  # Vite + автоматический Cloudflare Tunnel для телефона
cd frontend; yarn run build
```

SEO prerender: `yarn run prerender-seo` после `frontend build` (CI). По умолчанию пишет HTML хабов, dogs (включая топ-15 000 активных собак выставок), events, судей спорта, Донино, **выставок** и **судей выставок**. Выкл show-пакетов: `PRERENDER_EXHIBITIONS=0` / `PRERENDER_SHOW_JUDGES=0` / `PRERENDER_SHOW_ONLY=0`. Fallback: `/spa-shell/index.html`.

## Pitfalls

- Не добавлять Worker runtime для публичных данных.
- Не хардкодить counters — `manifest.json`.
- Performance ranking shows: отдельный backlog; не ломать lean indexes.
- React Query: не шарить один `queryKey` между `useApi` и `useStaticData` с разным shape (годы календаря: `['api','years']` vs `['staticData','years']`) — иначе dropdown «Год» схлопывается до 5 лет.
- **Mobile Carousel Invariant**: мобильные карусели и слайдеры пород реализуются через непрерывный 3-слотовый трек `[prev, current, next]` со сдвигом `translateX(calc(-100% + ${dragOffset}px))` и прямым тактильным 1:1 откликом на свайп. Запрещено использовать подмену одного элемента с `opacity: 0` или цепочками `requestAnimationFrame` (приводит к миганию, белым экранам и залипанию в скрытом состоянии).
- **S3 SPA Fallback Invariant**: никогда не настраивать S3 `--error-document` на статический `404.html` без JS и не вырезать `<script type="module">` из fallback-страниц. S3 не имеет собственного серверного роутинга, поэтому `--error-document` обязан отдавать рабочую SPA-оболочку (`index.html`), иначе при прямом переходе из поиска на непререндеренные профили собак пользователи получают 404.
- **Dropdown Lazy Evaluation & Render Prop Invariant**: все выпадающие списки (`ModernDropdown`, фильтры тулбаров) поддерживают `children: ReactNode | (() => ReactNode)` и рендерятся строго лениво при `isOpen`, исключая деградацию INP (>1.5 с).
- **Multi-Subtab Idle Prefetch & Intent Warming**: `MobileSubNavTabs` использует `onHoverTab` для прогрева чанков при наведении/касании, а родительские контейнеры («Выставки», «Соревнования», «Донино») запускают фоновый префетч неактивных вкладок через `requestIdleCallback` (через 2с), обеспечивая мгновенный 0&nbsp;мс переход.
- **Monolithic Code & Toolbar Decomposition**: интерактивные компоненты страниц, хуки и CLI-скрипты сохраняют модульную архитектуру ($\le 400$ строк). Тулбары и сложные фильтры страниц (`Judges`, `ShowJudges`, `EventResults`, `ShowRanking`) обязаны изолироваться в отдельные компоненты `*Toolbar.tsx` / `*FilterPanel.tsx` с едиными функциями рендеринга элементов меню между мобильной и десктопной консолями для исключения дублирования разметки и рассинхронизации состояния.
- **Mobile Scroll Containers & Horizontal Clipping Invariant**: на мобильных устройствах во избежание паразитных внутренних скролл-контейнеров (scroll container trap), срезающих кнопки и блоки при вертикальном свайпе, строго запрещено использовать `overflow-x-hidden` и компенсирующие отрицательные марджины (`pb-* -mb-*`) на контентных блоках и вкладках (`SeasonTopSection`, `*TopTab`). Для отсечения горизонтальных хвостов каруселей и анимаций свайпа используется исключительно `overflow-x: clip` (`overflow-x-clip`), который не превращает элемент в scroll container (сохраняя нативный `overflow-y: visible`) и гарантирует прокрутку страницы только целиком.
- **Search Registry Single Source of Truth**: запрещено создавать дублирующие статические списки пород для поиска (`quickSearchData.ts`). Все поисковые реестры пород динамически порождаются из `CORE_BREED_HUBS` (`frontend/src/lib/breed-hubs-data.ts`), обеспечивая 100% охват всех 82 пород каталога и корректные ссылки `/breeds/:slug/`.
- **Russian Cynological Search Morphology & Declensions**: любой поиск (QuickSearch, Guide Search, Filters) по собакам, породам и терминам обязан поддерживать морфологический стемминг русских окончаний (`stemWord` из `stemmer.ts`) с порогом основы $\ge 3$. Запросы в косвенных падежах («таксу», «борзую», «уиппета», «волкодава», «бигля») обязаны с высоким приоритетом ($\ge 90$ баллов) находить канонические страницы пород и разделов, отображаясь выше сырых совпадений по кличкам собак.
- **Breed Hub Canonical Slugs & Variety Aliasing**: при наличии внутри породы разновидностей по росту или шерсти (таксы: стандартная/мини/кроличья, поденко, шнауцеры, пудели) основной породный хаб использует канонический международный слаг (`dachshund`), а специализированные наименования и синонимы регистрируются в `aliases` (`miniature-dachshund`, `taksa`). Функция `matchesBreedFilter` сопоставляет базовый канонический ключ породы («ТАКСА») со всеми ее спецификациями в базе состязаний и выставок.

## See also

[01-three-domains](01-three-domains.md) · [02-data-pipeline](02-data-pipeline.md) · [04-shows](04-shows.md) · ADR-001, ADR-002, [ADR-014](../decisions/014-cdn-packs-vs-turso.md)
