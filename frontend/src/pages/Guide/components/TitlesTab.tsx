import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  ABBREVIATIONS,
  COURSING_REQUIREMENTS,
  OFFICIAL_SOURCES,
  TITLE_RANK_LADDER,
  type TitleRankItem,
} from '../constants'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleBadge,
} from './GuideUi'

function TitleLadderList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const tierBg = {
    international: 'border-amber-400 bg-linear-to-r from-amber-50/80 via-cream-50/50 to-amber-50/80 hover:bg-amber-100/60 shadow-xs',
    absolute: 'border-amber-300/90 bg-amber-50/50 hover:bg-amber-50/80',
    career: 'border-camel-300/80 bg-camel-50/40 hover:bg-camel-50/70',
    annual: 'border-camel-200/90 bg-white hover:bg-camel-50/30',
    cert_intl: 'border-blue-200/90 bg-blue-50/30 hover:bg-blue-50/60',
    cert_nat: 'border-old-money-200 bg-white hover:bg-old-money-50/50',
  }

  const badgeFrame = {
    international: 'border-2 border-amber-600 bg-amber-200 text-amber-950 font-bold shadow-xs',
    absolute: 'border-2 border-amber-500 bg-amber-100 text-amber-900 font-bold shadow-2xs',
    career: 'border border-camel-500 bg-camel-100 text-camel-900 font-semibold shadow-2xs',
    annual: 'border border-camel-400 bg-cream-50 text-camel-800 font-semibold shadow-2xs',
    cert_intl: 'border border-blue-400 bg-blue-100 text-blue-900 font-medium shadow-2xs',
    cert_nat: 'border border-old-money-300 bg-white text-charcoal-800 font-medium shadow-2xs',
  }

  const tagColor = {
    international: 'bg-amber-200 text-amber-950 border-amber-400 font-bold',
    absolute: 'bg-amber-100 text-amber-900 border-amber-300',
    career: 'bg-camel-100 text-camel-900 border-camel-300',
    annual: 'bg-cream-100 text-camel-900 border-camel-200',
    cert_intl: 'bg-blue-100 text-blue-900 border-blue-200',
    cert_nat: 'bg-white text-charcoal-700 border-old-money-200',
  }

  return (
    <div className="space-y-2">
      {TITLE_RANK_LADDER.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={item.badge}
            className={`rounded-lg border transition-all shadow-2xs ${tierBg[item.prestigeTier]}`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-2.5 p-2.5 sm:px-3 sm:py-2 text-left"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-charcoal-700 shadow-2xs">
                  {item.rank}
                </span>
                <span
                  className={`inline-block shrink-0 rounded px-1.5 py-0.5 text-xs ${badgeFrame[item.prestigeTier]}`}
                >
                  {item.badge}
                </span>
                <span className="min-w-0 flex-1 font-serif text-xs font-bold leading-snug text-charcoal-900 sm:text-sm">
                  {item.name}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`hidden rounded border px-2 py-0.5 text-[10px] font-semibold sm:inline-block shadow-2xs ${tagColor[item.prestigeTier]}`}
                >
                  {item.prestigeLabel}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-charcoal-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-old-money-100 bg-white/80 px-3.5 py-2.5 text-xs text-charcoal-600">
                <p className="leading-relaxed">{item.details}</p>

                <div className="mt-2 rounded border border-old-money-200 bg-old-money-50/60 p-2 text-[11px]">
                  <span className="font-semibold text-charcoal-800">Как получить:</span>
                  <div className="mt-0.5 text-charcoal-700">{item.howToGet}</div>

                  {item.extraList && (
                    <div className="mt-2 pt-2 border-t border-old-money-200/60">
                      <span className="font-semibold text-charcoal-800">Официальные варианты набора (РКФ):</span>
                      <ul className="mt-1 list-disc pl-4 space-y-0.5 text-charcoal-600">
                        {item.extraList.map((variant) => (
                          <li key={variant}>{variant}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {item.ref && <RefTag>{item.ref}</RefTag>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function TitlesTab() {
  return (
    <div className="space-y-6">
      {/* 1. Наглядная лестница титулов: ценность и как получить */}
      <SectionCard title="Лестница титулов: ценность и как получить">
        <p className="text-xs text-charcoal-600">
          Сравнение всех титулов от абсолютной вершины до базовых полевых сертификатов (клик по строке раскроет детали регламента):
        </p>

        <TitleLadderList />
      </SectionCard>

      {/* 3. Ключевые правила состязаний (Памятка участника) */}
      <SectionCard title="Памятка участника: кворум и условия сертификатов">
        <div className="grid gap-3 sm:grid-cols-2">
          {COURSING_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                {req.label}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                {req.text}
              </p>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 4. Словарь сокращений */}
      <SectionCard title="Словарь сокращений в протоколах">
        <p className="text-xs text-charcoal-600">
          Выберите официальное сокращение титула или сертификата, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={ABBREVIATIONS}
          refTag={<RefTag>Положение РКФ о титулах, разд. IV · abbreviation.pdf</RefTag>}
        />
      </SectionCard>

      {/* 5. Первоисточники и регламенты РКФ */}
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600">
          Нормативные документы РКФ, регламентирующие правила присвоения титулов:
        </p>
        <OfficialSourcesList sources={OFFICIAL_SOURCES} />
      </SectionCard>
    </div>
  )
}
