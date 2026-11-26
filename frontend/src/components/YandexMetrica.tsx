import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

// Яндекс.Метрика код счетчика
// Номер счётчика: 110619327
// Настройки: Вебвизор, карта скроллинга, точные отскоки, отслеживание ссылок
const YANDEX_METRICA_ID = 110619327

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

  // Init-скрипт и noscript вынесены статически в index.html для гарантированного обнаружения ботами
  return null
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
