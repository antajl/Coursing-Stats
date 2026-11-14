import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ArrowLeft, X, Info } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema } from '../../components/JsonLd'
import { useEvents } from '../../hooks/useApi'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import EventsMonthList from '../Events/EventsMonthList'
import {
  type CalendarEvent,
  groupEventsByMonth,
  eventMatchesDiscipline,
} from '../Events/eventListUtils'
import { DISCIPLINE_OPTIONS } from '../Events/EventsToolbar'

const DISCIPLINE_DOT: Record<string, string> = {
  coursing: 'bg-forest-500',
  bzmp: 'bg-blue-500',
  racing: 'bg-rose-400',
  other: 'bg-amber-400',
}

export default function Competitions2027() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState('')

  const { data: eventsData, isLoading } = useEvents('2027')
  const events: CalendarEvent[] =
    eventsData?.success && Array.isArray(eventsData.data) ? eventsData.data : []

  const handleDisciplineToggle = (d: string) => {
    setFilterDiscipline(filterDiscipline === d ? '' : d)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterDiscipline('')
  }

  const hasActiveFilters = Boolean(searchQuery || filterDiscipline)

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (filterDiscipline && !eventMatchesDiscipline(event, filterDiscipline)) {
        return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableFields = [
          event.title,
          event.full_title,
          event.location,
          event.host_club,
          event.region,
          event.competition_kind,
          event.competition_type,
          event.rank_label,
          event.date_start,
          event.date_end,
          event.notes,
        ]
        if (!searchableFields.some((f) => f && f.toString().toLowerCase().includes(query))) {
          return false
        }
      }

      return true
    })
  }, [events, filterDiscipline, searchQuery])

  const monthGroups = useMemo(() => groupEventsByMonth(filteredEvents), [filteredEvents])

  const toolbarFilters = (
    <div className="w-full min-w-0 flex flex-wrap sm:flex-nowrap items-center gap-2">
      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Город, клуб, дисциплина…"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="cs-glass-pill shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full !text-charcoal-500 hover:!text-charcoal-800 transition-colors cursor-pointer select-none"
            title="Сбросить фильтры"
            aria-label="Сбросить фильтры"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="hidden sm:block h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

      {/* Выбор дисциплины */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 -my-1 w-full sm:w-auto">
        {DISCIPLINE_OPTIONS.map((d) => {
          const active = filterDiscipline === d.value
          return (
            <ToolbarTip key={d.value} label={d.tip}>
              <button
                type="button"
                onClick={() => handleDisciplineToggle(d.value)}
                className={`inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none ${
                  active
                    ? 'cs-glass-pill-active !text-camel-950'
                    : 'cs-glass-pill'
                }`}
              >
                <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[d.value]}`} />
                <span>{d.label}</span>
              </button>
            </ToolbarTip>
          )
        })}
      </div>

      <div className="ml-auto hidden sm:flex items-center">
        <Link
          to="/competitions/?tab=archive"
          className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none text-charcoal-700 hover:bg-camel-100/80"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-camel-700" />
          <span>Архив соревнований</span>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <SEO
        title="Расписание соревнований по курсингу и бегам 2027 — График и план РКФ | Курсинг Статс"
        description="Будущие соревнования по курсингу борзых, бегам за механической приманкой (БЗМП) и рейсингу на 2027 год. Календарный план РКФ, даты стартов, города, проводящие клубы и судьи на платформе Coursing Stats."
        canonicalUrl="https://coursing-stats.ru/competitions/2027/"
        keywords="курсинг 2027 расписание, календарь соревнований по курсингу 2027, бега борзых 2027, БЗМП 2027 график, план РКФ 2027 состязания, чемпионат россии по курсингу 2027, состязания борзых 2027, будущие соревнования"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Соревнования', url: '/competitions/' },
              { name: 'Сезон 2027', url: '/competitions/2027/' },
            ]),
          ],
        }}
      />

      <div className="space-y-4">
        {/* Шапка страницы */}
        <div className="cs-glass-card rounded-2xl p-4 sm:p-5 border border-old-money-200/80 bg-white/90 backdrop-blur-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-old-money-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="cs-glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-camel-900 border-camel-400/50 bg-camel-50">
                <Calendar className="h-3.5 w-3.5 text-camel-700" />
                Сезон 2027
              </span>
              <span className="text-xs text-charcoal-500 font-medium">
                {events.length} состязаний в плане РКФ
              </span>
            </div>

            <Link
              to="/competitions/?tab=archive"
              className="cs-glass-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-camel-700" />
              <span>Вернуться в архив</span>
            </Link>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-charcoal-900 tracking-tight">
              Будущие соревнования по курсингу и бегам 2027 года
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-3xl">
              Предварительный график и утвержденный календарный план состязаний Российской кинологической федерации (РКФ) по дисциплинам курсинг борзых, бега борзых и бега за механической приманкой (БЗМП).
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-cream-50/70 p-2.5 sm:p-3 border border-old-money-100 text-[11px] sm:text-xs text-charcoal-600">
            <Info className="h-4 w-4 text-camel-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Справочно:</strong> даты, ранги состязаний и проводящие организации согласованы спорткомитетом РКФ. Судейские бригады и регламенты дополняются по мере утверждения оргкомитетами клубов. После проведения состязаний и сдачи отчетов результаты забегов автоматически переносятся в архив с начислением рейтинговых очков.
            </p>
          </div>
        </div>

        {/* Панель фильтров */}
        <PageToolbar
          bare
          topRowClassName="flex-nowrap"
          filters={toolbarFilters}
        />

        {/* Список соревнований по месяцам */}
        {isLoading ? (
          <LoadingCard count={3} variant="list" />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="Соревнования не найдены"
            message="По заданным фильтрам или поисковому запросу ничего не найдено в календаре 2027 года."
            actionLabel="Сбросить фильтры"
            onAction={handleResetFilters}
          />
        ) : (
          <EventsMonthList monthGroups={monthGroups} reveal={true} />
        )}
      </div>
    </>
  )
}
