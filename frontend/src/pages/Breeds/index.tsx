import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema, itemPageSchema } from '../../components/JsonLd'
import LoadingCard from '../../components/LoadingCard'
import { useBreedsFilterAndSort } from './useBreedsFilterAndSort'
import BreedsToolbar from './BreedsToolbar'
import BreedsList from './BreedsList'

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

      <BreedsList
        sortedBreeds={sortedBreeds}
        statsMap={statsMap}
        visibleCount={visibleCount}
        sortKey={sortKey}
        setSortKey={setSortKey}
        plaqueTitle={plaqueTitle}
        loadMoreRef={loadMoreRef}
        loading={loading}
      />
    </div>
  )
}
