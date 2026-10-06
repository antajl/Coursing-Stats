import { lazy, Suspense, useState, useEffect } from 'react'
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { usePublicCalendarVisible } from '../hooks/useStaticData'
import LoadingCard from '../components/LoadingCard'
import { MobileSubNavTabs } from '../components/ui/MobileSubNavTabs'

const TopDogs = lazy(() => import('./TopDogs'))
const Judges = lazy(() => import('./Judges'))
const Events = lazy(() => import('./Events'))

function Competitions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = searchParams.get('tab') || 'ranking'
  const calendarVisible = usePublicCalendarVisible('competitions')

  if (tab === 'calendar') {
    return <Navigate to="/competitions?tab=archive" replace />
  }

  if (tab === 'builder' || tab === 'protocol-builder') {
    return <Navigate to="/protocol-builder" replace />
  }

  if (!calendarVisible && tab === 'archive') {
    return <Navigate to="/competitions?tab=ranking" replace />
  }

  const activeTab =
    tab === 'judges' || tab === 'ranking' || (calendarVisible && tab === 'archive')
      ? tab
      : 'ranking'

  const handleTabChange = (newTab: string) => {
    if (newTab === 'builder') {
      navigate('/protocol-builder')
      return
    }
    const next = new URLSearchParams(searchParams)
    next.set('tab', newTab)
    setSearchParams(next)
  }

  const tabs = [
    { id: 'ranking', label: 'Рейтинг' },
    ...(calendarVisible ? [{ id: 'archive', label: 'Архив' }] : []),
    { id: 'judges', label: 'Судьи' },
    { id: 'builder', label: 'Конструктор' },
  ]

  return (
    <>
      <SEO
        title="Рейтинг собак: курсинг и бега борзых"
        description="Два отдельных рейтинга — по медалям и по очкам CS (курсинг, БЗМП, бега борзых) — плюс архив соревнований и статистика судей. Данные с 2015 года."
        canonicalUrl="https://coursing-stats.ru/competitions"
        keywords="рейтинг курсинг, бега борзых, топ собак, медали, архив соревнований, судьи курсинг, РКФ"
      />
      <MobileSubNavTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        ariaLabel="Разделы соревнований"
      />

      <div className="min-h-[400px]">
        {activeTab === 'ranking' && (
          <div
            key="ranking"
            id="tab-panel-ranking"
            role="tabpanel"
            aria-labelledby="tab-ranking"
            className="cs-tab-panel-enter"
          >
            <Suspense fallback={<LoadingCard count={3} variant="list" />}>
              <TopDogs />
            </Suspense>
          </div>
        )}
        {activeTab === 'judges' && (
          <div
            key="judges"
            id="tab-panel-judges"
            role="tabpanel"
            aria-labelledby="tab-judges"
            className="cs-tab-panel-enter"
          >
            <Suspense fallback={<LoadingCard count={3} variant="list" />}>
              <Judges />
            </Suspense>
          </div>
        )}
        {calendarVisible && activeTab === 'archive' && (
          <div
            key="archive"
            id="tab-panel-archive"
            role="tabpanel"
            aria-labelledby="tab-archive"
            className="cs-tab-panel-enter"
          >
            <Suspense fallback={<LoadingCard count={3} variant="list" />}>
              <Events />
            </Suspense>
          </div>
        )}
      </div>

      <footer className="mt-8 rounded-xl border border-old-money-100 bg-cream-50/30 p-3 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs leading-relaxed text-charcoal-500">
          <strong>Примечание:</strong> спортивная статистика и результаты состязаний систематизированы на основе официальных протоколов
          организаторов, полевых секретариатов и материалов ProCoursing.ru. Сведения могут содержать ошибки или быть неполными
          из-за фрагментарности открытых источников и ручного ведения ранних баз организаторами.
        </p>
      </footer>
    </>
  )
}

export default Competitions
