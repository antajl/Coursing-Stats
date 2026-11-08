import { useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { getLastSectionTab, setLastSectionTab } from '../../lib/navState'
import { SEO } from '../../components/SEO'
import { JsonLd, faqPageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import { GUIDE_FAQS } from './guideFaqs'
import TitlesTab from './components/TitlesTab'
import ShowsTab from './components/ShowsTab'
import DoninoTab from './components/DoninoTab'
import RatingTab from './components/RatingTab'

const GUIDE_SECTIONS = [
  {
    id: 'titles',
    label: 'Соревнования',
    description:
      'Правила курсинга и бегов борзых РКФ/FCI: титулы, сертификаты CACIL и CACL, анатомия протокола, кворум и лестница наград.',
    keywords: 'титулы курсинг, CACIL, CACL, чемпион России курсинг, сертификаты бега борзых, анатомия протокола, норма ВС',
  },
  {
    id: 'shows',
    label: 'Выставки',
    description:
      'Награды и титулы на выставках РКФ: пошаговый роадмап ринга от CW до BIS, 8 классов собак по возрасту, ленты оценок и ранги выставок.',
    keywords: 'выставки РКФ, CAC, BOB, ЧРКФ, КЧК, классы выставок, титулы выставок',
  },
  {
    id: 'donino',
    label: 'Скорость и Донино',
    description:
      'Скорость бега пород борзых в км/ч, спринт 350 м на песчаном треке Донино, система 3 соревновательных лиг и рекорды полигона.',
    keywords: 'курсинг донино, скорость борзых км ч, замеры скорости собак, рекорды 350м, runningdog, лиги донино, уиппет скорость',
  },
  {
    id: 'rating',
    label: 'Рейтинг сайта',
    description:
      'Как устроен зачёт сезона Coursing Stats: олимпийский медальный каскад, показатель эффективности standingScore и индекс качества CS v2.',
    keywords: 'рейтинг курсинг, зачёт сезона, индекс CS, standingScore, медали курсинг, бега борзых',
  },
] as const

type TabId = (typeof GUIDE_SECTIONS)[number]['id']

function parseGuideTab(value: string | null): TabId {
  if (value === 'site' || value === 'protocol') {
    return 'titles'
  }
  if (value === 'speeds') {
    return 'donino'
  }
  return GUIDE_SECTIONS.some((t) => t.id === value) ? (value as TabId) : 'titles'
}

export default function Guide() {
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTabParam = searchParams.get('tab')

  let redirectPath: string | null = null
  if (!rawTabParam) {
    const savedTab = getLastSectionTab('guide')
    const next = new URLSearchParams(searchParams)
    next.set('tab', parseGuideTab(savedTab))
    redirectPath = `/guide/?${next.toString()}`
  }

  const activeTab = parseGuideTab(rawTabParam)
  const section = GUIDE_SECTIONS.find((s) => s.id === activeTab) ?? GUIDE_SECTIONS[0]
  const { reachGoal } = useYandexGoal()

  const handleTabChange = (newTab: TabId) => {
    setSearchParams({ tab: newTab })
  }

  useEffect(() => {
    reachGoal('guide_view')
  }, [reachGoal])

  useEffect(() => {
    if (!redirectPath) {
      setLastSectionTab('guide', activeTab)
    }
  }, [activeTab, redirectPath])

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  return (
    <>
      <h1 className="sr-only">Справочник: рекорды скорости пород, титулы и правила курсинга</h1>
      <SEO
        title={`Справочник — ${section.label}`}
        description={section.description}
        keywords={section.keywords}
        canonicalUrl="https://coursing-stats.ru/guide/"
      />
      <JsonLd data={faqPageSchema(GUIDE_FAQS)} />

      <MobileSubNavTabs
        tabs={GUIDE_SECTIONS}
        activeTab={activeTab}
        onChange={handleTabChange}
        ariaLabel="Разделы справочника"
      />

      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === 'titles' && <TitlesTab />}
        {activeTab === 'shows' && <ShowsTab />}
        {activeTab === 'donino' && <DoninoTab />}
        {activeTab === 'rating' && <RatingTab />}
      </div>
    </>
  )
}
