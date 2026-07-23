# Parsing Rules — Правила парсинга

> **ИИ:** детали реализации — [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md). Workflow D1 — [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md).

Критические правила для парсинга данных с procoursing.ru. Эти правила НЕЛЬЗЯ нарушать без явного запроса.

---

## КРИТИЧЕСКИ: Кодировка windows-1251

**Сайт procoursing.ru использует windows-1251 БЕЗ charset в заголовках.**

### Правило
- **НЕЛЬЗЯ** доверять `fetch().text()` — декодировать из байт вручную
- **ОБЯЗАТЕЛЬНО** использовать `iconv-lite` для декодирования
- Реализация: `backend/lib/fetch-win1251.ts`

### Пример правильного подхода
```typescript
import iconv from 'iconv-lite';
import fetch from 'node-fetch';

const response = await fetch(url);
const buffer = await response.buffer();
const html = iconv.decode(buffer, 'win1251');
```

### Пример НЕПРАВИЛЬНОГО подхода
```typescript
// НЕ ДЕЛАЙ ТАК!
const response = await fetch(url);
const html = await response.text(); // БИТАЯ КИРИЛЛИЦА
```

---

## Правила турниров курсинга

### Количество судей
- 1, 2 или 3 судьи (чаще всего 2)
- Определяется из заголовка протокола

### Категории оценок (каждая 0-20)
- Маневренность
- Резвость
- Выносливость
- Преследование
- Энтузиазм

### Максимальная оценка
- 1 судья = 200 баллов
- 2 судьи = 400 баллов
- 3 судьи = 600 баллов

### Нормализация total_score
- **НЕ ДЕЛИТЬ** на количество судей
- Сохранять исходную `grand_total` как есть
- Изменено в 2026 году

---

## Правила парсинга календаря

### Одна строка таблицы = одно событие
- НЕ разбивать мультидисциплинарные строки
- Пример: 2025-08-03 Донино — курсинг + БЗМП в одной строке

### rank_label
- Сохранять переносы строк (`<br>` → `\n`)
- `[отменён]` / `[отменен]` остаётся в тексте
- UI заголовок берётся из `rank_label`, не из `title`

### Даты
- `date_start`: формат YYYY-MM-DD
- `date_end`: null для однодневных, YYYY-MM-DD для многодневных
- Парсинг диапазонов: `18-19.04.2026` → `date_start` + `date_end`

### results_url и event_type
- **ТОЛЬКО из ссылки на результаты**, не из каталога
- Принимаемые ссылки:
  - `_Complete_Results_*.html`
  - Текст «результат» (в т.ч. «Результаты состязания»)
- Исключаемые ссылки:
  - `_by_Runs`
  - `_by_Breed`
- `event_type` из суффикса файла:
  - `_C_` → coursing
  - `_B_` → bzmp
  - `_R_` → racing

### Уникальный title для БД
- UNIQUE constraint: `(date_start, title, location, event_type)`
- Старые форматы давали `title = location` → коллизии
- Функция `deriveUniqueTitle()` строит уникальный title
- UI использует `rank_label` для заголовка

### Форматы таблицы по годам

| Ячеек | Годы | title | host_club |
|-------|------|-------|-----------|
| 6 | 2015–2024 | = location | пусто |
| 7 | 2025 | = host_club | из ячейки 2 |
| 8 | 2026+ | из ячейки 2 | из ячейки 3 |

---

## HTML формат по годам

### 2015-2022
- Results stored as JPG images
- **НЕДОСТУПНЫ для парсинга без OCR**
- Требуется OCR для восстановления данных

### 2023-2024
- Simplified HTML tables (23 ячейки)
- Catalog numbers как plain text
- Парсится существующими парсерами

### 2025-2026
- Detailed HTML tables (25 ячеек)
- Catalog numbers в `<i>` tags
- Парсится существующими парсерами

---

## Правила извлечения судей

### Поддерживаемые форматы
- "Судьи:" и "Судья:"
- Многострочные и однострочные
- Colspan ячейки
- Текст перед таблицей

### Нормализация
- "Главный судья - X, судья - Y" → "X, Y"
- Валидация и восстановление имён из зашумлённого текста

### Реализация
- `backend/parsers/shared/extract-judges.ts`

---

## Разные форматы страниц

### BZMP
- **ОТДЕЛЬНЫЙ формат** от курсинга
- Парсер: `backend/parsers/bzmp/index.ts`
- НЕ предполагать, что формат курсинга подойдёт

### Racing
- **ОТДЕЛЬНЫЙ формат** от курсинга
- Парсер: `backend/parsers/racing/index.ts`
- НЕ предполагать, что формат курсинга подойдёт

### Unique tournaments
- Уникальные турниры ("Кубок Котейки Глюка", "Тройки")
- Категория "other" с оригинальным названием
- Парсер: `backend/parsers/unique/index.ts`

### Одноразовый PDF (event 1545)

Штатные парсеры курсинга/БЗМП/бегов читают **HTML** (`*_Complete_Results_*.html`). PDF выставок РКФ — отдельный пайплайн (`docs/SHOWS.md`), не курсинг.

**Исключение (2026-07):** у события **1545** (Донино ПЧРКФ курсинг, 20–21.06.2026) на procoursing.ru нет HTML (сайт/архив без протокола). Есть текстовый PDF с той же таблицей, что HTML:

- файл: `2026-06-21_Coursing_BreedChRKF_Donino.pdf`
- локальный кэш: `data/local/coursing-pdf/` (gitignore)
- скрипт: `backend/scripts/import/import-1545-donino-pdf.ts`
- цвета попон: `extract-1545-bib-colors.py` (red / `#f0ffff`, как в HTML)

Скрипт: PDF → синтетический HTML (25 `<td>`, 2 судьи, `bgcolor` попон) → штатный `parseCoursingHTML` → `data/v1/competitions/.../1545-*.json` + календарь.

**Неявки / DQ:** не из эвристики PDF-текста (ломает клички), а из `manualNonFinishDogs()` в скрипте — сверять с блоками «Неприбывшие» / «Отстранение» в PDF. DQ в синтетическом HTML — `rowspan=2` + пустая строка судьи 2 (иначе следующая собака с каталогом ≤20 съедается как оценки).

Колонки протокола (как в HTML):
- **CC** → поле `vc` (`"CC"`) — сертификат, **не** титул
- **Титул** → поле `qualification` (`"ПЧРКФ РК"`, `CACLBr`, …)

```bash
npx tsx backend/scripts/import/import-1545-donino-pdf.ts
npx tsx backend/scripts/import/import-1545-donino-pdf.ts --pdf "D:\path\to.pdf"
npx tsx backend/scripts/import/import-1545-donino-pdf.ts --dry-run
# затем
npm run build-all-data
```

**Не обобщать** в постоянный PDF-парсер курсинга без явного запроса. Если появится HTML на procoursing — предпочтительно переимпортировать обычным путём и удалить/пометить one-off.

---

## Правила сохранения данных

### raw_text
- **ВСЕГДА** сохранять `raw_text` при парсинге
- Это страховка от потери данных
- Используется для отладки и ручной проверки

### raw_scores_json
- Сохранять детальные данные (баллы или скорость)
- Формат зависит от event_type
- Используется для статистики и истории

---

## Правила тестирования

### Перед изменением парсера
- **ОБЯЗАТЕЛЬНО** запустить: `npx tsx backend/scripts/test/test-parser.ts`
- Проверить на синтетических тестах

### Тестирование на фикстурах
- Фикстуры: `backend/tests/fixtures/{coursing,bzmp,racing}/`
- Команда: `npm run test-parser-fixtures`
- Реальный HTML из procoursing.ru

### Скачивание фикстур
- **ТОЛЬКО через** `fetchWin1251` (windows-1251!)
- Команда: `npx tsx backend/scripts/test/download-fixtures.ts`
- НЕ использовать curl без декодирования

---

## Правила нормализации

### Нормализация кличек
- Скрипт: `backend/scripts/migrate/migrate-normalize-dog-names.ts`
- Каноническое имя латиницей
- Уникальность: `(name_lat, breed)`

### Нормализация типов соревнований
- "Бега за механической приманкой" → "БЗМП"
- Единое название во всех годах

---

## См. также

- [15-PARSING-IMPLEMENTATION.md](15-PARSING-IMPLEMENTATION.md) — Детали реализации парсеров
- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Workflow для заливки в D1
- [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) — Схема БД
