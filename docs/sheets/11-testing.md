---
title: Testing
verified: 2026-08-06
---

# 11 — Testing

## Purpose

Что гонять перед merge/deploy по типу задачи.

## Truth table — Done when

| Задача | Критерий |
|--------|----------|
| Site / data | `yarn run build-all-data` OK + `yarn test` |
| Parsers | `yarn run test-parser-fixtures` (+ `test-parser`) |
| Bot | `cd bot; yarn run build` + `cd bot; yarn test` |
| Security | `yarn run security:scan` без critical |
| Data integrity | `yarn run data:quick` |
| Perf smoke | `yarn run perf:quick` |
| Docs links | `yarn run docs:check-links` (после правок docs) |
| Publish | `yarn run publish-gates` |

## Key commands / paths

```bash
yarn test                              # vitest backend/tests/
yarn run test-parser-fixtures
yarn run test:e2e                      # playwright
yarn run smoke-api
yarn run publish-gates
```

- Fixtures: `backend/tests/fixtures/`
- PDF shows tests: `backend/tests/parse-rkf-certificate-pdf.test.ts`, `show-grades.test.ts`
- CI: static-indexes / publish-gates tests в workflow

## Pitfalls

- Зелёный HTTP 200 на index ≠ non-empty ranking — проверяй payload.
- Менял парсер без fixtures → регрессии на windows-1251/score.
- Bot: typecheck (`build`) важнее «просто deploy».

## See also

[02-data-pipeline](02-data-pipeline.md) · [06-parsers](06-parsers.md) · [08-bot](08-bot.md)
