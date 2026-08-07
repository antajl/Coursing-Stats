---
title: Three Domains
verified: 2026-08-06
---

# 01 — Three Domains

## Purpose

Сайт = **три раздела с разной идентичностью**. Не смешивать сущности без явного запроса.

## Truth table

| Домен | Hub | Собаки | Судьи | Данные |
|-------|-----|--------|-------|--------|
| **Соревнования** | `/competitions` | `dog_id` (procoursing, обычно &lt;1M) | `indexes/judges-*` | CDN JSON |
| **Выставки** | `/shows` | show id / hash (≥1M для hash) | `shows/indexes/judges.json` | CDN indexes + **Turso для протоколов** |
| **Донино** | `/speed-records` | name + breed slug | нет | CDN `donino/*.json` |

| Маршрут | Домен |
|---------|--------|
| `/dog/:id` | Unified profile (спорт ± show ± donino колонки) |
| `/donino-dog/:name/:breed` | Только Донино |
| `/event/:id` | Протокол соревнования |
| `/shows/exhibition/:id` | Протокол выставки |

## Identity rules

- Одна кличка ≠ одна собака между доменами. `show id ≠ competition dog_id` (совпадения чисел случайны).
- Связь sport↔show: `dog_links` (planned) / `competition_dog_id` в show-индексах.
- Sport↔donino: только если в donino JSON есть `dog_id`.
- Судьи соревнований ≠ судьи выставок.

## Data sources

| Feature | Competitions | Shows | Donino |
|---------|--------------|-------|--------|
| Calendar | `calendar/{year}.json` | `shows/calendar-rkf/` | — |
| Rankings | `indexes/top-*` | `shows/indexes/dog-ranking-{year}.json` | inline JSON |
| Protocols | `competitions/...json` | CDN index → **Turso fallback** | — |
| Profiles | `indexes/dog-profiles/` | `show-dog-lookup/` shards | filter name+breed |

## Key files

- `.cursor/rules/00-three-domains.mdc`
- `.cursor/skills/three-domains/SKILL.md`
- Domain skills: `competitions-domain`, `shows-domain`, `donino-domain`
- `frontend/src/AppRoutes.tsx`

## Pitfalls

- Не читать ranking выставок из Turso — Turso только exhibition payload.
- Не объединять индексы судей двух доменов.
- Open gap: sport↔show linkage неполный.

## See also

[03-competitions](03-competitions.md) · [04-shows](04-shows.md) · [05-donino](05-donino.md) · skill `sport-show-linkage`
