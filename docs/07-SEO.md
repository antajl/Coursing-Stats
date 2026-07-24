# SEO — Поисковая оптимизация

## Обзор

Coursing Stats использует meta (Helmet), статический sitemap, JSON-LD, prerender HTML для краулеров и Метрику для Яндекс и Google.

**Публичный прод (вариант A):** рейтинги соревнований, выставки, Донино, профили собак и судьи. Календари на проде — только при `ui-flags.json` (`publicCalendars.*`); полных протоколов `/event/:id` на проде нет. Meta/description не обещать «всегда открытый календарь» без флага.

**Краулеры:** после Vite build CI запускает `npm run prerender-seo` — path-specific HTML с реальными title/description/canonical и контентом в `#root` (React заменяет `#root` при JS; без JS краулер видит текст).

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
- **Содержит:** хабы `/`, `/competitions`, `/shows`, `/speed-records`, `/guide`; legacy `/top`, `/judges`; `/dog/:id`, судьи, Донино-профили. Источник списка динамики — `data/v1/indexes/sitemap-urls.json`
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
  - Динамический title / description / keywords
  - Open Graph, Twitter Cards
  - Канонические URL
  - Опциональный `noindex`

```tsx
<SEO
  title="Заголовок страницы"
  description="Описание страницы"
  canonicalUrl="https://coursing-stats.ru/page"
/>
```

### JSON-LD
- **Файл:** `frontend/src/components/JsonLd.tsx`
- Схемы: **Organization**, **WebSite** (поиск), `breadcrumbListSchema`, `faqPageSchema`
- Профиль собаки: BreadcrumbList (Главная → Рейтинг → кличка)
- Справочник `/guide`: FAQPage (общие вопросы по рейтингу, Донино, выставкам, календарю, источникам)

### Внутренние ссылки (фаза C)
- **Home / профиль:** видимые дубли шапки убраны; навигация — в общей шапке сайта. JSON-LD BreadcrumbList на профиле остаётся (для поисковиков, без UI)
- **Guide:** видимые FAQ на вкладках Рейтинг / Выставки / О сайте

### OG Image
- **Файл:** `frontend/public/og-image.svg` (на базе logo-light)

### Prerender HTML (фаза B)

После `cd frontend && npm run build` CI (и локально) запускает:

```bash
npm run prerender-seo
```

- **Хелперы:** `backend/scripts/seo/prerender-html.ts`
- **CLI:** `backend/scripts/seo/prerender-pages.ts`
- **CI:** `.github/workflows/deploy-frontend.yml` → шаг `Prerender SEO HTML` после `Build frontend`
- **Кэш:** `frontend/public/_headers` — no-cache для `/competitions`, `/shows`, `/speed-records`, `/guide`, `/dog/*` (как у `/` и `/index.html`)

Пишет:
| Путь | Файл |
|------|------|
| `/` | патч `frontend/dist/index.html` |
| `/competitions` | `frontend/dist/competitions/index.html` |
| `/shows` | `frontend/dist/shows/index.html` |
| `/speed-records` | `frontend/dist/speed-records/index.html` |
| `/guide` | `frontend/dist/guide/index.html` |
| `/dog/:id` | `frontend/dist/dog/{id}/index.html` |

Источники собак: `frontend/dist/data/v1/indexes/dog-profiles/*.json` (fallback `data/v1/...`). Show-only из `dog-ranking-*.json` **выключены по умолчанию** (полный дамп ≫ лимита файлов Cloudflare Pages); опционально: `PRERENDER_SHOW_ONLY=1` и `PRERENDER_SHOW_ONLY_MAX` (дефолт 2000).

**Cloudflare Pages:** `_redirects` остаётся `/* /index.html 200`. Статические `…/index.html` обслуживаются раньше catch-all. Не добавлять `404.html`. Hashed `/assets/*` в клоне shell не трогать.

**Проверка (после prerender):**

```bash
# title / description / canonical в первом HTML
curl -sS https://coursing-stats.ru/dog/263 | findstr /i "title description canonical"
# локально после build + prerender:
curl -sS http://127.0.0.1:4173/dog/1 | head
# или: Select-String -Path frontend/dist/dog/1/index.html -Pattern '<title>|canonical|#root'
```

Юнит-тесты хелперов (без Vite build): `npx vitest run backend/tests/prerender-seo.test.ts`

### Канонические URL (основные)
- `/`, `/competitions`, `/shows`, `/speed-records`, `/guide?tab=…`
- Legacy редиректы: `/top`, `/judges` → hub `/competitions?tab=…`
- Динамика: `/dog/:id` (с `canonicalUrl`), `/donino-dog/…`, `/judges/:id` (если публичны)

### Хабы (title / смысл)
| URL | Title (смысл) |
|-----|----------------|
| `/` | Статистика курсинга, бегов и выставок собак |
| `/competitions` | Рейтинг собак: курсинг и бега борзых |
| `/shows` | Рейтинг выставочных собак РКФ |
| `/speed-records` | Рекорды Донино: замер скорости и бега 350 м |
| `/guide?tab=…` | Справочник — вкладка (титулы / выставки / протоколы / рейтинг / о сайте) |

### Реализация на страницах

#### Страницы собак (`frontend/src/pages/DogProfile/index.tsx`)
```tsx
<SEO
  title={`${dogName} (${dogBreed}) — статистика курсинг, бега, выставки`}
  description={`${dogName} (${dogBreed}): курсинг N стартов; … Статистика на Coursing Stats.`}
  keywords={`${dogName}, ${dogBreed}, курсинг, …`}
  canonicalUrl={`https://coursing-stats.ru/dog/${id}`}
/>
```

#### Профили Донино (`frontend/src/pages/DoninoDogProfile.tsx`)
```tsx
<SEO
  title={`${name} — ${breed}`}
  description={`Рекорды Донино: ${name} (${breed}). лучшая скорость … км/ч; лучшее время 350 м: … с.`}
  keywords={`${name}, ${breed}, рекорды Донино, замер скорости, бега борзых, 350 м`}
  canonicalUrl={`https://coursing-stats.ru/donino-dog/${encodeURIComponent(name)}/${encodeURIComponent(breed)}`}
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

#### Страницы судей соревнований (`frontend/src/pages/Judges/JudgeDetail.tsx`)
```tsx
<SEO
  title={`${judgeName} - статистика судьи`}
  description={`Статистика судьи ${judgeName} по курсингу и бегам борзых...`}
  keywords={`${judgeName}, судья, курсинг, бега борзых, статистика...`}
/>
```

Профили судей **выставок** (`ShowJudgeDetail`) — отдельно; канон UI/данных: [`SHOWS.md`](SHOWS.md).

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

В `SEO.tsx` — **короткий** дефолт под RU-нишу (курсинг, бега, рейтинг, Донино, выставки, РКФ). На страницах — точечные keywords (кличка, порода, дисциплина). Meta keywords почти не влияет на Google; не раздувать списком EN/US терминов.

### Типовые запросы
- статистика / рейтинг курсинга; рекорды Донино; рейтинг выставок РКФ
- [Имя собаки] + [порода]; [судья] + статистика

## Яндекс.Метрика

- **Счётчик:** `110619327`
- **Файлы:** `frontend/src/components/YandexMetrica.tsx`, `frontend/src/types/yandex-metrica.d.ts`
- **Вкл.:** вебвизор, карта скролла, точные отскоки, отслеживание ссылок, SSR-friendly init
- **Не нужно:** e-commerce, контентная аналитика, тег-менеджер

### Цели (`reachGoal`)

| Цель | Смысл |
|------|--------|
| `dog_profile_view` | профиль собаки |
| `search_used` | поиск |
| `filter_used` | фильтры |
| `procoursing_link` | переход на procoursing.ru |
| `competition_view` | соревнование |
| `speed_records_view` | Донино |
| `judges_view` | судьи |
| `guide_view` | справочник |

```tsx
const { reachGoal } = useYandexGoal()
useEffect(() => { reachGoal('dog_profile_view') }, [reachGoal])
```

Подключение: `App.tsx` → `<YandexMetrica />` внутри `HelmetProvider` / `Router`.

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
- Базовый `index.html` — общий shell; для хабов и `/dog/:id` CI делает **prerender** (фаза B) с уникальными meta и текстом в `#root`
- React при загрузке JS гидратирует/заменяет `#root`; краулеры без JS видят prerender-контент
- Sitemap + Helmet meta остаются обязательными; prerender усиливает первый HTML

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

## FAQ (кратко)

| Вопрос | Ответ |
|--------|--------|
| Цели Метрики вручную? | В коде уже есть; в интерфейсе можно создать JS-события с теми же id или включить автоцели |
| Favicon в Вебмастере? | Иногда нужна ручная загрузка: Настройки → Иконка сайта |
| Тег-менеджер? | Не нужен — одного счётчика Метрики достаточно |
| Как проверить SEO? | F12 → Head (meta); sitemap/robots; Метрика через 24–48 ч; индексация — через несколько дней |

## Связанные файлы

- `frontend/src/components/SEO.tsx`, `JsonLd.tsx`, `YandexMetrica.tsx`
- `frontend/src/types/yandex-metrica.d.ts`
- `frontend/public/og-image.svg`, `robots.txt`, `sitemap.xml` (генерируется CI), `_headers`
- `backend/scripts/build-derived-indexes.ts` — URL для sitemap
- `backend/scripts/seo/prerender-html.ts`, `prerender-pages.ts` — prerender Phase B
- `backend/tests/prerender-seo.test.ts`

## История изменений

### 2026-07-24
- Главная (home-v2): панели колонок, плоские event-row внутри, CTA `.home-v2-external` / `.home-v2-section-link`; масштаб — центрированные метрики + count-up `StatCounter`; z-index stage-copy над body для listbox поиска. Канон: [`04-FRONTEND.md`](04-FRONTEND.md), токены: [`06-DESIGN-SYSTEM.md`](06-DESIGN-SYSTEM.md)

### 2026-07-23
- Фаза A: честные meta без «календаря» на проде; сильные title хабов; `/shows` в sitemap; короткий `DEFAULT_KEYWORDS`; `canonicalUrl` и фактовое description у `/dog/:id` и Донино; SEO guide по вкладкам
- Фаза B: prerender HTML хабов и `/dog/:id` после Vite build (`prerender-seo` в CI); no-cache для prerender-путей в `_headers`
- Фаза C: FAQ + FAQPage на Guide; BreadcrumbList JSON-LD на профиле (без дублей шапки в UI)
- Тексты: слоган и H1 на главной; «Кому полезен» + обновлённый FAQ/рейтинг в справке; угловая атрибуция источника на рейтингах и Донино
- Главная: блок масштаба базы (соревнования + выставки и secondary-метрики); «Топ сезона» двумя колонками; титулы соревнований — отдельный CACLBr и сортировка по крутости

### Что дальше (фаза D — в основном вне кода)

| Задача | Зачем |
|--------|--------|
| Проверить покрытие в GSC / Яндекс.Вебмастер после деплоя с prerender | Убедиться, что хабы и `/dog/:id` индексируются с правильным title |
| Внешние ссылки (форумы РКФ, клубы, соцсети, упоминания) | Ссылочный вес; код сам по себе не даст |
| Не раздувать prerender show-only (~127k) без лимита Pages | Уже off by default; включать точечно (`PRERENDER_SHOW_ONLY`) |
| Уникальные lead/FAQ только там, где реально помогают людям | Уже на Guide; не плодить тонкий SEO-текст на каждой вкладке |
| Следить за дублями протоколов в `competitions/` | Дубль стартов искажает CS и сниппеты профилей |

### 2026-07-22
- Канон SEO: этот файл; устаревший дубль `SEO.md` удалён (контент Метрики/JsonLd/OG смержен сюда)

### 2026-07-07 (вечер)
- Публичный sitemap — статический из CI (`build-derived-indexes`), один файл на Pages
- Legacy: динамический sitemap на Worker (`sitemap.ts`) — только dev:d1

### 2026-07-07 (утро)
- Favicon.ico для индексации
- Заметки по региону в Вебмастере

### 2026-07-05
- `react-helmet-async`, `SEO.tsx`, meta на ключевых страницах
- Верификация Яндекс/Google; `robots.txt` + sitemap
