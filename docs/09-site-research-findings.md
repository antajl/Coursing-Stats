# 09. Site Research Findings — Результаты исследования procoursing.ru

## 1. Кодировка

**Подтверждено:** Сайт использует **windows-1251**

- Главная страница: `<meta http-equiv="Content-Type" content="text/html; charset=utf-8">` (неправильно!)
- Страница результатов: `<meta http-equiv="Content-Type" content="text/html; charset=windows-1251">` (правильно)
- **Решение:** Использовать iconv-lite для декодирования из байт, НЕ доверять meta-тегам

**Исправлено в lib/fetch-win1251.mjs:**
```javascript
const ab = await res.arrayBuffer();
const buf = Buffer.from(ab);
return iconv.decode(buf, "win1251");
```

Также исправлен User-Agent (убрана кириллица, которая вызывала ошибку ByteString в Node.js fetch).

## 2. DOM-структура страницы результатов

### Заголовок события
```html
<tr>
<td colspan=25 align=center>
  <font style=font-size:12pt face="Arial" color=#000000>
    <b>Чемпионат РКФ-CACL по курсингу борзых, 04.04.2026<br>
    (Ярославская область, Большесельский район)</b>
  </font>
</td>
</tr>
```

### Информация об организаторе
```html
<tr align=center>
<td colspan=25 align=center>
  <font style=font-size:10pt face="Arial" color=#000000>
    <b>Кинологическая организация:</b> Общественная Организация "Ярославский Областной Клуб Спортивно-Прикладного Собаководства"
  </font>
</td>
</tr>
```

### Таблица результатов

**Структура заголовка таблицы:**
- 25 колонок (colspan=25)
- Заголовки групп: `<tr><td colspan=25 bgcolor="#c0c0c0"><b>Басенджи - Стандартный - Кобели</b></td></tr>`
- Строки собак: `<tr align=center bgcolor=#ffffff>` с rowspan=2 для двух забегов

**Порядок колонок:**
1. Место (rowspan=2)
2. № каталожный (rowspan=2, italic)
3. Порода (rowspan=2)
4. Класс (rowspan=2)
5. Пол (rowspan=2)
6. Кличка (rowspan=2, с `<br>` между рус/лат)
7. Забег 1 VC (rowspan=2, italic)
8-13. Судьи забега 1 (Ман, Резв, Вын, Прес, Энт, Сум)
14. Сумма 1 (rowspan=2, bold)
15. Забег 2 VC (rowspan=2, italic)
16-21. Судьи забега 2 (Ман, Резв, Вын, Прес, Энт, Сум)
22. Сумма 2 (rowspan=2, bold)
23. Общая сумма (rowspan=2, bold, крупный шрифт)
24. ВС (rowspan=2, "+" или пусто)
25. Титул (rowspan=2)

**Пример строки собаки:**
```html
<tr align=center bgcolor=#ffffff>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>1</font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000><i>2</i></font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>Басенджи</font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>Стандартный</font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>Кобель</font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>РУС ДОГ'МА ПАРКЕР /<br>RUS DOG'MA PARKER</font></td>
<td rowspan=2 bgcolor=#f0ffff><font style=font-size:10pt face="Arial" color=#000000><i>30</i></font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>15</font></td>
<!-- ... судейские оценки ... -->
<td><font style=font-size:10pt face="Arial" color=#000000><b>77</b></font></td>
<td rowspan=2><font style=font-size:11pt face="Arial" color=#000000><b>156</b></font></td>
<!-- ... второй забег ... -->
<td rowspan=2><font style=font-size:12pt face="Arial" color=#000000><b>318</b></font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>+</font></td>
<td rowspan=2><font style=font-size:10pt face="Arial" color=#000000>Чемпион РКФ, RegCACL</font></td>
</tr>
```

## 3. Текстовые статусы

### Секция "Неприбывшие участники"
```html
<tr align=center>
<td colspan=25 bgcolor="#c0c0c0">
  <font style=font-size:12pt face="Arial" color=#000000><b>Неприбывшие участники</b></font>
</td>
</tr>
<tr align=center bgcolor="#eaeaea">
<td><font style=font-size:10pt face="Arial" color=#000000></font></td>
<td><font style=font-size:10pt face="Arial" color=#000000><i>26</i></font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Уиппет</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Стандартный</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Сука</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>ДИАМАНТ ТОП КРИСТАЛ /<br>DIAMANT TOP KRISTAL</font></td>
<td colspan=19><font style=font-size:10pt face="Arial" color=#000000>Неявка</font></td>
</tr>
```

**Найденные статусы:**
- "Неявка" — в секции "Неприбывшие участники" с colspan=19
- Другие статусы (снят, дисквалифицирован, не финишировал) — не найдены на этой странице, нужно проверить другие страницы

## 4. Критическая проблема с текущим парсером

**parse-results-coursing.mjs написан для markdown-формата:**
- Ищет `**bold**` и `*italic*` (markdown)
- Реальный HTML использует `<b>` и `<i>` теги
- Поэтому парсер возвращает 0 результатов

**Требуется переписывание парсера для работы с реальным HTML:**
- Использовать cheerio для парсинга DOM
- Искать `<tr bgcolor="#c0c0c0">` для заголовков групп
- Искать `<tr bgcolor=#ffffff>` для строк собак
- Извлекать данные из `<td>` с учётом rowspan
- Обрабатывать секцию "Неприбывшие участники" отдельно (bgcolor="#eaeaea")

## 5. Селекторы для нового парсера

```javascript
// Заголовки групп пород
$("tr td[colspan=25][bgcolor='#c0c0c0']")

// Строки собак
$("tr[bgcolor=#ffffff]")

// Неприбывшие участники
$("tr[bgcolor='#eaeaea']")

// Каталожный номер (italic)
$("td i").text()

// Жирные числа (итоги)
$("td b").text()
```

## 6. План действий

1. ✅ Исправить fetchWin1251 (сделано)
2. ✅ Исследовать структуру сайта (сделано)
3. 🚧 Переписать parse-results-coursing.mjs для работы с HTML (не markdown)
4. 📋 Протестировать на 5-10 реальных страницах разных лет
5. 📋 Добавить обработку статусов (Неявка, снят, дисквалифицирован, не финишировал)
6. 📋 Написать парсеры для БЗМП и Racing
