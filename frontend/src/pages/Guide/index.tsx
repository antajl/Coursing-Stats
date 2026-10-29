import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { JsonLd, faqPageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import { GUIDE_FAQS } from './guideFaqs'
import ProtocolTab from './components/ProtocolTab'
import RatingTab from './components/RatingTab'
import ShowsTab from './components/ShowsTab'
import TitlesTab from './components/TitlesTab'
import DoninoTab from './components/DoninoTab'
import SpeedsTab from './components/SpeedsTab'

const GUIDE_SECTIONS = [
  {
    id: 'titles',
    label: 'Соревнования',
    description:
      'Титулы и сертификаты курсинга и бегов борзых: CACIL, CACL, чемпион России, иерархия наград на соревнованиях.',
    keywords: 'титулы курсинг, CACIL, CACL, чемпион России курсинг, сертификаты бега борзых',
  },
  {
    id: 'shows',
    label: 'Выставки',
    description:
      'Награды и титулы на выставках РКФ: CAC, BOB, ЧРКФ, КЧК, ранги выставок и сокращения в протоколах.',
    keywords: 'выставки РКФ, CAC, BOB, ЧРКФ, КЧК, титулы выставок',
  },
  {
    id: 'donino',
    label: 'Донино',
    description:
      'Замеры скорости и бега 350 м в Донино: км/ч, секунды, рекорды полигона и электронный хронометраж.',
    keywords: 'курсинг донино, замеры скорости собак, рекорды 350м, runningdog',
  },
  {
    id: 'protocol',
    label: 'Протоколы',
    description:
      'Как читать протоколы курсинга и бегов борзых: структура таблицы, оценки, квалификация и статусы вне зачёта.',
    keywords: 'протокол курсинг, как читать протокол, оценка курсинг, квалификация ВС',
  },
  {
    id: 'rating',
    label: 'Рейтинг',
    description:
      'Как устроен зачёт сезона Coursing Stats: медали и эффективность, индекс CS, Elo как справка.',
    keywords: 'рейтинг курсинг, зачёт сезона, индекс CS, Elo, медали курсинг',
  },
  {
    id: 'speeds',
    label: 'Скорость пород',
    description:
      'Скорость бега и рекорды пород борзых в км/ч: уиппет, салюки, русская псовая борзая, левретка, грейхаунд. Сравнение спринта и дистанционной выносливости.',
    keywords:
      'рекорд скорости салюки, какая максимальная скорость уиппета, русская борзая скорость бега, левретка скорость бега, скорость борзых км ч',
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
  const activeTab = parseGuideTab(searchParams.get('tab'))
  const section = GUIDE_SECTIONS.find((s) => s.id === activeTab) ?? GUIDE_SECTIONS[0]
  const { reachGoal } = useYandexGoal()

  const handleTabChange = (newTab: TabId) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', newTab)
    setSearchParams(next)
  }

  useEffect(() => {
    reachGoal('guide_view')
  }, [reachGoal])

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
        {activeTab === 'protocol' && <ProtocolTab />}
        {activeTab === 'rating' && <RatingTab />}
        {activeTab === 'speeds' && <SpeedsTab />}
      </div>
    </>
  )
}
