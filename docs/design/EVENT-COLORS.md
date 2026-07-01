# Цветовая система календаря событий

## Обзор

Календарь событий использует цветовое кодирование для визуального различения дисциплин соревнований. Каждая дисциплина (Курсинг, БЗМП, Бега, Другие) имеет свой уникальный цвет, который применяется к строкам таблицы и карточкам событий.

## Реализация

### Файл: `frontend/src/pages/Events/index.tsx`

Цвета задаются через inline стили с использованием функции `getDisciplineColor()`:

```typescript
function getDisciplineColor(eventType: string, isDark: boolean): { backgroundColor: string } {
  const lightColors = {
    coursing: '#aecbae',
    bzmp: '#a8c8e0',
    racing: '#e8b8a0',
    other: '#c9a86a',
    default: 'transparent'
  }
  
  const darkColors = {
    coursing: 'rgba(42, 90, 42, 0.25)',
    bzmp: 'rgba(24, 104, 152, 0.35)',
    racing: 'rgba(136, 64, 64, 0.25)',
    other: 'rgba(90, 68, 0, 0.25)',
    default: 'transparent'
  }
  
  const colors = isDark ? darkColors : lightColors
  return { backgroundColor: colors[eventType] || colors.default }
}
```

### Применение

**Desktop версия (таблица):**
```tsx
<td style={getDisciplineColor(event.event_type, isDark)} className="px-3 py-3 text-sm ...">
  {event.field}
</td>
```

**Mobile версия (карточки):**
```tsx
<div style={getDisciplineColor(event.event_type, isDark)} className="rounded-xl p-4 ...">
  {/* контент карточки */}
</div>
```

### Отслеживание Dark Mode

Dark mode отслеживается через React state и MutationObserver:

```typescript
const [isDark, setIsDark] = useState(false)

useEffect(() => {
  const checkDarkMode = () => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }
  checkDarkMode()
  const observer = new MutationObserver(checkDarkMode)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}, [])
```

## Цветовая палитра

### Светлый режим

| Дисциплина | Hex код | Tailwind эквивалент | Описание |
|------------|---------|-------------------|----------|
| Курсинг | `#aecbae` | `forest-300` | Светло-зелёный |
| БЗМП | `#a8c8e0` | `warm-blue-300` | Светло-голубой |
| Бега | `#e8b8a0` | `terracotta-300` | Светло-розовый/персиковый |
| Другие | `#c9a86a` | `camel-300` | Светло-жёлтый/песочный |

### Тёмный режим

| Дисциплина | RGBA код | Tailwind эквивалент | Прозрачность | Описание |
|------------|----------|-------------------|--------------|----------|
| Курсинг | `rgba(42, 90, 42, 0.25)` | `forest-900/25` | 25% | Тёмно-зелёный полупрозрачный |
| БЗМП | `rgba(24, 104, 152, 0.35)` | `warm-blue-900/35` | 35% | Тёмно-синий полупрозрачный |
| Бега | `rgba(136, 64, 64, 0.25)` | `terracotta-900/25` | 25% | Тёмно-красный полупрозрачный |
| Другие | `rgba(90, 68, 0, 0.25)` | `camel-900/25` | 25% | Тёмно-жёлтый полупрозрачный |

## Легенда цветов

Над таблицей событий отображается легенда с кружочками, показывающими цвета дисциплин (строки 362-376 в `Events/index.tsx`):

```tsx
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-forest-300 dark:bg-forest-900/25 border border-forest-400 dark:border-forest-700"></div>
  <span>Курсинг</span>
</div>
```

Цвета легенды синхронизированы с цветами в таблице для обеспечения визуальной согласованности.

## История изменений

### 2026-07-01
- **Первоначальная реализация:** Использовались Tailwind CSS классы с `dark:` префиксами
- **Проблема:** Tailwind `dark:` классы не применялись корректно из-за синтаксиса `:is(.dark *)`
- **Решение 1:** Попытка использовать JavaScript-детекцию dark mode с заменой классов через `replace()`
- **Решение 2 (финальное):** Переход на inline стили с hex/rgba цветами для надёжности

### Почему inline стили?

1. **Надёжность:** Inline стили имеют приоритет над CSS и гарантированно применяются
2. **Независимость от Tailwind:** Не зависит от проблем с PurgeCSS или синтаксисом dark mode
3. **Простота:** Прямое управление цветами без сложностей с CSS селекторами
4. **Синхронизация:** Легко синхронизировать с легендой

## Связанные файлы

- `frontend/src/pages/Events/index.tsx` - Основной компонент календаря
- `frontend/src/constants.ts` - Константы (больше не используется для цветов)
- `frontend/tailwind.config.js` - Tailwind конфигурация с определением цветовых палитр
- `frontend/src/components/ThemeToggle.tsx` - Компонент переключения темы

## Рекомендации по изменению цветов

Если нужно изменить цвета:

1. Обновите `lightColors` и `darkColors` в функции `getDisciplineColor()`
2. Обновите цвета кружочков в легенде (строки 362-376)
3. Проверьте, что цвета соответствуют Tailwind палитре в `tailwind.config.js`
4. Протестируйте в обоих режимах (светлый/тёмный)

## Примечания

- Цвета выбраны мягкими и пастельными для светлого режима чтобы не перегружать интерфейс
- В тёмном режиме используются полупрозрачные цвета чтобы сохранить читаемость текста
- Прозрачность 25-35% обеспечивает хорошую видимость на тёмном фоне
