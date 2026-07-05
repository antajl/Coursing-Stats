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

### Статический sitemap
- **Файл**: `frontend/public/sitemap.xml`
- **URL**: `https://coursing-stats.ru/sitemap.xml`
- **Содержит**: Основные страницы + ссылка на динамический sitemap
- **Обновление**: При деплое фронтенда

### Динамический sitemap (API)
- **Файл**: `backend/src/routes/sitemap.ts`
- **URL**: `https://api.coursing-stats.ru/sitemap.xml`
- **Содержит**: Все страницы из базы данных
  - Собаки (~1600)
  - События (~225)
  - Судьи
- **Обновление**: Автоматически при каждом запросе

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

3. **Добавь страницу в динамический sitemap** (`backend/src/routes/sitemap.ts`):
```tsx
// Добавь запрос к базе данных
const items = await db.prepare('SELECT id, name FROM items').all();

// Добавь в sitemap
if (items.results) {
  for (const item of items.results) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}/item/${item.id}</loc>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  }
}
```

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
- Динамический sitemap доступен через API (api.coursing-stats.ru)

### SPA (Single Page Application)
- Проблема: Поисковики могут плохо индексировать динамические страницы
- Решение: Динамический sitemap + meta-теги
- Будущее: Рассмотреть SSR (Server-Side Rendering) для критичных страниц

## История изменений

### 2026-07-05
- Добавлен `react-helmet-async` для динамических meta-тегов
- Создан компонент `SEO.tsx`
- Добавлены meta-теги на страницы собак, событий, судей
- Создан динамический sitemap API endpoint
- Подтверждена верификация в Яндекс и Google
- Создан `robots.txt` и статический `sitemap.xml`
