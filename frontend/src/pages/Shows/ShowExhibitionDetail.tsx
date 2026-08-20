import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import SkeletonLoader from '../../components/SkeletonLoader'
import ErrorState from '../../components/ErrorState'
import RKFAttribution from '../../components/RKFAttribution'
import PageToolbar from '../../components/toolbar/PageToolbar'
import { SEO } from '../../components/SEO'
import { CACHE } from '../../lib/constants'
import ToolbarFiltersDropdown from '../../components/toolbar/ToolbarFiltersDropdown'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { getShowExhibition } from '../../lib/staticData'
import {
  SHOW_AWARD_BADGE,
  type ShowAwardKey,
} from '../../../../backend/lib/show-award-ranking'
import { collectExhibitionAwardKeys } from './showExhibitionUtils'
import type { ShowExhibition } from './ShowExhibitionDetail/types'
import { ExhibitionHeader } from './ShowExhibitionDetail/ExhibitionHeader'
import { MainRingSection } from './ShowExhibitionDetail/MainRingSection'
import {
  CatalogResultsSection,
  ExhibitionAwardFilter,
} from './ShowExhibitionDetail/CatalogResultsSection'
import { LegacyResultsSection } from './ShowExhibitionDetail/LegacyResultsSection'

export default function ShowExhibitionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [exhibition, setExhibition] = useState<ShowExhibition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [awardKey, setAwardKey] = useState<ShowAwardKey | null>(null)

  // React Query for exhibition data with caching (5 minutes staleTime, matches ShowCalendar)
  const { data: exhibitionData, isLoading: isExhibitionLoading, error: exhibitionError } = useQuery({
    queryKey: ['showExhibition', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('ID выставки не указан')
      }
      const result = await getShowExhibition(id)
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Не удалось загрузить данные выставки')
      }
      return result.data as ShowExhibition
    },
    enabled: !!id,
    staleTime: CACHE.MEDIUM, // 5 minutes (matches query-client.tsx)
  })

  useEffect(() => {
    if (exhibitionData) {
      setExhibition(exhibitionData)
      setAwardKey(null)
    }
  }, [exhibitionData])

  useEffect(() => {
    if (exhibitionError) {
      setError('Не удалось загрузить данные выставки')
    }
  }, [exhibitionError])

  useEffect(() => {
    setLoading(isExhibitionLoading)
  }, [isExhibitionLoading])

  const availableAwards = useMemo(
    () => (exhibition ? collectExhibitionAwardKeys(exhibition.results) : []),
    [exhibition]
  )

  const hasActiveFilters = Boolean(searchQuery.trim() || awardKey)

  if (loading) {
    return (
      <div className="mx-auto max-w-full pb-2 sm:pb-4">
        <SkeletonLoader variant="card" count={3} />
      </div>
    )
  }

  if (error || !exhibition) {
    return (
      <div className="mx-auto max-w-full pb-2 sm:pb-4">
        <ErrorState
          title="Выставка не найдена"
          message={error || `ID: ${id}`}
          action={
            <Link
              to="/shows?tab=ranking"
              className="rounded-xl border-2 border-camel-300 bg-white px-4 py-2 text-sm font-semibold text-camel-700 transition-all hover:border-camel-400 hover:bg-camel-50 dark:border-camel-600 dark:bg-charcoal-800 dark:text-camel-400 dark:hover:bg-charcoal-700"
            >
              К рейтингу выставок
            </Link>
          }
        />
      </div>
    )
  }

  const hasCatalog = exhibition.breed_catalog != null && exhibition.breed_catalog.length > 0
  const seoTitle = `${exhibition.title || 'Выставка'} — ${exhibition.date || ''}`.trim()
  const seoDescription = [
    `Выставка РКФ: ${exhibition.title}`,
    exhibition.date || null,
    exhibition.location || null,
    exhibition.results?.length ? `${exhibition.results.length} результатов` : null,
    'Протокол и статистика на Coursing Stats.',
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <div className="mx-auto max-w-full pb-2 sm:pb-4">
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${exhibition.title}, выставка РКФ, результаты, ${exhibition.location || ''}`}
        canonicalUrl={`https://coursing-stats.ru/shows/exhibition/${id}`}
      />
      <ExhibitionHeader exhibition={exhibition} onBack={() => navigate(-1)} />

      {exhibition.results.length > 0 || hasCatalog ? (
        <div className="mb-4">
          <PageToolbar
            bare
            trailing={<RKFAttribution />}
            onClearAllFilters={
              hasActiveFilters
                ? () => {
                    setSearchQuery('')
                    setAwardKey(null)
                  }
                : undefined
            }
            filters={
              <>
                <ToolbarSearch
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Кличка или порода…"
                  className="!w-auto min-w-[180px] flex-1 max-w-md"
                />
                {availableAwards.length > 0 ? (
                  <ToolbarFiltersDropdown
                    active={Boolean(awardKey)}
                    activeCount={awardKey ? 1 : 0}
                    panelClassName="md:w-[min(360px,calc(100vw-2rem))]"
                    onReset={() => setAwardKey(null)}
                    label="Фильтры"
                  >
                    <ExhibitionAwardFilter
                      awards={availableAwards}
                      value={awardKey}
                      onChange={setAwardKey}
                    />
                  </ToolbarFiltersDropdown>
                ) : null}
              </>
            }
          />
        </div>
      ) : null}

      <MainRingSection
        rows={exhibition.main_ring ?? []}
        bisUrl={exhibition.bis_reports_link}
      />

      {hasCatalog ? (
        <CatalogResultsSection
          catalog={exhibition.breed_catalog!}
          results={exhibition.results}
          searchQuery={searchQuery}
          awardKey={awardKey}
        />
      ) : exhibition.results.length > 0 ? (
        <LegacyResultsSection
          results={exhibition.results}
          searchQuery={searchQuery}
          awardKey={awardKey}
        />
      ) : (
        <div className="rounded-xl border border-old-money-200 bg-cream-50 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/40">
          <div className="text-sm text-old-money-500 dark:text-old-money-400">Нет данных о результатах</div>
        </div>
      )}
    </div>
  )
}
