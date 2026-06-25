# 16. Plan for Improvements — План улучшений проекта

**Обновлено:** 2026-06-25 — все пункты выполнены.

---

## ✅ Приоритет 1: Lint во фронтенде — ВЫПОЛНЕНО

- Fetch-логика перенесена внутрь `useEffect` в `TopDogs.jsx`, `Events.jsx`, `DogProfile.jsx`
- `npm run lint` в `frontend/` — 0 ошибок, 0 предупреждений

---

## ✅ Приоритет 2: Нормализация кличек — ВЫПОЛНЕНО

- `normalizeDogName` / `normalizeBreed` в парсерах coursing, bzmp, racing
- `backend/lib/dog-lookup.mjs` — индекс и поиск с учётом нормализации
- `load-results.mjs`, `reparse-standalone.mjs`, `reparse-coursing-events.mjs` — используют нормализацию
- `migrate-normalize-dog-names.mjs` + `data/migrate-normalize-dogs.sql` — применено на remote D1

---

## ✅ Приоритет 3: CLI merge-dogs — ВЫПОЛНЕНО

```bash
node backend/scripts/merge-dogs.mjs <sourceDogId> <targetDogId>
```

---

## ✅ Приоритет 4: GitHub Actions — ВЫПОЛНЕНО

- `.github/workflows/update-db.yml`
- `backend/scripts/ci-update-db.mjs`
- Secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `npm run ci-update-db`

---

## ✅ Приоритет 5: Пагинация API и UI — ВЫПОЛНЕНО

- API: параметры `limit` / `offset` на `/api/top/placement`, `/score`, `/speed`
  - без `limit` — массив (обратная совместимость)
  - с `limit` — `{ items, total, limit, offset }`
- UI: клиентская пагинация по 50 строк в `DogStatsTable.jsx`
- `api.js` — опциональные `limit` / `offset`

---

## 📋 Следующие задачи (вне исходного плана)

| Приоритет | Задача |
|-----------|--------|
| Средний | Серверная пагинация в `TopDogs` (сейчас поиск по всему набору — клиентская пагинация) |
| Средний | Деплой обновлённого Worker после изменений API |
| Низкий | OCR для результатов 2015–2022 |
| Низкий | Ссылки на родословные (saluki.breedarchive.com) в UI |
