import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { JsonLd, faqPageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { GUIDE_FAQS } from './guideFaqs'
import ProtocolTab from './components/ProtocolTab'
import RatingTab from './components/RatingTab'
import ShowsTab from './components/ShowsTab'
import TitlesTab from './components/TitlesTab'
import DoninoTab from './components/DoninoTab'

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
      <SEO
        title={`Справочник — ${section.label}`}
        description={section.description}
        keywords={section.keywords}
        canonicalUrl={`https://coursing-stats.ru/guide?tab=${activeTab}`}
      />
      <JsonLd data={faqPageSchema(GUIDE_FAQS)} />

      {/* Mobile-only tab switcher (как на остальных страницах сайта) */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <div className="flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-old-money-200/80 bg-white/80 p-1 shadow-xs">
          {GUIDE_SECTIONS.map((s) => {
            const active = activeTab === s.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleTabChange(s.id)}
                className={`flex flex-1 items-center justify-center rounded-lg py-1.5 px-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-camel-500 text-charcoal-900 shadow-sm'
                    : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-50/50'
                }`}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeTab === 'titles' && <TitlesTab />}
        {activeTab === 'shows' && <ShowsTab />}
        {activeTab === 'donino' && <DoninoTab />}
        {activeTab === 'protocol' && <ProtocolTab />}
        {activeTab === 'rating' && <RatingTab />}
      </div>
    </>
  )
}
