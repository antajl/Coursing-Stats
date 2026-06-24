# Frontend — ProCoursing Stats

React приложение для отображения статистики собак procoursing.ru.

## Структура

```
frontend/src/
├── components/
│   ├── DogStatsTable.jsx    # Таблица статистики собак
│   └── DogTooltip.jsx       # Tooltip с информацией о собаке
├── pages/
│   ├── DogProfile.jsx       # Профиль собаки
│   ├── Events.jsx           # Календарь событий
│   └── TopDogs.jsx          # Рейтинги собак
├── services/
│   └── api.js               # API клиент
└── data/
    └── mockData.js          # Мок данные для разработки
```

## Установка зависимостей

```bash
cd frontend
npm install
```

## Локальная разработка

```bash
cd frontend
npm run dev
```

Фронтенд будет доступен на `http://localhost:5173`

## Сборка для продакшена

```bash
cd frontend
npm run build
```

## Технологии

- React 18
- Vite
- Tailwind CSS
- Lucide Icons

## API

Фронтенд обращается к Cloudflare Worker API:
- Базовый URL: `https://procoursing-stats.antajltube.workers.dev`
- Локально: `http://127.0.0.1:8787`

Подробнее см. `docs/15-api-reference.md`

## Компоненты

### DogTooltip
Tooltip с раздельной статистикой для курсинга и бегов. Сайд-бай-сайд layout.

### DogStatsTable
Таблица статистики собак с сортировкой по колонкам.

### Events
Календарь событий с фильтрами по году и типу.

### TopDogs
Рейтинги собак с фильтрами по породе и году.
