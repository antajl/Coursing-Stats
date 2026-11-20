---
title: Ops, Deploy & Infrastructure Invariants
domain: ops-deploy
description: Правила инфраструктуры: Yandex Object Storage S3 CDN, двухуровневый пререндер, сжатие gzip, Vite dev сервер, тестирование
---

# Ops, Deploy & Infrastructure Invariants

> Правила инфраструктуры: Yandex Object Storage S3 CDN, двухуровневый пререндер, сжатие gzip, Vite dev сервер, тестирование

## Invariants & Architectural Rules

### Public site

JSON from CDN only — **no** Worker/D1 runtime

### Hosting

**Yandex Object Storage** (`deploy.yml` CI sync)

### S3 Cache policy

`/assets/*` 1y immutable, HTML no-cache, `/data/v1/` 1h ([sheet 09](../sheets/09-ops-deploy.md))

### Truth

`data/v1/` in git

### CDN packs

`dog-profiles/pack-*`, show `judge-details/pack-*` ([ADR-014](../decisions/014-cdn-packs-vs-turso.md))

### Pages slim

exclude `dogs/by-id` + bulk exhibitions (`publish-exclude.js`)

### Calendars

ON in `data/v1/ui-flags.json` (competitions + shows)

### Turso

Полностью удалён из проекта. Все 56 225 протоколов выставок (2019–2026) отдаются статически из Яндекс S3 CDN (`/data/v1/shows/protocols/{id}.json`) в сжатом виде gzip. В `deploy.yml` команда `aws s3 sync data/v1/ ... --delete` обязана содержать `--exclude "shows/protocols/*"`, исключая удаление протоколов при полном деплое данных

### Legacy scripts & Drafts

Одноразовые исторические скрипты черновиков состязаний (2021–2022), утилиты Turso и Elo полностью удалены из кодовой базы ([ADR-015](../decisions/015-legacy-code-cleanup.md)). Запрещено захламлять кодовую базу устаревшими черновиками; ввод ведётся строго через `yarn ingest-competition`

### S3 Asset Compression

Хэшированные JS и CSS в `/assets/*` обязаны предварительно сжиматься gzip level 9 (`yarn compress-assets`) и синхронизироваться в S3 с `--content-encoding gzip` и точным `--content-type`

### Two-Tier Prerender & S3 Deployment Cost Optimization

1) В пайплайне деплоя `deploy.yml` и скрипте `prerender-pages.ts` внедрена двухуровневая модель пререндера: при повседневных коммитах (git push в `main`) выполняется лёгкий пререндер `yarn run prerender-seo --hubs-only` (~180 страниц: все разделы, каталог пород, хабы пород `/breeds/:slug/`, 404.html, sitemap), занимающий 0.26 сек и генерирующий менее 200 операций записи в месяц. Это полностью укладывается в бесплатный лимит Free Tier Яндекс Облака (10 000 операций в месяц — 0 ₽) и предотвращает спам 25 000 PUT-запросами на каждый коммит (устраняя необоснованные списания ~350–900 ₽/мес). Живые пользователи мгновенно обслуживаются через React SPA и S3 fallback (`--error-document index.html`); 2) Полный SEO-пререндер всех 25 000+ HTML-страниц (собаки, выставки, судьи) запускается строго 1 раз в месяц по расписанию (`0 3 1 * *`) либо вручную по кнопке в GitHub Actions (`inputs.full_prerender: true` или `[seo full]`), что обходится всего в ~7.7 ₽ за весь месяц; 3) В `deploy.yml` поиск HTML-страниц хабов ограничен `-maxdepth 3`: `find frontend/dist -maxdepth 3 -name "index.html"` рекурсивно находит и обновляет 100% хабов пород любой глубины (включая `/breeds/:slug/index.html` на глубине 3), гарантируя актуальность хэшей скриптов и предотвращая зависание цикла; при лёгком деплое устаревшие страницы `dog/` на S3 очищаются (`aws s3 rm .../dog/ --recursive`), гарантируя отдачу свежего SPA-бандла пользователям

### Package manager

**yarn@1.22.22**

### Local secrets

`.env.ai` (gitignored)

### Bot

Workers + Grammy + KV; aggregates only

### Local Dev Data Compression Parity

В локальном сервере разработки (frontend/vite.config.ts -> serveDataV1) раздача файлов .json из /data/v1/ обязана поддерживать gzip-сжатие при наличии заголовка Accept-Encoding: gzip, обеспечивая паритет скорости передачи данных с продакшн CDN S3 и предотвращая передачу многомегабайтных несжатых файлов через loopback

### S3 Trailing Slash Canonical & Crawl Invariant

На статическом веб-хостинге S3 (Яндекс Облако) все директории и страницы каталогов в канонических URL (`<link rel="canonical">`), хлебных крошках (`BreadcrumbList`), внутренней перелинковке хабов и файлах `sitemap*.xml` обязаны строго содержать замыкающий слэш (`/`). Ссылки без слэша вызывают цепочки HTTP `302 Found` редиректов веб-сервера S3, сжигая краулинговый бюджет ботов

### Canonical URL Trailing Slash & Route Redirects Invariant

Все внутренние ссылки на разделы каталога и хабов обязаны строго содержать замыкающий слэш (`/speed-records/`, `/donino/championship/`, `/competitions/?tab=...`, `/shows/?tab=...`). Редиректы со старых путей (`/donino/championship/standings` → `/donino/championship/`, `/donino/championship/analytics` → `/donino/analytics/`, `/donino-championship` → `/donino/championship/`) регистрируются в `AppRoutes.tsx` с флагом `replace`, предотвращая накопление лишней истории навигации

## Domain Forbidden Rules

- Неизолированные живые сетевые HTTP-запросы в юнит-тестах без оффлайн-фикстуры, мока или AbortSignal.timeout (приводит к зависаниям и падениям тестов при недоступности внешних серверов)
- Повторное синхронное чтение всего набора 256 CDN-шардов внутри отдельных тестов и циклов (шарды обязаны кэшироваться в Map на уровне файла, а проверки собираться в массив нарушений violations[])
- Deploy Worker in site CI
- Commit/push without user request (execute smart commits only when user requests: "commit", "push", "закоммить", "сохрани", "запушь")
- Runtime D1 in production
- Co-Authored-By trailers, bot author credits, or committing as bot accounts (maintain clean single-contributor profile 'antajl <antajl@yandex.ru>')
- Writing complex multiline node -e with backticks in PowerShell (use temporary .cjs scripts to avoid shell escaping issues)
- Passing Node V8 memory flags to npx CLI (e.g. `npx --max-old-space-size=...` is ignored by npx and causes 4GB heap OOM; use `node --max-old-space-size=12288 ./node_modules/tsx/dist/cli.mjs <script>` or `NODE_OPTIONS`)
- Блокировать путь «/data/» в robots.txt: поисковые краулеры (Google WRS) используют клиентский JavaScript для рендеринга страниц и должны иметь полный доступ к fetch-запросам JSON данных, иначе страницы индексируются пустыми или получают статус Soft 404
