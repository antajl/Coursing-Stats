# Future Plans — Будущие планы

**Выполненные задачи:** [`archive/01-FUTURE-PLANS-COMPLETED.md`](archive/01-FUTURE-PLANS-COMPLETED.md) · **Changelog:** [`19-CHANGELOG.md`](19-CHANGELOG.md)

Только **открытые** задачи. Реализованное (Breed Archive, PageToolbar, lazy routes и т.д.) — в changelog, не дублировать здесь.

---

## Оптимизация сборки

### Разбиение больших файлов — низкий приоритет

Основное сделано (lazy routes, `manualChunks`, `Nav` вынесен). При необходимости — точечное разбиение тяжёлых страниц.

---

## Документация — низкий приоритет

- Примеры использования локального API ([`05-API-REFERENCE.md`](05-API-REFERENCE.md))
- Статусы результатов / событий — справочник
- ~~Guide для новых разработчиков~~ — [`01-GETTING-STARTED.md`](01-GETTING-STARTED.md), [`20-OPERATIONS.md`](20-OPERATIONS.md), [`08-TESTING.md`](08-TESTING.md)

---

## Тестирование — низкий приоритет

- ✅ Фикстуры парсеров, E2E Playwright, CI e2e, `smoke-api`
- 🔄 In-process Worker-тесты: vitest@4 + `@cloudflare/vitest-pool-workers`
- Расширить E2E для критического функционала
- UI component tests

---

## Мониторинг — низкий приоритет

Логирование ошибок, uptime, алерты, метрики API.

---

## UI / Мобильная адаптация

### Рекорды Донино — точечная проверка 320–375px

Hub готов (2026-07-06). Проверить карточки групп в статистике после изменений.

**Файлы:** `SpeedRecords/index.tsx`, `DoninoStatsColumns.tsx`

---

## Новые разделы

### Вкладка «Сравнение» (собаки / судьи)

Side-by-side: места, очки, скорость, медали или средние оценки судей. **Приоритет:** низкий.

### Профиль собаки — история титулов

Агрегация `results.qualification` на `DogProfile.tsx`. **Приоритет:** низкий.

### PNG-экспорт на `DoninoDogProfile`

Паттерн из `DogProfile.tsx` (`html-to-image`). **Приоритет:** низкий, по запросу.

---

## UI / визуальная согласованность — средний приоритет

**Эталон:** `Events/index.tsx` + `Home.tsx`.

**Остаётся:**
- Два размера контролов фильтров (`h-9` календарь vs `h-12` рейтинг)
- «Матрёшка» контейнеров в hub-страницах
- Типографика таблиц
- EventResults, DoninoDogProfile, JudgeDetail vs календарь
- Home: custom CSS vs Tailwind (опционально)

**Выполнено:** см. [`19-CHANGELOG.md`](19-CHANGELOG.md) (PageToolbar, Nav, Donino visual language, токены).

---

## Аудит турниров (идея)

Скрипт `audit-events`: проверка `calendar/*.json` и `competitions/*.json` на `result_count: 0`, много `total_score: null`. См. ADR в [`19-HISTORY.md`](19-HISTORY.md) → 2026-07-10.

**Приоритет:** средний (контроль качества после варианта A).
