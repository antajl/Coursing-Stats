import { Info, Calendar, FileText, Clock } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'

export function formatUpdateDate(isoDate?: string | null): string {
  if (!isoDate) return ''
  try {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export function formatShortUpdateDate(isoDate?: string | null): string {
  if (!isoDate) return ''
  try {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return ''
    return d
      .toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
      .replace(' г.', '')
  } catch {
    return ''
  }
}

export function ShowCalendarModalContent({ updatedAt }: { updatedAt?: string | null }) {
  const fullDate = formatUpdateDate(updatedAt)

  return (
    <div className="p-3.5 space-y-3 text-charcoal-800">
      {fullDate && (
        <div className="flex items-start gap-2.5 rounded-lg bg-camel-50/70 border border-camel-200/60 p-2.5 text-xs text-charcoal-800">
          <Clock className="h-4 w-4 text-camel-700 shrink-0 mt-0.5" aria-hidden />
          <div className="leading-snug">
            <span>В базу внесены все данные РКФ,</span>
            <div className="font-semibold text-charcoal-900 mt-0.5">
              опубликованные к {fullDate}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 text-xs text-charcoal-700 leading-snug">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-camel-700 shrink-0 mt-0.5" aria-hidden />
          <p>
            Раздел систематизирует архив и протоколы выставок собак всех пород и монопородных выставок РКФ по городам, клубам, рангам и результатам.
          </p>
        </div>
      </div>

      <div className="border-t border-old-money-200/80 pt-2.5 mt-2.5 text-[10.5px] leading-relaxed text-charcoal-600 flex items-start gap-1.5">
        <FileText className="h-3.5 w-3.5 text-camel-700 shrink-0 mt-0.5" aria-hidden />
        <p>
          <strong className="text-charcoal-800 font-semibold">Примечание:</strong> сведения могут содержать ошибки или быть неполными из-за фрагментарности открытых источников и изменений в расписании организаторами. Проект не является официальным сайтом РКФ.
        </p>
      </div>
    </div>
  )
}

export const SHOW_CALENDAR_MODAL_CONTENT = <ShowCalendarModalContent />

interface ShowCalendarHintProps {
  compact?: boolean
  updatedAt?: string | null
}

export default function ShowCalendarHint({ compact, updatedAt }: ShowCalendarHintProps = {}) {
  const fullDate = formatUpdateDate(updatedAt)
  const shortDate = formatShortUpdateDate(updatedAt)

  const trigger = (
    <button
      type="button"
      className={
        compact
          ? 'cs-glass-pill inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer select-none'
          : 'cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer whitespace-nowrap select-none'
      }
      aria-label="Об архиве выставок и источниках данных"
      title={fullDate ? `Об архиве (актуально по: ${fullDate})` : 'Об архиве'}
    >
      <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
      {!compact && <span>Об архиве{shortDate ? ` · ${shortDate}` : ''}</span>}
    </button>
  )

  return (
    <ModernDropdown trigger={trigger} width="340px" portal closeOnScroll>
      <ShowCalendarModalContent updatedAt={updatedAt} />
    </ModernDropdown>
  )
}
