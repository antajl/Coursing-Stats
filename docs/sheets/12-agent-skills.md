---
title: Agent Skills & Rules
verified: 2026-10-01
---

# 12 — Agent Skills & Rules

## Purpose

Как агент выбирает skills/rules для CoursingStats. **Slash-команды пользователю не нужны** — auto-routing по контексту задачи.

## Truth table

| Слой | Где | Когда |
|------|-----|-------|
| Project skills | `.agents/skills/*/SKILL.md` | доменные workflows CoursingStats |
| Global skills | `~/.agents/skills/` / builtin | инженерные практики (ponytail, verification, etc.) |
| MCP | `.mcp.json` | GitHub Copilot MCP + Cloudflare MCP |

### Priority

1. Project skills (`.agents/skills/`)
2. Global / builtin skills (`ponytail`, `verification-before-completion`, `incremental-implementation`)

### Project skills (10 доменных скиллов)

| Skill | Когда |
|-------|-------|
| `three-domains` | неясный scope / границы спорта, выставок и Донино |
| `competition-ingest` | безопасный ввод соревнований через `yarn ingest-competition` |
| `competitions-domain` | спорт: курсинг, БЗМП, бега, рейтинги, протоколы |
| `shows-domain` | выставки: календарь РКФ, рейтинги собак/судей, Turso UI |
| `donino-domain` | Донино: замеры скорости (км/ч) и курсинг 350м (сек) |
| `sport-show-linkage` | связывание идентичности собак спорт ↔ выставки |
| `shows-pdf-pipeline` | пайплайн обработки отчетов и дипломов РКФ в PDF |
| `coursing-stats-dev` | сборка индексов, CDN-only пайплайн, publish-gates |
| `coursing-stats-parsers` | парсеры procoursing.ru (windows-1251, grand_total) |
| `bot-add-handler` | добавление команд и клавиатур в Telegram-бота |

### Global (активируются автоматически)

- `ponytail` — минималистичные решения, YAGNI, стандартная библиотека
- `verification-before-completion` — обязательная проверка тестами перед отчетом о готовности
- `incremental-implementation` — пошаговая разработка тонкими вертикальными слайсами

## Key files

- `.agents/skills/*/SKILL.md` — 10 доменных скиллов проекта
- `AGENTS.md` — главная точка входа для любого ИИ-агента
- `docs/ROADMAP.md` — 4 ветки развития и правила работы
- `.mcp.json` — конфигурация MCP-серверов (GitHub Copilot, Cloudflare)

## Docs entry

`AGENTS.md` → `docs/ROADMAP.md` (план) / `docs/MAP.md` (навигация) → конкретная шпаргалка.

## Pitfalls

- Не дублировать проектные скиллы в глобальные каталоги.
- Старые артефакты Devin / `.cursor` не использовать как источник правды.
- Запрещено добавлять соревнования вручную в обход `yarn ingest-competition`.

## See also

[00-overview](00-overview.md) · [MAP](../MAP.md) · [ROADMAP](../ROADMAP.md)
