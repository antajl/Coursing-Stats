import { Flag, Gauge } from 'lucide-react'
import { SPORT_DISCIPLINES } from '../../../constants'
import { SectionCard } from '../../GuideUi'

export function DisciplinesOverviewSection() {
  return (
    <div id="sec-disciplines">
      <SectionCard title="Две спортивные дисциплины: курсинг и бега борзых">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Официальный спорт борзых в системе РКФ и FCI делится на две принципиально разные дисциплины с раздельными правилами, судейством и титулами:
        </p>

        <div className="grid gap-3.5 sm:grid-cols-2 pt-1">
          {SPORT_DISCIPLINES.map((disc) => (
            <div
              key={disc.id}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2 border-b border-old-money-100 pb-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-camel-100 text-camel-900 shadow-2xs">
                    {disc.id === 'coursing' ? (
                      <Flag className="h-4 w-4" aria-hidden />
                    ) : (
                      <Gauge className="h-4 w-4" aria-hidden />
                    )}
                  </span>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-charcoal-900">{disc.title}</span>
                    <div className="text-[11px] font-medium text-camel-800">{disc.subtitle}</div>
                  </div>
                </div>

                <ul className="mt-3 space-y-2 text-xs text-charcoal-700">
                  <li className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-900 shrink-0">Трасса:</span>
                    <span>{disc.track}</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-semibold text-charcoal-900 shrink-0">Судейство:</span>
                    <span>{disc.judging}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-3.5 rounded-lg border border-camel-200/90 bg-camel-50/60 p-2.5 text-[11px] font-medium text-camel-950">
                {disc.keyFact}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
