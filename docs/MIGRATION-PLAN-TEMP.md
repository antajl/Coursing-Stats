# План миграции data/v1

> **Временный файл.** Актуальная схема: [`LOCAL-DATA.md`](LOCAL-DATA.md)

## Цель

**Стабильный прод:** push в GitHub → Cloudflare автоматически обновляет сайт со всеми данными.

**Приоритеты:** стабильность > полнота данных > скорость cold start.  
Переключения на сайте (год, порода, вкладки) — без лагов.

---

## Выбранная архитектура (2026-07-07)

### Источник правды
`data/v1/*.json` в git — единственное, что вы правите (вручную или через агента).

### Деплой (одна кнопка = push в main)
```
git push main
  → CI: build-all-data
      1. JSON → pc-db.sqlite (derived, для SQL routes)
      2. indexes (топы, судьи)
      3. копия всего data/v1 на Pages
      4. pc-db.sqlite.gz + snapshot-latest.json
  → Deploy Pages (фронт + data/v1/)
  → Deploy Worker (без --var, без bash heredoc)
```

### Prod Worker
| Данные | Откуда |
|--------|--------|
| Donino speed/coursing | `donino/*.json` с CDN |
| Топы по году, судьи (без фильтров) | `indexes/*.json` |
| Календарь, результаты, профили | in-memory DB из `pc-db.sqlite.gz` |
| Cold start | ~1–2 сек OK; дальше кэш Worker |

### Dev
`npm run dev` — JSON с диска, better-sqlite3. Admin → sync в JSON.

---

## Фазы

### Фаза 1 — Стабильный деплой ✅
- [x] `package-pages-snapshot.ts` (без bash)
- [x] `speed_records.json` в git
- [x] Убрать `DATA_SNAPSHOT_HASH` из wrangler deploy
- [x] `static-data.ts` без `node:fs` (чинит Deploy Worker)
- [x] Копия всего JSON tree на Pages
- [x] Admin → JSON sync, dev freshness, cron speed → data/v1

### Фаза 2 — Производительность ✅ (базово)
- [x] `build-derived-indexes.ts`
- [x] Fast path: top/judges/speed/coursing из JSON
- [ ] `top-speed-{year}.json`
- [ ] Тесты parity indexes vs SQL

### Фаза 3 — Упростить Worker (долгосрочно)
- [ ] Убрать sql.js: routes читают JSON напрямую
- [ ] Cron coursing → data/v1
- [ ] Опционально R2 для data-only deploy

### Фаза 4 — Парсеры → JSON напрямую
- [ ] Без D1 как промежуточного слоя

---

## Что пошло не так раньше (уроки)

| Проблема | Причина |
|----------|---------|
| Deploy #143 | bash heredoc в CI |
| Deploy #144 | `speed_records.json` в .gitignore |
| Deploy #145 | `node:fs` в Worker bundle (`static-data.ts`) |
| Пустые замеры на проде | старый Worker + сломанный deploy |
| Слишком сложно | 3 слоя (D1, JSON, sqlite) без sync loop |

---

## Чеклист «всё работает»

- [ ] GitHub Actions Deploy — зелёный
- [ ] `/api/stats` → 389 events, 191 speed
- [ ] `/api/speed-records` — непустой
- [ ] Календарь, результаты, топы, профили собак
- [ ] Удалить этот файл, перенести итог в LOCAL-DATA.md

---

*Обновлено: 2026-07-07*
