---
title: Frontend
verified: 2026-08-08
---

# 07 — Frontend

## Purpose

React 19 + Vite + Tailwind SPA на Cloudflare Pages. Данные: static JSON; Turso только для miss протоколов выставок.

## Truth table

| Факт | |
|------|--|
| Entry routes | `frontend/src/AppRoutes.tsx` |
| Static data | `frontend/src/lib/staticData/*`, `hooks/useStaticData.ts` |
| Calendars gate | `data/v1/ui-flags.json` + `usePublicCalendarVisible` — local всегда видно |
| Shows lists | React Query (`staleTime` ~5 min) → CDN |
| Exhibition detail | CDN → Turso fallback (`lib/turso.ts`) |
| Design | PageToolbar, SALUKI theme — см. существующие UI patterns в `frontend/src` |
| Admin | только `yarn run dev` → `/admin` (список/создание) + `/admin/event/:id` (редактор) + API `:8787`; на проде нет |
| Years dropdown | `indexes/years.json`; hooks: `useApi` `['api','years']` ≠ `useStaticData` `['staticData','years']` |
| iframe | `frontend/public/_headers` frame-ancestors |

### Main routes

`/`, `/competitions`, `/shows`, `/speed-records`, `/guide`, `/dog/:id`, `/event/:id`, `/donino-dog/:name/:breed`, `/shows/exhibition/:id`, `/shows/dog/…`, `/judges/:judgeId`, `/shows/judges/:judgeId`, auth `/login|/register|/account`

## Key files

- `frontend/vite.config.ts`
- `frontend/src/index.css` — Tailwind + `@import` → `frontend/src/styles/*` (nav, shell, donino, home-v2-*)
- `frontend/src/pages/**` — крупные страницы разбиты: `Shows/ShowExhibitionDetail/`, `ShowCalendar/`, `ShowJudgeDetail/`, `Events/{EventsToolbar,EventsMonthList}`
- `frontend/src/lib/staticData/*` — доменные barrels (`shows.ts` → `shows/…`)
- `frontend/src/components/toolbar/**`
- `frontend/.env.example` — `VITE_TURSO_*`

## Workflows

```bash
yarn run dev
cd frontend; yarn run build
```

SEO prerender: `yarn run prerender-seo` (когда нужно).

## Pitfalls

- Не добавлять Worker runtime для публичных данных.
- Не хардкодить counters — `manifest.json`.
- Performance ranking shows: отдельный backlog; не ломать lean indexes.
- React Query: не шарить один `queryKey` между `useApi` и `useStaticData` с разным shape (годы календаря: `['api','years']` vs `['staticData','years']`) — иначе dropdown «Год» схлопывается до 5 лет.

## See also

[01-three-domains](01-three-domains.md) · [04-shows](04-shows.md) · ADR-001, ADR-002
