# UI Audit — Визуальный аудит (2026-07)

> **Статус:** Рабочий документ. Создан по результатам анализа Amazon Q.
> Выполненные пункты → перенести в `docs/_archive/FUTURE-PLANS-COMPLETED.md`.
> Связанный раздел в `FUTURE-PLANS.md` → «UI / визуальная согласованность».

---

## Контекст

Анализ охватил: `index.css`, `tailwind.config.js`, `App.tsx`, `Nav.tsx`, `lib/toolbar.ts`,
`Home.tsx`, `DogProfile.tsx`, `EventListRow.tsx`, `EventResults/index.tsx`, `Button.tsx`,
`PageToolbar.tsx`, `ToolbarSegmentControl.tsx`.

**Эталон стиля:** `Events/index.tsx` (календарь) + `Home.tsx`.

---

## Найденные проблемы

### П1. Двойная система цветовых токенов 🔴 Высокий приоритет

**Суть:** В проекте параллельно существуют два набора токенов:
- CSS-переменные в `index.css`: `--om-*`, `--char-*`, `--camel-*`, `--wb-*`, `--forest-*`
- Tailwind-классы в `tailwind.config.js`: `old-money-*`, `charcoal-*`, `warm-blue-*`, `forest-*`

Имена не совпадают (`--wb-600` vs `warm-blue-600`), значения частично расходятся.
`Nav.tsx` использует `old-money-*` и `charcoal-*`, `index.css` — `--om-*` и `--char-*`.
При правке одного набора второй не обновляется → визуальный drift.

**Файлы:** `frontend/src/index.css`, `frontend/tailwind.config.js`, `frontend/src/components/Nav.tsx`

**Решение:** Выбрать один источник правды. Рекомендация — Tailwind-токены как основа,
CSS-переменные оставить только там, где они нужны для `index.css` (главная, podium).
Не смешивать `--om-*` и `old-money-*` в одном компоненте.

---

### П2. Три паттерна вкладок 🔴 Высокий приоритет

**Суть:** Одна и та же задача (переключение разделов) решена тремя разными способами:

| Место | Паттерн | Файл |
|-------|---------|------|
| Nav | Подчёркивание `scale-x` на `camel-600` | `Nav.tsx` |
| Competitions, SpeedRecords ViewToggle | `ToolbarSegmentControl` — pill на белом фоне | `toolbar/ToolbarSegmentControl.tsx` |
| Home (топ сезона) | `.home-ranking-tab` — `rounded-full`, camel active | `index.css` |

**Файлы:** `frontend/src/components/Nav.tsx`, `frontend/src/index.css`,
`frontend/src/components/toolbar/ToolbarSegmentControl.tsx`

**Решение:** `ToolbarSegmentControl` — единый компонент для всех переключателей внутри страниц.
`.home-ranking-tab` заменить на `ToolbarSegmentControl`. Nav — отдельный паттерн (навигация),
оставить как есть.

---

### П3. `gray-*` в `DogProfile.tsx` 🟡 Средний приоритет

**Суть:** В `DogProfile.tsx` используется стандартный Tailwind `gray-*` (`text-gray-500`,
`text-gray-400`, `border-gray-200`), который не входит в дизайн-систему проекта.
Должен быть `charcoal-*` или `old-money-*`.

**Файл:** `frontend/src/pages/DogProfile.tsx`

**Конкретные места:**
- `text-gray-500 dark:text-gray-400` — лейблы «Лучший результат», «Лучшая скорость»
- `text-gray-400 dark:text-gray-500` — единицы измерения (км/ч, сек)
- `border-gray-200 bg-white` — бейдж типа события в истории

**Решение:** Заменить на:
- `text-gray-500` → `text-charcoal-500`
- `text-gray-400` → `text-charcoal-400`
- `border-gray-200` → `border-old-money-200`

---

### П4. Несогласованная толщина рамок 🟡 Средний приоритет

**Суть:** В коде встречаются четыре разных значения без явного правила:

| Значение | Где используется |
|----------|-----------------|
| `border` (1px) | `EventListRow`, toolbar chips active filters |
| `border-[1.5px]` | Toolbar chips, donino rows, `index.css` карточки |
| `border-2` (2px) | `DogProfile` карточки, кнопки в `EventResults` |
| `border-[Npx]` произвольные | Разные компоненты |

**Решение — правило:**
- Строки списков, мелкие элементы → `border` (1px)
- Карточки, тулбар-панели → `border` или `border-[1.5px]` (выбрать одно)
- Шапки профилей, крупные блоки → `border-2`

---

### П5. `TOOLBAR_SEGMENT_ACTIVE` — слабый акцент 🟡 Средний приоритет

**Суть:** Активный сегмент в `ToolbarSegmentControl`:
```
bg-old-money-100 text-charcoal-900 shadow-sm
```
Почти незаметен на фоне неактивных. При этом активные чипы фильтров:
```
border-camel-500 bg-camel-500 text-charcoal-900
```
— яркие. Разная визуальная весомость у похожих элементов.

**Файл:** `frontend/src/lib/toolbar.ts` — константа `TOOLBAR_SEGMENT_ACTIVE`

**Решение:** Привести к единому языку. Вариант A — сегменты тоже camel:
```
bg-camel-500 text-charcoal-900 shadow-sm
```
Вариант B — чипы тоже нейтральные. Выбор за владельцем.

---

### П6. Active-стиль Nav: desktop ≠ mobile 🟢 Низкий приоритет

**Суть:**
- Desktop: подчёркивание `camel-600` (`scale-x-100`)
- Mobile: заливка фона `bg-camel-100 text-camel-700`

Разные паттерны для одного состояния «активная страница».

**Файл:** `frontend/src/components/Nav.tsx`

**Решение:** Унифицировать. Проще привести mobile к desktop-паттерну:
добавить нижнюю линию вместо заливки. Или наоборот — заливка везде (проще на мобиле).

---

### П7. Произвольные `border-radius` значения 🟢 Низкий приоритет

**Суть:** Смешение стандартных Tailwind и произвольных значений:
`rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`,
`rounded-[10px]`, `rounded-[14px]`, `rounded-[16px]`, `rounded-[18px]`, `rounded-[22px]`

**Решение — таблица соответствий:**

| Произвольное | Заменить на |
|-------------|-------------|
| `rounded-[10px]` | `rounded-lg` (8px) или `rounded-xl` (12px) |
| `rounded-[14px]` | `rounded-xl` (12px) |
| `rounded-[16px]` | `rounded-2xl` (16px) |
| `rounded-[18px]` | `rounded-2xl` (16px) |
| `rounded-[22px]` | `rounded-3xl` (24px) |

---

### П8. `DogProfile` — визуально тяжелее остального сайта 🟢 Низкий приоритет

**Суть:** Карточки на `/dog/:id` используют `border-2 ... shadow-md` — более тяжёлый стиль,
чем лёгкие `border border-old-money-200` в календаре и тулбаре.
Страница выглядит как из другого дизайна.

**Файл:** `frontend/src/pages/DogProfile.tsx`

**Решение:** Привести шапку профиля к стилю `PageToolbar`:
`border border-old-money-200/80 bg-cream-100/70` вместо `border-2 border-old-money-200 shadow-md`.
Внутренние блоки статистики — оставить `border-2` для акцента дисциплины (forest/warm-blue).

---

## Порядок работ

### Фаза 1 — Быстрые правки (высокий эффект, низкий риск)

- [x] **П3** — Заменить `gray-*` на `charcoal-*` в `DogProfile.tsx` ✅ 2026-07
- [x] **П5** — Усилить `TOOLBAR_SEGMENT_ACTIVE` в `lib/toolbar.ts` ✅ 2026-07
- [x] **П2** — Удалить мёртвый `.home-ranking-tab` из `index.css` (`Home.tsx` уже на `ToolbarSegmentControl`) ✅ 2026-07

### Фаза 2 — Стандартизация

- [x] **П4** — Зафиксировать правило толщины рамок, пройтись по компонентам ✅ 2026-07
- [ ] **П8** — Облегчить шапку `DogProfile` (отклонено владельцем — шапка выглядит нормально)
- [x] **П6** — Унифицировать active-стиль Nav ✅ 2026-07

### Фаза 3 — Токены (требует осторожности)

- [x] **П1** — Аудит всех мест смешения CSS-переменных и Tailwind-классов ✅ 2026-07 (TSX файлы обновлены, CSS vars для homepage оставлены осознанно)
- [x] **П7** — Заменить произвольные `rounded-[Npx]` на стандартные ✅ 2026-07 (произвольных значений в TSX нет, в CSS оставлены осознанно)

> ⚠️ **П1 и П7** — затрагивают много файлов. Делать отдельными коммитами,
> проверять визуально после каждого файла.

---

## Что НЕ трогать

- `.hero-dashboard`, `.pod-card`, `.donino-home-*` в `index.css` — осознанное решение,
  главная намеренно смешивает CSS и Tailwind
- Цветовое кодирование дисциплин (forest / warm-blue / blue / rose) — работает хорошо
- Hover-анимации карточек (`translateY` + `border-color` + `box-shadow`) — единообразны
- Dark mode покрытие — полное, не ломать

---

## Связанные файлы

| Файл | Проблемы |
|------|----------|
| `frontend/src/index.css` | П1, П2 (`.home-ranking-tab`) |
| `frontend/tailwind.config.js` | П1 |
| `frontend/src/lib/toolbar.ts` | П5 |
| `frontend/src/components/Nav.tsx` | П1, П6 |
| `frontend/src/components/toolbar/ToolbarSegmentControl.tsx` | П2, П5 |
| `frontend/src/pages/Home.tsx` | П2 |
| `frontend/src/pages/DogProfile.tsx` | П3, П4, П8 |
| `frontend/src/components/ui/Button.tsx` | П4 (нет размера) |
