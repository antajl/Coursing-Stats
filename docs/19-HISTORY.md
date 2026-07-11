# History — Архитектурные решения (ADR)

Записи **почему** приняты ключевые решения. Хронология изменений (что сделано) — в [`19-CHANGELOG.md`](19-CHANGELOG.md).

---

## 2026-07-10 — Вариант A: публичный сайт без календаря и протоколов

### Контекст
Договорённость с владельцем procoursing.ru: не дублировать первичные протоколы публично; оставить агрегаты (рейтинг, судьи, профили), указать источник, разрешить iframe coursing-stats.ru на procoursing.ru.

### Решение
| Область | Прод | Локально (`npm run dev`) |
|---------|------|---------------------------|
| `/competitions` | Рейтинг + Судьи | То же |
| Календарь | Убран | `/admin/calendar` |
| `/event/:id` | Redirect → рейтинг | `/admin/event/:id` |
| Ссылки на протоколы | procoursing.ru | admin routes |

`data/v1/` и индексы **без изменений** — рейтинг/судьи из `competitions/*.json`.

### Урок
Контроль качества данных — локальный календарь, админка, будущий audit-скрипт; по одному рейтингу сломанный турнир не виден.

Changelog: [`19-CHANGELOG.md`](19-CHANGELOG.md) → 2026-07-10

---

## 2026-07-09 — Пустые индексы на проде (CI затирал `indexes/`)

### Симптом
Локально indexes полные; на coursing-stats.ru — `"count": 0`. CDN отдавал 200.

### Причина
`loadCompetitions()` в `load-sqlite.ts` не загружал `results[]` из `competitions/*.json` → CI собирал пустые топы/судей и деплоил поверх git.

### Решение
- Загрузка `results` из competitions; `PRAGMA foreign_keys = OFF` при snapshot
- `build-all-data.ts`: fatal при пустых `top-placement-all` / `judges-summary`
- CI: `static-indexes.test.ts`

### Урок
Индексы = runtime для рейтинга/судей. Проверять `build-all-data` + тест, не только `npm run dev`.

**Процедура:** [`03-DATA.md`](03-DATA.md) → «Диагностика» · [`20-OPERATIONS.md`](20-OPERATIONS.md)

---

## 2026-07-09 — Реорганизация документации

- Плоская `docs/` 00–19; консолидация CONTRIBUTING, SCRIPTS, DATABASE, PARSING
- `DECISIONS-LOG` + `CHANGELOG` → `19-HISTORY` (+ `19-CHANGELOG` с 2026-07-11)
- Исторические файлы → [`archive/`](archive/)

---

## 2026-07-08 — Web Archive Integration

Восстановление 2022–2024 из web.archive.org (49 событий, 2689 results). Парсеры v1/v2 без смены формата runtime JSON.

---

## 2026-07-07 — Публичный прод без Worker (статика CDN)

### Решение
React читает precomputed JSON с `/data/v1/`; Worker **не деплоится** в CI.

### Причина
Cold start Worker + sql.js → пустые экраны. Данные уже на Pages.

### Реализация
`staticData.ts`, Vite `serveDataV1`, `build-derived-indexes` → `indexes/`, `dog-profiles/`.

---

## 2026-07-07 — Runtime на файлах `data/v1/` (без R2)

- Канон: `data/v1/` в git → CDN
- D1 только импорт
- R2 отклонён
- Админка: `sync-sqlite-to-v1` → git push

---

## 2026-07-07 — Edge cache, архив, cron, SEO

- Edge cache на Worker — legacy, не прод с 2026-07-07
- `export-archive` → `data/archive/snapshots/`
- `update-db.yml` — manual only; Donino cron 4×/день
- Sitemap на Pages; favicon для краулеров

---

## 2026-07-06 — Owner marks

Список кличек только во фронтенде (`ownerMarks.ts`); **нет** связи Донино ↔ соревнования в D1. Редактировать только по явной просьбе владельца.

---

## 2026-07-05 — Ребрендинг

Coursing Stats, coursing-stats.ru, GitHub antajl/Coursing-Stats. procoursing.ru — внешний источник, не ребрендить.

---

## 2026-07-04 — Админ-интерфейс

Локальная админка для исторических правок; `ADMIN_API_TOKEN`. OCR отложен — ручной ввод надёжнее.

---

## 2026-07-12 — Индекс CS для рейтинга «по очкам»

**Проблема:** сортировка по `best_score` (сумма протокола) завышала собак с 3 судьями; чистая «лучшая оценка» или «средняя» давала одноразовых лидеров.

**Решение:** составной **`rating_score` (индекс CS)** в `top-score-*.json`:
- сглаженная средняя оценка судей (prior 85, shrink k=12);
- + до 0,6 за пик (`best_judge_score` выше сглаженной);
- + до +2 за опыт (`min(2, 0,5×log₂(старты+1))`).
- `total_score` в формулу **не входит**; на карточке показывается как «Сумма (протокол)».

**2026-07-12 (уточнение):** cap `E = min(2, …)`; `P = 0` при B ≤ μ̃; prior=85 — округление между median (~83,4) и p75 (~85,7), не точный перцентиль; n — число оценок судей; курсинг и БЗМП — одна шкала (эмпирика: средние 83,9 vs 82,7); **CS v1** — prior/k фиксированы в коде, не пересчитываются при каждой сборке (см. `/guide`).

Код: `backend/lib/rating/coursing-rating-score.ts`, `build-derived-indexes.ts` → `attachScoreMetrics`. UI: подсказка ⓘ у переключателя «очки», справка `/guide` → «О сайте».

Changelog: [`19-CHANGELOG.md`](19-CHANGELOG.md) → 2026-07-12

---

## 2026-06-26 — Два независимых рейтинга

**Медали (места)** и **очки** — отдельные формулы и UI-вкладки. Не сводить в одну метрику. `total_score` = `grand_total` без деления на судей.

---

## 2026-06-26 — Донино: два источника

`speed_records` (км/ч, Google Sheet) ≠ `coursing_records` (350 м, сек). Не смешивать в одной таблице/API.

---

## Ранее

- Парсинг procoursing.ru (windows-1251)
- Cloudflare Worker + D1 (импорт)
- Pages для SPA
