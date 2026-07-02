# Исправление парсинга судей и отображения оценок

**Дата:** 2026-07-02  
**Задача:** Исправить парсинг судей и отображение оценок для событий с несколькими судьями

## Проблемы

1. **Парсинг судей:** Парсеры искали судей в `body` с неправильным регулярным выражением, которое не находило формат "Судьи:" (множественное число)
2. **Примечания:** В поле судей попадали примечания вроде "Номера забегов не отражены..."
3. **Второй судья:** Coursing и BZMP парсеры не обрабатывали оценки второго судьи
4. **Фронтенд:** Racing события показывали белый экран из-за отсутствия проверки на `judges`
5. **Календарь:** Судьи отображались в одну строку через запятую

## Решения

### 1. Парсинг судей (coursing, bzmp, racing)

**Файлы:**
- `backend/parsers/coursing/index.ts`
- `backend/parsers/bzmp/index.ts`
- `backend/parsers/racing/index.ts`

**Изменения:**
```typescript
// Было:
const judgesText = $('body').text();
const judgesMatch = judgesText.match(/(?:Главный\s+судья|Судья)[^:]*:\s*([^.\n]+)/i);
if (judgesMatch) {
  judges = judgesMatch[1].trim();
}

// Стало:
const judgesCell = $('table tr').find('td').filter(function() {
  return $(this).text().trim().startsWith('Судьи:');
});

if (judgesCell.length > 0) {
  const text = judgesCell.text().trim();
  judges = text.replace(/^Судьи[:\s]+/i, '').trim();
  
  // Фильтруем примечания
  if (judges.includes('Номера забегов') || judges.includes('не отражены') || judges.includes('отсутствием информации')) {
    judges = null;
  }
}
```

### 2. Парсинг второго судьи (coursing)

**Файл:** `backend/parsers/coursing/row-parsers.ts`

**Изменения:**
- Добавлена логика определения количества судей по следующей строке (rowspan=2)
- Парсинг оценок судьи 2 из второй строки для обоих забегов
- Использование `processedRows` Set для пропуска уже обработанных строк

```typescript
// Определяем количество судей по следующей строке
let judgeCount = 1;
if (rowIndex + 1 < allRows.length) {
  const $row2 = $(allRows[rowIndex + 1]);
  const $cells2 = $row2.find("td");
  const cellCount2 = $cells2.length;
  
  // Если следующая строка имеет 25 ячеек, это судья 2
  if (cellCount2 === 25) {
    judgeCount = 2;
  }
}

// Парсинг оценок судьи 2
if (judgeCount === 2 && rowIndex + 1 < allRows.length) {
  const $row2 = $(allRows[rowIndex + 1]);
  const $cells2 = $row2.find("td");
  
  // Оценки судьи 2 для забега 1 (ячейки 0-4)
  for (let i = 0; i <= 4; i++) {
    const score = extractNumber($cells2.eq(i).text());
    heat1Judge2Scores.push((score !== null && score <= 20) ? score : null);
  }
  
  // Оценки судьи 2 для забега 2 (ячейки 6-10)
  for (let i = 6; i <= 10; i++) {
    const score = extractNumber($cells2.eq(i).text());
    heat2Judge2Scores.push((score !== null && score <= 20) ? score : null);
  }
  
  // Помечаем следующую строку как обработанную
  if (processedRows) {
    processedRows.add(rowIndex + 1);
  }
}
```

### 3. Парсинг второго судьи (bzmp)

**Файлы:**
- `backend/parsers/bzmp/index.ts`
- `backend/parsers/bzmp/row-parsers.ts`

**Изменения:**
- Добавлен `processedRows` Set в index.ts
- Обновлена сигнатура `parseDogRow` для приема `processedRows`
- Логика определения 2 судей по следующей строке (12 ячеек)
- Парсинг оценок судьи 2 из второй строки

```typescript
// Определяем количество судей по следующей строке
let judgeCount = 1;
if (rowIndex + 1 < allRows.length) {
  const $row2 = $(allRows[rowIndex + 1]);
  const $cells2 = $row2.find("td");
  const cellCount2 = $cells2.length;
  
  // Если следующая строка имеет 12 ячеек (6 оценок + 6 оценок), это судья 2
  if (cellCount2 === 12) {
    judgeCount = 2;
  }
}
```

### 4. Исправление фронтенда для racing

**Файл:** `frontend/src/pages/Events/EventResults.tsx`

**Проблема:** Racing формат не имеет `judges` в `raw_scores_json`, что вызывало ошибку `Cannot read properties of undefined (reading 'judges')`

**Решение:**
```typescript
// Было:
const judgesCount = rawScores.heats[0].judges.length;

// Стало:
const judgesCount = rawScores.heats[0]?.judges?.length || 0;
if (judgesCount === 0) return null; // Racing format - no judges
```

Также добавлена проверка для мобильной версии:
```typescript
{heat.judges && heat.judges.map((judge, judgeIdx) => {
  // ...
})}
```

### 5. Отображение судей в календаре

**Файл:** `frontend/src/pages/Events/index.tsx`

**Изменение:** Судьи теперь отображаются по одному на строку

```typescript
// Было:
<td className="px-4 py-4 text-sm text-old-money-700 dark:text-old-money-400 whitespace-nowrap">
  {event.judges || ''}
</td>

// Стало:
<td className="px-4 py-4 text-sm text-old-money-700 dark:text-old-money-400">
  {event.judges ? (
    <div className="space-y-1">
      {event.judges.split(',').map((judge, idx) => (
        <div key={idx} className="whitespace-nowrap">
          {judge.trim()}
        </div>
      ))}
    </div>
  ) : ''}
</td>
```

## Перепарсинг данных

**Скрипты:**
- `backend/scripts/reparse/reparse-coursing-events.ts`
- `backend/scripts/reparse/reparse-bzmp-events.ts`
- `backend/scripts/reparse/reparse-racing-events.ts`

**Результаты:**
- Coursing: 9 событий, 1398 SQL-запросов
- BZMP: 7 событий, 262 SQL-запроса
- Racing: 1 событие, 72 SQL-запроса

**Команды:**
```bash
# Local D1
npx wrangler d1 execute pc-db --local --file=./data/updates/reparse-coursing.sql
npx wrangler d1 execute pc-db --local --file=./data/reparse-bzmp.sql
npx wrangler d1 execute pc-db --local --file=./data/updates/reparse-racing.sql

# Remote D1
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-coursing.sql
npx wrangler d1 execute pc-db --remote --file=./data/reparse-bzmp.sql
npx wrangler d1 execute pc-db --remote --file=./data/updates/reparse-racing.sql
```

## Структура HTML для парсинга

### Coursing с 2 судьями
```
Строка 1 (rowspan=2): Место, №, Порода, Класс, Пол, Кличка, Забег1, [Оценки судьи 1], Сумма1, Забег2, [Оценки судьи 1], Сумма2, Итого, ВС, Титул
Строка 2: [Оценки судьи 2 забег 1], Сумма, [Оценки судьи 2 забег 2], Сумма
```

### BZMP с 2 судьями
```
Строка 1 (rowspan=2): Место, №, Порода, Класс, Пол, Кличка, Забег1, [Оценки судьи 1], Сумма1, Забег2, [Оценки судьи 1], Сумма2, Итого, ВС, Титул
Строка 2: [Оценки судьи 2 забег 1], Сумма, [Оценки судьи 2 забег 2], Сумма
```

### Racing
```
Строка: Место, №, Порода, Класс, Пол, Кличка, [Время забегов], [Скорости]
```
Нет оценок судей, только время и скорость.

## Тестирование

**Тестовые скрипты:**
- `backend/scripts/test/test-coursing-judges-cell.ts` - проверка ячейки с судьями
- `backend/scripts/test/test-bzmp-judges.ts` - проверка парсинга судей BZMP
- `backend/scripts/test/test-coursing-raw.ts` - проверка raw_scores_json
- `backend/scripts/test/test-bzmp-raw-2judges.ts` - проверка оценок 2 судей BZMP

## Итог

- ✅ Парсинг судей исправлен для всех типов событий
- ✅ Примечания отфильтрованы
- ✅ Оценки второго судья парсятся для coursing и BZMP
- ✅ Фронтенд не падает на racing событиях
- ✅ Судьи отображаются по одному на строку в календаре
- ✅ Local и remote базы обновлены

## Дополнительные улучшения UI

### Ссылка на профиль собаки
**Файл:** `frontend/src/pages/Events/EventResults.tsx`

Добавлена иконка ссылки на профиль собаки рядом с именем. Кликабельна только иконка, имя собаки не кликабельно. Иконка ведет на `/dog/{dog_id}`.

```typescript
<div className="flex items-center gap-1">
  <span className="font-medium text-old-money-800 dark:text-old-money-300 truncate text-sm md:text-base">
    {name}
  </span>
  <Link 
    to={`/dog/${result.dog_id}`}
    className="flex-shrink-0"
    onClick={(e) => e.stopPropagation()}
  >
    <svg className="w-3 h-3 text-old-money-400 dark:text-old-money-500 hover:text-camel-600 dark:hover:text-camel-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </Link>
</div>
```

### Отображение двойных кличек
**Файлы:**
- `frontend/src/pages/Events/EventResults.tsx`
- `frontend/src/pages/DogProfile.tsx`

Клички через слэш (например, "ЧЕЙЗИ /CHEJZI") теперь отображаются в две строки:
- Первая строка: основное имя (клиентабельная ссылка)
- Вторая строка: латинское имя (меньший шрифт, менее заметный цвет)

```typescript
const name = result.name_ru || result.name_lat;
const parts = name.split('/');

if (parts.length > 1) {
  return (
    <>
      <Link to={`/dog/${result.dog_id}`}>
        {parts[0].trim()}
      </Link>
      <span className="text-xs text-old-money-600 dark:text-old-money-400">
        {parts[1].trim()}
      </span>
    </>
  );
}
```

### Разделение кликов
**Файл:** `frontend/src/pages/Events/EventResults.tsx`

Добавлен `stopPropagation()` на ссылку имени собаки, чтобы клик на имя открывал профиль собаки, а клик на строку раскрывал детали с оценками.

```typescript
onClick={(e) => e.stopPropagation()}
```

### Сортировка результатов по номеру
**Файл:** `frontend/src/pages/Events/EventResults.tsx`

Изменена сортировка результатов в каждой группе - теперь собаки сортируются по номеру (catalog_number) вместо места (placement). Неприбывшие участники остаются внизу списка.

```typescript
// Было:
return (a.placement || 999) - (b.placement || 999);

// Стало:
return (a.catalog_number || 999) - (b.catalog_number || 999);
```
