import { useState, useEffect, useRef, useCallback } from 'react'

const ITEMS_PER_PAGE = 30

export function useInfiniteScroll(itemCount: number, resetDeps: unknown[] = []) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when filters or list length change
  }, [itemCount, ...resetDeps])

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, itemCount))
  }, [itemCount])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0.1 }
    )

    const el = loadMoreRef.current
    if (el) observerRef.current.observe(el)

    return () => observerRef.current?.disconnect()
  }, [loadMore])

  const hasMore = visibleCount < itemCount

  return { visibleCount, loadMoreRef, hasMore }
}
