import { useState, useEffect, useRef, useCallback } from 'react'

const ITEMS_PER_PAGE = 30

export function useInfiniteScroll(
  itemCount: number,
  resetDeps: unknown[] = [],
  pageSize: number = ITEMS_PER_PAGE
) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setVisibleCount(pageSize)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when filters or list length change
  }, [itemCount, pageSize, ...resetDeps])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + pageSize, itemCount))
  }, [itemCount, pageSize])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1, rootMargin: '300px' }
    )

    const el = loadMoreRef.current
    if (el) observerRef.current.observe(el)

    return () => observerRef.current?.disconnect()
  }, [loadMore])

  const hasMore = visibleCount < itemCount

  return { visibleCount, loadMoreRef, hasMore }
}
