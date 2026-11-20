import { ShieldCheck } from 'lucide-react'
import { COURSING_REQUIREMENTS, SPORT_BLANKET_COLORS } from '../../../constants'
import { RefTag, SectionCard } from '../../GuideUi'

export function ParticipantMemoSection() {
  return (
    <div id="sec-requirements">
      <SectionCard id="regulations" title="Памятка участника: регламент, кворум и экипировка">
        <div className="grid gap-3 sm:grid-cols-2">
          {COURSING_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="flex flex-col justify-between rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-camel-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
                  {req.label}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                  {req.text}
                </p>
              </div>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>

        {/* Цвета попон */}
        <div className="mt-3 rounded-xl border border-old-money-200 bg-white p-4 shadow-2xs">
          <h3 className="text-xs font-bold text-charcoal-900 sm:text-sm">
            Официальная цветовая кодировка попон состязаний (РКФ / FCI)
          </h3>
          <p className="mt-1 text-xs text-charcoal-600">
            Судьи и зрители идентифицируют бегущих собак по цвету номеров попон:
          </p>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {SPORT_BLANKET_COLORS.map((b) => (
              <div
                key={b.number}
                className="flex flex-col items-center justify-center rounded-lg border p-2 text-center shadow-2xs transition-all"
              >
                <span
                  className={`inline-block rounded border px-2 py-0.5 text-xs font-bold shadow-2xs ${b.badgeClass}`}
                >
                  № {b.number} · {b.name}
                </span>
                <span className="mt-1.5 text-[10px] leading-tight text-charcoal-600 font-medium">
                  {b.desc}
                </span>
              </div>
            ))}
          </div>
          <RefTag>Правила состязаний борзых РКФ, разд. III · п. 3.2</RefTag>
        </div>
      </SectionCard>
    </div>
  )
}
