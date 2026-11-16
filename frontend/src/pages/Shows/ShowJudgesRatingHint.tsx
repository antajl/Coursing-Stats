import { Info, Award, Zap, ShieldCheck } from 'lucide-react'
import ModernDropdown from '../../components/ui/ModernDropdown'

export const SHOW_JUDGES_HINT_MODAL_CONTENT = (
  <div className="p-3.5 space-y-3 text-charcoal-800">
    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900 border-b border-old-money-200/80 pb-2">
      <Info className="h-4 w-4 text-camel-700 shrink-0" aria-hidden />
      <span>О судействе выставок и оценках РКФ</span>
    </div>

    <div className="space-y-2.5 text-xs">
      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-camel-100 text-camel-900 text-[11px] font-bold border border-camel-300/80 shadow-2xs">
          1
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Award className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
            <span>Оценки экстерьера в рингах РКФ</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            Экспертиза проводится по стандарту породы FCI/РКФ: <strong>Отлично</strong> (красная лента), <strong>Очень хорошо</strong> (синяя), <strong>Хорошо</strong> (зеленая), <strong>Дисквалификация</strong> или <strong>Без оценки</strong>.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300/80 shadow-2xs">
          2
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <Zap className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden />
            <span>Шкала строгости судей</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            Калибровка по 2,5+ млн оценок каталогов РКФ (порог — от 30 взрослых или 15 щенков):
          </p>
          <div className="mt-1 space-y-1.5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">Взрослые классы (CAC)</span>
              <div className="mt-0.5 grid grid-cols-3 gap-1 text-[10.5px]">
                <div className="rounded border border-rose-200/80 bg-rose-50/70 p-1 text-center">
                  <span className="font-semibold text-rose-800">Строгий</span>
                  <span className="block text-[9.5px] text-rose-700">&lt; 88% отл.</span>
                </div>
                <div className="rounded border border-amber-200/80 bg-amber-50/70 p-1 text-center">
                  <span className="font-semibold text-amber-800">Умеренный</span>
                  <span className="block text-[9.5px] text-amber-700">88–95%</span>
                </div>
                <div className="rounded border border-emerald-200/80 bg-emerald-50/70 p-1 text-center">
                  <span className="font-semibold text-emerald-800">Лояльный</span>
                  <span className="block text-[9.5px] text-emerald-700">≥ 96% отл.</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">Щенки и бэби</span>
              <div className="mt-0.5 grid grid-cols-3 gap-1 text-[10.5px]">
                <div className="rounded border border-rose-200/80 bg-rose-50/70 p-1 text-center">
                  <span className="font-semibold text-rose-800">Строг</span>
                  <span className="block text-[9.5px] text-rose-700">&lt; 94% персп.</span>
                </div>
                <div className="rounded border border-amber-200/80 bg-amber-50/70 p-1 text-center">
                  <span className="font-semibold text-amber-800">Умеренный</span>
                  <span className="block text-[9.5px] text-amber-700">94–98%</span>
                </div>
                <div className="rounded border border-emerald-200/80 bg-emerald-50/70 p-1 text-center">
                  <span className="font-semibold text-emerald-800">Лоялен</span>
                  <span className="block text-[9.5px] text-emerald-700">≥ 99% персп.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cream-200 text-charcoal-800 text-[11px] font-bold border border-old-money-300/80 shadow-2xs">
          3
        </span>
        <div className="leading-tight">
          <div className="flex items-center gap-1 font-semibold text-charcoal-900">
            <ShieldCheck className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
            <span>Сертификаты и титулы ринга</span>
          </div>
          <p className="text-[11px] text-charcoal-600 mt-0.5 leading-snug">
            Победителям присваиваются <strong>CW</strong>, <strong>CAC</strong> / <strong>JCAC</strong> / <strong>VCAC</strong> / <strong>CACIB</strong>, выбираются <strong>BOS</strong> и <strong>BOB (ЛПП)</strong> для выхода в главные финалы <strong>BIG</strong> и <strong>BIS</strong>.
          </p>
        </div>
      </div>
    </div>
  </div>
)

interface ShowJudgesRatingHintProps {
  embedded?: boolean
  compact?: boolean
}

export default function ShowJudgesRatingHint({ embedded: _embedded, compact }: ShowJudgesRatingHintProps) {
  const isCompact = compact === true
  const isAuto = compact === undefined

  const trigger = (
    <button
      type="button"
      className={
        isCompact
          ? 'cs-glass-pill inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer select-none'
          : isAuto
            ? 'cs-glass-pill inline-flex h-8 w-8 sm:w-auto shrink-0 items-center justify-center gap-1.5 rounded-full sm:px-3 text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer whitespace-nowrap select-none'
            : 'cs-glass-pill inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold !text-charcoal-700 transition-all cursor-pointer whitespace-nowrap select-none'
      }
      aria-label="О судействе выставок"
      title="О судействе выставок"
    >
      <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
      {isAuto ? (
        <span className="hidden sm:inline">О судействе</span>
      ) : !isCompact ? (
        <span>О судействе</span>
      ) : null}
    </button>
  )

  return (
    <ModernDropdown trigger={trigger} width="340px" portal closeOnScroll>
      {() => SHOW_JUDGES_HINT_MODAL_CONTENT}
    </ModernDropdown>
  )
}
