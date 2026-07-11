# Design System SALUKI

> Базовая информация о дизайн-системе Coursing Stats

---

## Цветовая палитра

### Light Mode

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

**Профили Донино — замер скорости:** карточки и история с `border-warm-blue-*`, `bg-warm-blue-50`, градиент полос `from-warm-blue-400 to-warm-blue-600`

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

**Использование:** Курсинг (зелёный) - статистика и история выступлений в профиле собаки

**Профили Донино — бега 350 м:** карточки и история с `border-forest-*`, `bg-forest-50`, градиент полос `from-forest-400 to-forest-600`

**Не путать:** warm-blue на профиле Донино = замер км/ч; forest = бега 350 м из Google Sheet. На профиле соревнований бега procoursing.ru — отдельные секции (не те же CSS-блоки).

### Алиасы (Tailwind `theme.extend.colors`)

- **Gold** → Camel (primary accent)
- **Steel** → Warm Blue (`warm-blue` — полная палитра в `tailwind.config.js`; краткий алиас `wb`)
- **Terracotta** → terra / медали (`terracotta-400`…`900` в config; CSS vars `--terra-*` в `index.css`)

### Специальные классы (`index.css`)

**`.nav-glass`** — sticky-шапка: ~8% белого / 12% чёрного + `blur(16px)`; fallback непрозрачный для браузеров без backdrop-filter.

**`.placement-badge-bronze`** — круг 3-го места в `PlacementBadge` (`--terra-500` / `--terra-600`).

**`.owner-crown-name`** — личная метка владельца сайта: корона слева от клички (`OwnerCrownName` + `ownerMarks.ts`).

**Главная (`index.css`):** `.hero-dashboard`, `.podium-preview`, `.pod-card`, `.donino-home-columns`, `.stats-strip`, `.home-section-*` — часть лендинга в CSS, часть через Tailwind в компонентах.

### Dark Mode принципы

**Статус:** ✅ Полная реализация (class-based в `tailwind.config.js`)

**Тема по умолчанию:** светлая. Класс `dark` на `<html>` только если `localStorage.theme === 'dark'`. Скрипт в `index.html` (до React) + `ThemeToggle.tsx`. Системная `prefers-color-scheme` **не** применяется автоматически.

**Принципы адаптации:**
1. Фоны: Инвертировать яркость, сохраняя насыщенность
2. Текст: Инвертировать контрастность
3. Акценты: Сохранить насыщенность, возможно немного увеличить яркость
4. Границы: Использовать более светлые тона для видимости на тёмном фоне

**Основные dark mode цвета:**
- Основной фон: `bg-charcoal-900`
- Фон карточек: `bg-charcoal-800`
- Границы: `border-charcoal-600`
- Основной текст: `text-charcoal-50` или `text-charcoal-100`
- Primary accent: `text-camel-400` или `text-camel-300`
- Secondary accent: `text-warm-blue-400`

---

## Типографика

### Шрифты

- **Sans-serif:** Montserrat (основной шрифт)
- **Serif:** Georgia (для pedigree aesthetic — DogTooltip)
- **Mono:** JetBrains Mono / Courier New (для чисел, скоростей, времени)

### Type scale

- **Display:** `text-3xl font-bold` (страничные заголовки)
- **Heading:** `text-xl font-bold` (заголовки секций)
- **Subheading:** `text-base font-semibold` (подзаголовки карточек)
- **Body:** `text-sm font-normal` (основной текст)
- **Caption:** `text-xs font-medium` (метки, лейблы)
- **Mono:** `font-mono text-sm` (числа, скорости, время)

### Правила

- `tracking-tight` для заголовков
- `leading-relaxed` для длинных текстов (>2 строк)
- `tabular-nums` для числовых колонок таблиц

---

## Компоненты

### Карточки

**Базовый стиль:**
```tsx
rounded-2xl border-2 border-old-money-200 dark:border-charcoal-600
bg-white dark:bg-charcoal-800
shadow-md p-4
```

**С hover эффектом:**
```tsx
hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer
```

**`JudgeCard`** (`frontend/src/components/JudgeCard.tsx`) — список судей на `/judges`: grid карточек вместо таблицы; имя, число оцениваний, ссылка на `/judges/{name}`.

### Кнопки

**Primary:**
```tsx
bg-camel-600 text-white hover:bg-camel-700
dark:bg-camel-700 dark:hover:bg-camel-600
```

**Secondary:**
```tsx
border-2 border-camel-300 bg-white text-camel-700
dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-400
```

**Ghost:**
```tsx
text-charcoal-700 hover:bg-old-money-50
dark:text-charcoal-300 dark:hover:bg-charcoal-700
```

### Таблицы

**Базовый стиль:**
```tsx
border-2 border-old-money-200 dark:border-charcoal-600
bg-white dark:bg-charcoal-800
```

**Числовые колонки:**
```tsx
font-mono tabular-nums
```

### Шапка профиля собаки (`DogProfile`)

Компактная одноэтажная компоновка (2026-07):

```
[←]  КЛИЧКА ♀                    [↓ скачать]
     латинская часть (если есть)
     [порода]  [Breed Archive ↗]   ← только если pedigree_url

────────────────────────────────────────────
Титулы:  [Чемпион России X2] [CACL] …   ← flex-wrap чипы, не колонка справа
```

- Chip **Breed Archive:** `rounded-full`, border `old-money-200`, иконка `ExternalLink`, открывается в новой вкладке

- Кнопки «назад» и «скачать» с `data-export-ignore` (не попадают в PNG-экспорт)
- Титулы — `titleBadgeClass()` + `formatTitleLine()`, горизонтальный ряд

### PageToolbar

Два режима:

| Режим | Класс | Где |
|-------|-------|-----|
| **bare** | только `space-y-2.5`, без рамки | рейтинг, судьи, Донино |
| **panel** | `TOOLBAR_PANEL` (`rounded-xl border bg-cream-100/70 p-3`) | календарь (dev) |

Сегменты — `ToolbarSegmentControl` или `ViewToggle` (pill внутри bordered group).

**Панель «Фильтры»:** `ToolbarFiltersDropdown` — белая карточка `rounded-xl`, секции с `TOOLBAR_FILTER_SECTION_LABEL`, строки `TOOLBAR_FILTER_CHECKBOX_ROW`, футер «Сбросить» / «Готово».

**Рейтинг — секция «Год»:** один выбранный год или ни одного (все годы). Повторный клик по отмеченному году снимает галку; chip под тулбаром — «Все годы».

**Рейтинг — секция «Порода»:** только породы с выступлениями (`useCompetingBreeds`, ~66); без `18` и прочего числового мусора из `breeds.json`.

**Рейтинг — «по очкам»:** подсказка ⓘ — `CoursingRatingHint.tsx`: **простой язык** для пользователя (средняя + лучший + старты; без prior/μ̃); полная формула — `/guide` → «О сайте». `HoverTooltip` `variant="site"`, `interactive` для ссылки.

**Где:** рейтинг (`TopDogsFilters`), судьи (`Judges/index`), рекорды Донино (`DoninoPageToolbar`), календарь (`Events/index.tsx` — framed).

### Рекорды Донино — статистика

Классы в `frontend/src/index.css`:

| Класс | Назначение |
|-------|------------|
| `.donino-stats-column-header` | Шапка колонки: заголовок + число собак + строка метрик |
| `.donino-group-card` | Карточка группы (порода / пол / год) в статистике |
| `.donino-stats-chart` | Свёрнутый аккордеон гистограммы (`<details>`) |

Список записей: `.donino-list-row`, `.donino-column-plaque` — режим «Записи».

---

## Правила dark mode

### Обязательно добавлять dark: классы

Для каждого:
- `bg-*` → `dark:bg-*`
- `text-*` → `dark:text-*`
- `border-*` → `dark:border-*`
- `shadow-*` → переопределить в CSS для dark mode

### Контраст (WCAG AA 4.5:1)

**Использовать:**
- `text-old-money-700` на `bg-white` (4.7:1 ✅)
- `text-camel-700` на `bg-white` (5.1:1 ✅)
- `text-charcoal-200` на `dark:bg-charcoal-800` (8.2:1 ✅)

**Избегать:**
- `text-old-money-600` на `bg-white` (3.4:1 ❌)
- `text-camel-400` на `dark:bg-charcoal-800` (3.8:1 ❌)
- `text-old-money-400` на `dark:bg-charcoal-800` (~3.1:1 ❌)

---

## Accessibility

### Обязательно для интерактивных элементов

- `aria-label` для кнопок без текста
- `aria-expanded` для toggle кнопок
- `aria-controls` для связки с контролируемым элементом
- `role="tablist/tab/tabpanel"` для вкладок

### Touch targets

Минимум 44x44px для всех интерактивных элементов на мобильных.

### Skip-link

```tsx
<a href="#main-content"
   className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
              focus:z-50 focus:px-4 focus:py-2 focus:bg-camel-600 focus:text-white
              focus:rounded-lg">
  Перейти к содержимому
</a>
```

---

## Цветовая система календаря событий

### Обзор
Календарь событий использует цветовое кодирование для визуального различения дисциплин соревнований. Каждая дисциплина (Курсинг, БЗМП, Бега, Другие) имеет свой уникальный цвет.

### Реализация

**Файлы:**
- `frontend/src/pages/Events/eventListUtils.ts` — константы цветов и хелперы
- `frontend/src/pages/Events/EventListRow.tsx` — применение цветов к строке списка
- `frontend/src/pages/Events/index.tsx` — легенда дисциплин в тулбаре

### Дисциплины — левый бордер

| Дисциплина | Tailwind (светлая / тёмная) |
|------------|----------------------------|
| Курсинг | `border-l-forest-300` / `dark:border-l-forest-600` |
| БЗМП | `border-l-blue-500` / `dark:border-l-blue-600` |
| Бега | `border-l-rose-300` / `dark:border-l-rose-600` |
| Другие | `border-l-amber-300` / `dark:border-l-amber-600` |

### Чемпионаты и кубки

`isImportantCompetition(competition_kind)` → золотой градиент фона строки (`from-camel-100`), serif-заголовок, иконка кубка. **Левый бордер** остаётся цветом дисциплины.

### Легенда цветов

Над таблицей событий отображается легенда с кружочками, показывающими цвета дисциплин.

---

## Чек-лист для новых компонентов

```
□ Есть dark: классы для КАЖДОГО bg-, text-, border-, shadow-
□ Есть aria-label или aria-expanded если это интерактивный элемент
□ Touch target ≥44px если это кнопка
□ Есть loading/empty/error состояние
□ Открывается без горизонтального скролла на 360px
□ Контраст всех текстовых элементов ≥4.5:1 (WCAG AA)
```
