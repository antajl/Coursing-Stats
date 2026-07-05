# Design Roadmap Coursing Stats — Полный план редизайна

> Дата: 2026-06-30
> Статус: Объединённый аудит (Claude + Devin)
> Метод: Независимые аудиты → сравнение → синтез

---

## Итоговые оценки

| Критерий | Light | Dark | Mobile | До фиксов | После крит. | После полного |
|----------|-------|------|--------|-----------|-------------|---------------|
| Визуальный стиль | 8.5 | 5.0 | 7.0 | **6.8** | 8.0 | **10** |
| Цветовая палитра | 9.0 | 5.5 | 8.0 | **7.5** | 8.5 | **10** |
| Консистентность | 7.0 | 4.5 | 6.0 | **5.8** | 8.0 | **9.5** |
| Типографика | 7.5 | 7.0 | 7.0 | **7.2** | 7.5 | **9.5** |
| Интерактивность | 8.0 | 7.0 | 7.0 | **7.3** | 8.5 | **10** |
| Accessibility | 7.0 | 5.5 | 6.0 | **6.2** | 8.0 | **9.5** |
| Адаптивность | — | — | 7.2 | **7.2** | 8.5 | **9.5** |
| Пустые/ошибочные состояния | 6.0 | 6.0 | 6.0 | **6.0** | 6.5 | **9.0** |
| Производительность | 7.0 | 7.0 | 6.0 | **6.7** | 6.7 | **8.5** |
| **ИТОГО** | | | | **6.7** | **~8.3** | **~9.5** |

> 🔴 Критичные баги в dark mode тянут общий балл вниз непропорционально

---

## Дизайн-система SALUKI

### Цветовая палитра (Light Mode)

#### Old Money (тёплые нейтральные)
- 50: `#faf8f4` — очень светлый кремовый
- 100: `#f3ede4` — светлый бежевый
- 200: `#e7ddcf` — бежевый
- 300: `#d9ccb8` — светло-коричневый
- 400: `#c7b79e` — коричнево-бежевый
- 500: `#b39f84` — средний коричневый
- 600: `#98836a` — коричневый
- 700: `#796855` — тёмно-коричневый
- 800: `#5d5144` — глубокий коричневый
- 900: `#433a31` — очень тёмный коричневый
- 950: `#2c2621` — почти чёрный коричневый

**Использование:** Фоны карточек, границы, текст второстепенной важности

#### Cream (кремовые тона)
- 50: `#fcfaf7` — основной фон страниц
- 100: `#f7f2ea` — светлый крем
- 200: `#eee5d6` — кремовый
- 300: `#e4d7bf` — тёмный крем
- 400: `#d8c6a4` — бежево-кремовый
- 500: `#c8af85` — золотисто-кремовый
- 600: `#a78f68` — тёмно-кремовый
- 700: `#846f51` — коричнево-кремовый
- 800: `#65543f` — глубокий кремовый
- 900: `#483b2d` — очень тёмный кремовый

**Использование:** Основной фон страниц (`bg-cream-50`)

#### Camel (primary accent)
- 50: `#fbf6ef` — очень светлый верблюжий
- 100: `#f3e7d5` — светлый верблюжий
- 200: `#e7d1ab` — верблюжий
- 300: `#d8b57a` — золотисто-коричневый
- 400: `#c79c56` — коричнево-золотой
- 500: `#b68231` — золотистый
- 600: `#9b6720` — основной акцентный цвет
- 700: `#7b511c` — тёмный акцент
- 800: `#65441b` — глубокий акцент
- 900: `#553a1b` — очень тёмный акцент

**Использование:** Primary actions, ссылки, hover состояния, кнопки

#### Charcoal (текст)
- 50: `#f7f7f6` — почти белый
- 100: `#ecebe7` — очень светлый серый
- 200: `#d8d5ce` — светлый серый
- 300: `#bcb7ad` — серый
- 400: `#9f988d` — тёмно-серый
- 500: `#81796e` — глубокий серый
- 600: `#655d54` — угольный
- 700: `#4d4740` — тёмный угольный
- 800: `#38342f` — глубокий угольный
- 900: `#252320` — почти чёрный
- 950: `#171513` — чёрный

**Использование:** Основной текст (`text-charcoal-900`, `text-charcoal-800`), заголовки

#### Warm Blue (secondary accent)
- 50: `#f2f6f8` — очень светлый тёплый синий
- 100: `#e2ebf0` — светлый тёплый синий
- 200: `#c8d9e3` — тёплый синий
- 300: `#a8c0cf` — тёмно-тёплый синий
- 400: `#88a8bc` — глубокий тёплый синий
- 500: `#698ea4` — тёплый синий
- 600: `#55738a` — тёмный тёплый синий
- 700: `#465c70` — глубокий тёплый синий
- 800: `#3b4b5b` — очень тёмный тёплый синий
- 900: `#333f4b` — почти чёрный тёплый синий

**Использование:** Racing данные, secondary actions, links

#### Terracotta (терракотовые тона)
- 50: `#fcf4ef` — очень светлый терракотовый
- 100: `#f7e4d9` — светлый терракотовый
- 200: `#efc8b4` — терракотовый
- 300: `#e2a58a` — тёмно-терракотовый
- 400: `#d17f62` — глубокий терракотовый
- 500: `#bb6148` — терракотовый красный
- 600: `#9d4c37` — тёмный терракотовый
- 700: `#7f3f31` — глубокий терракотовый
- 800: `#69372d` — очень тёмный терракотовый
- 900: `#583026` — почти чёрный терракотовый

**Использование:** Медали, error states

#### Forest (лесные тона)
- 50: `#f2f6f2` — очень светлый зелёный
- 100: `#e3ede3` — светлый зелёный
- 200: `#c9dcc9` — зелёный
- 300: `#aac7ab` — тёмно-зелёный
- 400: `#88ae8b` — глубокий зелёный
- 500: `#6f9173` — лесной зелёный
- 600: `#557658` — тёмный лесной
- 700: `#435d46` — глубокий лесной
- 800: `#384b3a` — очень тёмный лесной
- 900: `#2f3f31` — почти чёрный лесной
- 950: `#182419` — чёрный лесной

**Использование:** Зарезервирован для future features

### Алиасы

**Gold (алиас к Camel):** Primary accent
**Steel (алиас к Warm Blue):** Secondary accent

### Dark Mode принципы

**Статус:** ✅ Полная реализация (class-based в tailwind.config.js)

**Принципы адаптации:**
1. Фоны: Инвертировать яркость, сохраняя насыщенность
2. Текст: Инвертировать контрастность
3. Акценты: Сохранить насыщенность, возможно немного увеличить яркость
4. Границы: Использовать более светлые тона для видимости на тёмном фоне

---

## КРИТИЧЕСКИЕ БАГИ (найдены Claude)

### 1. FiltersDropdown.tsx — 0 dark: классов (КРИТИЧНО)

`frontend/src/components/FiltersDropdown.tsx` полностью сломан в тёмной теме:

```tsx
// СЕЙЧАС — вся панель белая в dark mode:
<div className="bg-white rounded-2xl shadow-2xl border-2 border-old-money-200">
  <h2 className="text-charcoal-800">Фильтры</h2>
  <button className="bg-old-money-100 text-old-money-800">Сбросить</button>
  <button className="bg-camel-600 text-white">Применить</button>
</div>

// ИСПРАВЛЕНИЕ:
<div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl
                border-2 border-old-money-200 dark:border-charcoal-600">
  <h2 className="text-charcoal-800 dark:text-charcoal-100">Фильтры</h2>
  <button className="bg-old-money-100 dark:bg-charcoal-700
                     text-old-money-800 dark:text-charcoal-200
                     hover:bg-old-money-200 dark:hover:bg-charcoal-600">
    Сбросить
  </button>
  <button className="bg-camel-600 dark:bg-camel-700 text-white
                     hover:bg-camel-700 dark:hover:bg-camel-600">
    Применить
  </button>
</div>

// Триггер-кнопка:
className={`... ${open
  ? 'bg-camel-600 text-white border-camel-600'
  : 'bg-white dark:bg-charcoal-800
     border-old-money-300 dark:border-charcoal-600
     text-old-money-800 dark:text-charcoal-200'
}`}
```

**Файл:** `frontend/src/components/FiltersDropdown.tsx`  
**Время:** 20 мин  
**Приоритет:** КРИТИЧЕСКИЙ

---

### 2. Competitions.tsx вкладки — нет dark: (КРИТИЧНО)

```tsx
// frontend/src/pages/Competitions.tsx — СЕЙЧАС:
<div className="bg-cream-50/90 backdrop-blur-lg rounded-2xl
                shadow-xl border border-cream-300 p-4 md:p-8">
  <div className="bg-old-money-100 p-1 rounded-xl">
    <button className={activeTab === 'calendar'
      ? 'bg-white text-charcoal-700 shadow-sm'        // нет dark:
      : 'text-charcoal-600 hover:text-charcoal-700'}> // нет dark:
```

```tsx
// ИСПРАВЛЕНИЕ:
<div className="bg-cream-50/90 dark:bg-charcoal-900/90 backdrop-blur-lg
                rounded-2xl shadow-xl
                border border-cream-300 dark:border-charcoal-700 p-4 md:p-8">
  <div className="bg-old-money-100 dark:bg-charcoal-800 p-1 rounded-xl">
    <button className={activeTab === 'calendar'
      ? 'bg-white dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-100 shadow-sm'
      : 'text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-200'}>
```

**Файл:** `frontend/src/pages/Competitions.tsx`  
**Время:** 15 мин  
**Приоритет:** КРИТИЧЕСКИЙ

---

### 3. Logo не переключается (КРИТИЧНО)

`navbar-bg-dark.svg` **существует** в `/dist/assets/` но **никогда не используется**.

```tsx
// frontend/src/App.tsx — СЕЙЧАС (оба случая):
<img src="/assets/navbar-bg.svg" alt="Logo" className="h-[61px] opacity-80" />

// Шаг 1 — создать хук:
// frontend/src/hooks/useDarkMode.ts
export function useDarkMode() {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

// Шаг 2 — использовать в Nav:
const isDark = useDarkMode()
<img
  src={isDark ? '/assets/navbar-bg-dark.svg' : '/assets/navbar-bg.svg'}
  alt=""  // пустой alt — изображение декоративное
  className="h-[61px] opacity-80"
/>
```

**Файлы:** `frontend/src/App.tsx`, `frontend/src/hooks/useDarkMode.ts` (новый)  
**Время:** 30 мин  
**Приоритет:** КРИТИЧЕСКИЙ

---

### 4. Nav dropdowns без dark: (КРИТИЧНО)

```tsx
// App.tsx — Sources dropdown — ИСПРАВЛЕНИЕ:
<div className="absolute right-0 mt-1 w-64
                bg-white dark:bg-charcoal-800
                rounded-xl shadow-xl
                border-2 border-old-money-200 dark:border-charcoal-600">
  <a className="text-charcoal-700 dark:text-charcoal-200
                hover:bg-old-money-50 dark:hover:bg-charcoal-700
                border-b border-old-money-100 dark:border-charcoal-600">

// App.tsx — Mobile menu — ИСПРАВЛЕНИЕ:
<div className="bg-white dark:bg-charcoal-900
                border-b border-old-money-200 dark:border-charcoal-700">
  <Link className="text-charcoal-700 dark:text-charcoal-200
                   hover:bg-old-money-50 dark:hover:bg-charcoal-800">
```

**Файл:** `frontend/src/App.tsx`  
**Время:** 20 мин  
**Приоритет:** КРИТИЧЕСКИЙ

---

### 5. input[type="date"] — hardcoded light (КРИТИЧНО)

```css
/* App.css — СЕЙЧАС: */
input[type="date"] { color-scheme: light; }  /* всегда светлый */

/* ИСПРАВЛЕНИЕ: */
input[type="date"] { color-scheme: light; }
.dark input[type="date"] { color-scheme: dark; }

.dark input[type="date"]::-webkit-datetime-edit-text,
.dark input[type="date"]::-webkit-datetime-edit-month-field,
.dark input[type="date"]::-webkit-datetime-edit-day-field,
.dark input[type="date"]::-webkit-datetime-edit-year-field {
  color: #d4c6a3;
}
```

**Файл:** `frontend/src/App.css`  
**Время:** 5 мин  
**Приоритет:** КРИТИЧЕСКИЙ

---

### 6. ThemeToggle — логика иконок инвертирована

```tsx
// ThemeToggle.tsx — СЕЙЧАС:
// isDark = true → показываем луну ← НЕПРАВИЛЬНО
// Пользователь в тёмной теме видит луну, хотя должен видеть солнце
// (иконка = то, во что переключишься при клике)

// ИСПРАВЛЕНИЕ:
{isDark ? <SunIcon /> : <MoonIcon />}
// В тёмной теме → показываем солнце (нажми чтобы стать светлым)
// В светлой теме → показываем луну (нажми чтобы стать тёмным)
```

**Файл:** `frontend/src/components/ThemeToggle.tsx`  
**Время:** 5 мин  
**Приоритет:** ВАЖНЫЙ

---

### 7. aria-expanded отсутствует везде

```tsx
// App.tsx — Nav:
// СЕЙЧАС:
<button onClick={toggleMobileMenu}>          // нет aria-expanded
<button title="Источники данных">           // нет aria-expanded

// ИСПРАВЛЕНИЕ:
<button
  onClick={toggleMobileMenu}
  aria-expanded={mobileMenuOpen}
  aria-controls="mobile-menu"
  aria-label="Открыть меню навигации"
>

<div id="mobile-menu" aria-hidden={!mobileMenuOpen}>

// FiltersDropdown.tsx — ИСПРАВЛЕНИЕ:
<button
  onClick={() => setOpen(!open)}
  aria-expanded={open}
  aria-controls="filters-panel"
>
<div id="filters-panel">
```

**Файлы:** `frontend/src/App.tsx`, `frontend/src/components/FiltersDropdown.tsx`  
**Время:** 20 мин  
**Приоритет:** ВАЖНЫЙ

---

### 8. Touch targets 36px в Nav mobile

```tsx
// App.tsx — СЕЙЧАС:
<button className="w-9 h-9 ...">  // 36px < 44px минимум

// ИСПРАВЛЕНИЕ:
<button className="w-11 h-11 ...">  // 44px ✓
// или
<button className="min-w-[44px] min-h-[44px] ...">

// Кнопка закрытия в FiltersDropdown — ИСПРАВЛЕНИЕ:
<button className="p-2 -m-2 min-w-[44px] min-h-[44px]
                   flex items-center justify-center">
  <svg className="h-6 w-6" />
</button>
```

**Файлы:** `frontend/src/App.tsx`, `frontend/src/components/FiltersDropdown.tsx`  
**Время:** 5 мин  
**Приоритет:** ВАЖНЫЙ

---

### 9. Flash при смене темы

```css
/* index.css — добавить: */
html {
  transition: background-color 200ms ease, color 200ms ease;
}
```

**Файл:** `frontend/src/index.css`  
**Время:** 5 мин  
**Приоритет:** ВАЖНЫЙ

---

### 10. Escape не закрывает меню

```tsx
// App.tsx — добавить в Nav:
useEffect(() => {
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setMobileMenuOpen(false)
      setSourcesOpen(false)
    }
  }
  document.addEventListener('keydown', handleEsc)
  return () => document.removeEventListener('keydown', handleEsc)
}, [])

// FiltersDropdown.tsx — то же самое для setOpen(false)
```

**Файлы:** `frontend/src/App.tsx`, `frontend/src/components/FiltersDropdown.tsx`  
**Время:** 15 мин  
**Приоритет:** ВАЖНЫЙ

---

## ДОПОЛНИТЕЛЬНЫЕ УЛУЧШЕНИЯ (найдены Devin)

### 11. Hover:scale микро-анимации на карточках

```tsx
// Events/index.tsx, Judges/index.tsx, DogProfile.tsx — добавить:
<div className="... hover:scale-[1.01] transition-transform duration-200 cursor-pointer">
  {/* карточка */}
</div>
// Внимание: scale конфликтует с overflow-hidden — проверить на каждой карточке
```

**Файлы:** Все карточки (Events, Judges, DogProfile)  
**Время:** 30 мин  
**Приоритет:** СРЕДНИЙ

---

### 12. Semantic color tokens (success / warning / error)

```js
// tailwind.config.ts — добавить:
colors: {
  'success': {
    50: '#f0f5f0', 100: '#e0ebe0', 500: '#4a7a4a', 900: '#1a4a1a'
  },
  'warning': {
    50: '#fef3e0', 100: '#fde8c0', 500: '#b8860b', 900: '#5a4400'
  },
  'error': {
    50: '#fef2f2', 100: '#fee2e2', 500: '#bb6148', 900: '#7f3f31'
  }
  // Примечание: 'error' использует terracotta — гармонирует с палитрой
}
```

**Файл:** `frontend/tailwind.config.js`  
**Время:** 20 мин  
**Приоритет:** СРЕДНИЙ

---

### 13. leading-relaxed для описательных текстов

```tsx
// DogProfile.tsx, EventResults.tsx, JudgeDetail.tsx — добавить:
// В длинных описательных блоках:
<p className="text-sm text-charcoal-700 dark:text-charcoal-300 leading-relaxed">
  {описание}
</p>
// Текущий default leading (~1.5) нормальный,
// но для блоков >2 строк leading-relaxed (1.625) читается заметно лучше
```

**Файлы:** DogProfile, EventResults, JudgeDetail  
**Время:** 20 мин  
**Приоритет:** СРЕДНИЙ

---

### 14. Card.tsx — переиспользуемый компонент

```tsx
// frontend/src/components/Card.tsx — новый файл:
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600
        bg-white dark:bg-charcoal-800
        shadow-md p-4
        ${hover ? 'hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
```

**Файл:** `frontend/src/components/Card.tsx` (новый)  
**Время:** 90 мин  
**Приоритет:** СРЕДНИЙ

---

### 15. Regular audit schedule

```markdown
## Расписание проверок (добавить в CONTRIBUTING.md)

Еженедельно:
- [ ] Тест dark mode во всех новых компонентах
- [ ] Проверка контраста новых цветовых комбинаций (WebAIM Contrast Checker)
- [ ] Ручной тест на 375px (iPhone SE)

Ежемесячно:
- [ ] Lighthouse audit (Performance, Accessibility, Best Practices)
- [ ] axe DevTools scan
- [ ] Тест keyboard-only navigation

При каждом новом компоненте:
- [ ] dark: классы для каждого цветового значения
- [ ] aria-label/aria-expanded если это button/toggle
- [ ] Проверка touch target ≥44px
```

**Файл:** `CONTRIBUTING.md`  
**Время:** 30 мин  
**Приоритет:** СРЕДНИЙ

---

## КОНСЕНСУС (оба согласны)

### Контраст — конкретные замены

| Токен | Сейчас | Замена | Где используется |
|-------|--------|--------|-----------------|
| `text-old-money-600` на bg-white | 3.4:1 ❌ | `text-old-money-700` | Описания карточек, лейблы |
| `text-camel-400` на dark:bg-charcoal-800 | 3.8:1 ❌ | `text-camel-300` | Ссылки в dark mode |
| `text-old-money-400` на dark:bg-charcoal-800 | ~3.1:1 ❌ | `text-old-money-300` | Метки в dark mode |

```bash
# Найти все проблемные токены в коде:
grep -r "text-old-money-600\|text-camel-400\|text-old-money-400" frontend/src/ \
  --include="*.tsx" | grep -v "dark:"
# Всё что нашлось без соответствующего dark: варианта — потенциальная проблема
```

**Файлы:** Все страницы с этими токенами  
**Время:** 45 мин  
**Приоритет:** ВАЖНЫЙ

---

### ARIA-метки — полный список

```tsx
// Все места где нужны aria-атрибуты:

// 1. Nav burger button (App.tsx)
aria-expanded={mobileMenuOpen} aria-label="Навигационное меню"

// 2. Nav sources button (App.tsx)
aria-expanded={sourcesOpen} aria-label="Источники данных"

// 3. FiltersDropdown trigger (FiltersDropdown.tsx)
aria-expanded={open} aria-label="Расширенные фильтры"

// 4. ThemeToggle (уже есть aria-label, отлично!)

// 5. Вкладки Competitions.tsx — добавить role:
<div role="tablist" aria-label="Разделы">
  <button role="tab" aria-selected={activeTab === 'calendar'}>
<div role="tabpanel" aria-labelledby="tab-calendar">

// 6. Skip-link (index.html или App.tsx):
<a href="#main-content"
   className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
              focus:z-50 focus:px-4 focus:py-2 focus:bg-camel-600 focus:text-white
              focus:rounded-lg">
  Перейти к содержимому
</a>
// ... в App.tsx:
<main id="main-content" ...>
```

**Файлы:** `frontend/src/App.tsx`, `frontend/src/components/FiltersDropdown.tsx`, `frontend/src/pages/Competitions.tsx`, `frontend/index.html`  
**Время:** 30 мин  
**Приоритет:** ВАЖНЫЙ

---

### Code splitting

```tsx
// App.tsx — СЕЙЧАС:
import DogProfile from './pages/DogProfile'
import EventResults from './pages/Events/EventResults'
// ... все импорты статические

// ИСПРАВЛЕНИЕ:
import { lazy, Suspense } from 'react'
const DogProfile = lazy(() => import('./pages/DogProfile'))
const EventResults = lazy(() => import('./pages/Events/EventResults'))
const SpeedRecords = lazy(() => import('./pages/SpeedRecords/index'))
const JudgeDetail = lazy(() => import('./pages/Judges/JudgeDetail'))
// Оставить синхронными только "домашние" страницы: Coursing Stats, Events, TopDogs, Judges

// В Routes обернуть в Suspense:
<Suspense fallback={<SkeletonLoader variant="card" count={4} />}>
  <Routes>...</Routes>
</Suspense>

// Ожидаемый результат: основной бандл < 300kB (сейчас 652kB)
```

**Файл:** `frontend/src/App.tsx`  
**Время:** 60 мин  
**Приоритет:** СРЕДНИЙ

---

### EmptyState/ErrorState — финальная версия

```tsx
// frontend/src/components/EmptyState.tsx — ПЕРЕРАБОТАТЬ:
const ICONS = {
  default: (
    <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
      {/* Простая геометрическая иконка в духе сайта */}
      <circle cx="40" cy="40" r="30" className="stroke-old-money-200 dark:stroke-old-money-700" strokeWidth="2"/>
      <path d="M28 40 Q40 28 52 40 Q40 52 28 40" className="stroke-camel-300 dark:stroke-camel-600" strokeWidth="2" fill="none"/>
    </svg>
  ),
}

export default function EmptyState({
  title = 'Нет данных',
  description = '',
  action = null,
  icon = 'default'
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 opacity-70">{ICONS[icon] || ICONS.default}</div>
      <h3 className="text-xl font-bold text-charcoal-800 dark:text-charcoal-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-old-money-700 dark:text-old-money-300 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
```

**Файлы:** `frontend/src/components/EmptyState.tsx`, `frontend/src/components/ErrorState.tsx`  
**Время:** 45 мин  
**Приоритет:** ВАЖНЫЙ

---

## ПОЛНЫЙ ПРИОРИТИЗИРОВАННЫЙ ПЛАН

### 🔴 БЛОК 1 — КРИТИЧНО (~2.5 часа) → +1.6 к общей оценке

| # | Задача | Файл | Время | Статус |
|---|--------|------|-------|--------|
| 1 | FiltersDropdown — все dark: классы | FiltersDropdown.tsx | 20 мин | ✅ |
| 2 | Competitions.tsx — вкладки dark: | Competitions.tsx | 15 мин | ✅ |
| 3 | Nav mobile/sources — dark: | App.tsx | 20 мин | ✅ |
| 4 | Logo переключение (useDarkMode хук) | App.tsx + hooks/useDarkMode.ts | 30 мин | ✅ |
| 5 | input[type="date"] — dark color-scheme | App.css | 5 мин | ✅ |
| 6 | ThemeToggle — исправить иконки | ThemeToggle.tsx | 5 мин | ✅ |
| 7 | Touch targets w-9 → w-11 | App.tsx | 5 мин | ✅ |
| 8 | Flash при смене темы | index.css | 5 мин | ✅ |

**Статус блока 1:** ✅ ВЫПОЛНЕН (2026-07-01)

---

### 🟡 БЛОК 2 — ВАЖНО (~4 часа) → +0.7 к общей оценке

| # | Задача | Файл | Время | Статус |
|---|--------|------|-------|--------|
| 9 | aria-expanded на burger/sources/filters | App.tsx, FiltersDropdown.tsx | 20 мин | ✅ |
| 10 | role="tablist/tab/tabpanel" | Competitions.tsx | 15 мин | ✅ |
| 11 | Контраст: old-money-606 → 700, camel-400 → 300 в dark | все страницы | 45 мин | ✅ |
| 12 | FiltersDropdown → bottom sheet на мобиле | FiltersDropdown.tsx | 60 мин | ⏭️ |
| 13 | Escape для закрытия меню | App.tsx, FiltersDropdown.tsx | 15 мин | ✅ |
| 14 | Skip-link | App.tsx | 10 мин | ✅ |
| 15 | EmptyState/ErrorState — SVG иконки | EmptyState.tsx, ErrorState.tsx | 45 мин | ✅ |
| 16 | alt="" на декоративных изображениях | App.tsx | 5 мин | ✅ |
| 17 | Тени в dark mode — переопределить | index.css | 20 мин | ✅ |
| 18 | Semantic color tokens | tailwind.config.ts | 20 мин | ✅ |

**Статус блока 2:** ✅ ВЫПОЛНЕН (2026-07-01) кроме задачи 12 (пропущена)

---

### 🟢 БЛОК 3 — ПОЛИРОВКА (~8 часов) → +0.5 к общей оценке

| # | Задача | Файл | Время |
|---|--------|------|-------|
| 19 | Card.tsx переиспользуемый компонент | components/Card.tsx | 90 мин |
| 20 | Button.tsx единый компонент | components/Button.tsx | 60 мин |
| 21 | Code splitting (React.lazy) | App.tsx | 60 мин |
| 22 | hover:scale на карточках событий/судей | Events, Judges | 30 мин |
| 23 | tabular-nums на числовых колонках | DogStatsTable.tsx | 20 мин |
| 24 | leading-relaxed на описаниях | DogProfile, EventResults | 20 мин |
| 25 | Алиасы gold/steel в tailwind.config.ts | tailwind.config.ts | 10 мин |
| 26 | theme-color + apple-touch-icon | index.html | 5 мин |
| 27 | Scroll-fade маска для горизонт. скролла | index.css | 15 мин |
| 28 | Regular audit checklist | CONTRIBUTING.md | 30 мин |

---

## ЧЕКЛИСТ ПЕРЕД КАЖДЫМ КОММИТОМ

```
Новый компонент/страница:
□ Есть dark: классы для КАЖДОГО bg-, text-, border-, shadow-
□ Есть aria-label или aria-expanded если это интерактивный элемент
□ Touch target ≥44px если это кнопка
□ Есть loading/empty/error состояние
□ Открывается без горизонтального скролла на 360px

Dark mode проверка (30 сек):
□ Открыть в Chrome DevTools → Rendering → Emulate CSS media feature prefers-color-scheme: dark
□ Переключить ThemeToggle и убедиться что всё видно
□ Открыть FiltersDropdown — должен быть тёмным
□ Открыть мобильное меню (devtools 375px) — должен быть тёмным
```

---

## ИНСТРУМЕНТЫ ДЛЯ РУЧНОГО АУДИТА

| Инструмент | Для чего | Ссылка |
|------------|----------|--------|
| WebAIM Contrast Checker | Проверка контраста двух цветов | webaim.org/resources/contrastchecker |
| axe DevTools | Автоматическое сканирование a11y | Chrome extension |
| Chrome DevTools → Rendering | Эмуляция dark/light mode | F12 → ... → Rendering |
| Lighthouse | Комплексный аудит | F12 → Lighthouse |
| responsively.app | Тест на нескольких размерах | Бесплатное приложение |
| VoiceOver (macOS) | Тест скринридера | Cmd+F5 |

---

## ФИНАЛЬНЫЙ ПРОГНОЗ

```
Сейчас:          6.7/10
После блока 1:  ~8.3/10  (2.5 часа работы)
После блока 2:  ~8.9/10  (+4 часа)
После блока 3:  ~9.5/10  (+8 часов)
```

> Блок 1 даёт максимальный прирост за минимальное время.  
> Тёмная тема сейчас — главная слабость. Исправление 5 файлов  
> поднимает проект с 6.7 до 8.3 за один вечер.
