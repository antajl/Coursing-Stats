# Локальная база v1

Каноническое хранилище для сайта без D1 в runtime.

**Сборка:** `npm run export-local-data` (см. `docs/LOCAL-DATA-PLAN.md`).  
**Локальный dev:** `npm run dev` загружает эти файлы в память (~0.5 с) и отдаёт тот же API.

| Путь | Содержимое |
|------|------------|
| `manifest.json` | версия, дата, счётчики |
| `calendar/{year}.json` | события года; `results_file` → competitions |
| `competitions/...` | один JSON на турнир с `event` + `results[]` |
| `dogs/by-id/`, `dogs/by-key/` | профили собак |
| `donino/` | рекорды Донино (отдельно от procoursing) |
| `indexes/` | быстрый поиск для UI и ИИ |

Правка одного турнира = один файл в `competitions/`, без затрагивания остальных.

**Прод:** `npm run build-data-snapshot` → `pc-db.sqlite` копируется на Pages → Worker читает по URL (без R2).
