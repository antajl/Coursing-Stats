---
title: Agent Skills & Rules
verified: 2026-08-06
---

# 12 — Agent Skills & Rules

## Purpose

Как агент выбирает skills/rules для CoursingStats. **Slash-команды пользователю не нужны** — auto-routing.

## Truth table

| Слой | Где | Когда |
|------|-----|-------|
| Rules `.mdc` | `.cursor/rules/` | alwaysApply или по globs |
| Project skills | `.cursor/skills/` | domain workflows |
| Global skills | `~/.agents/skills/` / `~/.cursor/skills/` | eng practices |
| Router | `.cursor/rules/skill-routing.mdc` | **alwaysApply** |

### Priority

1. Project `.cursor/skills/`  
2. Domain: `three-domains` → competitions / shows / donino  
3. Global `~/.agents/skills/`  
4. Cursor built-in `~/.cursor/skills-cursor/`

### Project skills (lean)

| Skill | Когда |
|-------|-------|
| `three-domains` | неясный scope / identity |
| `competitions-domain` | спорт |
| `shows-domain` | выставки / Turso UI |
| `donino-domain` | Донино |
| `sport-show-linkage` | связи id |
| `shows-pdf-pipeline` | RKF PDF |
| `coursing-stats-dev` | build-all-data / indexes |
| `coursing-stats-parsers` | парсеры |
| `bot-add-handler` | bot handlers |

### Global (примеры, не дублировать в project)

`systematic-debugging`, `verification-before-completion`, `vercel-react-best-practices`, `security-and-hardening`, `test-driven-development`, `writing-plans`, Cloudflare/wrangler skills, Sentry skills…

## Key files

- `.cursor/README.md`
- `.cursor/rules/skill-routing.mdc`
- `.cursor/rules/00-three-domains.mdc`
- `.cursor/mcp.json` (Turso OAuth URL)

## Docs entry

`AGENTS.md` → `docs/MAP.md` → one sheet. Не читать удалённые legacy docs.

## Pitfalls

- Не ставить копии global skills в `.cursor/skills/`.
- Devin / `skill invoke` — не использовать.
- MCP: Turso через OAuth в Cursor; codebase-memory — graph search.

## See also

[00-overview](00-overview.md) · [MAP](../MAP.md)
