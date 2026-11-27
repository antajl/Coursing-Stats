import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronDown, Bell } from 'lucide-react'
import { SEO } from '../../components/SEO'
import { JsonLd, breadcrumbListSchema } from '../../components/JsonLd'
import { useEvents } from '../../hooks/useApi'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import ToolbarTip from '../../components/toolbar/ToolbarTip'
import ModernDropdown from '../../components/ui/ModernDropdown'
import { MobileSubNavTabs } from '../../components/ui/MobileSubNavTabs'
import EmptyState from '../../components/EmptyState'
import LoadingCard from '../../components/LoadingCard'
import EventsMonthList from '../Events/EventsMonthList'
import { toolbarPillTriggerClass } from '../../lib/toolbar'
import {
  type CalendarEvent,
  groupEventsByMonth,
  eventMatchesDiscipline,
  compareEventsAsc,
} from '../Events/eventListUtils'
import { DISCIPLINE_OPTIONS } from '../Events/EventsToolbar'
import {
  type CalendarChangelog,
  DEFAULT_CHANGELOG,
  Season2027ToolbarButtons,
} from './Season2027Modals'
import { Season2027NotifyBanner } from './Season2027NotifyBanner'

const DISCIPLINE_DOT: Record<string, string> = {
  coursing: 'bg-forest-500',
  bzmp: 'bg-blue-500',
  racing: 'bg-rose-400',
  other: 'bg-amber-400',
}

export default function Competitions2027() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [changelog, setChangelog] = useState<CalendarChangelog>(DEFAULT_CHANGELOG)

  useEffect(() => {
    fetch('/data/v1/calendar/2027-changelog.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.entries && Array.isArray(data.entries)) {
          setChangelog(data)
        }
      })
      .catch(() => {})
  }, [])
  const [filterDiscipline, setFilterDiscipline] = useState('')
  const [disciplineDropdownOpen, setDisciplineDropdownOpen] = useState(false)

  const tabs = [
    { id: 'ranking', label: 'Рейтинг' },
    { id: 'archive', label: 'Архив' },
    { id: 'judges', label: 'Судьи' },
    { id: 'builder', label: 'Конструктор' },
  ]

  const handleTabChange = (newTab: string) => {
    if (newTab === 'ranking') {
      navigate('/competitions/ranking/')
    } else if (newTab === 'archive') {
      navigate('/competitions/archive/')
    } else if (newTab === 'judges') {
      navigate('/competitions/judges/')
    } else if (newTab === 'builder') {
      navigate('/protocol-builder/')
    }
  }

  const prefetchCompTab = (tabId: string) => {
    if (tabId === 'ranking') void import('../TopDogs')
    else if (tabId === 'archive') void import('../Events')
    else if (tabId === 'judges') void import('../Judges')
  }

  const { data: eventsData, isLoading } = useEvents('2027')
  const events: CalendarEvent[] =
    eventsData?.success && Array.isArray(eventsData.data) ? eventsData.data : []

  const disciplineLabel =
    DISCIPLINE_OPTIONS.find((d) => d.value === filterDiscipline)?.label || 'Дисциплина'

  const handleDisciplineToggle = (d: string) => {
    setFilterDiscipline(filterDiscipline === d ? '' : d)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterDiscipline('')
  }

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
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
      .sort(compareEventsAsc)
  }, [events, filterDiscipline, searchQuery])

  const monthGroups = useMemo(() => groupEventsByMonth(filteredEvents), [filteredEvents])

  const toolbarFilters = (
    <div className="w-full min-w-0">
      {/* Мобильная строка (32px): Поиск + Кнопки сезона/изменений + Дисциплина + В архив */}
      <div className="flex sm:hidden items-center gap-1.5 w-full min-w-0">
        <ToolbarSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск 2027…"
        />

        <Season2027ToolbarButtons eventsCount={events.length} changelog={changelog} isMobile />

        <div className="shrink-0">
          <ModernDropdown
            trigger={
              <button
                type="button"
                className={`shrink-0 inline-flex items-center gap-1.5 ${toolbarPillTriggerClass(Boolean(filterDiscipline))}`}
              >
                {filterDiscipline && DISCIPLINE_DOT[filterDiscipline] && (
                  <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[filterDiscipline]}`} />
                )}
                <span>{filterDiscipline ? disciplineLabel : 'Дисциплина'}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              </button>
            }
            isOpen={disciplineDropdownOpen}
            onOpenChange={setDisciplineDropdownOpen}
            width="160px"
          >
            {disciplineDropdownOpen ? (
              <div className="p-1 max-h-60 overflow-y-auto" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setFilterDiscipline('')
                    setDisciplineDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    !filterDiscipline
                      ? 'bg-camel-100 text-camel-950 font-semibold'
                      : 'text-charcoal-700 hover:bg-camel-100'
                  }`}
                >
                  Все дисциплины
                </button>
                {DISCIPLINE_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      handleDisciplineToggle(d.value)
                      setDisciplineDropdownOpen(false)
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      filterDiscipline === d.value
                        ? 'bg-camel-100 text-camel-950 font-semibold'
                        : 'text-charcoal-700 hover:bg-camel-100'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full shrink-0 ${DISCIPLINE_DOT[d.value]}`} />
                    <span>{d.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </ModernDropdown>
        </div>

        <div className="ml-auto shrink-0 flex items-center gap-1.5">
          <Link
            to="/tracker/?tab=competitions"
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-charcoal-700 hover:border-camel-300 hover:text-charcoal-900 no-underline"
            title="Статусы согласования и подписка в РКФ Трекере"
          >
            <Bell className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden="true" />
            <span>Трекер</span>
          </Link>

          <Link
            to="/competitions/archive/"
            className="group cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold text-charcoal-700 hover:bg-camel-100"
            title="Вернуться в архив"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-camel-700 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            <span>Архив</span>
          </Link>
        </div>
      </div>

      {/* Десктопная строка: поиск + «О сезоне 2027» справа от поиска + дисциплины + «В архив» справа */}
      <div className="hidden sm:flex sm:items-center gap-2 w-full min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Город, клуб, дисциплина…"
          />

          {/* Кнопки «О сезоне 2027», «Изменения» и переход в «РКФ Трекер» */}
          <Season2027ToolbarButtons eventsCount={events.length} changelog={changelog} />
          <Link
            to="/tracker/?tab=competitions"
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-charcoal-700 hover:border-camel-300 hover:text-charcoal-900 no-underline"
            title="Статусы согласования и подписка на турниры в РКФ Трекере"
          >
            <Bell className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden="true" />
            <span>РКФ Трекер</span>
          </Link>

          {/* Сброс фильтров */}

        </div>

        {/* Разделитель перед выбором дисциплины */}
        <div className="h-5 w-px bg-old-money-300 shrink-0 mx-0.5" aria-hidden="true" />

        {/* Выбор дисциплины с цветными индикаторами */}
        <div className="flex items-center gap-1.5 overflow-visible py-1 -my-1">
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

        {/* Кнопка возврата в архив — прилипшая к правому краю */}
        <div className="ml-auto shrink-0 flex items-center">
          <Link
            to="/competitions/archive/"
            className="group cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none text-charcoal-700 hover:text-charcoal-900 hover:bg-camel-100/80"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-camel-700 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            <span>В архив соревнований</span>
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <h1 className="sr-only">Будущие соревнования по курсингу и бегам 2027 года — Календарный план РКФ</h1>
      <SEO
        title="Расписание соревнований по курсингу и бегам 2027 — График и план РКФ | Курсинг Статс"
        description="Будущие соревнования по курсингу борзых, бегам за механической приманкой (БЗМП) и рейсингу на 2027 год. Календарный план РКФ, даты стартов, города, проводящие клубы и судьи на платформе Курсинг Статс."
        canonicalUrl="https://coursing-stats.ru/competitions/archive/2027/"
        keywords="курсинг 2027 расписание, календарь соревнований по курсингу 2027, бега борзых 2027, БЗМП 2027 график, план РКФ 2027 состязания, чемпионат россии по курсингу 2027, состязания борзых 2027, будущие соревнования"
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@graph': [
            breadcrumbListSchema([
              { name: 'Главная', url: '/' },
              { name: 'Соревнования', url: '/competitions/' },
              { name: 'Архив', url: '/competitions/archive/' },
              { name: 'Сезон 2027', url: '/competitions/archive/2027/' },
            ]),
          ],
        }}
      />

      <MobileSubNavTabs
        tabs={tabs}
        activeTab="archive"
        onChange={handleTabChange}
        onHoverTab={prefetchCompTab}
        ariaLabel="Разделы соревнований"
      />

      <div className="space-y-4">
        <Season2027NotifyBanner />

        {/* Панель фильтров с кнопкой «О сезоне 2027» справа от поиска */}
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
            description="По заданным фильтрам или поисковому запросу ничего не найдено в календаре 2027 года."
            action={
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-lg border border-camel-300 bg-camel-50 px-3 py-1.5 text-xs font-semibold text-camel-800 hover:bg-camel-100"
              >
                Сбросить фильтры
              </button>
            }
          />
        ) : (
          <EventsMonthList monthGroups={monthGroups} reveal={true} />
        )}
      </div>
    </>
  )
}
