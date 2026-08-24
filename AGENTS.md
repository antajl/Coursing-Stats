# AGENTS.md — AI Agent Entry Point

> Read this first, then **[docs/MAP.md](docs/MAP.md)** for task → cheatsheet routing.  
> Code is source of truth for implementation details.

---

## Quick Start (30 seconds)

1. **[docs/MAP.md](docs/MAP.md)** — куда смотреть
2. **[docs/sheets/](docs/sheets/)** — шпаргалки 00–12
3. **[docs/decisions/](docs/decisions/)** — почему (ADRs)
4. Skills: `.agents/skills/*/SKILL.md` — 9 domain-specific skills for CoursingStats

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

**Статус улучшений дизайна:** Phases 1-7 завершены (accessibility, performance, responsive design, React composition patterns) — см. [`docs/superpowers/plans/2025-01-15-comprehensive-design-improvement.md`](docs/superpowers/plans/2025-01-15-comprehensive-design-improvement.md)

---

## Critical Architecture Facts

| Факт | |
|------|--|
| Public site | JSON from CDN only — **no** Worker/D1 runtime |
| Truth | `data/v1/` in git |
| CDN packs | `dog-profiles/pack-*`, show `judge-details/pack-*` ([ADR-014](docs/decisions/014-cdn-packs-vs-turso.md)) |
| Pages slim | exclude `dogs/by-id` + bulk exhibitions (`publish-exclude.js`) |
| Calendars | ON in `data/v1/ui-flags.json` (competitions + shows) |
| Turso | Exhibition **protocols** only (`getShowExhibition` fallback; LC allowlist still CDN) |
| Package manager | **yarn@1.22.22** |
| Local secrets | `.env.ai` (gitignored) |
| Two sport ratings | medals ≠ CS points — never merge |
| Local admin | `/admin` + `/admin/event/:id` only in `yarn run dev` |
| Bot | Workers + Grammy + KV; aggregates only |

Three domains: **Competitions** / **Shows** / **Donino** — see [docs/sheets/01-three-domains.md](docs/sheets/01-three-domains.md).

---

## Critical Commands

```bash
yarn run dev                  # Vite :5173 + admin API :8787 (/admin)
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
