import { useEffect } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { getLastSectionTab, setLastSectionTab } from '../../lib/navState'
import { SEO } from '../../components/SEO'
import { JsonLd, faqPageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import { GUIDE_FAQS } from './guideFaqs'
import TitlesTab from './components/TitlesTab'
import ProtocolTab from './components/ProtocolTab'
import ShowsTab from './components/ShowsTab'
import SpeedsTab from './components/SpeedsTab'
import RatingTab from './components/RatingTab'
import DoninoTab from './components/DoninoTab'

const GUIDE_SECTIONS = [
  {
    id: 'titles',
    label: 'Соревнования',
    description:
      'Правила курсинга и бегов борзых РКФ/FCI: титулы, сертификаты CACIL и CACL, кворум и олимпийская лестница наград.',
    keywords: 'титулы курсинг, CACIL, CACL, чемпион России курсинг, сертификаты бега борзых',
  },
  {
    id: 'protocol',
    label: 'Протоколы',
    description:
      'Как читать протоколы курсинга и бегов борзых: структура таблицы, 5 критериев судейства, норматив ВС, попоны и дисквалификации.',
    keywords: 'протокол курсинг, как читать протокол, оценка курсинг, квалификация ВС, критерии судейства',
  },
  {
    id: 'shows',
    label: 'Выставки',
    description:
      'Награды и титулы на выставках РКФ: пошаговый роадмап ринга от CW до BIS, 8 классов собак по возрасту, ленты оценок и ранги выставок.',
    keywords: 'выставки РКФ, CAC, BOB, ЧРКФ, КЧК, классы выставок, титулы выставок',
  },
  {
    id: 'speeds',
    label: 'Скорость пород',
    description:
      'Скорость бега и рекорды пород борзых в км/ч: уиппет, салюки, русская псовая борзая, левретка, грейхаунд, афган. Сравнение спринта и дистанционной выносливости.',
    keywords:
      'рекорд скорости салюки, какая максимальная скорость уиппета, русская борзая скорость бега, левретка скорость бега, скорость борзых км ч',
  },
  {
    id: 'rating',
    label: 'Рейтинг',
    description:
      'Как устроен зачёт сезона Coursing Stats: олимпийский медальный каскад, показатель эффективности standingScore и индекс CS v2.',
    keywords: 'рейтинг курсинг, зачёт сезона, индекс CS, standingScore, медали курсинг, бега борзых',
  },
  {
    id: 'donino',
    label: 'Донино',
    description:
      'Беговой комплекс в Донино: трек 350 м, старт из боксов, система 3 соревновательных лиг (Прогресс, Чемпионы, Абсолют) и рекорды полигона.',
    keywords: 'курсинг донино, замеры скорости собак, рекорды 350м, runningdog, лиги донино',
  },
] as const

type TabId = (typeof GUIDE_SECTIONS)[number]['id']

function parseGuideTab(value: string | null): TabId {
  if (value === 'site') {
    return 'titles'
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
    next.set('tab', savedTab)
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
        {activeTab === 'protocol' && <ProtocolTab />}
        {activeTab === 'shows' && <ShowsTab />}
        {activeTab === 'speeds' && <SpeedsTab />}
        {activeTab === 'rating' && <RatingTab />}
        {activeTab === 'donino' && <DoninoTab />}
      </div>
    </>
  )
}
