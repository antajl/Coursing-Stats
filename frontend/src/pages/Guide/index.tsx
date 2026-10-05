import { useEffect, useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Trophy,
  Award,
  Gauge,
  FileText,
  TrendingUp,
  Search,
  X,
  ArrowRight,
  BookOpen,
} from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, faqPageSchema } from '../../components/JsonLd'
import { useYandexGoal } from '../../components/YandexMetrica'
import { GUIDE_FAQS } from './guideFaqs'
import ProtocolTab from './components/ProtocolTab'
import RatingTab from './components/RatingTab'
import ShowsTab from './components/ShowsTab'
import TitlesTab from './components/TitlesTab'
import DoninoTab from './components/DoninoTab'
import { GUIDE_SEARCH_INDEX, type GuideSearchItem } from './guideSearchIndex'

const GUIDE_SECTIONS = [
  {
    id: 'titles',
    label: 'Соревнования',
    shortLabel: 'Спорт',
    icon: Trophy,
    description:
      'Титулы и сертификаты курсинга и бегов борзых: CACIL, CQN, чемпион России, иерархия наград на соревнованиях.',
    keywords: 'титулы курсинг, CACIL, CQN, чемпион России курсинг, сертификаты бега борзых',
  },
  {
    id: 'shows',
    label: 'Выставки',
    shortLabel: 'Выставки',
    icon: Award,
    description:
      'Награды и титулы на выставках РКФ: CAC, BOB, ЧРКФ, КЧК, ранги выставок и сокращения в протоколах.',
    keywords: 'выставки РКФ, CAC, BOB, ЧРКФ, КЧК, титулы выставок',
  },
  {
    id: 'donino',
    label: 'Донино',
    shortLabel: 'Донино',
    icon: Gauge,
    description:
      'Замеры скорости и бега 350 м в Донино: км/ч, секунды, рекорды полигона и электронный хронометраж.',
    keywords: 'курсинг донино, замеры скорости собак, рекорды 350м, runningdog',
  },
  {
    id: 'protocol',
    label: 'Протоколы',
    shortLabel: 'Протоколы',
    icon: FileText,
    description:
      'Как читать протоколы курсинга и бегов борзых: структура таблицы, оценки, квалификация и статусы вне зачёта.',
    keywords: 'протокол курсинг, как читать протокол, оценка курсинг, квалификация ВС',
  },
  {
    id: 'rating',
    label: 'Рейтинг',
    shortLabel: 'Рейтинг',
    icon: TrendingUp,
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

  const [termQuery, setTermQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleTabChange = (newTab: TabId) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', newTab)
    setSearchParams(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    reachGoal('guide_view')
  }, [reachGoal])

  // Поиск по терминам
  const searchResults = useMemo(() => {
    const q = termQuery.trim().toLowerCase()
    if (!q || q.length < 2) return []

    return GUIDE_SEARCH_INDEX.filter((item) => {
      const matchTerm = item.term.toLowerCase().includes(q)
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchDesc = item.description.toLowerCase().includes(q)
      return matchTerm || matchTitle || matchDesc
    }).slice(0, 8)
  }, [termQuery])

  const handleSelectSearchResult = (result: GuideSearchItem) => {
    handleTabChange(result.tab)
    setTermQuery('')
  }

  return (
    <>
      <SEO
        title={`Справочник — ${section.label}`}
        description={section.description}
        keywords={section.keywords}
        canonicalUrl={`https://coursing-stats.ru/guide?tab=${activeTab}`}
      />
      <JsonLd data={faqPageSchema(GUIDE_FAQS)} />

      {/* Header and Quick Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-camel-100 text-camel-800">
                <BookOpen className="h-4 w-4" aria-hidden />
              </span>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl">
                Справочник и правила
              </h1>
            </div>
            <p className="mt-1 text-xs text-charcoal-600 sm:text-sm">
              Официальные регламенты состязаний, выставок РКФ, замеров Донино и методики рейтингов сайта
            </p>
          </div>

          {/* Quick Term Search */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={termQuery}
                onChange={(e) => setTermQuery(e.target.value)}
                placeholder="Поиск термина (CAC, ВС, CS, Elo...)"
                className="w-full rounded-xl border border-old-money-200 bg-white/90 py-2 pl-9 pr-8 text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-camel-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-camel-200"
              />
              <Search
                className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-charcoal-400"
                aria-hidden
              />
              {termQuery && (
                <button
                  type="button"
                  onClick={() => setTermQuery('')}
                  className="absolute right-2.5 top-2.5 rounded p-0.5 text-charcoal-400 hover:text-charcoal-700"
                  title="Очистить поиск"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>

            {/* Dropdown search results */}
            {termQuery.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-old-money-200 bg-white p-2 shadow-lg">
                {searchResults.length === 0 ? (
                  <div className="py-4 text-center text-xs text-charcoal-500">
                    Термин «{termQuery}» не найден
                  </div>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <button
                        key={`${item.tab}-${item.term}`}
                        type="button"
                        onClick={() => handleSelectSearchResult(item)}
                        className="group flex w-full items-start justify-between gap-2 rounded-lg p-2 text-left transition-colors hover:bg-cream-50"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-camel-800">
                              {item.term}
                            </span>
                            <span className="rounded bg-old-money-100 px-1.5 py-0.2 text-[10px] font-medium text-charcoal-600">
                              {item.tabLabel}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-[11px] text-charcoal-600">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-charcoal-400 group-hover:text-camel-700" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Global tab switcher (Both desktop & mobile) */}
        <div className="flex w-full overflow-x-auto pb-1 sm:pb-0">
          <div className="inline-flex min-w-full sm:min-w-0 items-center gap-1 rounded-xl border border-old-money-200/90 bg-white/90 p-1.5 shadow-2xs">
            {GUIDE_SECTIONS.map((s) => {
              const active = activeTab === s.id
              const Icon = s.icon
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleTabChange(s.id)}
                  className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 rounded-lg py-2 px-3 sm:px-4 text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-camel-500 text-charcoal-900 shadow-sm'
                      : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100/60'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? 'text-charcoal-900' : 'text-camel-700'}`} aria-hidden />
                  <span>{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
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
