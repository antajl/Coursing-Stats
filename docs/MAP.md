---
title: Docs Map — Agent Router
description: Single navigation entry for CoursingStats docs. Task → one cheatsheet.
confidence: stable
verified: 2026-10-01
---

# MAP — куда смотреть

**Правило:** `AGENTS.md` → `docs/ROADMAP.md` (стратегия) / этот файл → **один** sheet. Не искать правду в git history старых `docs/site|wiki|bot`.

## Прод-факты (проверено 2026-10-01)

| Факт | Значение |
|------|----------|
| Package manager | **yarn@1.22.22** (не npm, не Yarn v4 PnP) |
| Публичный сайт | **Yandex Object Storage** (`https://coursing-stats.ru`) через GitHub Actions `deploy.yml` |
| Формат CDN | **JSON** (+ gzip/Brotli на edge); канон редактируемый |
| Паки | sport `dog-profiles/pack-*`, show `judge-details/pack-*` (ADR-014) |
| Календари | `ui-flags.json`: competitions **ON**, shows **ON** |
| Turso | Только протоколы выставок RKF (`getShowExhibition`; LC allowlist ещё на CDN) |
| CDN limits | ≤~20k файлов; exclude: `dogs/by-id`, bulk `shows/exhibitions` (`publish-exclude.js`) |
| Dev | Vite `:5173` (`yarn run dev`) — чистый статический фронтенд |
| Рейтинги спорта | зачёт сезона (медали/КПД) → CS tie-break; Elo display-only — никогда не мерджить в одно число |

## Задача → файл

| Задача | Читать |
|--------|--------|
| Стратегия и 4 ветки рефакторинга | [ROADMAP.md](ROADMAP.md) |
| Старт, запреты, стек | [sheets/00-overview.md](sheets/00-overview.md) |
| Три домена / identity | [sheets/01-three-domains.md](sheets/01-three-domains.md) |
| data/v1, build-all-data, CDN packs, empty ranking | [sheets/02-data-pipeline.md](sheets/02-data-pipeline.md) |
| Соревнования, medals/CS, judges | [sheets/03-competitions.md](sheets/03-competitions.md) |
| Импорт соревнований, протоколов, собак | [.agents/skills/competition-ingest/SKILL.md](../.agents/skills/competition-ingest/SKILL.md) |
| Бега борзых, sex, breed_class, кворум | [sheets/13-racing-standards.md](sheets/13-racing-standards.md) |
| Выставки, RKF, Turso protocols | [sheets/04-shows.md](sheets/04-shows.md) |
| Донино speed ≠ 350m | [sheets/05-donino.md](sheets/05-donino.md) |
| Парсеры procoursing | [sheets/06-parsers.md](sheets/06-parsers.md) |
| Routes, ui-flags, React Query | [sheets/07-frontend.md](sheets/07-frontend.md) |
| Дизайн-система, UI Kit, десктопные компоненты | [sheets/14-design-system.md](sheets/14-design-system.md) |
| SEO, поисковая аналитика, Mobile-First | [sheets/15-seo-analytics.md](sheets/15-seo-analytics.md) |
| Telegram bot | [sheets/08-bot.md](sheets/08-bot.md) |
| Dev, deploy, CI, secrets | [sheets/09-ops-deploy.md](sheets/09-ops-deploy.md) |
| Security | [sheets/10-security.md](sheets/10-security.md) |
| Tests, publish-gates | [sheets/11-testing.md](sheets/11-testing.md) |
| Cursor skills / rules | [sheets/12-agent-skills.md](sheets/12-agent-skills.md) |
| Why (ADRs) | [decisions/](decisions/) — слои CDN/Turso: [014](decisions/014-cdn-packs-vs-turso.md) |
| Термины | [index/glossary.yaml](index/glossary.yaml) |

## Skills (коротко)

См. [12-agent-skills](sheets/12-agent-skills.md). Домены: `three-domains` → `competitions-domain` / `shows-domain` / `donino-domain`.

## MCP Integration (NEW 2026-09-22)

Официальные MCP серверы для GitHub и Cloudflare:
- **GitHub:** `https://api.githubcopilot.com/mcp` — OAuth, repository management, issues, PRs, Actions
- **Cloudflare:** `https://mcp.cloudflare.com/mcp` — OAuth, Code Mode, 2500+ endpoints
- **Cloudflare Docs:** `https://docs.mcp.cloudflare.com/mcp` — Documentation search

Конфигурация: `.mcp.json`
