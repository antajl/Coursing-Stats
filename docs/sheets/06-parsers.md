---
title: Parsers
verified: 2026-08-06
---

# 06 — Parsers (procoursing)

## Purpose

Парсинг HTML с procoursing.ru в JSON соревнований. Три дисциплины = три парсера.

## Truth table

| Правило | |
|---------|--|
| Encoding | windows-1251 **без** charset → только `backend/lib/fetch-win1251.ts` |
| Запрет | `fetch().text()` для procoursing → битая кириллица |
| Coursing ≠ BZMP ≠ Racing | `backend/parsers/{coursing,bzmp,racing}/` |
| `total_score` | = `grand_total` **как есть**; не делить на число судей |
| raw | Сохранять `raw_text` / scores JSON при парсе |
| Calendar | одна строка таблицы = одно событие; `event_type` из суффикса `_C_`/`_B_`/`_R_`; `rank_label` с `\n` |
| API | `/api/competitions`, не `/api/events` |
| Fixtures | `backend/tests/fixtures/{coursing,bzmp,racing,calendar}/` |

Также есть парсеры `unique/`, calendar helpers, shows PDF (это [04-shows](04-shows.md)).

## Key files

- `backend/lib/fetch-win1251.ts`
- `backend/parsers/coursing|bzmp|racing/` — coursing rows: `row-parsers.ts` router + `row-parsers-1judge.ts` / `row-parsers-2judges.ts`
- `backend/parsers/shows/parse-rkf-certificate-pdf.ts` — barrel; impl в `rkf-cert/`
- `backend/scripts/test/test-parsers-fixtures.ts`
- Skill: `.cursor/skills/coursing-stats-parsers/`

## Workflows

```bash
yarn run test-parser
yarn run test-parser-fixtures   # перед изменением парсера
yarn run parse-coursing         # и bzmp / racing
yarn run reparse-2026-coursing  # и т.п.
```

После успешного парса → запись в `data/v1` → `yarn run build-all-data`.

## Pitfalls

- Не нормализовать total через деление на судей (историческая ловушка).
- Календарь: не разбивать мультидисциплинарную строку на несколько событий вручную неправильно.
- UI title часто из `rank_label`, не из `title`.

## See also

[03-competitions](03-competitions.md) · [11-testing](11-testing.md)
