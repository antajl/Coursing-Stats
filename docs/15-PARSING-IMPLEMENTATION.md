# Parsing Implementation — Детали реализации парсеров

> **ИИ:** правила парсинга — [14-PARSING-RULES.md](14-PARSING-RULES.md). Workflow D1 — [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md).

Детали реализации парсеров для procoursing.ru: структура файлов, функции, форматы данных.

---

## Версии парсеров

Все скрипты — `.ts`, запуск `npx tsx`. Файлов `.mjs` нет.

| Версия | Путь | Назначение |
|--------|------|------------|
| v1 | `backend/parsers/parse-results-coursing.ts`, `backend/parsers/parse-results-bzmp.ts`, `backend/parsers/parse-results-racing.ts` | CLI, legacy-скрипты (`reparse-coursing` и т.д.) |
| v2 | `backend/parsers/coursing/index.ts`, `backend/parsers/bzmp/index.ts`, `backend/parsers/racing/index.ts`, `backend/parsers/unique/` | **`reparse-by-year.ts`**, `test-parser-fixtures` |

**Фикстуры:** `backend/tests/fixtures/{coursing,bzmp,racing}/` — реальный HTML.

**Racing фикстуры (исправлены 2026-07):**
- `2026-05-16_Complete_Results_Racing.html`
- `Complete_Results_2025-cc-sample.html`

---

## Coursing Parsing Implementation

### Source Data
- **URL:** http://procoursing.ru/2026/[date]_Complete_Results_Coursing.html
- **Парсер:** `backend/parsers/coursing/index.ts` (модульная версия)
- **Fallback:** `backend/parsers/parse-results-coursing.ts` (старая версия)

### Модульная структура

**Файлы:**
- `parsers/coursing/utils.ts` - утилиты (extractNumber, normalizeDogName, etc.)
- `parsers/coursing/row-parsers.ts` - парсинг строк (parseDogRow1Judge, parseDogRow2Judges)
- `parsers/coursing/header-parsers.ts` - парсинг заголовков (extractJudgeCount)
- `parsers/coursing/schemas.ts` - Zod схемы для валидации
- `parsers/coursing/index.ts` - модульный парсер с валидацией

**Функции:**
- `parseCoursingHTML(html)` - базовый парсинг
- `parseCoursingHTMLWithValidation(html)` - парсинг с Zod валидацией
- `parseCoursingResultsPage(url)` - парсинг по URL

### HTML Structure

#### Заголовок страницы
```html
<title>Чемпионат РКФ-CACL по курсингу борзых, 04.04.2026 (Ярославская область, Большесельский район): Полные результаты состязания</title>
```

**Извлекаемые данные:**
- `full_title`: часть до запятой с датой
- `event_date`: дата в формате DD.MM.YYYY
- `protocol_location`: локация в скобках

#### Таблица результатов

**Заголовки групп пород:**
```html
<tr><td colspan=25 bgcolor="#c0c0c0"><b>Порода - Класс - Пол</b></td></tr>
```

**Схемы трасс:**
```html
<tr>
<td colspan=11 align=center><b>Схема трассы №1 (длина 700 м)<br><img src="2026-04-04_M1.png"></b></td>
<td colspan=14 align=center><b>Схема трассы №2 (длина 700 м)<br><img src="2026-04-04_M2.png"></b></td>
</tr>
```

**Судьи:**
```html
<tr>
<td colspan=25 align=center><b>Судьи:</b><br>Главный судья - Лукина Д.М., судья - Гродинская Т.Л.</td>
</tr>
```

**Строки собак (формат с двумя строками на собаку):**
- Ячейка 0: место
- Ячейка 1: каталожный номер (в `<i>`)
- Ячейка 2: порода
- Ячейка 3: класс
- Ячейка 4: пол
- Ячейка 5: кличка (с `<br>` между рус/лат)
- Ячейка 6: номер забега 1 (с цветом фона)
- Ячейки 7-11: судья 1, забег 1 (5 категорий оценок)
- Ячейка 12: сумма судьи 1, забег 1
- Ячейка 13: сумма 1 (rowspan=2)
- Ячейка 14: номер забега 2 (с цветом фона)
- Ячейки 15-19: судья 1, забег 2 (5 категорий оценок)
- Ячейка 20: сумма судьи 1, забег 2
- Ячейка 21: сумма 2 (rowspan=2)
- Ячейка 22: общая сумма (rowspan=2)
- Ячейка 23: ВС
- Ячейка 24: титул

**Категории оценок:**
1. Маневренность
2. Резвость
3. Выносливость
4. Преследование
5. Энтузиазм

**Цвета попон (bib colors):**
- `red` или `#FF0000`: красный
- `white` или `#FFFFFF`: белый
- `blue` или `#0000FF`: синий
- другие: серый

**Статусы собак:**
- `finished`: финишировал
- `disqualified`: дисквалифицирован (отстранение)
- `dns`: неявка
- `withdrawn`: снят
- `dnf`: не финишировал

### Data Structure

```javascript
{
  results: [
    {
      breed_class: "Порода - Класс - Пол",
      placement: 1,
      catalog_no: 12345,
      breed: "САЛЮКИ",
      class: "Стандартная",
      sex: "Сука",
      name: "СОБАКА / DOG",
      total_score: 95.5,
      judge_count: 2,
      qualification: "CACL, RegCACL",
      vc: "+",
      status: "finished",
      raw_scores_json: JSON.stringify({
        heats: [
          {
            heat_number: 1,
            bib_number: 30,
            bib_color: "red",
            judges: [...],
            total: 185
          },
          {
            heat_number: 2,
            bib_number: 50,
            bib_color: "blue",
            judges: [...],
            total: 188
          }
        ],
        grand_total: 373
      }),
      raw_text: "<html>..."
    }
  ],
  full_title: "Чемпионат РКФ-CACL по курсингу борзых",
  event_date: "04.04.2026",
  protocol_location: "Ярославская область, Большесельский район",
  judges: "Главный судья - Лукина Д.М., судья - Гродинская Т.Л.",
  track_schemes: [...]
}
```

### Key Parser Functions

- `extractBibColor($cell)` — Извлекает цвет попоны из атрибутов bgcolor или style
- `extractItalicNumber($el)` — Извлекает число из тега `<i>` (для каталожных номеров)
- `extractBoldNumber($el)` — Извлекает число из тега `<b>` (для сумм)
- `normalizeDogName(name)` — Нормализует имя собаки: uppercase, удаление спецсимволов, замена Ё на Е
- `normalizeBreed(breed)` — Нормализует породу: uppercase, удаление спецсимволов, замена Ё на Е
- `detectStatusFromText(text, hasScore)` — Определяет статус собаки на основе текста
- `extractJudgeCount(judgesText, $)` — Определяет количество судей из текста или структуры таблицы

### Judge Count Detection

**Приоритет:** текст судей над структурой таблицы

**Логика:**
1. Проверяется текст судей (judgesText)
2. Формат "Главный судья - Иванова Г.С." без "судья -" → 1 судья
3. Формат "Главный судья - Иванова Г.С., судья - Петрова А.А." → 2 судьи
4. Если текст недоступен, анализируется структура заголовков таблицы
5. По умолчанию: 2 судьи

**Separate Parsing Functions:**
- `parseDogRow1Judge()` — для 1 судьи
- `parseDogRow2Judges()` — для 2 судей
- `parseDogRow3Judges()` — для 3 судей (зарезервировано)

### Heat Number Extraction

**Жесткая привязка к цвету:**
- Если в ячейке есть цвет (bgcolor), то содержимое ячейки — это номер забега
- Это особенно важно для disqualified собак, где номер забега может быть единственным идентификатором

**Пример (BZMP):**
```html
<td bgcolor="#ff0000">5</td>  <!-- Номер забега 5, красная попона -->
```

### Disqualification Handling

**Coursing:**
- Проверка colspan в ячейках 7 и 15
- Если colspan >= 6 → disqualified
- Сохранение причины дисквалификации
- Сохранение номера забега и цвета попоны

**BZMP:**
- Проверка colspan в ячейках 7 (забег 1) и 15 (забег 2)
- Текст причины: "Отстранение (Сход с трассы)"
- Жесткая привязка номера забега к цвету

---

## BZMP Parsing Implementation

### Source Data
- **URL:** http://procoursing.ru/2026/[date]_Complete_Results_BZMP.html
- **Парсер:** `backend/parsers/bzmp/index.ts` (модульная версия)
- **Fallback:** `backend/parsers/parse-results-bzmp.ts` (старая версия)

### Модульная структура

**Файлы:**
- `parsers/bzmp/row-parsers.ts` - парсинг строк для БЗМП
- `parsers/bzmp/schemas.ts` - Zod схемы для БЗМП
- `parsers/bzmp/index.ts` - модульный парсер с валидацией

**Функции:**
- `parseBzmpHTML(html)` - базовый парсинг
- `parseBzmpHTMLWithValidation(html)` - парсинг с Zod валидацией
- `parseBzmpResultsPage(url)` - парсинг по URL

### Особенности формата
- Метрики: Судейские оценки (как в курсинге)
- Забеги: 2 забега
- Статусы: "Отстранение (Сход с трассы)" и другие

### Структура таблицы (25 колонок, как в курсинге)
1. Место (rowspan=2)
2. № (rowspan=2, italic)
3. Порода (rowspan=2)
4. Класс (rowspan=2)
5. Пол (rowspan=2)
6. Кличка (rowspan=2)
7. Забег 1 VC (rowspan=2, italic)
8-13. Судьи забега 1 (Ман, Резв, Вын, Прес, Энт, Сум)
14. Сумма 1 (rowspan=2, bold)
15. Забег 2 VC (rowspan=2, italic)
16-21. Судьи забега 2 (Ман, Резв, Вын, Прес, Энт, Сум)
22. Сумма 2 (rowspan=2, bold)
23. Общая сумма (rowspan=2, bold)
24. ВС (rowspan=2)
25. Титул (rowspan=2)

### Особенности
- rowspan=2 как в курсинге
- Статус "Отстранение (Сход с трассы)" с colspan=6 вместо судейских оценок
- bgcolor=#ff0000 для VC при отстранении
- Извлечение судей: поиск во всем body с паттернами "Главный судья", "судья -", "Судьи:"

---

## Racing Parsing Implementation

### Source Data
- **URL:** http://procoursing.ru/2026/[date]_Complete_Results_Racing.html
- **Парсер:** `backend/parsers/racing/index.ts` (модульная версия)
- **Fallback:** `backend/parsers/parse-results-racing.ts` (старая версия)

### Модульная структура

**Файлы:**
- `parsers/racing/row-parsers.ts` - парсинг строк для рейсинга (время, скорость)
- `parsers/racing/schemas.ts` - Zod схемы для рейсинга
- `parsers/racing/index.ts` - модульный парсер с валидацией

**Функции:**
- `parseRacingHTML(html)` - базовый парсинг
- `parseRacingHTMLWithValidation(html)` - парсинг с Zod валидацией
- `parseRacingResultsPage(url)` - парсинг по URL

### Особенности формата
- Метрики: Время и скорость (не судейские оценки как в курсинге)
- Забеги: До 3 забегов на собаку
- Дистанция: Указывается в метрах (например, 360 м)
- Попоны: Цвета попон (но часто не указаны, "-")

### Структура таблицы (18 колонок)
1. Место
2. № каталожный (italic)
3. Порода
4. Класс
5. Пол
6. Кличка
7. Дистанция (м)
8. Забег 1 (номер)
9. Попона 1
10. Время 1 / Скорость (формат: "21.88 с<br>16.45 м/с<br>59.232 км/ч")
11. Забег 2 (номер)
12. Попона 2
13. Время 2 / Скорость
14. Забег 3 (номер)
15. Попона 3
16. Время 3 / Скорость
17. ВС (+ или пусто)
18. Титул(ы)

### Особенности
- Нет rowspan=2 — каждая строка самодостаточна
- Лучшее время может быть выделено цветом (bgcolor=#ffd700)
- Формат времени: "21.88 с<br>16.45 м/с<br>59.232 км/ч"
- Скорость в м/с, конвертируется в км/ч в API (×3.6)

---

## Unique Parsing Implementation

### Source Data
- **URL:** http://procoursing.ru/2026/[date]_Complete_Results_[Type].html
- **Парсер:** `backend/parsers/unique/index.ts` (модульная версия)

### Модульная структура

**Файлы:**
- `parsers/unique/row-parsers.ts` - гибкий парсинг для нестандартных форматов
- `parsers/unique/schemas.ts` - Zod схемы для уникальных турниров
- `parsers/unique/index.ts` - модульный парсер с валидацией

**Функции:**
- `parseUniqueHTML(html)` - базовый парсинг
- `parseUniqueHTMLWithValidation(html)` - парсинг с Zod валидацией
- `parseUniqueResultsPage(url)` - парсинг по URL

### Особенности
- Гибкий парсинг для нестандартных форматов турниров
- Автоматическое определение структуры таблицы
- Поддержка различных форматов колонок
- Используется для турниров категории "other" (Кубок Котейки Глюка, Тройки и т.д.)

---

## Сравнение форматов

| Характеристика | Coursing | BZMP | Racing | Unique |
|---------------|----------|------|--------|--------|
| Колонок | 25 | 25 | 18 | Переменная |
| rowspan | Да (2) | Да (2) | Нет | Переменная |
| Метрики | Судейские оценки | Судейские оценки | Время/скорость | Переменные |
| Забеги | 2 | 2 | До 3 | Переменные |
| Дистанция | Нет | Нет | Да | Переменная |
| Попоны | Нет | Нет | Да | Переменные |
| Парсер | `parsers/coursing/index.ts` | `parsers/bzmp/index.ts` | `parsers/racing/index.ts` | `parsers/unique/index.ts` |

---

## Тестирование парсеров

### Синтетические тесты (v1)
```bash
npm run test-parser
```

### Тестирование на фикстурах (v2 модульные)
```bash
npm run test-parser-fixtures
npm run download-fixtures
npx tsx backend/scripts/test/compare-parsers.ts
```

### CLI Mode (v1)
```bash
npx tsx backend/parsers/parse-results-coursing.ts <url>
npx tsx backend/parsers/parse-results-bzmp.ts <url>
npx tsx backend/parsers/parse-results-racing.ts <url>
```

---

## Перепарсинг после изменений

### Универсальный скрипт по годам
```bash
# Перепарсинг всех событий года
npm run reparse-2026
npm run reparse-2025
npm run reparse-2024
npm run reparse-2023

# Перепарсинг только определенного типа событий
npm run reparse-2026-coursing
npm run reparse-2026-bzmp
npm run reparse-2026-racing
```

Или напрямую:
```bash
npx tsx backend/scripts/reparse/reparse-by-year.ts 2026
npx tsx backend/scripts/reparse/reparse-by-year.ts 2026 coursing
```

**Парсеры:** `reparse-by-year.ts` использует **v2** модульные парсеры (`parsers/coursing|bzmp|racing/index.ts`).

### Специализированные скрипты (legacy)
```bash
npm run reparse-coursing
npm run reparse-bzmp
npm run reparse-racing
```

---

## Track Schemes (Схемы трасс)

### Извлечение

**Coursing:**
- Поиск в `<a>` и `<img>` тегах
- Ключевые слова: 'Map', 'схема трассы', 'схема'
- Извлечение номера схемы и длины
- HEAD запрос для валидации URL

**BZMP:**
- Аналогично coursing

### Хранение

- Поле `track_schemes` в таблице `events` (JSON массив)
- Пример:
```json
[
  {
    "scheme_number": 1,
    "url": "http://procoursing.ru/...",
    "length": "480 м"
  }
]
```

---

## См. также

- [14-PARSING-RULES.md](14-PARSING-RULES.md) — Критические правила парсинга
- [13-DATABASE-WORKFLOW.md](13-DATABASE-WORKFLOW.md) — Workflow для заливки в D1
- [12-DATABASE-SCHEMA.md](12-DATABASE-SCHEMA.md) — Схема БД
