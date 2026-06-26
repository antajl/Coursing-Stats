# ProCoursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях procoursing.ru
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

Полная документация проекта находится в папке `docs/`:

- **[docs/00-OVERVIEW.md](docs/00-OVERVIEW.md)** — Обзор проекта, стек, текущее состояние, деплой
- **[docs/01-AI-GUIDELINES.md](docs/01-AI-GUIDELINES.md)** — Правила для ИИ-агента
- **[docs/02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md)** — Архитектура, БД, API, деплой
- **[docs/03-DEVELOPMENT.md](docs/03-DEVELOPMENT.md)** — Разработка, данные, парсинг

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Локальная разработка (использует remote D1)
npm run dev

# Тестирование парсера
npm run test-parser
```

## Деплой

- **Фронтенд:** https://procoursing.antajl.ru (Cloudflare Pages)
- **API:** https://procoursing-stats.antajltube.workers.dev (Cloudflare Worker)
- **GitHub:** https://github.com/antajl/ProCoursing

## Новые функции (июнь 2026)

### Страница "Рекорды Донино"
- Отображение личных рекордов скорости из Google Sheets
- Фильтрация по породе и полу
- Статусы: "новый результат" (зелёный), "улучшение личного рекорда" (синий), "обычный результат" (серый)
- Автоматическое обновление через GitHub Actions (ежедневно)
- Ссылка на оригинальную Google таблицу

### Обновлённая навигация
- Минималистичный дизайн с анимированными подчёркиваниями
- Две основные вкладки: "Procoursing" и "Рекорды Донино"
- Вкладка "Procoursing" содержит подвкладки: "Календарь событий" и "Рейтинг собак"
- Old money цветовая палитра (cream, camel, charcoal, forest)

### Новый домен
- Фронтенд: https://procoursing.antajl.ru
- API: https://procoursing-stats.antajltube.workers.dev (временно, custom domain требует платного плана)

## Лицензия

MIT
