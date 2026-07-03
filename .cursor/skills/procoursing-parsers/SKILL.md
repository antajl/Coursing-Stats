---
name: procoursing-parsers
description: Изменение и отладка парсеров ProCoursing (coursing, BZMP, racing) — windows-1251, фикстуры, reparse, судьи. Использовать при правках backend/parsers/, скрапинге procoursing.ru или ошибках парсинга.
---

# ProCoursing — парсеры

## Перед любым изменением

```bash
npx tsx backend/scripts/test/test-parser.ts
```

После изменения — снова. На реальных HTML:

```bash
npx tsx test-parsers-fixtures.ts    # корень репо, если есть
```

Фикстуры: `backend/tests/fixtures/{coursing,bzmp,racing}/`

## Критические правила

1. Декодирование: `fetchWin1251` из `backend/lib/fetch-win1251.ts`
2. `total_score` = `grand_total` без деления на судей
3. Всегда сохранять `raw_text`
4. Coursing/BZMP/Racing — отдельные парсеры и форматы

## v1 vs v2

- **v1** (`parse-results-*.ts`) — используется reparse-скриптами сейчас
- **v2** (`parsers/*/index.ts`) — модульный, Zod-валидация, не в продакшене

При фиксе — синхронизировать оба набора или явно переключить reparse на v2.

## После изменения логики

Данные в D1 **не обновляются автоматически**:

```bash
npm run reparse-2026-coursing   # или reparse-by-year
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2026.sql --yes
```

## Форматы таблиц

| Дисциплина | Колонки | Особенности |
|------------|---------|-------------|
| Coursing/BZMP | 25, rowspan=2 | Судейские оценки, 2 забега |
| Racing 2025 | 18 | Время+скорость в одной ячейке |
| Racing 2026 | 21 | Время и скорость отдельно |

## Судьи

- Искать ячейку `Судьи:`, не regex по body
- Фильтровать примечания («Номера забегов не отражены…»)
- 2 судьи: вторая строка (coursing: 25 ячеек, bzmp: 12 ячеек)

Подробнее: `docs/data/PARSING.md`, `docs/development/parser-fixtures-debugging.md`
