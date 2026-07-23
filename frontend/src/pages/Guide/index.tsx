import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SEO } from '../../components/SEO'
import { JsonLd, faqPageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { GUIDE_FAQS } from './guideFaqs'
import ProtocolTab from './components/ProtocolTab'
import RatingTab from './components/RatingTab'
import ShowsTab from './components/ShowsTab'
import SiteTab from './components/SiteTab'
import TitlesTab from './components/TitlesTab'

const GUIDE_SECTIONS = [
  {
    id: 'titles',
    label: 'Соревнования',
    description:
      'Титулы и сертификаты курсинга и бегов борзых: CACIL, CQN, чемпион России, иерархия наград на соревнованиях.',
    keywords: 'титулы курсинг, CACIL, CQN, чемпион России курсинг, сертификаты бега борзых',
  },
  {
    id: 'shows',
    label: 'Выставки',
    description:
      'Награды и титулы на выставках РКФ: CAC, BOB, ЧРКФ, КЧК, ранги выставок и сокращения в протоколах.',
    keywords: 'выставки РКФ, CAC, BOB, ЧРКФ, КЧК, титулы выставок',
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
      'Как устроен рейтинг Coursing Stats: места и очки, индекс CS, отдельные таблицы по медалям и баллам.',
    keywords: 'рейтинг курсинг, индекс CS, рейтинг по местам, рейтинг по очкам',
  },
  {
    id: 'site',
    label: 'О сайте',
    description:
      'О проекте Coursing Stats: источники данных (procoursing.ru, Донино, РКФ), связь с автором.',
    keywords: 'Coursing Stats, о сайте, procoursing, Донино, статистика курсинга',
  },
] as const

type TabId = (typeof GUIDE_SECTIONS)[number]['id']

function parseGuideTab(value: string | null): TabId {
  return GUIDE_SECTIONS.some((t) => t.id === value) ? (value as TabId) : 'titles'
}

export default function Guide() {
  const [searchParams] = useSearchParams()
  const activeTab = parseGuideTab(searchParams.get('tab'))
  const section = GUIDE_SECTIONS.find((s) => s.id === activeTab) ?? GUIDE_SECTIONS[0]
  const { reachGoal } = useYandexGoal()

  useEffect(() => {
    reachGoal('guide_view')
  }, [reachGoal])

  return (
    <div className="space-y-6">
      <SEO
        title={`Справочник — ${section.label}`}
        description={section.description}
        keywords={section.keywords}
        canonicalUrl={`https://coursing-stats.ru/guide?tab=${activeTab}`}
      />
      <JsonLd data={faqPageSchema(GUIDE_FAQS)} />
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
