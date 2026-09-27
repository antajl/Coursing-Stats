# Миграция на GitHub Pages

## Обзор

Перенос сайта с Cloudflare Pages на GitHub Pages для доступности из России без VPN.

**Риск:** `VITE_TURSO_AUTH_TOKEN` будет в браузерном коде (как сейчас на Cloudflare Pages). Данные выставок публичные, риск приемлем.

---

## Шаг 1: Настройка GitHub Pages

### 1.1 Включить GitHub Pages

1. Перейди в репозиторий `antajl/Coursing-Stats`
2. Settings → Pages
3. Source: **GitHub Actions** (не Deploy from a branch)
4. Сохранить

### 1.2 Настроить custom domain

1. В Settings → Pages → Custom domains
2. Введи: `coursing-stats.ru`
3. Нажми "Add"
4. Добавь: `www.coursing-stats.ru`
5. После добавления GitHub покажет CNAME для DNS (скопируй)

---

## Шаг 2: Настройка GitHub Secrets

### 2.1 Добавить Turso secrets

1. Settings → Secrets and variables → Actions
2. New repository secret → **VITE_TURSO_URL**
   - Значение: взять из Cloudflare Pages secrets (или `.env.ai`)
3. New repository secret → **VITE_TURSO_AUTH_TOKEN**
   - Значение: взять из Cloudflare Pages secrets (или `.env.ai`)

**Где взять значения:**
- Cloudflare Pages → Settings → Environment variables
- Или локально в `.env.ai` (gitignored)

---

## Шаг 3: Перенос DNS на Reg.ru

### 3.1 Изменить NS-серверы

**На Reg.ru:**
1. Перейди к домену `coursing-stats.ru`
2. DNS-серверы и управление зоной
3. Удали Cloudflare NS:
   - Удалить: `raquel.ns.cloudflare.com`
   - Удалить: `rohin.ns.cloudflare.com`
4. Добавь Reg.ru NS:
   - Добавить: `ns1.reg.ru`
   - Добавить: `ns2.reg.ru`
5. Сохранить

**Ждать:** 5-30 минут для NS распространения

### 3.2 Настроить DNS записи

**На Reg.ru (после NS распространения):**
1. DNS-серверы и управление зона → Управление зоной
2. Удали все существующие записи (если есть)
3. Добавь новые записи:

```
Type: CNAME
Name: @
Value: antajl.github.io
TTL: 3600

Type: CNAME
Name: www
Value: antajl.github.io
TTL: 3600
```

**Важно:** Используй CNAME который показал GitHub Pages в Шаге 1.2 (может отличаться от `antajl.github.io`)

---

## Шаг 4: Деплой

### 4.1 Сделать commit

```bash
git add .github/workflows/deploy-frontend.yml
git commit -m "Migrate to GitHub Pages for Russia accessibility"
git push
```

### 4.2 Проверить GitHub Actions

1. Перейди в репозиторий → Actions
2. Workflow "Deploy to GitHub Pages" должен запуститься
3. Подожди завершения (~5-10 минут)

---

## Шаг 5: Тестирование

### 5.1 Без VPN (из России)

1. Открой `https://coursing-stats.ru`
2. Проверь:
   - [ ] Главная страница загружается
   - [ ] Соревнования → Календарь работает
   - [ ] Соревнования → Рейтинги работают
   - [ ] Выставки → Календарь работает
   - [ ] Выставки → Рейтинги работают
   - [ ] Донино → Календарь работает

### 5.2 С VPN

1. Открой `https://coursing-stats.ru` с VPN
2. Проверь что всё работает так же

---

## Шаг 6: Отключить Cloudflare Pages (опционально)

**После успешного тестирования:**

1. Cloudflare Dashboard → Pages → coursingstats
2. Project settings → Custom domains
3. Удали `coursing-stats.ru` и `www.coursing-stats.ru`
4. Или удали весь project (если не нужен)

---

## Если что-то не работает

### DNS не распространяется

- Проверь через `nslookup coursing-stats.ru` - должен показывать Reg.ru NS
- Ждите до 24 часов для полного распространения

### GitHub Actions падает

- Проверь Secrets в Settings → Secrets and variables → Actions
- Проверь логи в Actions → Deploy to GitHub Pages

### Турсо не работает

- Проверь что `VITE_TURSO_URL` и `VITE_TURSO_AUTH_TOKEN` добавлены в Secrets
- В DevTools → Console поищи ошибки Turso
- Браузер должен показать JSON fallback (если Turso не работает)

---

## Изменения в инфраструктуре

**Было:**
```
GitHub Actions → Cloudflare Pages → coursing-stats.ru (DNS Cloudflare)
```

**Стало:**
```
GitHub Actions → GitHub Pages → coursing-stats.ru (DNS Reg.ru)
```

**Что не меняется:**
- GitHub Actions workflow (только деплой на GitHub Pages вместо Cloudflare)
- Frontend код (никаких изменений)
- Turso (прямые запросы из браузера)
- Данные (data/v1/ → копируются в dist)
