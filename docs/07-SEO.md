# SEO — Поисковая оптимизация

## Обзор

Coursing Stats использует несколько стратегий для поисковой оптимизации (SEO) в Яндекс и Google.

## Верификация поисковиков

### Google Search Console
- **Метод верификации**: DNS TXT запись через Cloudflare
- **Статус**: ✅ Подтверждён
- **DNS запись**: `google-site-verification=ZQkNqwtAMX4-awkZ4spBUrfpOvWyojo8LVP8kRiHtrw`

### Яндекс.Вебмастер
- **Метод верификации**: DNS TXT запись
- **Статус**: ✅ Подтверждён
- **DNS запись**: `yandex-verification: 6e47f6f32cdce62f`

## Sitemap (Карта сайта)

### Статический sitemap (прод, CI)

- **Генерация:** `backend/scripts/build-derived-indexes.ts` → `frontend/public/sitemap.xml`
- **URL:** `https://coursing-stats.ru/sitemap.xml`
- **Содержит:** все публичные URL (страницы, собаки, события, судьи, Донино) из `data/v1/indexes/sitemap-urls.json`
- **Обновление:** автоматически при `git push main` (CI `build-all-data`)

### Legacy: динамический sitemap на Worker

- **Файл:** `backend/src/routes/sitemap.ts` (только `npm run dev` / `dev:d1`)
- **URL:** `https://api.coursing-stats.ru/sitemap.xml` — Worker не деплоится в CI с 2026-07-07
- Для поисковиков используйте **`https://coursing-stats.ru/sitemap.xml`**

### Добавление sitemap в поисковики

**Яндекс.Вебмастер:**
1. Перейди в "Индексирование" → "Sitemap файлы"
2. Добавь: `https://coursing-stats.ru/sitemap.xml`

**Google Search Console:**
1. Перейди в "Sitemaps"
2. Добавь: `https://coursing-stats.ru/sitemap.xml`

## Meta-теги

### Компонент SEO
- **Файл**: `frontend/src/components/SEO.tsx`
- **Библиотека**: `react-helmet-async`
- **Функции**:
  - Динамический title
  - Description
  - Keywords (для старых систем)
  - Open Graph (Facebook, соцсети)
  - Twitter Cards

### Реализация на страницах

#### Страницы собак (`frontend/src/pages/DogProfile.tsx`)
```tsx
<SEO
  title={`${dogName} - ${dogBreed}`}
  description={`Статистика собаки ${dogName} (${dogBreed}) по курсингу и бегам борзых...`}
  keywords={`${dogName}, ${dogBreed}, курсинг, бега борзых, статистика, ${dogTitles}...`}
/>
```

#### Профили Донино (`frontend/src/pages/DoninoDogProfile.tsx`)
```tsx
<SEO
  title={`${name} — ${breed}`}
  description={`Рекорды Донино: ${name} (${breed}). лучшая скорость … км/ч; лучшее время 350 м: … с.`}
  keywords={`${name}, ${breed}, рекорды Донино, замер скорости, бега борзых, 350 м`}
/>
```

URL профилей Донино попадают в **статический** sitemap: CI (`build-derived-indexes.ts`) → `frontend/public/sitemap.xml` → `/donino-dog/…` на проде.

#### Страницы событий (`frontend/src/pages/Events/EventResults/index.tsx`)
```tsx
<SEO
  title={`${eventName} - ${eventDate}`}
  description={`Результаты соревнований по ${eventType} ${eventDate} в ${event.location}...`}
  keywords={`${eventName}, ${eventType}, ${event.location}, результаты...`}
/>
```

#### Страницы судей (`frontend/src/pages/Judges/JudgeDetail.tsx`)
```tsx
<SEO
  title={`${judgeName} - статистика судьи`}
  description={`Статистика судьи ${judgeName} по курсингу и бегам борзых...`}
  keywords={`${judgeName}, судья, курсинг, бега борзых, статистика...`}
/>
```

## robots.txt

- **Файл**: `frontend/public/robots.txt`
- **URL**: `https://coursing-stats.ru/robots.txt`
- **Содержимое**:
```
User-agent: *
Allow: /

Sitemap: https://coursing-stats.ru/sitemap.xml
```

## Правило для новых страниц

При создании новой страницы с динамическим контентом:

1. **Добавь импорт SEO компонента**:
```tsx
import { SEO } from '../../components/SEO'
```

2. **Оберни return в JSX фрагмент**:
```tsx
return (
  <>
    <SEO
      title="Заголовок страницы"
      description="Описание страницы для поисковиков"
      keywords="ключевые, слова, через, запятую"
    />
    <div className="...">
      {/* контент страницы */}
    </div>
  </>
)
```

3. **Добавь URL в sitemap** — в `backend/scripts/build-derived-indexes.ts` (функция `buildSitemapUrls` / запись в `sitemap-urls.json`). После `npm run build-all-data` URL попадёт в `frontend/public/sitemap.xml` на проде.

   Для локального dev API (legacy) можно дублировать в `backend/src/routes/sitemap.ts` — на публичный прод это не влияет.

## Ключевые слова

Сайт оптимизирован под следующие запросы:

### Основные
- курсинг
- бега борзых
- статистика
- соревнования
- РКФ

### Специфические
- [Имя собаки] + [порода]
- [Название соревнования] + [дата]
- [Имя судьи] + статистика
- рекорды скорости
- рейтинги собак
- результаты соревнований

## Мониторинг

### Яндекс.Вебмастер
- **Индексирование** → "Страницы в поиске"
- **Поисковые запросы** → "Запросы и клики"
- **Внешние ссылки** → "Ссылки на сайт"

### Google Search Console
- **Indexing** → "Pages"
- **Search results** → "Performance"
- **Links** → "External links"

## Ограничения

### Cloudflare блокировка в России
- Проблема: Cloudflare заблокирован в РФ с 2022 года
- Решение: DNS верификация (работает)
- Sitemap: статический `https://coursing-stats.ru/sitemap.xml` (генерируется в CI)

### SPA (Single Page Application)
- Проблема: Поисковики могут плохо индексировать динамические страницы
- Решение: Динамический sitemap + meta-теги
- Будущее: Рассмотреть SSR (Server-Side Rendering) для критичных страниц

## Яндекс.Вебмастер — практические заметки

### Регион
- «Нет региона» — **нормально** для всероссийского агрегатора без привязки к одному городу
- Не требует исправления, если аудитория — вся Россия

### Sitemap
- В Вебмастере указать: `https://coursing-stats.ru/sitemap.xml`
- Генерируется в CI (`build-derived-indexes`) — собаки, события, судьи, Донино
- После `git push main` роботы подхватывают обновления автоматически

### Favicon
- `frontend/public/favicon.ico` + `favicon-48.png` — для краулеров и вкладок
- Генерация: `npm run generate-favicon`

### HTTPS и Business
- HTTPS через Cloudflare — OK
- Яндекс Business — опционально; для статистического сайта не обязателен

## История изменений

### 2026-07-07 (вечер)
- Публичный sitemap — статический из CI (`build-derived-indexes`), один файл на Pages
- Legacy: динамический sitemap на Worker (`sitemap.ts`) — только dev:d1

### 2026-07-07 (утро)
- Favicon.ico для индексации
- Заметки по региону в Вебмастере

### 2026-07-05
- Добавлен `react-helmet-async` для динамических meta-тегов
- Создан компонент `SEO.tsx`
- Добавлены meta-теги на страницы собак, событий, судей
- Создан динамический sitemap API endpoint
- Подтверждена верификация в Яндекс и Google
- Создан `robots.txt` и статический `sitemap.xml`
