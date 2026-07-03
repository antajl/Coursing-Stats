# ProCoursing Stats

Агрегатор статистики по собакам, участвовавшим в состязаниях procoursing.ru
(курсинг, БЗМП, бега/трасса) за все годы (2015–2026).

## Документация

Полная документация в папке **[docs/](docs/README.md)**:

| Раздел | Файл |
|--------|------|
| Статус проекта | [docs/00-PROJECT-STATUS.md](docs/00-PROJECT-STATUS.md) |
| Быстрый старт | [docs/01-QUICK-START.md](docs/01-QUICK-START.md) |
| ИИ-агент | [docs/ai/GUIDELINES.md](docs/ai/GUIDELINES.md), [docs/ai/MEMORY-SETUP.md](docs/ai/MEMORY-SETUP.md) |
| Архитектура | [docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md), [API](docs/architecture/API-REFERENCE.md) |
| Данные | [docs/data/PARSING.md](docs/data/PARSING.md), [docs/data/DATABASE.md](docs/data/DATABASE.md) |
| Разработка | [docs/development/DEVELOPMENT.md](docs/development/DEVELOPMENT.md), [FRONTEND-MAP](docs/development/FRONTEND-MAP.md) |
| Планы | [docs/plans/FUTURE-PLANS.md](docs/plans/FUTURE-PLANS.md) |

Оглавление: **[docs/README.md](docs/README.md)**

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Локальная разработка (использует remote D1)
npm run dev

# Тестирование парсеров
npm run test-parser
npm run test-parser-fixtures
```

## Деплой

- **Фронтенд:** https://procoursing.antajl.ru (Cloudflare Pages)
- **API:** https://procoursing-stats.antajltube.workers.dev (Cloudflare Worker)
- **GitHub:** https://github.com/antajl/ProCoursing

## Новые функции (июнь 2026)

### Страница "Рекорды Донино"
- Две подвкладки: "Таблица" и "Статистика"
- **Вкладка "Таблица":**
  - Отображение личных рекордов скорости из Google Sheets
  - Фильтрация по году, породе и полу
  - Поиск по кличке, породе, полу (с алиасами: сука/кабель/самка/самец), скорости и дате
  - Сортировка по всем колонкам с правильными стрелками (↓ для descending, ↑ для ascending)
  - Статусы: "новый результат" (new), "улучшение личного рекорда" (upd)
  - История предыдущих результатов при наведении на кличку
  - Экспорт в Excel (.xlsx) с разделением по ячейкам
- **Вкладка "Статистика":**
  - Фильтры по году, породе, полу и диапазону скорости
  - Общая статистика: количество записей, средняя/лучшая/минимальная скорость
  - Статистика по породам: клик на породу показывает список кличек с их скоростями
  - Статистика по полу: клик на суку/кобеля показывает список кличек с их скоростями
  - Статистика по годам: клик на количество показывает список кличек за этот год
  - Все статистические данные пересчитываются динамически при применении фильтров
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
