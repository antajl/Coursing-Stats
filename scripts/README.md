# Скрипты для Windows

Папка содержит вспомогательные скрипты для Windows (.bat файлы).

## Доступные скрипты

### start-servers.bat
Запуск локальных серверов для разработки одной командой.

**Использование:**
```bash
scripts\start-servers.bat
```

**Функции:**
- Переходит в корень репозитория и запускает `npm run dev`
- Локальный API (админка) на http://127.0.0.1:8787
- Фронтенд на http://localhost:5173 (данные с `/data/v1/` с диска)

**Примечание:** Для работы требуется установленный Node.js и выполненный `npm install` в корне проекта и в `frontend/`.

### deploy-to-github.bat
Коммит и push в GitHub — после этого CI задеплоит сайт на Cloudflare Pages.

**Использование:**
```bash
scripts\deploy-to-github.bat
scripts\deploy-to-github.bat "Описание изменений"
```

**Функции:**
- Добавляет изменения в git (`git add -A`; пути из `.gitignore` не попадают)
- Коммитит с указанным сообщением (по умолчанию: `Deploy update`)
- Пушит в GitHub (`git push`, без `--force`)
- Если нет изменений для коммита — останавливается с ошибкой
- GitHub Actions: `build-all-data` → Deploy **Pages** (Worker не деплоится)
- Сайт: https://coursing-stats.ru

**Рекомендация:** перед push при изменении данных — `npm run build-all-data`.

**Примечание:** Для работы требуется настроенный git remote. Перед запуском проверь `git status`.
