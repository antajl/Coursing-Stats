---
title: Docs Map — Agent Router
description: Single navigation entry for CoursingStats docs. Task → one cheatsheet.
confidence: stable
verified: 2026-08-06
---

# MAP — куда смотреть

**Правило:** `AGENTS.md` → этот файл → **один** sheet. Не искать правду в git history старых `docs/site|wiki|bot`.

## Прод-факты (проверено 2026-08-06)

| Факт | Значение |
|------|----------|
| Package manager | **yarn@1.22.22** (не npm, не Yarn v4 PnP) |
| Публичный сайт | CDN `/data/v1/*.json` — без Worker/D1 runtime |
| Календари | `ui-flags.json`: competitions **ON**, shows **ON** |
| Turso | Только протоколы выставок (`getShowExhibition` fallback) |
| Secrets локально | `.env.ai` (gitignored); frontend `VITE_TURSO_*` |
| Рейтинги спорта | зачёт сезона (медали/КПД) → CS tie-break; Elo display-only — никогда не мерджить в одно число |

## Задача → файл

| Задача | Читать |
|--------|--------|
| Старт, запреты, стек | [sheets/00-overview.md](sheets/00-overview.md) |
| Три домена / identity | [sheets/01-three-domains.md](sheets/01-three-domains.md) |
| data/v1, build-all-data, empty ranking | [sheets/02-data-pipeline.md](sheets/02-data-pipeline.md) |
| Соревнования, medals/CS, judges | [sheets/03-competitions.md](sheets/03-competitions.md) |
| Выставки, RKF, Turso protocols | [sheets/04-shows.md](sheets/04-shows.md) |
| Донино speed ≠ 350m | [sheets/05-donino.md](sheets/05-donino.md) |
| Парсеры procoursing | [sheets/06-parsers.md](sheets/06-parsers.md) |
| Routes, ui-flags, React Query | [sheets/07-frontend.md](sheets/07-frontend.md) |
| Telegram bot | [sheets/08-bot.md](sheets/08-bot.md) |
| Dev, deploy, CI, secrets | [sheets/09-ops-deploy.md](sheets/09-ops-deploy.md) |
| Security | [sheets/10-security.md](sheets/10-security.md) |
| Tests, publish-gates | [sheets/11-testing.md](sheets/11-testing.md) |
| Cursor skills / rules | [sheets/12-agent-skills.md](sheets/12-agent-skills.md) |
| Why (ADRs) | [decisions/](decisions/) |
| Термины | [index/glossary.yaml](index/glossary.yaml) |

## Skills (коротко)

См. [12-agent-skills](sheets/12-agent-skills.md). Домены: `three-domains` → `competitions-domain` / `shows-domain` / `donino-domain`.
