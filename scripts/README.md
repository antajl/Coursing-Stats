# Скрипты для Windows

Папка содержит вспомогательные `.bat` файлы. Запуск двойным кликом или из корня репозитория.

## update-donino.bat

Скачивает свежие данные Донино из Google Sheets → `data/v1/donino/`.

```bat
scripts\update-donino.bat
```

Обновляет:
1. **Замер скорости** (км/ч) → `speed_records.json`  
   `backend/scripts/speed/export-speed-from-sheets.ts`
2. **Бега 350 м** (сек) → `coursing_records.json`  
   `backend/scripts/speed/export-coursing-from-sheets.ts`

После обновления локально смотри `npm run dev`. На прод — `deploy-to-github.bat`.

## Календари на проде (show / hide)

Флаги в `data/v1/ui-flags.json`. Локально (`npm run dev`) календари **всегда** видны. На проде — только если флаг `true`. Протоколы `/event` и `/shows/exhibition` этими скриптами **не** открываются.

| Скрипт | Действие |
|--------|----------|
| `show-calendar-competitions.bat` | Показать календарь соревнований на проде |
| `hide-calendar-competitions.bat` | Скрыть (только локалка) |
| `show-calendar-shows.bat` | Показать календарь выставок на проде |
| `hide-calendar-shows.bat` | Скрыть (только локалка) |

После bat:

```bat
scripts\deploy-to-github.bat "ui: show competitions calendar"
```

Статус без изменений:

```bat
npx tsx scripts/set-public-calendar.ts status
```

## deploy-to-github.bat

Коммит и push в GitHub — CI задеплоит сайт на Cloudflare Pages.

```bat
scripts\deploy-to-github.bat
scripts\deploy-to-github.bat "Описание изменений"
```

- `git add -A` (пути из `.gitignore` не попадают)
- коммит с сообщением (по умолчанию: `Update Donino records from Google Sheets`)
- если нечего коммитить — пушит текущую ветку
- `git push` без `--force`
- CI: `build-all-data` → Pages → https://coursing-stats.ru

## start-servers.bat

```bat
scripts\start-servers.bat
```

Запускает `npm run dev` (Vite :5173 + admin API :8787).

## Требования

- Node.js 18+ (лучше 22)
- `npm install` в корне (bat сделает сам при необходимости)
- для push — настроенный `git remote`
