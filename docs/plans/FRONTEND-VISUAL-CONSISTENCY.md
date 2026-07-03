# План: визуальная согласованность UI

> Аудит интерфейса (2026-07-03): шапка, главная, вкладки Procoursing и Донино, подвкладки, фильтры, таблицы.
> **Эталон плотности и форм:** `Events/index.tsx` (календарь) + обновлённая `Home.tsx`.

## Не в этом плане (быстрые правки «на ходу»)

Следующее можно сделать за минуты — **не выносим в отдельные задачи**, правим по мере касания файла:

| Что | Где | Статус |
|-----|-----|--------|
| Лишний внутренний `p-4` | `Events`, `TopDogs`, `Judges` внутри `Procoursing.tsx` | ✅ убран верхний padding в hub |
| Emoji в chip «Чемпионаты» | `Events/index.tsx` | ✅ `Icons.championship` |
| Nav layout / glass | `Nav.tsx` | ✅ `.nav-glass`, центр ссылок, края лого/иконок |
| FilterSelect подписи | `Events/index.tsx` | ✅ подсказки в `allLabel`, `ariaLabel` |
| `FilterSelect` options в dark | `index.css` | открыто |

---

## Контекст: что уже хорошо

- Палитра cream + camel + charcoal узнаваема; дисциплины в календаре цветокодированы (forest / blue / terracotta).
- **Главная** (dashboard): светлый hero, stats strip, подиум с вкладками, Донино по породам — цельный блок.
- **Календарь:** toolbar `h-9`, `rounded-[10px]`, chips `rounded-full`, компактный `FilterSelect` — лучший UX по плотности.
- Тёмная тема в Nav и календаре в целом стабильна.

---

## Проблема №1: три паттерна вкладок

Сейчас coexist:

| Паттерн | Где используется | Active | Inactive |
|---------|------------------|--------|----------|
| Подчёркивание | `Nav.tsx` | camel line снизу | серый текст |
| Segmented (iOS) | `Procoursing.tsx`, `SpeedRecords/index.tsx` | белая «таблетка» в `old-money-100` ложе | приглушённый текст |
| Camel pill | `TopDogsTabs.tsx`, `SpeedRecords/Stats.tsx`, `Home` ranking tabs | `bg-camel-600 text-white` | cream/charcoal кнопки |

**Проблема:** пользователь на каждом уровне видит другой вид переключателя.

### Задача 1.1 — Shared `TabBar` компонент

**Приоритет:** Высокий  
**Оценка:** 1–2 сессии

**Решение (предложение):**

- **Уровень 1–2** (Nav не трогаем; Procoursing, SpeedRecords, вложенные секции с 3+ пунктами): **segmented** — как сейчас в Procoursing.
- **Уровень 3** (переключатели данных: медали/очки, обзор/порода в Stats): **compact pills** (`home-ranking-tabs` стиль) — меньше, без второго «ложа».

**Файлы:**

- Создать `frontend/src/components/ui/TabBar.tsx` (variants: `segmented` | `pills`, sizes: `md` | `sm`)
- Заменить дубли в: `Procoursing.tsx`, `SpeedRecords/index.tsx`, `TopDogsTabs.tsx`, `Home.tsx`, `SpeedRecords/Stats.tsx`

**Критерий готовности:** один источник стилей вкладок; визуально одинаковое поведение active/hover/focus на всех экранах.

---

## Проблема №2: два размера контролов фильтров

| Стиль | Высота | Радиус | Текст | Где |
|-------|--------|--------|-------|-----|
| Компактный (эталон) | `h-9` | `rounded-[10px]` | `text-xs` | Календарь, `FilterSelect` |
| Крупный (legacy) | `h-12` / `py-3` | `rounded-xl` | base | TopDogs, Judges, SpeedRecords таблицы, Stats |

**Проблема:** рейтинг и судьи ощущаются «тяжелее» календаря при том же уровне вложенности.

### Задача 2.1 — Рейтинг: toolbar как у календаря

**Приоритет:** Высокий  
**Файлы:** `TopDogsFilters.tsx`, `TopDogsTabs.tsx` (отступы)

- Поиск и год/порода → `h-9`, `FilterSelect` где возможно.
- Расширенные фильтры оставить в `FiltersDropdown`, но кнопку dropdown привести к `h-9` и стилю календаря.
- Убрать `border-2` у блока фильтров → `border-[1.5px]` или без отдельной карточки (inline toolbar).

### Задача 2.2 — Судьи: те же контролы

**Приоритет:** Высокий  
**Файлы:** `Judges/index.tsx`

- Заменить `h-12` select + label сверху на компактный ряд: `FilterSelect` с `allLabel` / `ariaLabel` (как календарь; `compactLabel` убран).
- Карточку-обёртку фильтров (`border-2 p-4 md:p-6`) упростить до одной строки toolbar.

### Задача 2.3 — Донино (таблицы): фильтры

**Приоритет:** Средний  
**Файлы:** `SpeedTableTab.tsx`, `CoursingTableTab.tsx`

- Кастомные dropdown-кнопки (`py-3 rounded-xl`) → либо `FilterSelect` (одиночный выбор), либо общий `FilterDropdown` с чекбоксами в стиле `h-9`.
- Поиск: `h-9`, `text-xs`, иконка Search как в календаре.

### Задача 2.4 — Донино (статистика)

**Приоритет:** Средний  
**Файлы:** `SpeedRecords/Stats.tsx` (~850 строк)

- Фильтры и подвкладки перевести на shared `TabBar` + компактные контролы.
- По возможности вынести фильтры в отдельный файл `StatsFilters.tsx`.

---

## Проблема №3: «матрёшка» контейнеров

`Procoursing.tsx` и `SpeedRecords/index.tsx` оборачивают контент в:

```
bg-cream-50/90 rounded-2xl shadow-xl border p-4 md:p-8
```

Внутри дочерние страницы снова добавляют `p-4` → двойные отступы, лишняя тень.

### Задача 3.1 — Единая оболочка hub-страниц

**Приоритет:** Средний  
**Файлы:** `Procoursing.tsx`, `SpeedRecords/index.tsx`, дочерние `Events`, `TopDogs`, `Judges`

**Варианты (выбрать один):**

- A) Padding только на обёртке hub; дочерние — `p-0`.
- B) Убрать карточку-обёртку; tab bar sticky под Nav, контент на фоне `App` как у Home.

**Критерий:** одинаковые отступы слева/справа с календарём и главной.

---

## Проблема №4: две (три) серые шкалы и дубли палитры

В проекте параллельно:

- CSS variables: `--om-*`, `--char-*` (`index.css`, Home)
- Tailwind: `old-money-*`, `charcoal-*`, `camel-*`, `om-*`, `char-*` в `tailwind.config.js`

**Проблема:** почти одинаковые оттенки, разные имена → drift при правках.

### Задача 4.1 — Консолидация токенов цвета

**Приоритет:** Низкий (архитектурно), но снижает регрессии  
**Файлы:** `tailwind.config.js`, `index.css`, постепенная замена в компонентах

- Выбрать **один** набор нейтралей (рекомендация: Tailwind `old-money` + `charcoal` для UI, `camel` для акцента).
- Home CSS variables либо маппить на те же токены, либо перевести Home полностью на Tailwind.
- Документировать в `docs/development/FRONTEND-MAP.md` таблицу «семантических» цветов: фон страницы, карточка, border, accent, дисциплины.

---

## Проблема №5: Донино без визуального языка

На главной блок Донино использует `wb-*` (голубой). Внутри `/speed-records` — generic cream/charcoal, как Procoursing.

### Задача 5.1 — Вертикаль «Донино»

**Приоритет:** Средний  
**Файлы:** `SpeedRecords/index.tsx`, `SpeedTableTab.tsx`, `CoursingTableTab.tsx`, `Stats.tsx`, опционально `DoninoDogProfile.tsx`

- Лёгкий акцент `wb-300/600` на borders активных элементов, заголовках секций, ссылках «Все рекорды».
- Не перекрашивать весь экран — только маркеры вертикали (как дисциплины в календаре).
- Tab bar SpeedRecords: опционально variant с `wb` accent вместо нейтрального segmented.

---

## Проблема №6: толщина рамок и тени

Смешение `border-[1.5px]` (календарь, Home) и `border-2` (таблицы, Judges, Stats).

### Задача 6.1 — Design tokens для рамок

**Приоритет:** Низкий  
**Действие:** зафиксировать в гайде: карточки списка `1.5px`, таблицы-контейнеры `1.5px` + `shadow-sm` (не `shadow-md`/`xl` везде). Пройтись по `DogStatsTable`, `Judges`, `Stats`.

---

## Проблема №7: типографика и иерархия

| Элемент | Сейчас | Замечание |
|---------|--------|-----------|
| Заголовки секций Home | serif 22px `.divider h2` | Хорошо |
| Месяцы календаря | serif sticky | Хорошо |
| Hub tab labels | sans semibold | Ок |
| Таблицы | sans, разный размер ячеек | Выравнять `text-sm` / `text-xs` для meta |

### Задача 7.1 — Типографическая шкала

**Приоритет:** Низкий  
**Документ:** добавить в FRONTEND-MAP или отдельный `UI-TOKENS.md`:

- Page title / section title / toolbar / body / meta / mono numbers
- Когда serif (заголовки, чемпионаты), когда sans (данные, фильтры)

---

## Проблема №8: страницы вне hub — отстают от календаря

### Задача 8.1 — EventResults

**Приоритет:** Средний  
**Папка:** `frontend/src/pages/Events/EventResults/`

- Шапка события, карточки результатов — плотность и радиусы как `EventListRow`.
- Проверить dark mode на всех badge и detail panels.

### Задача 8.2 — DogProfile

**Приоритет:** Средний  
**Файл:** `DogProfile.tsx`

- Много секций с разными отступами; унифицировать карточки секций.
- Блоки Донино/бегов — визуально связать с `/speed-records`.

### Задача 8.3 — DoninoDogProfile

**Приоритет:** Низкий  
**Файл:** `DoninoDogProfile.tsx`

- Привести к стилю главной/Донино (`wb` accent, компактные stat chips).

### Задача 8.4 — JudgeDetail

**Приоритет:** Низкий  
**Файл:** `Judges/JudgeDetail.tsx`

- После редизайна списка судей — те же таблицы и фильтры.

---

## Проблема №9: Nav — мелкие несоответствия

Не блокер, но в бэклог:

- Desktop: underline active; mobile menu: pill active — разное поведение (задача 1.1 может не затронуть Nav намеренно).
- Лого `opacity-80` — слегка бледное на cream фоне.
- Кнопки 44×44 (`rounded-lg border-2`) vs toolbar `rounded-[10px] border-[1.5px]` — разный язык форм у utility-кнопок.

### Задача 9.1 — Nav polish (опционально)

**Приоритет:** Низкий  
**Файл:** `Nav.tsx`

- Унифицировать border-radius utility-кнопок с остальным UI (`rounded-[10px]`, `border-[1.5px]`).
- Рассмотреть pill-active и на desktop для согласованности с mobile (или наоборот).

---

## Проблема №10: Home vs остальной сайт

Главная на custom CSS (`.hero-dashboard`, `.stat-chip`); hub-страницы на Tailwind card.

### Задача 10.1 — Сближение Home и hub

**Приоритет:** Низкий  
**Варианты:**

- A) Постепенно перенести классы Home в Tailwind `@layer components`.
- B) Оставить CSS-модуль для Home, но использовать те же токены, что и Tailwind (задача 4.1).

---

## Рекомендуемый порядок работ

```
Фаза 1 (высокий эффект)
  1.1 TabBar shared
  2.1 TopDogs toolbar
  2.2 Judges toolbar
  3.1 Hub padding / оболочка

Фаза 2 (средний)
  2.3–2.4 SpeedRecords фильтры + Stats
  5.1 Donino visual language
  8.1 EventResults

Фаза 3 (низкий / фон)
  4.1 Цветовые токены
  6.1 Рамки и тени
  7.1 Типографика
  8.2–8.4 Профили
  9.1 Nav polish
  10.1 Home CSS → Tailwind
```

---

## Чеклист регрессии после каждой фазы

- [ ] Светлая и тёмная тема на всех затронутых экранах
- [ ] Mobile `< md` — toolbar не ломается на 320px
- [ ] Focus visible на tab и select (календарь уже с ring)
- [ ] `FilterSelect` options читаемы в dark (см. `index.css` `.dark select option`)
- [ ] Не менять цвета дисциплин и логику двух рейтингов (медали ≠ очки)

---

## Связанные документы

- `docs/development/FRONTEND-MAP.md` — структура страниц и вкладок
- `docs/plans/FUTURE-PLANS.md` — общий бэклог (п. 22 — ссылка сюда)
- `CLAUDE PLAN/` — HTML-макеты (ориентир для Home; hub-страницы ближе к календарю)
