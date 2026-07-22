import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { useYandexGoal } from '../../components/YandexMetrica'
import ProtocolTab from './components/ProtocolTab'
import RatingTab from './components/RatingTab'
import ShowsTab from './components/ShowsTab'
import SiteTab from './components/SiteTab'
import TitlesTab from './components/TitlesTab'

const GUIDE_SECTIONS = [
  { id: 'titles', label: 'Соревнования' },
  { id: 'shows', label: 'Выставки' },
  { id: 'protocol', label: 'Протоколы' },
  { id: 'rating', label: 'Рейтинг' },
  { id: 'site', label: 'О сайте' },
] as const

type TabId = (typeof GUIDE_SECTIONS)[number]['id']

function parseGuideTab(value: string | null): TabId {
  return GUIDE_SECTIONS.some((t) => t.id === value) ? (value as TabId) : 'titles'
}

export default function Guide() {
  const [searchParams] = useSearchParams()
  const activeTab = parseGuideTab(searchParams.get('tab'))
  const sectionLabel = GUIDE_SECTIONS.find((s) => s.id === activeTab)?.label ?? 'Соревнования'
  const { reachGoal } = useYandexGoal()

  useEffect(() => {
    reachGoal('guide_view')
  }, [reachGoal])

  return (
    <div className="space-y-6">
      <SEO
        title={`Справочник — ${sectionLabel}`}
        description="Справочник по курсингу и бегам борзых: правила соревнований, система рейтингов, квалификационные титулы, протоколы, выставки. Полная информация о спорте борзых."
        canonicalUrl={`https://coursing-stats.ru/guide?tab=${activeTab}`}
      />
      <div className="rounded-2xl border border-cream-300 bg-cream-50/90 p-4 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-800/90 md:p-8">
        {activeTab === 'titles' && <TitlesTab />}
        {activeTab === 'shows' && <ShowsTab />}
        {activeTab === 'protocol' && <ProtocolTab />}
        {activeTab === 'rating' && <RatingTab />}
        {activeTab === 'site' && <SiteTab />}
      </div>
    </div>
  )
}
