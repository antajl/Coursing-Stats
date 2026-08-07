# Зачёт сезона (B) + спокойный UI рейтинга — финальный план

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Единый список курсинг/БЗМП отвечает на вопрос «кто лучше выступил в срезе (сезон/карьера)»; места считаются по медальному зачёту со сглаживанием к стартам, без участия Elo в сортировке; первый взгляд на карточку — медали и старты, Elo/CS видны, но вторичны.

**Architecture:** Фронт мержит `top-placement` + `top-score` + `top-elo` в `buildCombinedRanking`, сортирует каскадом достижений. Карточка `DogCard` type `combined` остаётся одной на рейтинг и главную; визуальная иерархия сдвигается на медали. Рейсинг справа не трогаем. Отдельный блок-подиум не делаем — топ‑3 уже с badge-картинками + лёгкий акцент рамки/фона.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, CDN JSON `data/v1/indexes/top-*-{year}.json`.

---

## Product lock (зафиксировано с пользователем)

| Тема | Решение |
|------|---------|
| Вопрос списка | **B — зачёт / достижения**, не predictive «сила» |
| Сортировка | **B:** `standingScore = medalStrength / (starts + 4)` → CS → старты → dog_id |
| medalStrength | `3×gold + 1×silver + 0.5×bronze` |
| Elo в sort | **Нет** |
| standing формула | Без prior в числителе (иначе вспышки 1/1) |
| Слабое поле | Принимаем: много медалей = хороший зачёт B |
| Общий список | **Есть** (все породы); порода — обычный фильтр, не обязательный gate |
| Подиум-блок | **Нет**; топ‑3: существующие картинки мест + акцентная рамка/фон строки |
| Карточка списка | Крупно: медали + «N стартов»; **Elo и CS остаются**, но **менее заметны** (вторичный стиль) |
| ⓘ / сноска | «Как рассчитывается зачёт сезона» у заголовка колонки (без ссылки в Справочник в тултипе) |
| Главная | **Те же карточки и та же сортировка**, что рейтинг |
| Рейсинг | **Не трогаем** |
| Фото собак | Нет в данных — не планируем |
| CS formula / Elo pipeline | Не меняем (`cs-v1`, `elo-v2`) |
| Коммиты | Только по просьбе пользователя |

### Формула standing (B, зафиксировано)

```ts
export const STANDING_SHRINK_K = 4
export const STANDING_MIN_GAP = 0.12
export const CS_TIE_GAP = 0.5

export function medalStrength(dog) {
  return (dog.gold ?? 0) * 3 + (dog.silver ?? 0) * 1 + (dog.bronze ?? 0) * 0.5
}

export function standingScore(dog) {
  const starts = Math.max(0, dog.total_starts ?? 0)
  return medalStrength(dog) / (starts + STANDING_SHRINK_K)
}
```

Сорт: `|Δ standing| > 0.12` → standing; иначе CS (`> 0.5`); иначе старты; иначе `dog_id`.

На карточке **не** показываем сырой standingScore — медали + старты; Elo/CS muted.

---

## Как выглядит страница (без отдельного подиума)

```
[ Фильтры: сезон | порода | поиск … ]

Курсинг/БЗМП          Зачёт сезона  ⓘ          |  Рейсинг (как сейчас)
───────────────────────────────────────────────|─────────────────────
┌ акцент ───────────────────────────────────┐  |  …
│ 🏅1  Кличка          🥇5 🥈2 🥉1           │  |
│      порода · год    7 стартов            │  |
│                      elo · cs  (мелко)    │  |
└───────────────────────────────────────────┘  |
  🏅2  … (акцент)                              |
  🏅3  … (акцент)                              |
  4    … обычная строка                        |
  …                                            |
```

ⓘ текст: медали + эффективность (меньше стартов при том же наборе); CS — тай-брейк; Elo — сила через соперников, не место.

---

## File map

| File | Responsibility |
|------|----------------|
| `frontend/src/lib/eloRank.ts` → лучше переименовать в `seasonStanding.ts` (или оставить файл, сменить содержимое) | `medalStrength`, `standingScore`, пороги |
| `frontend/src/pages/TopDogs/mergeCombinedRanking.ts` | merge + новый sort; убрать Elo-trust cascade |
| `frontend/src/pages/TopDogs/mergeCombinedRanking.test.ts` | unit-тесты сортировки |
| `frontend/src/components/DogCard.tsx` | иерархия: медали главные; Elo/CS secondary; акцент top‑3 |
| `frontend/src/pages/TopDogs/CoursingRatingHint.tsx` | текст зачёта B |
| `frontend/src/pages/Guide/components/RatingTab.tsx` | то же в Справочнике |
| `frontend/src/pages/TopDogs/TopDogsColumns.tsx` | подпись «Зачёт сезона» + ⓘ |
| `frontend/src/pages/Home/components/SeasonCompetitionsCarousel.tsx` | подпись + те же карточки |
| `frontend/src/pages/Home/hooks/useHomeData.ts` | комментарий; уже через `buildCombinedRanking` |
| `.cursor/skills/competitions-domain/SKILL.md` | обновить правило единого списка |

> ~~`tasks/season-standing-dryrun.mjs`~~ — одноразовый dry-run, удалён после sign-off (не в git).


**Не трогать:** racing column, CS formula backend, Elo generate scripts, show domain.

---

## Global Constraints

- PowerShell: `;` не `&&`.
- Не смешивать медали и CS в одно взвешенное число.
- Не менять `cs-v1` / `elo-v2` формулы.
- Коммиты только по запросу пользователя.

---

### Task 0: Dry-run порядка (sign-off до кода UI) — ✅ done, скрипт удалён

**Files:**
- ~~`tasks/season-standing-dryrun.mjs`~~ (временный; удалён после выбора формулы B)

**Interfaces:**
- Consumes: `data/v1/indexes/top-placement-2026.json`, `top-score-2026.json`, `top-elo-2026.json`
- Produces: топ-10 салюков (+ опционально уиппет / риджбек) для трёх порядков: текущий / standing / сырой medalStrength

- [x] **Step 1:** Скрипт печатал place, name, G/S/B, starts, standingScore, CS, Elo.
- [x] **Step 2:** Dry-run на салюках 2026.
- [x] **Step 3:** Пользователь выбрал **B** (`standingScore = medalStrength / (starts+4)`, без prior в числителе).

- [ ] **Step 4:** Записать финальные константы в этот план и в код Task 1.

---

### Task 1: Сортировка зачёта (TDD)

**Files:**
- Create: `frontend/src/pages/TopDogs/mergeCombinedRanking.test.ts`
- Modify: `frontend/src/lib/eloRank.ts` (или `seasonStanding.ts` + обновить импорты)
- Modify: `frontend/src/pages/TopDogs/mergeCombinedRanking.ts`

**Interfaces:**
- Produces: `buildCombinedRanking(placement, score, elo): CombinedRankingDog[]`
- Elo-поля мержатся для UI, **не** участвуют в comparator

- [ ] **Step 1: Падающие тесты**

```ts
import { describe, expect, it } from 'vitest'
import { buildCombinedRanking } from './mergeCombinedRanking'
import { standingScore, medalStrength } from '../../lib/eloRank'

describe('season standing sort', () => {
  it('orders by standingScore, ignoring higher Elo', () => {
    const rows = buildCombinedRanking(
      [
        { dog_id: 1, name_lat: 'Medals', breed: 'x', gold: 5, silver: 0, bronze: 0, total_starts: 8 },
        { dog_id: 2, name_lat: 'EloFlash', breed: 'x', gold: 0, silver: 0, bronze: 0, total_starts: 2 },
      ],
      [
        { dog_id: 1, rating_score: 84, judge_eval_count: 10 },
        { dog_id: 2, rating_score: 90, judge_eval_count: 10 },
      ],
      [
        { dog_id: 1, elo_rating: 1450, elo_races: 20 },
        { dog_id: 2, elo_rating: 1600, elo_races: 20 },
      ]
    )
    expect(rows[0].dog_id).toBe(1)
    expect(rows[1].elo_rating).toBe(1600)
  })

  it('uses CS when standingScores are within gap', () => {
    // одинаковые G/S/B и starts, разный rating_score
  })

  it('counts silver/bronze in medalStrength', () => {
    expect(medalStrength({ gold: 1, silver: 2, bronze: 2 })).toBe(3 + 2 + 1)
  })

  it('does not put low-sample Elo dogs in a separate lower pool', () => {
    // собака с elo_races=2 и кучей медалей выше собаки с elo_races=20 без медалей
  })
})
```

- [ ] **Step 2:** `cd frontend; yarn vitest run src/pages/TopDogs/mergeCombinedRanking.test.ts` → FAIL

- [ ] **Step 3:** Реализовать `standingScore` + `compareSeasonStanding`; удалить `hasTrustedElo` / `ELO_RANK_MIN_GAP` из sort (константы Elo-trust можно удалить или оставить неиспользуемыми до чистки карточки).

- [ ] **Step 4:** Тесты PASS

- [ ] **Step 5:** Commit только по просьбе пользователя

---

### Task 2: DogCard — иерархия «медали главные, Elo/CS тихие»

**Files:**
- Modify: `frontend/src/components/DogCard.tsx`

**Interfaces:**
- `type === 'combined'`: визуал как в макете выше
- Top‑3: лёгкий accent (border-l / bg) **дополнительно** к `RankBadge` картинкам (уже есть для rank≤3)

- [ ] **Step 1:** Медали + старты — основной визуальный блок (текущий размер/контраст или чуть усилить).

- [ ] **Step 2:** Elo и CS — уменьшить: меньший кегль, `text-charcoal-500`, без «кричащего» camel на Elo **или** оба в одном вторичном стиле. Hover-кроссфейд на ср./лучш./Σ — **убрать или оставить только в профиле позже**; на списке не отвлекать (предпочтение: убрать hover-смену, чтобы строка спокойная).

- [ ] **Step 3:** Для `rank <= 3` добавить класс акцента строки, например `border-l-2 border-camel-500/80` или лёгкий `bg-camel-50/40` (в dark — аналог). Не отдельный подиум-компонент.

- [ ] **Step 4:** Убрать бейдж «мало данных» как сигнал «не для места» — либо удалить, либо нейтральная подпись не нужна, если Elo вторичен. Предпочтение: **убрать** trust-бейдж с карточки рейтинга.

- [ ] **Step 5:** Проверить вложенный `variant="embedded"` (рейтинг + главная).

---

### Task 3: Копирайт ⓘ + Guide + подписи колонок

**Files:**
- Modify: `frontend/src/pages/TopDogs/CoursingRatingHint.tsx`
- Modify: `frontend/src/pages/Guide/components/RatingTab.tsx`
- Modify: `frontend/src/pages/TopDogs/TopDogsColumns.tsx`
- Modify: `frontend/src/pages/Home/components/SeasonCompetitionsCarousel.tsx`

- [ ] **Step 1:** Тултип / сноска:

```
Зачёт сезона: места по медалям (золото важнее серебра и бронзы)
с учётом числа стартов. Если зачёт почти равный — индекс CS.
Elo на карточке — сила через соперников; на место не влияет.
```

- [ ] **Step 2:** Подпись колонки: `Зачёт сезона` вместо `Elo / CS / медали`.

- [ ] **Step 3:** Guide — заменить eye-test / Elo-cascade описание на B; Elo описать как справочный показатель на карточке и (позже) в профиле.

- [ ] **Step 4:** `rg "ELO_RANK_MIN_GAP|eye-test|Elo → CS|мало данных" frontend` — почистить устаревшее.

---

### Task 4: Главная = те же карточки

**Files:**
- Modify: `frontend/src/pages/Home/hooks/useHomeData.ts` (убедиться, что slides из `buildCombinedRanking`)
- Modify: `SeasonCompetitionsCarousel.tsx` (подпись Task 3)

- [ ] **Step 1:** После Task 1–2 карусель автоматически получает новый порядок и новый вид `DogCard` — проверить визуально топ слайда.

- [ ] **Step 2:** Ссылка «порода → рейтинг» сохраняет `year` + `breed`.

---

### Task 5: Документация агентам

**Files:**
- Modify: `.cursor/skills/competitions-domain/SKILL.md`
- Modify: этот план — отметить Tasks done

- [ ] **Step 1:** Записать: единый список = зачёт B; Elo не в sort; UI — медали primary, Elo/CS muted.

---

### Task 6 (опционально, позже): Elo/CS в профиле собаки

Сейчас в `dog-profiles/*.json` **нет** `elo_rating` / `rating_score`. На карточке рейтинга они есть из merge индексов.

- [ ] Если захотим богатый блок в профиле — отдельный мини-план: прокинуть поля в build dog-profiles + UI в `CoursingColumn` / header.  
- **Не блокер** этой поставки: на рейтинге Elo/CS уже видны (muted).

---

## Out of scope

- Glicko-2, отдельный режим «Сила (Elo)»
- Проверка сопоставимости курсинг/БЗМП для Elo
- Фото / отдельный олимпийский подиум
- Изменения рейсинга
- Смена формулы CS

---

## Done when

- [ ] Task 0 sign-off на порядок (хотя бы салюки 2026)
- [ ] Vitest `mergeCombinedRanking.test.ts` PASS
- [ ] Список: медали+старты читаются первыми; Elo/CS видны, но тише
- [ ] Топ‑3: badge-картинки + лёгкий акцент строки
- [ ] ⓘ и Guide говорят «зачёт», Elo не двигает место
- [ ] Главная совпадает по карточкам/порядку с рейтингом
- [ ] Рейсинг без регрессий

---

## Self-review

1. Product lock покрыт Tasks 0–5; профиль Elo — Task 6 optional.  
2. Нет отдельного подиума — зафиксировано.  
3. Elo/CS **остаются на карточке** (muted) — обновлено относительно черновика «только профиль».  
4. Имена: `standingScore` / `medalStrength` / `buildCombinedRanking` согласованы.

---

## Execution

Plan file: `docs/superpowers/plans/2026-08-06-season-standing-ranking-b.md`

**Старт:** Task 0 dry-run → sign-off констант → Task 1 сортировка → Task 2–4 UI.

**Варианты:** subagent-driven по задачам или inline в этом чате.
