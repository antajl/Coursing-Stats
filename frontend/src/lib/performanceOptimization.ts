/**
 * Утилиты для оптимизации производительности
 * Специфично для русского SEO и Core Web Vitals
 */

import { useState, useCallback } from 'react'

/**
 * Предзагрузка критических шрифтов для улучшения LCP
 */
export function preloadCriticalFonts() {
  if (typeof document === 'undefined') return

  const fonts = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      as: 'style',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = font.href
    link.as = font.as
    if (font.type) link.type = font.type
    if (font.crossorigin) link.crossOrigin = font.crossorigin
    document.head.appendChild(link)
  })
}

/**
 * Ленивая загрузка изображений для улучшения LCP
 */
export function setupLazyLoading() {
  if (typeof document === 'undefined') return

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          if (img.dataset.src) {
            img.src = img.dataset.src
            img.removeAttribute('data-src')
            observer.unobserve(img)
          }
        }
      })
    })

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img)
    })
  }
}

/**
 * Оптимизация критического CSS inline
 */
export function inlineCriticalCSS() {
  // Без критических CSS - используем оригинальные стили из index.css
  // Если нужно добавить критические стили, используйте оригинальные цвета сайта
}

/**
 * Предзагрузка критических JavaScript
 */
export function preloadCriticalJS() {
  if (typeof document === 'undefined') return

  const criticalScripts = [
    '/main.js',
  ]

  criticalScripts.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = src
    document.head.appendChild(link)
  })
}

/**
 * Инициализация всех оптимизаций производительности
 */
export function initPerformanceOptimizations() {
  if (typeof window === 'undefined') return

  // Запускаем после загрузки DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      preloadCriticalFonts()
      setupLazyLoading()
      preloadCriticalJS()
    })
  } else {
    preloadCriticalFonts()
    setupLazyLoading()
    preloadCriticalJS()
  }

  // Inline critical CSS сразу
  inlineCriticalCSS()
}

/**
 * Debounce для оптимизации обработчиков событий
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle для оптимизации обработчиков событий
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Оптимизация рендеринга списков с виртуализацией
 */
export function virtualizedList<T>(
  items: T[],
  renderItem: (item: T, index: number) => React.ReactNode,
  itemHeight: number,
  containerHeight: number
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2
  const [scrollTop, setScrollTop] = useState(0)

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount)

  const visibleItems = items.slice(startIndex, endIndex + 1)

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    startIndex,
    onScroll,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight,
  }
}

/**
 * Создание Set для O(1) lookups вместо O(n) array.includes
 */
export function createLookupSet<T>(items: T[]): Set<T> {
  return new Set(items)
}

/**
 * Оптимизированная проверка наличия элемента
 */
export function hasItem<T>(lookupSet: Set<T>, item: T): boolean {
  return lookupSet.has(item)
}

/**
 * Кэширование дорогих вычислений
 */
export function createComputationCache<TInput, TResult>() {
  const cache = new Map<TInput, TResult>()

  return {
    get(input: TInput, compute: () => TResult): TResult {
      if (cache.has(input)) {
        return cache.get(input)!
      }
      const result = compute()
      cache.set(input, result)
      return result
    },
    clear(): void {
      cache.clear()
    },
    size(): number {
      return cache.size
    },
  }
}

/**
 * Отложенное выполнение некритичных задач
 */
export function deferNonCriticalWork(callback: () => void): void {
  if (typeof window === 'undefined') return

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback)
  } else {
    setTimeout(callback, 0)
  }
}

/**
 * Оптимизированная фильтрация и сортировка в один проход
 */
export function filterAndSort<T>(
  items: T[],
  predicate: (item: T) => boolean,
  compareFn: (a: T, b: T) => number
): T[] {
  const filtered: T[] = []
  for (const item of items) {
    if (predicate(item)) {
      filtered.push(item)
    }
  }
  return filtered.sort(compareFn)
}