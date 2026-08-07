/**
 * Компонент для интеграции Cloudflare Web Analytics
 * Для SEO-мониторинга и анализа производительности
 */

import { Helmet } from 'react-helmet-async'

interface CloudflareAnalyticsProps {
  token?: string
  enableSPA?: boolean
}

const CLOUDFLARE_ANALYTICS_TOKEN = 'your-cloudflare-analytics-token' // Замените на реальный токен

export function CloudflareAnalytics({ 
  token = CLOUDFLARE_ANALYTICS_TOKEN,
  enableSPA = true 
}: CloudflareAnalyticsProps) {
  return (
    <Helmet>
      {/* Cloudflare Web Analytics */}
      <script defer src="https://static.cloudflareinsights.com/beacon.min.js" 
              data-cf-beacon={JSON.stringify({
                token: token,
                spa: enableSPA,
                script: 'beacon.min.js'
              })} />
    </Helmet>
  )
}

/**
 * Хук для отслеживания SEO-событий в Cloudflare Analytics
 */
export function useCloudflareAnalytics() {
  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any)._cfBeacon) {
      // Cloudflare Analytics автоматически отслеживает page views
      // Для пользовательских событий можно использовать собственную логику
      console.log(`[Cloudflare Analytics] Event: ${eventName}`, data)
    }
  }

  const trackSEOEvent = (eventType: string, seoData: {
    pageType?: string
    keywords?: string[]
    ranking?: number
    trafficSource?: string
  }) => {
    trackEvent('seo_event', {
      event_type: eventType,
      ...seoData,
      timestamp: new Date().toISOString()
    })
  }

  const trackPerformance = (metrics: {
    lcp?: number
    inp?: number
    cls?: number
    fcp?: number
    ttfb?: number
  }) => {
    trackEvent('performance_metrics', {
      ...metrics,
      timestamp: new Date().toISOString()
    })
  }

  return { trackEvent, trackSEOEvent, trackPerformance }
}

/**
 * Компонент для интеграции Google Analytics 4
 */
export function GoogleAnalytics4({ measurementId }: { measurementId: string }) {
  return (
    <Helmet>
      {/* Google Analytics 4 */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
            send_page_view: true
          });
        `}
      </script>
    </Helmet>
  )
}

/**
 * Хук для отслеживания событий в Google Analytics 4
 */
export function useGoogleAnalytics4() {
  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters)
    }
  }

  const trackSEOEvent = (eventType: string, seoData: {
    page_title?: string
    page_location?: string
    search_term?: string
    ranking_position?: number
  }) => {
    trackEvent('seo_event', {
      event_category: 'seo',
      event_type: eventType,
      ...seoData
    })
  }

  const trackPageView = (pagePath: string, pageTitle: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-MEASUREMENT_ID', {
        page_title: pageTitle,
        page_location: pagePath
      })
    }
  }

  return { trackEvent, trackSEOEvent, trackPageView }
}