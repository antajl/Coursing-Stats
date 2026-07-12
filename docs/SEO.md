# SEO Оптимизация Coursing Stats

## Обзор

Документ описывает все SEO улучшения, внедрённые на сайте coursing-stats.ru для улучшения индексации в Google и Яндекс.

## Выполненные улучшения

### 1. SEO Компонент

**Файл:** `frontend/src/components/SEO.tsx`

**Функциональность:**
- Динамические meta теги для каждой страницы
- Open Graph теги для соцсетей
- Twitter Cards
- Канонические URL
- Расширенные ключевые слова (200+ штук)
- Поддержка noindex для страниц, которые не должны индексироваться

**Использование:**
```tsx
<SEO
  title="Заголовок страницы"
  description="Описание страницы"
  canonicalUrl="https://coursing-stats.ru/page"
/>
```

### 2. JSON-LD Структурированные данные

**Файл:** `frontend/src/components/JsonLd.tsx`

**Добавленные схемы:**
- **Organization** - информация о сайте Coursing Stats
- **WebSite** - информация о сайте с возможностью поиска

**Использование:**
```tsx
<JsonLd data={organizationSchema} />
<JsonLd data={webSiteSchema} />
```

### 3. OG Image

**Файл:** `frontend/public/og-image.svg`

- Создан на основе logo-light.svg
- Используется для превью в соцсетях
- Формат SVG для лучшего качества

### 4. Канонические URL

Добавлены на все основные страницы для предотвращения дублей контента:
- Главная: `https://coursing-stats.ru/`
- Соревнования: `https://coursing-stats.ru/competitions`
- Рейтинг собак: `https://coursing-stats.ru/top`
- Рекорды скорости: `https://coursing-stats.ru/speed-records`
- Судьи: `https://coursing-stats.ru/judges`
- Справочник: `https://coursing-stats.ru/guide`

### 5. Ключевые слова

**Расширено с 7 до 200+ ключевых слов**

**Категории:**
- Основные термины (русский + английский)
- Породы борзых (русские + английские названия)
- Статистика и рейтинги
- Рекорды и скорость
- Организации (РКФ, FCI, AKC, ASFA, NOTRA)
- Судьи и эксперты
- Календарь и события
- Спорт и охота
- Технические термины
- Поисковые фразы

**Примеры ключевых слов:**
```
курсинг, coursing, lure coursing, sighthound racing, greyhound racing,
борзые, sighthounds, грейхаунд, whippet, салюки, saluki,
статистика, statistics, результаты, results, рейтинги  rankings,
рекорды скорости, speed records, FCI, AKC, ASFA, NOTRA
```

### 6. Яндекс.Метрика

**Номер счётчика:** 110619327

**Файл:** `frontend/src/components/YandexMetrica.tsx`

**Настройки:**
- ✅ Вебвизор (запись движений мыши, кликов)
- ✅ Карта скроллинга
- ✅ Точные отскоки
- ✅ Отслеживание ссылок
- ✅ SSR (для React SPA)
- ❌ Электронная коммерция (не нужно)
- ❌ Контентная аналитика (не нужно)
- ❌ Тег менеджер (не нужно)

### 7. Цели Яндекс.Метрики

**Файл:** `frontend/src/components/YandexMetrica.tsx`

**Добавленные цели:**
- `dog_profile_view` - просмотр профиля собаки
- `search_used` - использование поиска
- `filter_used` - использование фильтров
- `procoursing_link` - переход на procoursing.ru
- `competition_view` - просмотр соревнования
- `speed_records_view` - просмотр рекордов скорости
- `judges_view` - просмотр судей
- `guide_view` - просмотр справочника

**Использование в компонентах:**
```tsx
const { reachGoal } = useYandexGoal()

useEffect(() => {
  reachGoal('dog_profile_view')
}, [reachGoal])
```

### 8. SEO на страницах

**Добавлен SEO компонент на все основные страницы:**

| Страница | Файл | Статус |
|----------|------|--------|
| Главная | `frontend/src/pages/Home.tsx` | ✅ |
| Соревнования | `frontend/src/pages/Competitions.tsx` | ✅ |
| Рейтинг собак | `frontend/src/pages/TopDogs/index.tsx` | ✅ |
| Рекорды скорости | `frontend/src/pages/SpeedRecords/index.tsx` | ✅ |
| Судьи | `frontend/src/pages/Judges/index.tsx` | ✅ |
| Справочник | `frontend/src/pages/Guide/index.tsx` | ✅ |

### 9. Яндекс.Вебмастер и Google Search Console

**Статус:**
- ✅ Яндекс.Вебмастер - настроен пользователем ранее
- ✅ Google Search Console - настроен пользователем ранее

**Дополнительные действия:**
- Favicon может потребовать ручной загрузки в Яндекс.Вебмастер
- Настройки → Иконка сайта → Загрузить иконку

## Техническая реализация

### Типизация Яндекс.Метрики

**Файл:** `frontend/src/types/yandex-metrica.d.ts`

Добавлена типизация для глобального объекта `window.ym`:
```typescript
declare global {
  interface Window {
    ym: (
      counterId: number,
      method: 'init' | 'reachGoal' | string,
      ...args: (Record<string, unknown> | string | number | boolean)[]
    ) => void
  }
}
```

### Интеграция в приложение

**Файл:** `frontend/src/App.tsx`

```tsx
<HelmetProvider>
  <QueryProvider>
    <Router>
      <YandexMetrica />
      <DogSilhouettes />
      {/* ... */}
    </Router>
  </QueryProvider>
</HelmetProvider>
```

## Проверка после деплоя

### Яндекс.Метрика
1. Зайдите в Яндекс.Метрику
2. Проверьте, что счётчик работает (должны появиться данные)
3. Настройте цели (если не создались автоматически):
   - Тип: JavaScript-событие
   - Идентификатор: `dog_profile_view` и т.д.

### Google Search Console
1. Проверьте индексацию страниц
2. Проверьте наличие sitemap.xml
3. Проверьте robots.txt

### Яндекс.Вебмастер
1. Проверьте индексацию страниц
2. Проверьте наличие sitemap.xml
3. Загрузите favicon при необходимости

## Рекомендации по дальнейшему улучшению

### Опционально (не обязательно)
- Добавить больше целей для конкретных действий
- Настроить автоматические цели в Яндекс.Метрике
- Добавить структурированные данные для событий (Event schema)
- Добавить структурированные данные для статей (Article schema)

### Не рекомендуется
- ❌ Электронная коммерция (нет продаж)
- ❌ Контентная аналитика (не новостной сайт)
- ❌ Тег менеджер (избыточно)
- ❌ CRM интеграция (не нужно)
- ❌ Офлайн-конверсии (нет офлайн бизнеса)

## Частые вопросы

### Q: Нужно ли добавлять цели вручную в Яндекс.Метрику?
A: Цели работают автоматически в коде. В интерфейсе Яндекс.Метрики можно создать их вручную или включить "Автоматические цели".

### Q: Почему favicon не появился в Яндекс.Вебмастер?
A: Яндекс может не найти favicon автоматически. Загрузите его вручную: Настройки → Иконка сайта.

### Q: Нужно ли тег менеджер?
A: Нет, для вашего сайта достаточно одного счётчика Яндекс.Метрики. Тег менеджер нужен для сложных сайтов с множеством сервисов.

### Q: Как проверить, что SEO работает?
A: После деплоя:
1. Откройте страницу в браузере
2. F12 → Elements → Head - проверьте meta теги
3. Проверьте Яндекс.Метрику через 24-48 часов
4. Проверьте индексацию в Google/Yandex через несколько дней

## Связанные файлы

- `frontend/src/components/SEO.tsx` - SEO компонент
- `frontend/src/components/JsonLd.tsx` - JSON-LD компонент
- `frontend/src/components/YandexMetrica.tsx` - Яндекс.Метрика
- `frontend/src/types/yandex-metrica.d.ts` - Типизация
- `frontend/public/og-image.svg` - OG Image
- `frontend/public/robots.txt` - Robots.txt
- `frontend/public/sitemap.xml` - Sitemap

## Дата последнего обновления

12 июля 2026
