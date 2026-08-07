---
title: CoursingStats Documentation
verified: 2026-08-06
---

# Documentation

Шпаргалки для AI-агентов и краткий hub для людей.

## Start here

1. Root [`AGENTS.md`](../AGENTS.md) — 30 секунд  
2. [`MAP.md`](MAP.md) — задача → один файл  
3. [`sheets/`](sheets/) — чеклисты по доменам  
4. [`decisions/`](decisions/) — ADR (почему так)

## Layout

```
docs/
  MAP.md
  README.md          # this file
  manifest.yaml
  sheets/            # 00–12 cheatsheets
  decisions/         # ADRs
  index/
    glossary.yaml
    topics.yaml
```

Legacy `docs/wiki`, `docs/site`, `docs/bot`, `docs/working`, `docs/canonical/*` (кроме ADRs) **удалены** — история в git.

## Writing rules

См. [`manifest.yaml`](manifest.yaml): плотность, declarative rules, Done when, без generic React tutorials.
