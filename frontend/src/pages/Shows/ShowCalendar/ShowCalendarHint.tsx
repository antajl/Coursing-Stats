import { Info, Calendar, FileText } from 'lucide-react'
import ModernDropdown from '../../../components/ui/ModernDropdown'

export const SHOW_CALENDAR_MODAL_CONTENT = (
  <div className="p-3.5 space-y-3 text-charcoal-800">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200/80 pb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>Архив выставок РКФ</span>
    </div>

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

interface ShowCalendarHintProps {
  compact?: boolean
}

export default function ShowCalendarHint({ compact }: ShowCalendarHintProps = {}) {
  const trigger = (
    <button
      type="button"
      className={
        compact
          ? 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-old-money-300/80 bg-cream-50 text-xs font-semibold text-charcoal-800 hover:border-camel-500 hover:bg-cream-100 transition-all cursor-pointer shadow-2xs'
          : 'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-old-money-300/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-800 hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 transition-all cursor-pointer shadow-2xs whitespace-nowrap'
      }
      aria-label="Об архиве выставок и источниках данных"
      title="Об архиве"
    >
      <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
      {!compact && <span>Об архиве</span>}
    </button>
  )

  return (
    <ModernDropdown trigger={trigger} width="340px" portal closeOnScroll>
      {SHOW_CALENDAR_MODAL_CONTENT}
    </ModernDropdown>
  )
}
