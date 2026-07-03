# Parser & API test scripts

## Основные (используются в npm scripts)

| Скрипт | Команда | Назначение |
|--------|---------|------------|
| `test-parser.ts` | `npm run test-parser` | Регресс на синтетическом HTML (coursing v1) |
| `test-parsers-fixtures.ts` | `npm run test-parser-fixtures` | Модульные v2 парсеры на `backend/tests/fixtures/` |
| `download-fixtures.ts` | `npm run download-fixtures` | Скачать HTML с procoursing.ru |
| `smoke-api.ts` | `npm run smoke-api` | Smoke API (нужен `npm run dev`) |
| `compare-parsers.ts` | `npx tsx backend/scripts/test/compare-parsers.ts` | Сравнение v1 vs v2 на live URL |
| `test-racing-formats.ts` | `npx tsx backend/scripts/test/test-racing-formats.ts` | Форматы racing 18/21 колонка |

## Отладочные (`debug/`)

Одноразовые скрипты для расследования конкретных багов. **Не запускать в CI.** Не переиспользовать без чтения кода.

Фикстуры HTML: `backend/tests/fixtures/{coursing,bzmp,racing}/`
