import { ChevronRight } from 'lucide-react'
import { Icons } from '../../lib/icons'
import ProcoursingEventLink from '../../components/ProcoursingEventLink'
import { normalizeProcoursingUrl } from '../../lib/procoursingLinks'
import {
  type CalendarEvent,
  DISCIPLINE_BORDER,
  getEventDiscipline,
  formatRowDateParts,
  getEventHeadline,
  isEventCancelled,
  isImportantCompetition,
  parseJudgeNames,
  formatCompetitionJudgesWithRoles,
} from './eventListUtils'

interface EventListRowProps {
  event: CalendarEvent
}

const DISCIPLINE_BADGE_STYLE: Record<
  string,
  { bg: string; text: string; border: string; label: string }
> = {
  coursing: {
    bg: 'bg-forest-50/90',
    text: 'text-forest-800',
    border: 'border-forest-200/90',
    label: 'Курсинг',
  },
  bzmp: {
    bg: 'bg-blue-50/90',
    text: 'text-blue-800',
    border: 'border-blue-200/90',
    label: 'БЗМП',
  },
  racing: {
    bg: 'bg-rose-50/90',
    text: 'text-rose-800',
    border: 'border-rose-200/90',
    label: 'Рейсинг',
  },
  other: {
    bg: 'bg-amber-50/90',
    text: 'text-amber-800',
    border: 'border-amber-200/90',
    label: 'Другие',
  },
}

function resolveDisciplineLabel(eventType: string, rawText?: string): string {
  const text = (rawText || '').trim().toLowerCase()
  if (text.includes('бзмп') || eventType === 'bzmp') return 'БЗМП'
  if (text.includes('рейсинг') || text.includes('бега') || eventType === 'racing') return 'Рейсинг'
  if (text.includes('курсинг') || eventType === 'coursing') return 'Курсинг'
  return DISCIPLINE_BADGE_STYLE[eventType]?.label || 'Другие'
}

export default function EventListRow({ event }: EventListRowProps) {
  const important = isImportantCompetition(event.competition_kind)
  const eventType = getEventDiscipline(event)
  const borderClass = DISCIPLINE_BORDER[eventType] || DISCIPLINE_BORDER.default
  const badgeConfig = DISCIPLINE_BADGE_STYLE[eventType] || DISCIPLINE_BADGE_STYLE.other

  const dateParts = formatRowDateParts(event.date_start, event.date_end)
  const judgeNames = parseJudgeNames(event.judges)
  const participants =
    typeof event.participants_count === 'number' && event.participants_count > 0
      ? event.participants_count
      : typeof event.result_count === 'number' && event.result_count > 0
        ? event.result_count
        : 0
  const visibleJudges = judgeNames.slice(0, 3)
  const extraJudges = judgeNames.length - visibleJudges.length
  const cancelled = isEventCancelled(event)
  const TrophyIcon = Icons.championship
  const PawIcon = Icons.paw
  const procoursingUrl = normalizeProcoursingUrl(event.results_url)

  const rawHeadline = getEventHeadline(event)
  const headlineParts = rawHeadline.split(' · ')
  const titleText = headlineParts[0] || rawHeadline
  const specificDiscipline = resolveDisciplineLabel(
    eventType,
    headlineParts.length > 1 ? headlineParts.slice(1).join(' · ') : undefined,
  )

  const rowClassName = `group block rounded-xl border border-old-money-200/90 border-l-4 ${borderClass} bg-cream-50 p-2.5 sm:px-4 sm:py-3 mb-2.5 transition-all duration-200 hover:border-camel-400 hover:shadow-xs hover:bg-cream-100/50 ${
    cancelled ? 'opacity-70' : ''
  } ${
    important
      ? 'bg-gradient-to-r from-camel-100/70 via-cream-50 to-cream-50 border-camel-300/90'
      : ''
  }`

  return (
    <ProcoursingEventLink
      eventId={event.id}
      procoursingUrl={procoursingUrl}
      className={rowClassName}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1.2fr)_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
        {/* Колонка 1: Календарный блок даты с идеальным оптическим центрированием */}
        <div className="flex flex-col items-center justify-center rounded-lg bg-white/95 border border-old-money-200/80 px-1.5 w-[3.7rem] sm:w-[4.1rem] py-2 shrink-0 text-center shadow-2xs gap-1">
          <span className="text-sm sm:text-[15px] font-bold text-charcoal-900 tabular-nums leading-none tracking-tight">
            {dateParts ? dateParts.dayLine : '—'}
          </span>
          <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider leading-none">
            {dateParts?.metaLine || ''}
          </span>
        </div>

        {/* Колонка 2: Бейдж дисциплины ("Курсинг" / "Рейсинг" / "БЗМП") + Название + Клуб */}
        <div className="min-w-0">
          {/* На мобильных бейдж над названием */}
          <div className="sm:hidden mb-1 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
            >
              {specificDiscipline}
            </span>
            {cancelled && (
              <span className="shrink-0 rounded-full bg-charcoal-200 px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-wider text-charcoal-700">
                Отменён
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 leading-tight">
            {/* Лаконичный бейдж по ширине самого большого слова ("Курсинг"/"Рейсинг" — 67px) */}
            <span
              className={`hidden sm:inline-flex items-center justify-center shrink-0 w-[4.2rem] py-0.5 rounded text-[10.5px] font-semibold text-center border shadow-2xs ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
            >
              {specificDiscipline}
            </span>

            {important && (
              <TrophyIcon className="h-3.5 w-3.5 shrink-0 text-camel-600" strokeWidth={2} />
            )}

            <span
              className={`text-[13.5px] sm:text-sm font-semibold truncate ${
                important ? 'font-serif text-camel-800' : 'text-charcoal-900'
              }`}
            >
              {titleText}
            </span>

            {cancelled && (
              <span className="hidden sm:inline-flex shrink-0 rounded-full bg-charcoal-200 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-charcoal-700">
                Отменён
              </span>
            )}
          </div>

          {/* На мобильных локация и клуб выводятся здесь под названием */}
          <div className="sm:hidden mt-1 flex flex-col gap-0.5 text-left">
            {event.location && (
              <div className="text-xs font-semibold text-charcoal-800 leading-tight">
                {event.location}
              </div>
            )}
            {event.host_club && event.host_club !== event.location && (
              <div className="text-[11px] text-charcoal-500 leading-tight">
                {event.host_club}
              </div>
            )}
          </div>

          {/* На десктопе под названием выводится клуб-организатор */}
          {event.host_club && (
            <div className="hidden sm:block mt-1 text-[11px] text-charcoal-500 leading-tight truncate">
              {event.host_club}
            </div>
          )}
        </div>

        {/* Колонка 3 (ЦЕНТР НА ДЕСКТОПЕ): Локация и Регион */}
        <div className="hidden sm:flex flex-col justify-center min-w-0 pl-3.5 border-l border-old-money-200/70 text-left">
          <span className="text-[9.5px] uppercase font-bold tracking-wider text-charcoal-400 mb-0.5">
            Локация
          </span>
          <span className="text-xs font-semibold text-charcoal-800 leading-tight">
            {event.location || 'Место не указано'}
          </span>
          {event.region && event.region !== event.location && (
            <span className="text-[11px] text-charcoal-500 mt-0.5 truncate">
              {event.region}
            </span>
          )}
        </div>

        {/* Колонка 4 (Десктоп): Судьи + Количество участников + Кнопка "Результаты" */}
        <div className="hidden sm:flex items-center gap-4 shrink-0 pl-3.5 border-l border-old-money-200/80">
          <div
            className="w-[8.5rem] flex flex-col items-end justify-center text-right leading-tight"
            title={formatCompetitionJudgesWithRoles(event.judges)}
          >
            {visibleJudges.length > 0 ? (
              <>
                <span className="text-[9.5px] uppercase font-bold tracking-wider text-charcoal-400 mb-0.5">
                  Судьи
                </span>
                {visibleJudges.map((name, index) => (
                  <span
                    key={`${name}-${index}`}
                    className="w-full truncate text-[11px] text-charcoal-600"
                    title={name}
                  >
                    {index === 0 ? (
                      <strong className="font-semibold text-charcoal-800">{name}</strong>
                    ) : (
                      name
                    )}
                  </span>
                ))}
                {extraJudges > 0 && (
                  <span className="text-[9.5px] text-charcoal-400">+{extraJudges}</span>
                )}
              </>
            ) : (
              <span className="text-[11px] text-charcoal-400 italic">Судьи не указаны</span>
            )}
          </div>

          <div className="flex flex-col items-end justify-center gap-1.5 w-[5.8rem] shrink-0">
            {participants > 0 ? (
              <span
                className="inline-flex h-5.5 items-center justify-center gap-1 rounded-full border border-old-money-200/90 bg-white px-2 font-mono text-[11px] font-semibold tabular-nums text-charcoal-700 shadow-2xs"
                title={`${participants} участников`}
              >
                <PawIcon className="h-3 w-3 text-camel-600 shrink-0" strokeWidth={1.8} />
                <span>{participants}</span>
              </span>
            ) : (
              <span className="h-5.5" />
            )}

            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-700 group-hover:text-camel-800 transition-colors">
              <span>Результаты</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Мобильный подвал карточки (< sm): судьи, участники и кнопка перехода */}
      <div className="sm:hidden mt-2 pt-2 border-t border-old-money-200/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          {participants > 0 && (
            <span
              className="inline-flex h-5 shrink-0 items-center gap-1 rounded-md border border-old-money-200 bg-white px-1.5 font-mono text-[10.5px] font-semibold text-charcoal-700"
              title={`${participants} участников`}
            >
              <PawIcon className="h-2.5 w-2.5 text-camel-600" />
              <span>{participants}</span>
            </span>
          )}
          {visibleJudges.length > 0 ? (
            <span className="text-[11px] text-charcoal-500 truncate" title={visibleJudges.join(', ')}>
              {visibleJudges.join(', ')}
            </span>
          ) : (
            <span className="text-[10.5px] text-charcoal-400 italic">Судьи не указаны</span>
          )}
        </div>

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-camel-700 shrink-0 ml-auto">
          <span>Результаты</span>
          <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </ProcoursingEventLink>
  )
}
