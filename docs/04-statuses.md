# 04. Statuses — Обработка статусов собак

## Возможные статусы

| Статус | Описание | Строка в HTML |
|--------|----------|---------------|
| `finished` | Полная проверка | есть bold-итог в основной строке |
| `dns` | Неявка | "Неявка" в колонте с colspan=19 |
| `withdrawn` | Снят | "снят" в надписи |
| `disqualified` | Дисквалифицирован | "дисквалифицирован" в надписи |
| `dnf` | Не финишировал | "не финишировал" или "не учитывается" |
| `unknown_status_check_raw_text` | Неопознанный статус | нет bold-итога, нужно проверить raw_text |

## Определение статуса

### Автоматическое определение (по структуре)

```javascript
// Если нет bold-итога в основной строке — нестандартный статус
const status = boldNumsMain.length > 0 ? "finished" : "unknown_status_check_raw_text";
```

### Поиск по тексту (после исправления кодировки)

```javascript
const STATUS_PATTERNS = {
  dns: /Неявка/i,
  withdrawn: /снят/i,
  disqualified: /дисквалифицирован/i,
  dnf: /не ?финишировал/i
};
```

## Примеры из HTML

### Строка с "Неявка" (строки 2040-2050)

```html
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

### Строка с "дисквалифицирован" (из теста)

```
*7* ИМЯ ПОРОДА КЛИЧКА БЕЗ МЕСТА /
ALTAY *1* 15 16 14 14 10 **69** **137** *16* дисквалифицирован **137**
```

## Важные замечания

1. **raw_text сохраняется ВСЕГДА** — для отладки и ручной проверки
2. После исправления кодировки windows-1251, статусы можно определять точно по ключевым словам
3. Эвристика "нет bold-итога = нестандартный статус" требует доработки после прогона на реальных данных