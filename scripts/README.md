# Скрипты для Windows

Папка содержит вспомогательные `.bat` и `.ts` файлы для автоматизации. Запуск двойным кликом или из корня репозитория.

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

После обновления локально проверяется через `yarn run dev`. Отправка на прод — через `git push origin main`.

## Управление публичными календарями

Флаги доступности календарей на проде хранятся в `data/v1/ui-flags.json`. Локально (`yarn run dev`) календари **всегда** видны разработчику. На проде — только если соответствующий флаг установлен в `true`.

```bash
# Проверить статус публичных календарей:
npx tsx scripts/set-public-calendar.ts status

# Включить/выключить спортивный календарь:
npx tsx scripts/set-public-calendar.ts competitions enable
npx tsx scripts/set-public-calendar.ts competitions disable

# Включить/выключить выставочный календарь:
npx tsx scripts/set-public-calendar.ts shows enable
npx tsx scripts/set-public-calendar.ts shows disable
```

## start-servers.bat

```bat
scripts\start-servers.bat
```

Проверяет зависимости через `yarn install` и запускает локальный dev-сервер (`yarn run dev` на Vite `:5173`).

## Требования

- Node.js 18+ (рекомендуется 20–22)
- Пакетный менеджер: **yarn@1.22.22**
- Для push — настроенный `git remote origin`
