# Локальная база v1

Каноническое хранилище для сайта. **Публичный прод** читает эти файлы с CDN (`/data/v1/`).

**Источник правды:** эти файлы в git.  
**После парсинга в локальную SQLite:** `npm run sync-sqlite-to-v1`.  
**Пересборка индексов:** `npm run build-all-data`.  
**Локальный dev:** `npm run dev` — Vite отдаёт `/data/v1/` с диска; админка на `:8787`.

| Путь | Содержимое |
|------|------------|
| `manifest.json` | версия, дата, счётчики |
| `calendar/{year}.json` | события года; `results_file` → competitions |
| `competitions/...` | один JSON на турнир с `event` + `results[]` |
| `dogs/by-id/`, `dogs/by-key/` | карточки собак (ссылки на турниры) |
| `donino/` | рекорды Донино (отдельно от procoursing) |
| `indexes/` | precomputed: топы, судьи, `dog-profiles/`, `years.json` |

Правка одного турнира = один файл в `competitions/`, без затрагивания остальных.

Новые собаки появляются при `sync-sqlite-to-v1` или правке `dogs/` вручную, затем `build-all-data`.

**Прод:** `git push main` → CI `build-all-data` → Cloudflare Pages.
