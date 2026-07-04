# Parsing — Парсинг данных

Документация по парсингу данных с procoursing.ru.

## Источник данных

**URL:** http://procoursing.ru/2026/[date]_Complete_Results_[Type].html

**Типы:**
- `Coursing` — курсинг
- `BZMP` — БЗМП (Бега за механической приманкой)
- `Racing` — бега/трасса (Бега борзых)

**Кодировка:** Windows-1251 (используется `fetchWin1251` для корректного декодирования)

**ВАЖНО:** Сайт procoursing.ru использует windows-1251 без charset в заголовках. Использовать `iconv-lite` для декодирования. НЕ доверять `fetch().text()` — декодировать из байт вручную. Пример в `backend/lib/fetch-win1251.ts`.

---

## Версии парсеров

Все скрипты — `.ts`, запуск `npx tsx`. Файлов `.mjs` нет.

| Версия | Путь | Назначение |
|--------|------|------------|
| v1 | `parse-results-coursing.ts`, `parse-results-bzmp.ts`, `parse-results-racing.ts` | CLI, legacy-скрипты (`reparse-coursing` и т.д.) |
| v2 | `coursing/index.ts`, `bzmp/index.ts`, `racing/index.ts`, `unique/` | **`reparse-by-year.ts`**, `test-parser-fixtures` |

**Фикстуры:** `backend/tests/fixtures/{coursing,bzmp,racing}/` — реальный HTML.

**Racing фикстуры (исправлены 2026-07):**
- `2026-05-16_Complete_Results_Racing.html`
- `Complete_Results_2025-cc-sample.html`

---

## Парсинг календаря событий

> **Полный workflow, заливка D1, ошибка `D1_RESET_DO`, батчи:** [`CALENDAR-AND-DB-UPDATE.md`](CALENDAR-AND-DB-UPDATE.md)

### Source Data
- **URL:** http://procoursing.ru/s_{YEAR}.html (например, s_2026.html)
- **Парсер:** `backend/parsers/calendar/scrape-year-page.ts` (модуль), CLI: `backend/scripts/scrape/scrape-year-index.ts`
- **Тесты:** `backend/tests/calendar-scrape.test.ts`, фикстуры `backend/tests/fixtures/calendar/s_*.html`

**Важно:** одна строка таблицы = одно событие; `rank_label` сохраняет переносы (`<br>`) для нескольких дисциплин в одной дате; `date_end` для диапазонов; `event_type` только из URL результатов (`_C_`, `_B_`, `_R_`), не из каталога; ссылки «Результаты состязания» и `_Complete_Results_` без `_by_*`; `[отменён]` в `rank_label`; `deriveUniqueTitle()` для уникального `title` в БД (UI заголовок — из `rank_label`).

**Фикстуры календаря:** скачивать только через `npx tsx backend/scripts/test/download-calendar-fixtures.ts` (`fetchWin1251`). Не использовать curl без декодирования windows-1251.

### HTML Structure

**Таблица календаря имеет разные форматы по годам:**

#### Формат 2015-2024 (6 ячеек)
- Ячейка 0: дата (формат "12.04.2026" или "18-19.04.2026")
- Ячейка 1: rank_label (полное описание турнира)
- Ячейка 2: location (место проведения)
- Ячейка 3: пустая
- Ячейка 4: ссылка на результаты
- Ячейка 5: дополнительная ссылка (если есть)

Особенности:
- `title` совпадает с `location`
- `host_club` пустой (клуб не отделен от места)
- Ссылки определяются по тексту ("Полные результаты", "Каталог")

#### Формат 2025 (7 ячеек)
- Ячейка 0: дата (формат "12.04.2026" или "18-19.04.2026")
- Ячейка 1: rank_label (например "ЧРКФ(Курсинг борзых)")
- Ячейка 2: host_club (принимающая организация)
- Ячейка 3: location (место проведения)
- Ячейка 4: ссылка на каталог
- Ячейка 5: ссылка на результаты
- Ячейка 6: дополнительная ссылка

Особенности:
- `title` совпадает с `host_club`
- Ссылки определяются по тексту ("Каталог", "Результаты")

#### Формат 2026 (8 ячеек)
- Ячейка 0: дата (формат "12.04.2026" или "18-19.04.2026")
- Ячейка 1: rank_label (название турнира, например "ЧРКФ (Курсинг борзых)")
- Ячейка 2: title (название состязания)
- Ячейка 3: host_club (принимающая организация)
- Ячейка 4: location (место проведения)
- Ячейка 5: ссылка на каталог (если есть)
- Ячейка 6: ссылка на результаты (если есть)
- Ячейка 7: confirmed ("+" если подтверждено)

Особенности:
- Все поля отделены и четко структурированы
- Ссылки определяются по тексту ("каталог", "результат") и по суффиксу файла (`_Catalog_`, `_Complete_Results_`)
- `confirmed` в отдельной ячейке

### Извлечение ссылок

Логика извлечения ссылок поддерживает несколько методов:

1. **По тексту ссылки** (работает для всех форматов):
   - "каталог" → catalog_url
   - "результат" → results_url

2. **По суффиксу файла** (работает для 2025-2026):
   - `_Catalog_` → catalog_url
   - `_Complete_Results_` → results_url
   - `results/\d{4}-\d{2}-\d{2}/` → results_url

### Data Structure

```javascript
{
  year: 2026,
  date_start: "2026-04-04",        // формат YYYY-MM-DD
  date_end: null,                  // null для однодневных, "2026-04-19" для многодневных
  rank_label: "ЧРКФ(Курсинг борзых)",
  event_type: "coursing",          // coursing, bzmp, racing
  competition_kind: "ЧРКФ",        // вид соревнования (до скобок)
  competition_type: "Курсинг борзых", // тип соревнования (в скобках)
  title: "Курсинг Ярославль",
  host_club: "ОО \"Ярославский Областной Клуб...\"",
  location: "Ярославская область, Ярославль",
  catalog_url: "http://procoursing.ru/2026/2026-04-04_Catalog_Coursing.pdf",
  results_url: "http://procoursing.ru/2026/2026-04-04_Complete_Results_Coursing.html",
  confirmed: 1
}
```

### Определение типа события

1. **Из ссылки** (приоритет): по суффиксу файла
   - `_Complete_Results_Coursing.html` → coursing
   - `_Complete_Results_BZMP.html` → bzmp
   - `_Complete_Results_Racing.html` → racing

2. **Из rank_label** (если нет ссылки): по ключевым словам
   - "курсинг" → coursing
   - "бзмп" → bzmp
   - "рейсинг" или "бега" → racing

### Особенности

- События без результатов имеют `results_url: null`
- В `rank_label` могут перечисляться породы через `<br>` (хранится, но не выводится на сайт)
- Многодневные события: `date_start: "2026-04-18"`, `date_end: "2026-04-19"`
- Парсер автоматически определяет формат таблицы (6, 7 или 8 ячеек) и адаптирует логику извлечения
- Для старых форматов (2015-2024) некоторые поля могут быть пустыми или дублировать другие поля

### Нормализация типов соревнований

- "Бега за механической приманкой" → "БЗМП" (единое название во всех годах)
- Уникальные турниры ("Кубок Котейки Глюка", "Тройки" и т.д.) → категория "other" с оригинальным названием в `competition_type`

---

## HTML формат по годам

### 2015-2022
- Results stored as images (JPG) — NOT parseable without OCR
- Недоступны для парсинга

### 2023-2024
- Simplified HTML tables (23 cells)
- Catalog numbers as plain text

### 2025-2026
- Detailed HTML tables (25 cells)
- Catalog numbers in `<i>` tags

---

## Coursing Parsing

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

**Извлечение судей:**
- Приоритет: текст судей (judgesText) над структурой таблицы
- Паттерны: "Главный судья - Имя", "судья - Имя", "Судьи:"
- Формат с одним судьей: "Главный судья - Иванова Г.С."
- Формат с двумя судьями: "Главный судья - Лукина Д.М., судья - Гродинская Т.Л."
- Поддержка инициалов: Н.В., Г.С., Д.М. и т.д.

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

### Coursing Scoring System

**Правила турниров курсинга:**
- Количество судей: 1, 2 или 3 (чаще 2)
- Категории оценок (каждая 0-20): Маневренность, Резвость, Выносливость, Преследование, Энтузиазм
- Максимальная оценка: 1 судья=200, 2 судьи=400, 3 судьи=600

**ВАЖНО:** Нормализация total_score: НЕ делить на количество судей, сохраняется исходная grand_total.

**Status Handling:**
- Функция `detectStatusFromText` в `parse-results-coursing.ts`
- Маркеры: неявка, дисквалификац, снят, сошел, отстран, ветеринар
- raw_text сохраняется всегда для отладки

### Coursing Titles Hierarchy

**Источник (официально):** [Правила проведения состязаний по бегам борзых и курсингу борзых](https://rkf.org.ru/wp-content/uploads/2020/07/pravila-provedenija-sostjazanij-po-begam-borzyh-i-kursingu-borzyh.pdf) (РКФ, 2020), раздел IV.

**Иерархия титулов и сертификатов** (от высшего к низшему — для сортировки в профиле собаки, `backend/src/lib/qualification-titles.ts`):

| Ранг | Титул / сертификат | Уровень | В правилах РКФ 2020 |
|------|-------------------|---------|---------------------|
| 1 | Чемпион России по рабочим качествам | Победитель ЧР РКФ | п. 4.3.1.4 |
| 2 | Чемпион РКФ по рабочим качествам | Победитель ЧРКФ | п. 4.3.1.2 |
| 3 | Победитель Кубка России по рабочим качествам | Победитель КР РКФ | п. 4.3.1.3 |
| 4 | CACIL, International Race Champion (C.I.C.) | Международный | п. 4.2.1 |
| 5 | **CACL** | Национальный сертификат (состязания ранга CACL) | п. 4.3.1.1 |
| 6 | **RegCACL** | Региональный (см. примечание ниже) | — |
| 7 | Прочие рабочие сертификаты, сертификаты участия | Базовый | — |

**Примечание про RegCACL:** в PDF правил РКФ 2020 отдельного термина *RegCACL* нет — там только национальный **CACL** (п. 4.3) и международный **CACIL** (п. 4.2). Строка **RegCACL** встречается в протоколах procoursing.ru (колонка «титул») и сохраняется в `results.qualification` как есть. По смыслу это региональный аналог CACL; в UI и сортировке профиля он **ниже** национального CACL.

Квалификационные состязания (п. 1.2.7 правил РКФ) титулы не присваивают.

**Visual Display in UI:**
- isChampion (Чемпион РКФ / Чемпион России): золотой/camel акцент
- isCACL (национальный CACL): old-money
- isReg (RegCACL): серый
- default: нейтральный

Компоненты: `QualificationBadges.tsx` (страница события), `DogProfile.tsx` (блок «Титулы»).

---

## BZMP Parsing

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

## Racing Parsing

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

## Unique Parsing (уникальные турниры)

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

## Статистика судей

### Извлечение судей

**Coursing:**
- Поиск в тексте перед первой таблицей
- Паттерны: "Главный судья", "судья -", "Судьи:"

**BZMP:**
- Поиск во всем body тексте
- Паттерны: "Главный судья -", "судья -", "Судьи:"
- Исключение заголовков таблиц

**Racing:**
- Аналогично coursing

### Хранение судей

- Таблица `judges` в БД
- Поле `judges` в таблице `events` (JSON или строка)
- Поле `judges` в таблице `results` (информация о судьях из строки результата)

---

## Рекорды Донино

Подробное описание двух дисциплин, правил «не смешивать» и одной собаки в обоих листах — **`docs/data/SPEED_RECORDS.md`** (раздел «Два вида замеров»).

### Два источника Google Sheets

| Дисциплина | Spreadsheet ID | Таблица D1 | Скрипт |
|------------|----------------|------------|--------|
| **Замер скорости** (ошейник, км/ч на курсинге) | `1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE` | `speed_records` | `fetch-speed-records.ts` |
| **Бега борзых 350 м** (секундомер, ровная трасса) | `1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw` | `coursing_records` | `fetch-coursing-records.ts` |

Одна собака (`name` + `breed`) может иметь записи в **обеих** таблицах; статистика по дисциплинам на сайте остаётся раздельной.

Статистика на сайте (`SpeedRecords/stats/`): **Замер → Статистика** — только `speed_records`; **Бега → Статистика** — только `coursing_records`.

### Google Sheets — замер скорости

**Spreadsheet ID:** `1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE`

**Листы документа:**
- **2026** (gid=1787526009) — есть цвета ✓
- **2025** (gid=0) — есть цвета ✓
- **2025 по породам** (gid=1620065603) — без цветов
- **Абсолютный зачёт** (gid=1812358334) — без цветов
- **старые личные рекорды** (gid=1775097609) — есть цвета ✓

**PDF экспорт URL (пример для 2026):**
```
https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/export?format=pdf&gid=1787526009
```

### Скрипты

- `backend/scripts/speed/fetch-speed-records.ts` — замер скорости → `speed_records`
- `backend/scripts/speed/fetch-coursing-records.ts` — бега 350 м → `coursing_records`
- `backend/scripts/fetch-speed-records-pdf.py` — Python скрипт для PDF

---

## Тестирование парсеров

### Синтетические тесты (v1)
```bash
npm run test-parser
```

### Фикстуры (v2 модульные)
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

### ВАЖНО
Перед изменением парсера — `npm run test-parser` и `npm run test-parser-fixtures`.

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

### Применение изменений к базе данных
```bash
wrangler d1 execute pc-db --remote --file=./data/updates/reparse-2026.sql
```

**ВАЖНО:** Изменения в парсерах не применяются автоматически к существующим данным в базе. Необходимо всегда перезапускать парсинг и обновлять базу после изменений логики извлечения данных.

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

## Raw Text

**ВАЖНО:** Сохранять raw_text всегда при парсинге — страховка от потери данных.

---

## Полезные ссылки

- Источник данных: http://procoursing.ru
- Парсер курсинга: `backend/parsers/parse-results-coursing.ts`
- Парсер БЗМП: `backend/parsers/parse-results-bzmp.ts`
- Парсер рейсинга: `backend/parsers/parse-results-racing.ts`
- Функция декодирования: `backend/lib/fetch-win1251.ts`
- Тесты: `npm run test-parser`, `npm run test-parser-fixtures`
- Фикстуры: `backend/tests/fixtures/`
- v2 модульные: `backend/parsers/{coursing,bzmp,racing}/index.ts`
