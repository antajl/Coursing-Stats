import { useState, useMemo } from 'react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, itemPageSchema } from '../../components/JsonLd'
import LoadingCard from '../../components/LoadingCard'
import { CORE_BREED_HUBS } from '../../lib/breed-hubs-data'
import type { BreedCardDesignVariant } from '../../components/BreedCard/types'
import { useBreedsFilterAndSort } from './useBreedsFilterAndSort'
import BreedsToolbar from './BreedsToolbar'
import BreedsList from './BreedsList'
import BreedsCatalogSummary from './BreedsCatalogSummary'
import BreedsVariantSwitcher from './BreedsVariantSwitcher'

export default function BreedsDirectory() {
  const {
    selectedGroup,
    selectedBreed,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    visibleCount,
    isInitialLoad,
    loading,
    groupCounts,
    statsMap,
    allBreedKeys,
    sortedGroupKeys,
    mobileBreedList,
    breedCandidates,
    sortedBreeds,
    quickBreedBarValue,
    plaqueTitle,
    loadMoreRef,
    handleSelectGroup,
    handleSelectBreed,
  } = useBreedsFilterAndSort()

  const [cardVariant, setCardVariant] = useState<BreedCardDesignVariant>(() => {
    try {
      return (sessionStorage.getItem('cs_breed_card_variant') as BreedCardDesignVariant) || 'passport'
    } catch {
      return 'passport'
    }
  })

  const [showSummary, setShowSummary] = useState(true)

  const handleVariantChange = (v: BreedCardDesignVariant) => {
    setCardVariant(v)
    try {
      sessionStorage.setItem('cs_breed_card_variant', v)
    } catch {}
  }

  const summaryData = useMemo(() => {
    let totalDogs = 0
    let totalStarts = 0
    let maxSpeed = 0

    for (const s of Object.values(statsMap)) {
      totalDogs += s.dogs || 0
      totalStarts += s.starts || 0
      if (s.maxSpeed && s.maxSpeed > maxSpeed) {
        maxSpeed = s.maxSpeed
      }
    }

    return {
      totalBreeds: CORE_BREED_HUBS.length,
      totalDogs,
      totalStarts,
      maxSpeed,
    }
  }, [statsMap])

  const seoTitle = 'Каталог пород собак: курсинг, бега борзых и БЗМП | Курсинг Статс'
  const seoDesc =
    'Сводный реестр 83 беговых пород собак в курсинге, рейсинге и БЗМП: карточки пород по группам FCI и РКФ, история забегов с 2015 года, рекорды скорости и залы славы чемпионов.'

  if (isInitialLoad && loading) {
    return <LoadingCard count={8} variant="list" />
  }

  return (
    <div className="max-w-full mx-auto pb-4 sm:pb-6 space-y-3 sm:space-y-4">
      <SEO
        title={seoTitle}
        description={seoDesc}
        canonicalUrl="https://coursing-stats.ru/breeds/"
        keywords="породы собак, курсинг породы, бега борзых, уиппет, салюки, рпб, басенджи, бзмп, fci"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Породы', url: '/breeds/' },
            ]),
            itemPageSchema({
              url: 'https://coursing-stats.ru/breeds/',
              name: seoTitle,
              description: seoDesc,
            }),
          ],
        }}
      />

      <BreedsToolbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedGroup={selectedGroup}
        handleSelectGroup={handleSelectGroup}
        selectedBreed={selectedBreed}
        handleSelectBreed={handleSelectBreed}
        quickBreedBarValue={quickBreedBarValue}
        groupCounts={groupCounts}
        sortedGroupKeys={sortedGroupKeys}
        mobileBreedList={mobileBreedList}
        breedCandidates={breedCandidates}
        allBreedKeys={allBreedKeys}
      />

      {/* Интерактивный переключатель вариантов прямо на странице */}
      <BreedsVariantSwitcher
        currentVariant={cardVariant}
        onChangeVariant={handleVariantChange}
        showSummary={showSummary}
        onToggleSummary={() => setShowSummary((prev) => !prev)}
      />

      {/* Сводный баннер каталога пород */}
      {showSummary && (
        <BreedsCatalogSummary
          totalBreeds={summaryData.totalBreeds}
          totalDogs={summaryData.totalDogs}
          totalStarts={summaryData.totalStarts}
          maxSpeed={summaryData.maxSpeed}
        />
      )}

      <BreedsList
        sortedBreeds={sortedBreeds}
        statsMap={statsMap}
        visibleCount={visibleCount}
        sortKey={sortKey}
        setSortKey={setSortKey}
        plaqueTitle={plaqueTitle}
        loadMoreRef={loadMoreRef}
        loading={loading}
        layoutVariant={cardVariant}
      />
    </div>
  )
}
