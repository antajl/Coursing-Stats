import React from 'react'
import { Calendar, History, Info, Sparkles, ExternalLink } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'

export interface ChangelogEntry {
  date: string
  version?: string
  title: string
  summary: string
  changes: string[]
}

export interface CalendarChangelog {
  season: number
  last_checked_at: string
  source_url?: string
  attachment_url?: string
  entries: ChangelogEntry[]
}

export const DEFAULT_CHANGELOG: CalendarChangelog = {
  season: 2027,
  last_checked_at: '2026-11-23T16:00:00.000Z',
  entries: [
    {
      date: '2026-11-23',
      version: '1.1',
      title: 'Обновление утвержденного плана РКФ (2026-11-23)',
      summary: 'Синхронизация с официальным реестром РКФ.',
      changes: ['Добавлено 2 новых состязания (ЧРКФ по курсингу и бегам в Санкт-Петербурге)'],
    },
    {
      date: '2026-11-15',
      version: '1.0',
      title: 'Первичный план РКФ 2027',
      summary: 'Утвержденный календарный план состязаний РКФ по курсингу, бегам борзых и БЗМП на 2027 год.',
      changes: [
        'Опубликовано 42 национальных состязания РКФ (ЧР, ПКР, ЧРКФ)',
        'Для 6 состязаний зафиксирован статус «на согласовании комиссии»',
        'Исключены предварительные квалификационные и тренировочные забеги',
      ],
    },
  ],
}

export function formatChangelogDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return '23.11.2026'
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '23.11.2026'
  }
}

interface SeasonInfoProps {
  eventsCount: number
}

export function Season2027InfoContent({ eventsCount }: SeasonInfoProps) {
  return (
    <div className="p-3.5 space-y-2.5 text-charcoal-800">
      <div className="flex items-center justify-between border-b border-old-money-200/80 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
          <Calendar className="h-4 w-4 text-camel-700 shrink-0" aria-hidden="true" />
          <span>Сезон состязаний 2027</span>
        </div>
        <span className="text-[11px] font-semibold text-camel-900 bg-camel-100/80 border border-camel-300/80 rounded-full px-2 py-0.5">
          {eventsCount} состязаний в плане РКФ
        </span>
      </div>

      <div>
        <div className="text-xs font-semibold text-charcoal-900">
          Будущие соревнования по курсингу и бегам 2027 года
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-charcoal-700">
          Предварительный график и утвержденный календарный план состязаний Российской кинологической федерации (РКФ) по дисциплинам курсинг борзых, бега борзых и бега за механической приманкой (БЗМП).
        </p>
      </div>

      <div className="border-t border-old-money-200/80 pt-2 text-[10.5px] leading-relaxed text-charcoal-600 flex items-start gap-1.5">
        <Info className="h-3.5 w-3.5 text-camel-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong className="text-charcoal-800 font-semibold">Справочно:</strong> даты, ранги и клубы согласованы спорткомитетом РКФ. Судейские бригады дополняются по мере утверждения. После сдачи отчетов результаты переносятся в архив с начислением рейтинговых очков.
        </p>
      </div>
    </div>
  )
}

interface ChangelogProps {
  changelog: CalendarChangelog
}

export function Season2027ChangelogContent({ changelog }: ChangelogProps) {
  const latestEntry = changelog.entries[0]
  const version = latestEntry?.version || '1.1'

  return (
    <div className="p-3.5 space-y-2.5 text-charcoal-800">
      <div className="flex items-center justify-between border-b border-old-money-200/80 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
          <History className="h-4 w-4 text-camel-700 shrink-0" aria-hidden="true" />
          <span>История изменений плана</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-semibold text-camel-900 bg-camel-100/80 border border-camel-300/80 rounded-full px-2 py-0.5">
            v{version}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10.5px] text-charcoal-600 bg-cream-50/90 rounded-md p-2 border border-old-money-200/60">
        <span>Последняя сверка с РКФ:</span>
        <span className="font-semibold text-charcoal-800">
          {formatChangelogDate(changelog.last_checked_at)}
        </span>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {changelog.entries.map((entry, idx) => {
          const isLatest = idx === 0
          return (
            <div
              key={`${entry.date}-${idx}`}
              className={`rounded-lg p-2.5 border text-[10.5px] leading-relaxed space-y-1.5 ${
                isLatest
                  ? 'bg-amber-50/50 border-amber-200/80 text-charcoal-800'
                  : 'bg-cream-50/60 border-old-money-100 text-charcoal-700'
              }`}
            >
              <div className="flex items-center justify-between font-semibold text-charcoal-900">
                <div className="flex items-center gap-1.5">
                  {isLatest && <Sparkles className="h-3 w-3 text-camel-600 shrink-0" aria-hidden="true" />}
                  <span>{entry.title}</span>
                </div>
                <span className="text-[9.5px] font-mono text-camel-800 bg-camel-100/70 px-1.5 py-0.2 rounded shrink-0">
                  {entry.date}
                </span>
              </div>
              <p className="text-[10px] text-charcoal-600">{entry.summary}</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-charcoal-700 pl-0.5">
                {entry.changes.map((change, cIdx) => (
                  <li key={cIdx}>{change}</li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {changelog.source_url && (
        <div className="border-t border-old-money-200/80 pt-2 flex items-center justify-between text-[10px] text-charcoal-500">
          <span>Первоисточник реестра:</span>
          <a
            href={changelog.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-camel-700 hover:text-camel-800 font-semibold"
          >
            <span>Портал РКФ</span>
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </a>
        </div>
      )}
    </div>
  )
}

interface Season2027ToolbarButtonsProps {
  eventsCount: number
  changelog: CalendarChangelog
  isMobile?: boolean
}

export function Season2027ToolbarButtons({ eventsCount, changelog, isMobile }: Season2027ToolbarButtonsProps) {
  const latestEntry = changelog.entries[0]
  const latestVersion = latestEntry?.version || '1.1'

  if (isMobile) {
    return (
      <div className="flex items-center gap-1 shrink-0">
        <ModernDropdown
          closeOnScroll
          trigger={
            <button
              type="button"
              className="cs-glass-pill inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer select-none"
              aria-label="О сезоне 2027"
              title="О сезоне 2027"
            >
              <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden="true" />
            </button>
          }
          width="320px"
          portal
        >
          {() => <Season2027InfoContent eventsCount={eventsCount} />}
        </ModernDropdown>

        <ModernDropdown
          closeOnScroll
          trigger={
            <button
              type="button"
              className="cs-glass-pill relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer select-none"
              aria-label="История изменений плана 2027"
              title={`История изменений плана (v${latestVersion})`}
            >
              <History className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden="true" />
              <span className="absolute 1 top-1 right-1 h-1.5 w-1.5 rounded-full bg-camel-600" aria-hidden="true" />
            </button>
          }
          width="340px"
          portal
        >
          {() => <Season2027ChangelogContent changelog={changelog} />}
        </ModernDropdown>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <ModernDropdown
        closeOnScroll
        trigger={
          <button
            type="button"
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none text-charcoal-800 hover:text-charcoal-900"
            aria-label="О сезоне 2027 и календарном плане"
          >
            <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden="true" />
            <span>О сезоне 2027</span>
          </button>
        }
        width="360px"
        portal
      >
        {() => <Season2027InfoContent eventsCount={eventsCount} />}
      </ModernDropdown>

      <ModernDropdown
        closeOnScroll
        trigger={
          <button
            type="button"
            className="cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap select-none text-charcoal-800 hover:text-charcoal-900"
            aria-label="История изменений плана РКФ"
          >
            <History className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden="true" />
            <span>Изменения</span>
            <span className="ml-0.5 rounded-full bg-camel-100/90 px-1.5 py-0.2 text-[10px] font-mono font-semibold text-camel-900 border border-camel-300/70">
              v{latestVersion}
            </span>
          </button>
        }
        width="380px"
        portal
      >
        {() => <Season2027ChangelogContent changelog={changelog} />}
      </ModernDropdown>
    </div>
  )
}
