import { HelpCircle } from 'lucide-react'
import DoninoColumnPlaque, { DoninoColumnShell } from '../../SpeedRecords/DoninoColumnPlaque'
import type { BreedHubItem } from '../../../lib/breed-hubs-data'

interface BreedHubFaqProps {
  breedInfo: BreedHubItem
}

export function BreedHubFaq({ breedInfo }: BreedHubFaqProps) {
  if (!breedInfo.faqs || breedInfo.faqs.length === 0) return null

  return (
    <div id="faq" className="scroll-mt-24 md:scroll-mt-28">
      <DoninoColumnShell
        plaque={
          <DoninoColumnPlaque
            asHeader
            title={
              <span className="inline-flex items-center gap-1.5 sm:gap-2 truncate">
                <HelpCircle className="w-3.5 h-3.5 text-camel-700 shrink-0" aria-hidden />
                <span>Частые вопросы и регламент состязаний</span>
                <span className="text-old-money-500 font-semibold text-[11px] sm:text-xs normal-case tracking-normal shrink-0">
                  · {breedInfo.nameRu}
                </span>
              </span>
            }
          />
        }
        bodyClassName="flex flex-col divide-y divide-old-money-100"
      >
        {breedInfo.faqs.map((faq, i) => (
          <div key={i} className="p-3.5 sm:p-4 hover:bg-cream-50/50 transition-colors">
            <h3 className="text-xs sm:text-sm font-semibold text-charcoal-900 mb-1">
              {faq.question}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed max-w-4xl">
              {faq.answer}
            </p>
          </div>
        ))}
      </DoninoColumnShell>
    </div>
  )
}
