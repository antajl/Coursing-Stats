import { Info, Award, Trophy, Crown, FileText } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'

export const SHOW_RATING_MODAL_CONTENT = (
  <div className="p-3.5 space-y-3 text-charcoal-800">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200/80 pb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>Как устроен рейтинг выставок РКФ</span>
    </div>

    <div className="space-y-2.5 text-xs">
      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300/80 shadow-2xs">
          1
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Trophy className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden />
            <span>Главные победы арены</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            <strong>BIS</strong> (Best in Show) и <strong>BIG</strong> (Best in Group) дают максимальный вклад в рейтинг. Победители бэстов возглавляют общий зачёт.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-camel-100 text-camel-900 text-[11px] font-bold border border-camel-300/80 shadow-2xs">
          2
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Crown className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
            <span>Победы в породе (BOB / BOS)</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            <strong>BOB</strong> (ЛПП) и <strong>BOS</strong> определяют сильнейших собак в породных рингах на сертификатных выставках.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cream-200 text-charcoal-800 text-[11px] font-bold border border-old-money-300 shadow-2xs">
          3
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Award className="h-3.5 w-3.5 text-charcoal-600 shrink-0" aria-hidden />
            <span>Сертификаты (CACIB, CAC, ЧРКФ)</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            Кандидаты в чемпионы (CACIB/CAC/JCAC/VCAC) и победители классов формируют базовые баллы стабильности. При равенстве баллов выше собака с меньшим числом выставок.
          </p>
        </div>
      </div>
    </div>

    <div className="border-t border-old-money-200/80 pt-2.5 mt-2.5 text-[10.5px] leading-relaxed text-charcoal-600 flex items-start gap-1.5">
      <FileText className="h-3.5 w-3.5 text-camel-700 shrink-0 mt-0.5" aria-hidden />
      <p>
        <strong className="text-charcoal-800 font-semibold">Источник данных:</strong> официальные ведомости и протоколы РКФ (rkf.online). Проект собирает открытую статистику и формирует независимый аналитический рейтинг сезона.
      </p>
    </div>
  </div>
)

const TOOLTIP_CONTENT = (
  <div className="max-w-[20rem] space-y-2 text-charcoal-800">
    <p className="text-[12px] font-semibold leading-tight text-charcoal-900">
      Рейтинг выставок РКФ
    </p>
    <p className="text-[11px] leading-snug text-charcoal-700">
      Рассчитывается по взвешенной системе наград: BIS → BIG → BOB → BOS → CACIB / CAC.
    </p>
    <p className="text-[10.5px] text-charcoal-600 border-t border-old-money-200/80 pt-1.5">
      Нажмите для подробного описания формулы и иерархии титулов.
    </p>
  </div>
)

interface ShowRatingHintProps {
  embedded?: boolean
}

export default function ShowRatingHint({ embedded: _embedded }: ShowRatingHintProps) {
  const trigger = (
    <button
      type="button"
      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-old-money-300/80 bg-cream-50 px-3 text-xs font-semibold text-charcoal-800 hover:border-camel-500 hover:bg-cream-100 hover:text-charcoal-900 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
      aria-label="О рейтинге выставок"
    >
      <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
      <span>О рейтинге</span>
    </button>
  )

  return (
    <ModernDropdown trigger={trigger} width="340px" portal closeOnScroll>
      {SHOW_RATING_MODAL_CONTENT}
    </ModernDropdown>
  )
}
