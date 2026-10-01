# CoursingStats

Platform for cynological sports statistics, conformation dog shows, and speed records.

[![Website](https://img.shields.io/badge/Site-coursing--stats.ru-0070F3?style=flat-square)](https://coursing-stats.ru)
[![Telegram Bot](https://img.shields.io/badge/Telegram_Bot-@coursing__stats__bot-2CA5E0?style=flat-square&logo=telegram&logoColor=white)](https://t.me/coursing_stats_bot)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Telegram_Bot-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

---

## Обзор проекта

**CoursingStats** — открытая аналитическая платформа и агрегатор кинологической статистики в России. Проект объединяет результаты официальных состязаний борзых (2015–2026), национальные выставки Российской кинологической федерации (РКФ) и замеры спринтерской скорости в единую систему с поиском, рейтингами и профилями собак.

### Быстрые ссылки

- Веб-сайт: [coursing-stats.ru](https://coursing-stats.ru)
- Telegram-бот: [@coursing_stats_bot](https://t.me/coursing_stats_bot)
- Открытый CDN данных: [coursing-stats.ru/data/v1/](https://coursing-stats.ru/data/v1/)
- Дорожная карта: [docs/ROADMAP.md](docs/ROADMAP.md)
- Индекс документации: [docs/MAP.md](docs/MAP.md)

---

## Три ключевых домена

Система разделена на три изолированных домена со своими правилами расчета и источниками:

| Домен | Описание | Источники и рейтинги |
|---|---|---|
| **Соревнования (Sport)** | Курсинг, бега за механической приманкой (БЗМП), круговой трек. Профили собак, статистика судей, динамика забегов. | Данные procoursing.ru (2015–2026). Две независимые системы ранжирования: **Медали** (подиумы) и **Очки CS** (баллы за качество забега), а также расчет рейтинга **Elo** для очных парных забегов. |
| **Выставки РКФ (Shows)** | Национальный рейтинг собак, протоколы рингов, профили экспертов-судей и архивы выставок всех рангов (CAC, CACIB, монопородные). | Парсинг официальных PDF-отчетов РКФ. База из более чем 1.5 млн собак и расчет всероссийских годовых рейтингов по породам и группам FCI. |
| **Донино (Speed)** | Фиксация спринтерских рекордов борзых на специализированной трассе в Донино. | Радарные замеры максимальной скорости (**км/ч**) и прохождение дистанции курсинга 350 м (**секунды**). |

---

## Масштаб данных

| Показатель | Значение |
|---|---|
| Спортивные турниры (курсинг, бега, БЗМП) | 200+ состязаний (2015–2026) |
| Спортивные собаки в базе | 1,500+ собак |
| Результаты забегов в протоколах | 3,700+ записей |
| Выставки РКФ | 60,000+ выставок |
| Собак в выставочном рейтинге | 1,500,000+ собак |
| Записей в протоколах рингов | ~18,000,000 записей |
| Замеры скорости и спринта (Донино) | 300+ официальных результатов |

---

## Архитектура и технические решения

- **Zero-Backend для веб-интерфейса:** Публичный сайт не использует сервер приложений во время выполнения (no runtime Worker/D1). Фронтенд взаимодействует исключительно со статическим оптимизированным JSON-хранилищем через CDN на базе Yandex Object Storage (`/data/v1/`).
- **CDN Packs Pattern ([ADR-014](docs/decisions/014-cdn-packs-vs-turso.md)):** Профили собак и детали судей упаковываются в блочные сжатые файлы (`pack-*`), что исключает генерацию сотен тысяч мелких сетевых запросов.
- **Edge SQLite (Turso):** Протоколы рингов выставок хранятся в распределенной БД Turso (libSQL) и запрашиваются по требованию клиентом в режиме fallback.
- **Serverless Telegram Bot:** Бот реализован на Grammy и развернут в Cloudflare Workers с многоуровневым KV-кэшированием.
- **AI-First архитектура:** Кодовая база снабжена контекстными инструкциями для AI-ассистентов (`AGENTS.md`, каталог `.agents/skills/`, 14 тематических шпаргалок в `docs/sheets/`).

---

## Стек технологий

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, TanStack React Query, GSAP, Lucide Icons.
- **Data & Pipelines:** Node.js, TSX, Vitest, Cheerio, ExcelJS, PDF parsing (pdfjs, paddle-ocr), Zod.
- **Telegram Bot:** Cloudflare Workers, Grammy, TypeScript, Cloudflare KV.
- **Инфраструктура:** Yandex Object Storage (Static CDN), Turso (libSQL/SQLite), GitHub Actions CI/CD.

---

## Быстрый старт

### Системные требования

- Node.js >= 20.x
- Yarn 1.22.22

### Установка и запуск

1. Клонирование репозитория:
   ```bash
   git clone https://github.com/antajl/Coursing-Stats.git
   cd Coursing-Stats
   ```

2. Установка зависимостей:
   ```bash
   yarn install
   ```

3. Запуск локального сервера разработки:
   ```bash
   yarn run dev
   ```
   Фронтенд будет доступен по адресу `http://localhost:5173`.

### Пайплайн обработки данных

```bash
# Безопасный ввод турнира с автоматическим сопоставлением собак:
yarn ingest-competition <path-to-draft.json>

# Полная пересборка всех индексов и проверка publish-gates:
yarn run build-all-data

# Запуск тестов парсеров и фикстур:
yarn run test-parser-fixtures

# Запуск тестов бэкенда:
yarn test
```

### Разработка и тестирование Telegram-бота

```bash
cd bot
yarn install
yarn test
yarn run dev
```

---

## Структура репозитория

```
CoursingStats/
|-- frontend/             # Клиентское приложение (React 19, Vite, Tailwind CSS)
|-- backend/              # Парсеры, скрипты импорта, валидация и генерация индексов
|   |-- parsers/          # Парсеры procoursing.ru (курсинг, БЗМП, бега)
|   |-- scripts/          # Скрипты пересборки данных, миграций и аудита
|   `-- tests/            # Тесты парсеров и расчетных алгоритмов
|-- bot/                  # Telegram-бот (Cloudflare Workers + Grammy)
|-- data/v1/              # Каноническая база данных (JSON) для раздачи через CDN
|-- docs/                 # Архитектурная документация, ADR и шпаргалки
|   |-- ROADMAP.md        # Дорожная карта развития проекта
|   |-- MAP.md            # Маршрутизатор по документации и задачам
|   |-- decisions/        # Архитектурные решения (ADR-001 - ADR-014)
|   `-- sheets/           # Детальные шпаргалки (00-14) по всем аспектам системы
`-- AGENTS.md             # Точка входа для AI-ассистентов
```

---

## Документация

- [Дорожная карта (ROADMAP)](docs/ROADMAP.md) — 4 ключевых направления развития проекта.
- [Маршрутизатор документации (MAP)](docs/MAP.md) — навигатор по кодовой базе и задачам.
- [Архитектурные решения (ADR)](docs/decisions/) — история и контекст инженерных решений.
- [Шпаргалки по разделам](docs/sheets/) — 14 подробных технических документов.

---

## Лицензия

Проект распространяется под лицензией MIT. Подробности в файле [LICENSE](LICENSE).
