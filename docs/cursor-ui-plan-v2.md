# Coursing Stats — план UI-исправлений v2

Составлен на основе двух последовательных аудитов v0 (реальный браузер, продакшн-API,
мобильный 375px + десктоп 1440px, светлая + тёмная тема).

**Обновлено:** 2026-07-06 — ядро P0–P3 выполнено; ниже § «Дополнения v2.1» и «Осталось».

> **Не путать с `FUTURE-PLANS.md`:** там долгосрочная визуальная согласованность (TabBar, EventResults hub, токены). Этот файл — только задачи аудита v0 и их прямые доработки.

Выполняй блоки строго по порядку приоритета. После каждого блока — `npm run build`
и скриншот мобильного вида на 375px (светлая тема).

---

## Статус: ядро v2 (P0–P3) — ✅ выполнено

| ID | Задача | Статус |
|----|--------|--------|
| P0-A | Обрезка кличек в `DogCard` | ✅ |
| P0-B | Эмодзи-медали → `MedalTally` | ✅ |
| P1-A | Вкладки Competitions на мобиле | ✅ (`ToolbarSegmentControl`) |
| P1-B | Порядок подиума на мобиле | ✅ (`order-first sm:order-none`) |
| P1-C | Битые превью скриншотов | ✅ (v2.1-I — кнопка «Скрин») |
| P1-D | Числовые префиксы в судьях | ✅ (`judges.ts`) |
| P2-A | Вкладки рейтинга + сортировка | ✅ (`PageToolbar` flex-col на мобиле) |
| P2-B | Сворачивание истории Донино в профиле | ✅ |
| P2-C | Клички в результатах события | ✅ (`DogNameLink`) |
| P2-D | `items-start` в grid профиля | ✅ |
| P2-E | Расхождение годов Hero / StatsStrip | ⏭ не актуально — 2015–2026 оставляем |
| P3-A | Eyebrow Hero на мобиле | ✅ (`whitespace-nowrap` + v2.1-H h1) |
| P3-B | Overlay мобильного меню | ✅ |
| P3-C | Count-up при загрузке статистики | ✅ (мгновенное значение при первом показе) |

**Уже было до плана:** `MedalTally` на главной, `PageToolbar`, профили Донино, SEO Donino.

---

## Блок P0 — Главные блокеры

### P0-A. Обрезка кличек в рейтинге собак ✅

**Файл:** `frontend/src/components/DogCard.tsx`

**Проблема:** `truncate` + фиксированные чипы `min-w-[70px]` → на 375px клички неразличимы.

**Решение:** две строки на мобиле (`flex-col sm:flex-row`), `break-words` / `line-clamp-2`, убрать `min-w-[70px]`.

---

### P0-B. Эмодзи-медали ✅

**Файлы:** `DogCard.tsx`, `DogProfile.tsx`, `DogTooltip.tsx`

**Решение:** `MedalTally` вместо 🥇🥈🥉. `Home.tsx` уже использовал `MedalTally`.

---

## Блок P1 — Важные проблемы

### P1-A. Вкладки «Соревнования» на мобильном ✅

**Файл:** `frontend/src/pages/Competitions.tsx`

**Было:** `flex-col` — три кнопки столбиком.

**Стало:** `ToolbarSegmentControl` в `overflow-x-auto`.

---

### P1-B. Подиум на мобиле ✅

**Файл:** `frontend/src/pages/Home.tsx` — `order-first sm:order-none` на золотой карточке.

---

### P1-C. Скриншоты в рекордах Донино ✅

Скриншоты — внешние ссылки, не `<img>`. В `SpeedRecordCard` колонка с иконкой заменена на кнопку «Скрин» (v2.1-I).

---

### P1-D. Числовые префиксы в судьях ✅

**Файл:** `backend/src/routes/judges.ts` — `parseJudgeNames`.

---

## Блок P2

### P2-A ✅ `PageToolbar.tsx` — flex-col на мобиле для сегментов и сортировки.

### P2-B ✅ `DogProfile.tsx` — история Донино: 5 + «Показать все».

### P2-C ✅ `DogNameLink.tsx` — `break-words`.

### P2-D ✅ `DogProfile.tsx` — `items-start` на grid.

### P2-E ⏭ Годы не меняем (2015–2026).

---

## Блок P3

### P3-A ✅ `Hero.tsx` + `index.css` — eyebrow `whitespace-nowrap`, h1 responsive (v2.1-H).

### P3-B ✅ `Nav.tsx` — overlay `bg-black/40`.

### P3-C ✅ `StatCounter.tsx` — без анимации 0→N при первом показе.

---

## Что НЕ трогать

- `PodiumRankMark.tsx`, `PlacementBadge.tsx`, логику `MedalTally.tsx`
- Палитру, шрифты, тёмную тему
- Бизнес-логику API (кроме `parseJudgeNames`)

---

## Дополнения v2.1 — после первого прохода (2026-07-06)

Задачи из того же редизайна, выявленные при приёмке P1-A и обходе hub-страниц. **Не из FUTURE-PLANS.**

| ID | Задача | Статус |
|----|--------|--------|
| v2.1-A | Выравнивание вкладок и контента в hub «Соревнования» | ✅ |
| v2.1-B | Рекорды Донино: те же вкладки, что Competitions | ✅ |
| v2.1-C | История соревнований в профиле: кликабельная плашка | ✅ |
| v2.1-D | Donino-карточки — кличка без `truncate` | ✅ |
| v2.1-E | Профиль — сворачивание истории соревнований | ✅ |
| v2.1-F | EventResults — фон как у профиля | ✅ |
| v2.1-G | DoninoHomeRecordRow — перенос клички | ✅ |
| v2.1-H | Hero h1 на узком экране (375px) | ✅ |
| v2.1-I | SpeedRecordCard — кнопка «Скрин» вместо пустого слота | ✅ |

### v2.1-A. Hub «Соревнования» — вкладки не «вылазят» влево ✅

**Проблема:** `ToolbarSegmentControl` без лишнего padding, а вложенные вкладки добавляли свой `px-4`.

**Файлы:** `Events/index.tsx`, `TopDogs/index.tsx`, `Judges/index.tsx` — убран лишний горизонтальный padding в embedded-режиме.

### v2.1-B. Рекорды Донино — `ToolbarSegmentControl` ✅

**Файл:** `SpeedRecords/index.tsx` — сегменты «Замер» | «Бега 350 м».

### v2.1-C. Профиль — кликабельная плашка истории ✅

**Файл:** `DogProfile.tsx` — вся карточка события ведёт на `/event/:id`, без «Результаты →».

### v2.1-D. Donino-карточки — кличка без `truncate` ✅

**Файлы:** `SpeedRecordCard.tsx`, `CoursingRecordCard.tsx` — `break-words` + `line-clamp-2`, мобильная двухрядная раскладка (как P0-A).

### v2.1-E. Профиль — сворачивание истории соревнований ✅

**Файл:** `DogProfile.tsx` — курсинг/БЗМП и бега: 5 стартов + «Показать все N стартов».

### v2.1-F. EventResults — фон как у профиля ✅

**Файл:** `Events/EventResults/index.tsx` — убраны `min-h-screen bg-cream-50` и рамка.

### v2.1-G. DoninoHomeRecordRow — перенос клички ✅

**Файл:** `DoninoHomeRecordRow.tsx` — `break-words` + `line-clamp-2`.

### v2.1-H. Hero h1 — обрезка на 375px ✅

**Проблема:** заголовок «Статистика курсинга…» обрезался справа на узком экране (P3-A закрыл только eyebrow).

**Файл:** `frontend/src/index.css` — `min-width:0` на `.hero-intro`, `overflow-wrap` + `text-wrap:balance` на h1; 28px ≤860px, 23px ≤480px.

### v2.1-I. SpeedRecordCard — скриншот как кнопка ✅

**Проблема:** колонка с иконкой `Image` выглядела как битое превью (follow-up к P1-C).

**Файл:** `SpeedRecordCard.tsx` — иконка + подпись «Скрин», внешняя ссылка без изменений. `CoursingRecordCard` скриншотов не имеет.

---

## Осталось по v2.1

Все пункты v2.1-A … v2.1-I выполнены (2026-07-06).

Долгосрочное (календарь → `PageToolbar`, Shared TabBar) — **не сюда**, см. `FUTURE-PLANS.md`.

---

## Открыто вне этого плана

`docs/FUTURE-PLANS.md` §23 — PNG-экспорт на `DoninoDogProfile`.

---

## Порядок (исходный) — выполнен 2026-07-06

```
P0-A → P0-B → P1-A → P1-B → P1-D → P2-* → P3-*
```

Исключения: P2-E (не актуален). P1-C и P3-A доработаны в v2.1-I / v2.1-H.
