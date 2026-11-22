---
title: Docs Map — Agent Router
description: Single navigation entry for CoursingStats docs. Task → one cheatsheet.
confidence: stable
verified: 2026-10-01
---

# MAP — куда смотреть

**Правило:** `AGENTS.md` → `docs/ROADMAP.md` (стратегия) / `docs/invariants/` (правила доменов) / этот файл → **один** sheet. Не искать правду в git history старых `docs/site|wiki|bot`.

## Прод-факты (проверено 2026-10-01)

| Факт | Значение |
|------|----------|
| Package manager | **yarn@1.22.22** (не npm, не Yarn v4 PnP) |
| Публичный сайт | **Yandex Object Storage** (`https://coursing-stats.ru`) через GitHub Actions `deploy.yml` |
| Формат CDN | **JSON** (+ gzip/Brotli на edge); канон редактируемый |
| Паки | sport `dog-profiles/pack-*`, show `judge-details/pack-*` (ADR-014) |
| Календари | `ui-flags.json`: competitions **ON**, shows **ON** |
| Turso | Полностью удалён из проекта. Все 51 429 протоколов выставок отдаются напрямую с Яндекс S3 (gzip) |
| CDN limits | ≤~20k файлов; exclude: `dogs/by-id`, bulk `shows/exhibitions` (`publish-exclude.js`) |
| Dev | Vite `:5173` (`yarn run dev`) — чистый статический фронтенд |
| Рейтинги спорта | зачёт сезона (медали/КПД) → CS tie-break (Elo полностью удалён из UI/пайплайна) — никогда не мерджить в одно число |

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
| Выставки, RKF, протоколы выставок S3 | [sheets/04-shows.md](sheets/04-shows.md) |
| Разделение монопородок и всепородных выставок | [SHOW_MONO_ALLBREED_PLAN.md](SHOW_MONO_ALLBREED_PLAN.md) |
| Донино speed ≠ 350m | [sheets/05-donino.md](sheets/05-donino.md) |
| Парсеры procoursing | [sheets/06-parsers.md](sheets/06-parsers.md) |
| Routes, ui-flags, React Query | [sheets/07-frontend.md](sheets/07-frontend.md) |
| Дизайн-система, UI Kit, десктопные компоненты | [sheets/14-design-system.md](sheets/14-design-system.md) |
| Шаблоны и вёрстка протоколов (HTML / PDF) | [sheets/16-protocol-template.md](sheets/16-protocol-template.md) |
| SEO, поисковая аналитика, Mobile-First | [sheets/15-seo-analytics.md](sheets/15-seo-analytics.md) |
| Telegram bot | [sheets/08-bot.md](sheets/08-bot.md) |
| Dev, deploy, CI, secrets | [sheets/09-ops-deploy.md](sheets/09-ops-deploy.md) |
| Security | [sheets/10-security.md](sheets/10-security.md) |
| Tests, publish-gates | [sheets/11-testing.md](sheets/11-testing.md) |
| Cursor skills / rules | [sheets/12-agent-skills.md](sheets/12-agent-skills.md) |
| История с ProCoursing, обращения сообщества и правовой статус | [COMMUNITY_CHRONICLE_2026.md](COMMUNITY_CHRONICLE_2026.md) |
| Архитектурные решения (ADR) | [decisions/](decisions/) — слои CDN-паков: [014](decisions/014-cdn-packs-vs-turso.md) |
| Термины и понятия | [GLOSSARY.md](GLOSSARY.md) |

## Инварианты по доменам (docs/invariants/)

| Домен | Файл инвариантов | Описание |
|-------|------------------|----------|
| UI & дизайн-система | [invariants/ui-design.md](invariants/ui-design.md) | Old Money, верстка, мобилка, FLIP-анимации, карусели, скролл, кнопки |
| Соревнования и рейсинг | [invariants/competitions-racing.md](invariants/competitions-racing.md) | Протоколы, забеги, попоны, медали, зачет сезона vs CS-v2, титулы |
| Выставки РКФ | [invariants/shows-rkf.md](invariants/shows-rkf.md) | 56k статических протоколов, Главный ринг, парсинг PDF, нормализация судей |
| Донино | [invariants/donino.md](invariants/donino.md) | Замеры скорости km/h vs 350m, чемпионаты, синхронизация Google Sheets |
| Судьи | [invariants/judges.md](invariants/judges.md) | Профили судей, Proper Case фамилий, расчет строгости, ленивая отрисовка |
| Идентичность собак | [invariants/dogs-identity.md](invariants/dogs-identity.md) | Связи спорт↔выставки (`competition-links.json`), двуязычные клички, дедупликация |
| Ops, деплой, тесты | [invariants/ops-deploy.md](invariants/ops-deploy.md) | S3 CDN, двухуровневый пререндер, gzip сжатие, Vite dev стриминг |

## Skills (коротко)

См. [12-agent-skills](sheets/12-agent-skills.md). Домены: `three-domains` → `competitions-domain` / `shows-domain` / `donino-domain`.

## MCP Integration (NEW 2026-09-22)

Официальные MCP серверы для GitHub и Cloudflare:
- **GitHub:** `https://api.githubcopilot.com/mcp` — OAuth, repository management, issues, PRs, Actions
- **Cloudflare:** `https://mcp.cloudflare.com/mcp` — OAuth, Code Mode, 2500+ endpoints
- **Cloudflare Docs:** `https://docs.mcp.cloudflare.com/mcp` — Documentation search

Конфигурация: `.mcp.json`
