# CDN publish slim + data layers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Уложиться в лимит Cloudflare Pages (20k файлов), сохранить быстрый UX (календари/рейтинги/профили мгновенно), а тяжёлые протоколы выставок единообразно отдавать из Turso; склеивать JSON только по осмысленным категориям.

**Architecture:** Два слоя с одной схемой: канон (git `data/v1` + Turso для RKF-протоколов) → publish (`copy-data` → CDN «горячее», Turso «холодное»). Не класть на Pages то, что сайт не читает. Паки (шарды) — отдельными фазами по категориям, не «склеить всё подряд».

**Tech Stack:** `frontend/scripts/copy-data.js`, `verify-publish-gates.ts`, Turso `exhibitions_rkf`, Vite/Pages, yarn.

## Global Constraints

- Публичный сайт: CDN JSON для списков/календарей/рейтингов; Turso для RKF exhibition protocols (ADR-009).
- Cloudflare Pages: ≤20 000 файлов; ≤~25 MB на файл.
- Не платный R2 / не второй CF-аккаунт / не «всё только в Turso».
- Склеивание только по категориям, где много мелких файлов одной сущности.
- `PUBLISH_EXCLUDE_PATTERNS` и `copy-data.js` EXCLUDE должны совпадать по смыслу.
- Коммиты только по просьбе пользователя (кроме явного «делай/пуш»).
- PowerShell: `;` не `&&`.

## How the user should read phases

| Фаза | Что это | Зачем |
|------|---------|--------|
| **A** | Перестать **деплоить** лишнее на Pages | Сразу −тысячи файлов, сайт не хуже |
| **B** | Склеить в паки **по категориям** (профили, судьи, …) | Ещё слоты + чуть проще кэш |
| **C** | Документ «канон / CDN / Turso» + при желании сильнее канон в SQL | Чтобы не путаться |

Фаза A **не удаляет** файлы из GitHub сама по себе — только из бандла Pages. Удаление из git — отдельное решение.

---

### Task 1 (Phase A): Exclude `dogs/by-id` from Pages copy

**Files:**
- Modify: `frontend/scripts/copy-data.js`
- Modify: `backend/scripts/publish/verify-publish-gates.ts` (`PUBLISH_EXCLUDE_PATTERNS`)
- Test: `backend/tests/publish-exclude.test.ts` (новый)

**Why safe:** фронт читает `indexes/dog-profiles/{id}.json`, не `dogs/by-id/`. by-id нужен билдам/импорту в git.

- [x] **Step 1:** Добавить паттерн `dogs/by-id` в оба exclude-списка
- [x] **Step 2:** Тест: `shouldExclude('dogs/by-id/1.json') === true`, `shouldExclude('indexes/dog-profiles/1.json') === false`
- [x] **Step 3:** `node frontend/scripts/copy-data.js` → в `frontend/public/data/v1` нет `dogs/by-id`

---

### Task 2 (Phase A): Stop shipping bulk `shows/exhibitions/*`; keep LC allowlist from `shows/index.json`

**Files:**
- Modify: `frontend/scripts/copy-data.js` — exclude dir `shows/exhibitions`, затем copy only paths from `shows/index.json`
- Modify: `PUBLISH_EXCLUDE_PATTERNS` — `shows/exhibitions` (bulk); allowlist copy is post-step
- Optional: ослабить JSON fallback в `exhibitions-adapter` / оставить для allowlist only

**Why:** RKF протоколы — Turso; ~91 LC пути в `index.json` остаются на CDN.

- [x] **Step 1:** Smoke Turso (прод или `.env`): 3–5 exhibition id открываются
- [x] **Step 2:** Implement exclude + allowlist copy
- [x] **Step 3:** После copy: `exhibitions/` в public содержит только index-referenced files (~91), не ~5k (`87` present + `4` missing)
- [ ] **Step 4:** Deploy + ручная проверка `/shows` calendar, ranking, 2 LC, 2 RKF exhibition, `/dog/:id`, `/event/:id`

---

### Task 3 (Phase A): Document publish file budget

**Files:**
- Modify: `docs/sheets/02-data-pipeline.md` — таблица «что на Pages / что нет»
- Create: plan уже здесь

- [x] **Step 1:** Записать ожидаемый count после A (~10–12k data files + prerender dogs/events) — факт copy: **10013** files in public/data/v1

---

### Task 4 (Phase B): Pack `dog-profiles` by category (sport dog profiles only)

**Files:** build-derived dog-profiles writer + `frontend` loaders (`dogs.ts`, hooks)

**Design:** шарды по `id % N` или prefix; **не** смешивать с show-dogs. Один запрос = один пак или точечный файл — выбрать после дизайна API.

- [ ] Spec shard layout + migrate reader
- [ ] Keep backward-compatible fallback during rollout

---

### Task 5 (Phase B): Pack `shows/indexes/judge-details`

Отдельная категория (судьи выставок ≠ спорт). Не смешивать с dog-profiles.

---

### Task 6 (Phase B, optional): Укрупнить `shows/indexes/search` только если p50 мелкие и UX не страдает

---

### Task 7 (Phase C): ADR/sheet «Data layers»

Явная таблица: канон git vs Turso vs CDN packs. Без обязательного «всё в SQL».

---

### Task 8 (Optional, user-driven): Remove bulk exhibitions from **git**

Отдельно от Pages: `git rm` тысяч JSON уменьшает clone, но ломает локальные скрипты, если они ждут файлы на диске. Делать только после Task 2 стабилен на проде + подтверждение пользователя.

---

## GitHub vs Pages — важное

| Место | Что происходит при push |
|-------|-------------------------|
| **GitHub git** | Файлы **удаляются из текущего дерева**, только если в коммите есть deletion (`git rm`). Иначе старые JSON **остаются в репо навсегда** (и в истории). |
| **Cloudflare Pages** | Каждый деплой = **новый** `dist`. Чего нет в новом бандле — **нет на сайте**. Старый деплой не копит файлы. |
| **copy-data exclude** | Файлы могут жить в git, но **не попасть** на Pages → лечит лимит 20k без `git rm`. |

Пользовательская интуиция «на GitHub только прибавляются» — верна **пока никто не коммитит удаления**. Для лимита Pages достаточно exclude; чистка git — по желанию.

## Out of scope

- R2, второй CF-аккаунт, полный SSR Worker
- Склеивание competitions/ или exhibitions в один CDN JSON
- Удаление `dogs/by-id` из git (нужны импортам)
