# 10. Racing и BZMP — Структура страниц

## Racing (Бега)

### Особенности формата
- **Метрики:** Время и скорость (не судейские оценки как в курсинге)
- **Забеги:** До 3 забегов на собаку
- **Дистанция:** Указывается в метрах (например, 360 м)
- **Попоны:** Цвета попон (но часто не указаны, "-")

### Структура таблицы
**18 колонок:**
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

### Пример строки
```html
<tr align=center bgcolor=#ffffff>
<td><font style=font-size:10pt face="Arial" color=#000000>1</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000><i>1</i></font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Грейхаунд</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Стандартный</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Сука</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>ДЕРЖАВА</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>360</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000><i>-</i></font></td>
<td><b><font style=font-size:10pt face="Arial" color=#000000>-</font></b></td>
<td><font style=font-size:10pt face="Arial" color=#000000>21.88 с<br>16.45 м/с<br>59.232 км/ч</font></td>
<!-- ... забеги 2 и 3 ... -->
<td><font style=font-size:10pt face="Arial" color=#000000>+</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000></font></td>
</tr>
```

### Особенности
- Нет rowspan=2 — каждая строка самодостаточна
- Лучшее время может быть выделено цветом (bgcolor=#ffd700)
- Формат времени: "21.88 с<br>16.45 м/с<br>59.232 км/ч"

---

## BZMP (БЗМП - Беги за механической приманкой)

### Особенности формата
- **Метрики:** Судейские оценки (как в курсинге)
- **Забеги:** 2 забега
- **Статусы:** "Отстранение (Сход с трассы)" и другие

### Структура таблицы
**25 колонок (как в курсинге):**
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

### Пример строки с отстранением
```html
<tr align=center bgcolor=#ffffff>
<td><font style=font-size:10pt face="Arial" color=#000000></font></td>
<td><font style=font-size:10pt face="Arial" color=#000000><i>1</i></font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Американский стаффордширский терьер</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Ветераны</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>Сука</font></td>
<td><font style=font-size:10pt face="Arial" color=#000000>TCENNIY PRIZE EIRENA</font></td>
<td bgcolor=#ff0000><font style=font-size:10pt face="Arial" color=#000000><i>5</i></font></td>
<td colspan=6><font style=font-size:10pt face="Arial" color=#000000>Отстранение (Сход с трассы)</font></td>
<td><font style=font-size:11pt face="Arial" color=#000000><b></b></font></td>
<!-- ... пустые ячейки для забега 2 ... -->
</tr>
```

### Особенности
- rowspan=2 как в курсинге
- Статус "Отстранение (Сход с трассы)" с colspan=6 вместо судейских оценок
- bgcolor=#ff0000 для VC при отстранении

---

## Сравнение форматов

| Характеристика | Coursing | BZMP | Racing |
|---------------|----------|------|--------|
| Колонок | 25 | 25 | 18 |
| rowspan | Да (2) | Да (2) | Нет |
| Метрики | Судейские оценки | Судейские оценки | Время/скорость |
| Забеги | 2 | 2 | До 3 |
| Дистанция | Нет | Нет | Да |
| Попоны | Нет | Нет | Да |

## Парсеры

Нужны отдельные парсеры:
- `parse-results-coursing.mjs` — для курсинга (переписать для HTML)
- `parse-results-bzmp.mjs` — для БЗМП (структура похожа на курсинг)
- `parse-results-racing.mjs` — для бега (другой формат)
