# AGENTS.md — AI Agent Entry Point

> Read this first, then **[docs/MAP.md](docs/MAP.md)** for task → cheatsheet routing.  
> Code is source of truth for implementation details.

---

## Quick Start (30 seconds)

1. **[docs/ROADMAP.md](docs/ROADMAP.md)** — План развития и 4 ветки рефакторинга (читать обязательно)
2. **[docs/QUICK-REFERENCE.md](docs/QUICK-REFERENCE.md)** — 5-minute overview, critical commands
3. **[docs/MAP.md](docs/MAP.md)** — куда смотреть (detailed router)
4. **[docs/INDEX.md](docs/INDEX.md)** — quick links by category
5. **[docs/sheets/](docs/sheets/)** — шпаргалки 00–13
6. **[docs/decisions/](docs/decisions/)** — почему (ADRs)
7. Skills: `.agents/skills/*/SKILL.md` — 10 domain-specific skills for CoursingStats (включая `competition-ingest`)
8. MCP: GitHub + Cloudflare official servers configured in `.mcp.json`

## Automatic Skill Usage

The following global skills are automatically activated during development:

- **ponytail** — Forces laziest working solution (YAGNI, stdlib first, minimal code)
- **verification-before-completion** — Requires verification evidence before claiming completion
- **incremental-implementation** — Builds in thin vertical slices with testing between each

These skills trigger automatically based on context:
- **ponytail**: Any coding task, refactoring, or when user mentions "lazy", "simplest", "minimal"
- **verification-before-completion**: Before claiming completion, done, fixed, or tests pass
- **incremental-implementation**: When implementing features touching multiple files or large changes

---

## Project Overview

CoursingStats — статистика соревнований (procoursing), выставок РКФ, замеров Донино + Telegram bot.

**Прод:** https://coursing-stats.ru · **CDN:** `/data/v1/` · **GitHub:** antajl/Coursing-Stats

**Стратегия и дорожная карта:** см. [`docs/ROADMAP.md`](docs/ROADMAP.md) (4 ветки разработки).

---

## Critical Architecture Facts

| Факт | |
|------|--|
| Public site | JSON from CDN only — **no** Worker/D1 runtime |
| Hosting | **Yandex Object Storage** (`deploy.yml` CI sync) |
| Truth | `data/v1/` in git |
| CDN packs | `dog-profiles/pack-*`, show `judge-details/pack-*` ([ADR-014](docs/decisions/014-cdn-packs-vs-turso.md)) |
| Pages slim | exclude `dogs/by-id` + bulk exhibitions (`publish-exclude.js`) |
| Calendars | ON in `data/v1/ui-flags.json` (competitions + shows) |
| Turso | Exhibition **protocols** only (`getShowExhibition` fallback; LC allowlist still CDN) |
| Package manager | **yarn@1.22.22** |
| Local secrets | `.env.ai` (gitignored) |
| Two sport ratings | medals ≠ CS points — never merge |
| Bot | Workers + Grammy + KV; aggregates only |

Three domains: **Competitions** / **Shows** / **Donino** — see [docs/sheets/01-three-domains.md](docs/sheets/01-three-domains.md).

---

## Critical Commands

```bash
yarn run dev                  # Vite :5173
yarn run ingest-competition <draft.json> # Safe competition import (matches dogs, prevents orphan dogs)
yarn run build-all-data       # Rebuild indexes + publish-gates
yarn run test-parser-fixtures
yarn test
# Archive Full_Results → competitions → calendar link:
# npx tsx backend/scripts/import/import-full-results-archive.ts
# npx tsx backend/scripts/import/sync-archive-comps-to-calendar.ts
cd bot; yarn run build
cd bot; yarn test
cd bot; yarn run deploy
```
PowerShell: use `;` not `&&`.

---

## Forbidden (without explicit request)

- Manually create competition or dog JSON files bypassing `yarn ingest-competition` (leads to orphan dogs and test failures)
- All breeds + 2015–2026 archive in UI  
- Merge medals/points; change CS without `cs-v2` + guide  
- Parse Breed Archive PDF (URL only)  
- Rebrand procoursing.ru  
- Deploy Worker in site CI  
- Commit/push without user request  
- Runtime D1 in production  
- Full dog history in bot  

---

## Done when

| Area | |
|------|--|
| Site/data | `build-all-data` + `yarn test` |
| Bot | `cd bot; yarn run build` + `yarn test` |
| Parsers | `test-parser-fixtures` |
| Docs | MAP resolves task to one sheet |

Full checklists: [docs/sheets/11-testing.md](docs/sheets/11-testing.md).
