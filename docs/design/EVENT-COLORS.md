# Цветовая система календаря событий

## Обзор

Календарь событий использует цветовое кодирование для визуального различения дисциплин соревнований. Каждая дисциплина (Курсинг, БЗМП, Бега, Другие) имеет свой уникальный цвет, который применяется через:
- Градиентный фон строк (desktop таблица)
- Градиентный фон карточек (mobile версия)
- Цветные бейджи с названием дисциплины
- Усиленный золотой градиент для важных соревнований (чемпионаты, кубки)

## Реализация (обновлено 2026-07-03)

### Файлы

- `frontend/src/pages/Events/eventListUtils.ts` — константы цветов и хелперы
- `frontend/src/pages/Events/EventListRow.tsx` — применение цветов к строке списка
- `frontend/src/pages/Events/index.tsx` — легенда дисциплин в тулбаре

### Дисциплины — левый бордер (`DISCIPLINE_BORDER`)

| Дисциплина | Tailwind (светлая / тёмная) |
|------------|----------------------------|
| Курсинг | `border-l-forest-300` / `dark:border-l-forest-600` |
| БЗМП | `border-l-blue-500` / `dark:border-l-blue-600` |
| Бега | `border-l-rose-300` / `dark:border-l-rose-600` |
| Другие | `border-l-amber-300` / `dark:border-l-amber-600` |

Палитра `blue` добавлена в `frontend/tailwind.config.js` (ранее использовался несуществующий `warm-blue`).

### Легенда (`LEGEND_DOT_COLOR`)

Кружки в тулбаре календаря: coursing, bzmp, racing, other. Отдельного пункта для чемпионатов в легенде нет — они выделяются в строке (золотой градиент + иконка кубка).

### Чемпионаты и кубки

`isImportantCompetition(competition_kind)` → золотой градиент фона строки (`from-camel-100`), serif-заголовок, иконка кубка. **Левый бордер** остаётся цветом дисциплины.

### Устаревшее (до 2026-07-03)

Ранее цвета задавались inline-функциями в `Events/index.tsx` (градиент фона всей строки, бейдж дисциплины справа, desktop-таблица + mobile-карточки). Актуальный UI — единый `EventListRow` без бейджа дисциплины в строке.

---

## Архив: реализация 2026-07-01

### Файл: `frontend/src/pages/Events/index.tsx` (устарело)

Цвета задавались через три функции:

```typescript
function getDisciplineColor(eventType: string, isDark: boolean): { backgroundColor: string } {
  // Для легенды (кружочки)
  const lightColors = {
    coursing: '#81c784',
    bzmp: '#64b5f6',
    racing: '#f8bbd0',
    other: '#ffcc80',
    default: 'transparent'
  }

  const darkColors = {
    coursing: 'rgba(27, 94, 32, 0.4)',
    bzmp: 'rgba(13, 71, 161, 0.45)',
    racing: 'rgba(136, 14, 79, 0.5)',
    other: 'rgba(121, 85, 72, 0.4)',
    default: 'transparent'
  }

  const colors = isDark ? darkColors : lightColors
  return { backgroundColor: colors[eventType] || colors.default }
}

function getDisciplineBadgeColor(eventType: string): { bg: string, text: string } {
  // Для бейджей
  const badgeColors = {
    coursing: { bg: 'bg-forest-300 dark:bg-forest-800', text: 'text-forest-800 dark:text-forest-200' },
    bzmp: { bg: 'bg-warm-blue-300 dark:bg-warm-blue-800', text: 'text-warm-blue-800 dark:text-warm-blue-200' },
    racing: { bg: 'bg-rose-200 dark:bg-rose-800', text: 'text-rose-800 dark:text-rose-200' },
    other: { bg: 'bg-amber-300 dark:bg-amber-800', text: 'text-amber-800 dark:text-amber-200' },
    default: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' }
  }
  return badgeColors[eventType] || badgeColors.default
}

function getDisciplineGradient(eventType: string): string {
  // Для градиентного фона строк/карточек
  const gradients = {
    coursing: 'from-forest-300/70 to-transparent dark:from-forest-800/40',
    bzmp: 'from-warm-blue-300/70 to-transparent dark:from-warm-blue-800/45',
    racing: 'from-rose-200/70 to-transparent dark:from-rose-800/50',
    other: 'from-amber-300/70 to-transparent dark:from-amber-800/40',
    default: ''
  }
  return gradients[eventType] || gradients.default
}
```

### Применение

**Desktop версия (таблица):**
```tsx
<tr className={`${getImportantCompetitionStyle(event.competition_kind)} bg-gradient-to-r ${getDisciplineGradient(event.event_type)} transition-all duration-300`}>
  <td className="px-4 py-4 ...">
    {event.event_type && (
      <span className={`inline-block px-2 py-1 rounded font-medium text-xs ${getDisciplineBadgeColor(event.event_type).bg} ${getDisciplineBadgeColor(event.event_type).text}`}>
        {event.event_type === 'coursing' ? 'Курсинг' : event.event_type === 'bzmp' ? 'БЗМП' : event.event_type === 'racing' ? 'Бега' : 'Другие'}
      </span>
    )}
  </td>
</tr>
```

**Mobile версия (карточки):**
```tsx
<div className={`${getImportantCompetitionStyle(event.competition_kind)} bg-gradient-to-r ${getDisciplineGradient(event.event_type)} bg-white dark:bg-charcoal-900 rounded-xl p-4 ...`}>
  <div className="flex gap-2 text-xs text-old-money-700 dark:text-old-money-400">
    {event.event_type && (
      <span className={`px-2 py-1 rounded font-medium ${getDisciplineBadgeColor(event.event_type).bg} ${getDisciplineBadgeColor(event.event_type).text}`}>
        {event.event_type === 'coursing' ? 'Курсинг' : event.event_type === 'bzmp' ? 'БЗМП' : event.event_type === 'racing' ? 'Бега' : 'Другие'}
      </span>
    )}
  </div>
</div>
```

**Важные соревнования (чемпионаты, кубки):**
```typescript
function getImportantCompetitionStyle(competitionKind) {
  if (isImportantCompetition(competitionKind)) {
    return 'text-camel-600 dark:text-camel-400 drop-shadow-[0_0_8px_rgba(212,165,116,0.6)] dark:drop-shadow-[0_0_8px_rgba(212,165,116,0.4)] font-semibold'
  }
  return 'text-old-money-700 dark:text-old-money-400'
}
```

## Цветовая палитра

### Градиентные фоны строк

| Дисциплина | Light mode | Dark mode |
|------------|------------|-----------|
| Курсинг | `from-forest-300/70 to-transparent` | `from-forest-800/40 to-transparent` |
| БЗМП | `from-warm-blue-300/70 to-transparent` | `from-warm-blue-800/45 to-transparent` |
| Бега | `from-rose-200/70 to-transparent` | `from-rose-800/50 to-transparent` |
| Другие | `from-amber-300/70 to-transparent` | `from-amber-800/40 to-transparent` |

### Важные соревнования (чемпионаты, кубки)

| Режим | Стиль |
|-------|-------|
| Light | `text-camel-600 drop-shadow-[0_0_8px_rgba(212,165,116,0.6)] font-semibold` |
| Dark | `text-camel-400 drop-shadow-[0_0_8px_rgba(212,165,116,0.4)] font-semibold` |

**Реализация:** Золотое свечение (drop-shadow) и жирный шрифт для названия соревнования в ячейке competition_kind

### Цвета бейджей

| Дисциплина | Light mode | Dark mode |
|------------|------------|-----------|
| Курсинг | `bg-forest-300 text-forest-800` | `bg-forest-800 text-forest-200` |
| БЗМП | `bg-warm-blue-300 text-warm-blue-800` | `bg-warm-blue-800 text-warm-blue-200` |
| Бега | `bg-rose-200 text-rose-800` | `bg-rose-800 text-rose-200` |
| Другие | `bg-amber-300 text-amber-800` | `bg-amber-800 text-amber-200` |

### Светлый режим (для легенды)

| Дисциплина | Hex код | Tailwind эквивалент | Описание |
|------------|---------|-------------------|----------|
| Курсинг | `#81c784` | `forest-300` | Зелёный |
| БЗМП | `#64b5f6` | `warm-blue-300` | Голубой |
| Бега | `#f8bbd0` | `rose-200` | Светло-розовый |
| Другие | `#ffcc80` | `amber-300` | Янтарный |

### Тёмный режим (для легенды)

| Дисциплина | RGBA код | Tailwind эквивалент | Прозрачность | Описание |
|------------|----------|-------------------|--------------|----------|
| Курсинг | `rgba(27, 94, 32, 0.4)` | `forest-800/40` | 40% | Тёмно-зелёный полупрозрачный |
| БЗМП | `rgba(13, 71, 161, 0.45)` | `warm-blue-800/45` | 45% | Тёмно-синий полупрозрачный |
| Бега | `rgba(136, 14, 79, 0.5)` | `rose-800/50` | 50% | Тёмно-розовый полупрозрачный |
| Другие | `rgba(121, 85, 72, 0.4)` | `amber-800/40` | 40% | Тёмно-янтарный полупрозрачный |

## Легенда цветов

Над таблицей событий отображается легенда с кружочками, показывающими цвета дисциплин:

```tsx
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-forest-300 dark:bg-forest-800 border border-forest-400 dark:border-forest-700"></div>
  <span>Курсинг</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-warm-blue-300 dark:bg-warm-blue-800 border border-warm-blue-400 dark:border-warm-blue-700"></div>
  <span>БЗМП</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-rose-200 dark:bg-rose-800 border border-rose-300 dark:border-rose-700"></div>
  <span>Бега</span>
</div>
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-amber-300 dark:bg-amber-800 border border-amber-400 dark:border-amber-700"></div>
  <span>Другие</span>
</div>
```

## История изменений

### 2026-07-01 (переход на градиентные фоны)
- **Проблема:** Цветные полоски слева от строк не понравились пользователю
- **Решение:** Переход на градиентные фоны строк по дисциплинам (аналогично выделению чемпионатов)
- **Дополнительно:** Усилен градиент для важных соревнований (camel-100/70 в light, camel-900/30 в dark)

### 2026-07-01 (увеличение интенсивности градиентов в светлом режиме)
- **Проблема:** Градиенты в светлом режиме были слишком незаметными (forest-50/50)
- **Решение:** Увеличена интенсивность до forest-100/70 для лучшей видимости

### 2026-07-01 (обновление цветовой схемы - вариант 2)
- **Проблема:** Цвета дисциплин не отличались от фона сайта
- **Решение:** Переход на более насыщенные цвета (200→300) и новые цвета для бегов/других
- **Светлый режим:** forest-300, warm-blue-300, rose-200, amber-300 (более насыщенные, заметно отличаются от cream-50)
- **Тёмный режим:** forest-800/40, warm-blue-800/45, rose-800/50, amber-800/40 (контраст с charcoal-900)
- **Бейджи:** Обновлены для соответствия новым цветам
- **Дополнительно:** Уменьшена насыщенность для бегов (rose-300 → rose-200) по запросу пользователя

### 2026-07-01 (изменение стиля важных соревнований)
- **Проблема:** Жирный шрифт и градиентный фон не нравились пользователю
- **Решение:** Убран жирный шрифт, заменён градиент на рамку
- **Первый вариант:** border-2 border-camel-400/600 (не работал)
- **Второй вариант:** outline outline-2 (не работал)
- **Третий вариант:** Псевдоэлемент `::before` с градиентной полоской слева (пользователь не понравился - полоска слева, текст сдвинут)
- **Четвёртый вариант:** border-2 border-camel-400/600 вокруг всей строки (пользователь не понравился - рамка вокруг всей строки)
- **Финальный вариант:** Золотое свечение (drop-shadow) и жирный шрифт для названия соревнования
- **Реализация:** text-camel-600/400 + drop-shadow + font-semibold для ячейки competition_kind

### 2026-07-01 (переход на полоски и бейджи)
- **Проблема:** Цветные фоны ячеек в тёмном режиме создавали визуальный шум ("каша")
- **Решение:** Переход на цветные полоски (border-left/top) вместо цветных фонов ячеек
- **Дополнительно:** Добавлены цветные бейджи с названием дисциплины для лучшей информативности
- **Улучшения:** Увеличен padding ячеек (px-3 py-3 → px-4 py-4), ссылка "Открыть" сделана кнопкой

### 2026-07-01 (обновление цветов)
- **Проблема:** Terracotta использовался и для бронзы, и для дисциплины "Бега" (конфликт ролей)
- **Проблема:** Camel использовался и для акцентных элементов, и для дисциплины "Другие" (конфликт ролей)
- **Решение:** Бега → charcoal (серый), Другие → old-money (бежевый). Terracotta остаётся только для бронзы/error.

### 2026-07-01 (улучшение контраста в тёмном режиме)
- **Проблема:** Цвета дисциплин в тёмном режиме были слишком блёклыми (25-35% прозрачности)
- **Решение:** Увеличена прозрачность до 40-50% для лучшей читаемости
- **Дополнительно:** Добавлены улучшения UI (тень таблицы, hover-эффекты, визуальные маркеры для важных соревнований, улучшенная иерархия текста)

## Связанные файлы

- `frontend/src/pages/Events/index.tsx` - Основной компонент календаря
- `frontend/tailwind.config.js` - Tailwind конфигурация с определением цветовых палитр
- `frontend/src/components/ThemeToggle.tsx` - Компонент переключения темы

## Рекомендации по изменению цветов

Если нужно изменить цвета:

1. Обновите `gradients` в функции `getDisciplineGradient()`
2. Обновите `badgeColors` в функции `getDisciplineBadgeColor()`
3. Обновите `lightColors` и `darkColors` в функции `getDisciplineColor()` (для легенды)
4. Обновите цвета кружочков в легенде
5. Проверьте, что цвета соответствуют Tailwind палитре в `tailwind.config.js`
6. Протестируйте в обоих режимах (светлый/тёмный)

## Примечания

- Градиентные фоны обеспечивают визуальное разделение без создания цветового шума
- Бейджи дают дополнительную информацию о дисциплине
- Важные соревнования выделены усиленным золотым градиентом
- Подход работает одинаково хорошо в обоих режимах (светлый/тёмный)
