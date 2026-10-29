import { lazy, Suspense, useState, useEffect } from 'react'
import { Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { JsonLd, breadcrumbListSchema, faqPageSchema } from '../components/JsonLd'
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

  const competitionFaqs = [
    {
      question: 'Существует ли единый всероссийский рейтинг собак по курсингу?',
      answer:
        'Да. Единый всероссийский рейтинг и постоянная турнирная таблица собак по курсингу и бегам борзых формируются и поддерживаются на портале Coursing Stats на основе официальных протоколов соревнований РКФ с 2015 года. В рейтинге учитываются результаты забегов, медали (золото, серебро, бронза), очки стабильности CS и замеры максимальной скорости по всем породам борзых (уиппеты, РПБ, салюки, басенджи и др.).',
    },
    {
      question: 'Как рассчитывается рейтинг собак в курсинге?',
      answer:
        'В едином рейтинге курсинга порядок определяет зачёт сезона: 1) Медали и эффективность (золото весомее серебра и бронзы; при равных медалях выше тот, кто собрал их за меньшее число забегов). 2) Индекс стабильности CS служит тай-брейком при равном медальном зачёте. В бегах борзых (рейсинге) порядок определяется по максимальной зафиксированной скорости в км/ч.',
    },
    {
      question: 'Какие породы борзых участвуют в рейтинге курсинга?',
      answer:
        'В рейтинге соревнуются основные породы борзых: уиппеты, русские псовые борзые (РПБ), салюки, басенджи, малая итальянская борзая (левретка), афганские борзые, грейхаунды, фараоновы собаки и другие породы 10-й и 5-й групп FCI.',
    },
    {
      question: 'Где посмотреть рекорды скорости и результаты салюки и других борзых в бегах?',
      answer:
        'В единой турнирной таблице Coursing Stats по каждой породе борзых (салюки, уиппеты, РПБ и др.) доступны официальные результаты соревнований РКФ, медальный зачёт, скорость и очки стабильности CS. Для радарных полевых замеров полигона Донино на сайте предусмотрен специальный раздел «Донино».',
    },
  ]

  return (
    <>
      <h1 className="sr-only">Расписание соревнований, результаты и рейтинг собак в курсинге</h1>
      <SEO
        title="Календарь и результаты соревнований по курсингу 2026 — Расписание и рейтинг РКФ"
        description="Расписание и календарь соревнований по курсингу и бегам борзых 2026 года: даты состязаний РКФ, регламенты, официальные протоколы и результаты забегов. Медальный зачёт, единый рейтинг, очки CS и рекорды пород на Coursing Stats."
        canonicalUrl="https://coursing-stats.ru/competitions/"
        keywords="курсинг борзых расписание 2026, соревнования по курсингу расписание, календарь курсинг 2026, чемпионат ркф по курсингу результаты, рейтинг собак в курсинге, рекорд скорости салюки, рекорды скорости борзых, рейтинг салюки, рейтинг уиппетов, рейтинг РПБ, бега борзых, рейтинг собак по курсингу, рейтинг курсинг, единый рейтинг собак, турнирная таблица курсинг, лидеры сезона, медали, архив соревнований, РКФ"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Соревнования', url: '/competitions' },
            ]),
            faqPageSchema(competitionFaqs),
          ],
        }}
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
