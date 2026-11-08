import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

// Яндекс.Метрика код счетчика
// Номер счётчика: 110619327
// Настройки: Вебвизор, карта скроллинга, точные отскоки, отслеживание ссылок
const YANDEX_METRICA_ID = 110619327

declare global {
  interface Window {
    ym?: (...args: any[]) => void
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
  }
}

export function YandexMetrica() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.') ||
      window.location.hostname.startsWith('172.') ||
      window.location.hostname.endsWith('.local'))

  useEffect(() => {
    if (import.meta.env.DEV || isLocalhost) return

    // Первый рендер уже фиксируется init-скриптом Метрики и тегом GA4 в index.html
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // При виртуальных переходах в SPA (React Router) отправляем hit в Метрику и page_view в GA4
    const url = window.location.href
    const path = location.pathname + location.search

    // Откладываем на такт микротаски, чтобы тег <title> успел обновиться через Helmet/SEO
    const timer = setTimeout(() => {
      try {
        if (typeof window.ym === 'function') {
          window.ym(YANDEX_METRICA_ID, 'hit', url, {
            title: document.title,
            referer: document.referrer,
          })
        }
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: url,
            page_path: path,
          })
        }
      } catch (err) {
        console.warn('Analytics SPA hit error:', err)
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [location.pathname, location.search, isLocalhost])

  if (import.meta.env.DEV || isLocalhost) {
    return null
  }

  return (
    <Helmet>
      {/* Яндекс.Метрика */}
      <script type="text/javascript">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=110619327', 'ym');

          ym(${YANDEX_METRICA_ID}, 'init', {
            ssr: true,
            webvisor: false,
            clickmap: true,
            accurateTrackBounce: true,
            trackLinks: true
          });
        `}
      </script>
      <noscript>
        {`<div><img src="https://mc.yandex.ru/watch/${YANDEX_METRICA_ID}" width="1" height="1" style="position:absolute; left:-9999px;" alt="" role="presentation" aria-hidden="true" /></div>`}
      </noscript>
    </Helmet>
  )
}

// Хук для отслеживания целей Яндекс.Метрики
export function useYandexGoal() {
  const reachGoal = (goalName: string) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(YANDEX_METRICA_ID, 'reachGoal', goalName)
    }
  }

  const trackSEOEvent = (eventType: string, data: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.ym) {
      window.ym(YANDEX_METRICA_ID, 'reachGoal', eventType, data)
    }
  }

  return { reachGoal, trackSEOEvent }
}

// Имена целей для использования в компонентах:
// 'dog_profile_view' - просмотр профиля собаки
// 'search_used' - использование поиска
// 'filter_used' - использование фильтров
// 'procoursing_link' - переход на procoursing.ru
// 'competition_view' - просмотр соревнования
// 'speed_records_view' - просмотр рекордов скорости
// 'judges_view' - просмотр судей
// 'guide_view' - просмотр справочника
