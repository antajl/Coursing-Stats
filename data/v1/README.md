# Локальная база v1

Каноническое хранилище для сайта. **Публичный прод** читает эти файлы с CDN (`/data/v1/`).

**Экспорт из D1:** `npm run export-local-data -- --local` (см. [docs/03-DATA.md](../../docs/03-DATA.md)).  
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

Новые собаки появляются автоматически при `export-local-data` или sync из админки.

**Прод:** `git push main` → CI `build-all-data` → Cloudflare Pages.
