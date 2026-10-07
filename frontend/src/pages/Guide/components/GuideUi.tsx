import { useState, useMemo, type ReactNode } from 'react'
import { ChevronDown, ExternalLink, Search, X } from 'lucide-react'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { titleBadgeClass } from '../../../lib/qualificationTitles'
import { ABBREVIATIONS, type TitleRankItem } from '../constants'

const ABBR_LOOKUP = Object.fromEntries(ABBREVIATIONS.map((row) => [row.abbr, row.full]))

export function abbrExpansion(abbr: string): string | undefined {
  return ABBR_LOOKUP[abbr]
}

const ABBR_CLASS = 'font-mono text-xs font-bold text-camel-700'

export function AbbrTag({
  abbr,
  title,
  className = '',
}: {
  abbr: string
  title?: string
  className?: string
}) {
  const expansion = title ?? abbrExpansion(abbr) ?? abbr

  return (
    <HoverTooltip label={expansion} placement="top">
      <span className={`${ABBR_CLASS} ${className}`.trim()} tabIndex={0}>
        {abbr}
      </span>
    </HoverTooltip>
  )
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-old-money-200 bg-white/80 p-4 md:p-6">
      <h2 className="mb-3 font-serif text-lg font-bold text-charcoal-900 md:text-xl">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-charcoal-700">{children}</div>
    </section>
  )
}

export function ExternalHref({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-camel-700 underline decoration-camel-300 underline-offset-2 transition-colors hover:text-camel-800"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
    </a>
  )
}

export function TitleBadge({ title }: { title: string }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${titleBadgeClass(title)}`}>
      {title}
    </span>
  )
}

export function RefTag({ children }: { children: ReactNode }) {
  return (
    <span className="mt-1 block text-[11px] text-old-money-500">{children}</span>
  )
}

export function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-camel-200 bg-camel-50/80 px-3 py-2.5 text-sm text-camel-900">
      {children}
    </div>
  )
}

type OfficialSource = {
  label: string
  href: string
  note: string
  supplementary?: boolean
}

export function OfficialSourcesList({ sources }: { sources: readonly OfficialSource[] }) {
  return (
    <ul className="space-y-3">
      {sources.map((src) => (
        <li
          key={src.href}
          className={`rounded-lg border px-3 py-2.5 ${
            src.supplementary
              ? 'border-old-money-200 bg-old-money-50/50'
              : 'border-camel-200 bg-white'
          }`}
        >
          <ExternalHref href={src.href}>{src.label}</ExternalHref>
          <p className="mt-1 text-xs text-old-money-600">{src.note}</p>
        </li>
      ))}
    </ul>
  )
}

type HierarchyLevel = {
  label: string
  badges?: string[]
  note?: ReactNode
  /** Порядок сверху вниз: prestige → certificate → diploma → cumulative */
  tier: 'prestige' | 'certificate' | 'diploma' | 'cumulative'
}

export function TitleHierarchySection({
  title,
  levels,
  refTag,
}: {
  title: string
  levels: HierarchyLevel[]
  refTag?: ReactNode
}) {
  const tierClass = {
    prestige: 'rounded-xl border border-camel-300 bg-camel-50/70 p-3.5 sm:p-4 shadow-2xs',
    certificate: 'rounded-xl border border-old-money-200 bg-white p-3.5 sm:p-4 shadow-2xs',
    diploma: 'rounded-xl border border-old-money-200 bg-old-money-50/50 p-3.5 sm:p-4 shadow-2xs',
    cumulative: 'rounded-xl border border-camel-200 bg-cream-50/80 p-3.5 sm:p-4 shadow-2xs',
  }
  const labelClass = {
    prestige: 'text-[11px] font-bold uppercase tracking-wider text-camel-900',
    certificate: 'text-[11px] font-bold uppercase tracking-wider text-charcoal-700',
    diploma: 'text-[11px] font-bold uppercase tracking-wider text-old-money-600',
    cumulative: 'text-[11px] font-bold uppercase tracking-wider text-camel-800',
  }

  return (
    <SectionCard title={title}>
      <div className="space-y-3">
        {levels.map((level, idx) => (
          <div key={level.label} className={tierClass[level.tier]}>
            <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
              <span className={labelClass[level.tier]}>{level.label}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-charcoal-500 shadow-2xs">
                Уровень {idx + 1}
              </span>
            </div>
            {level.badges && level.badges.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2">
                {level.badges.map((badge) => (
                  <TitleBadge key={badge} title={badge} />
                ))}
              </div>
            )}
            {level.note && <div className="mt-2 text-xs leading-relaxed text-charcoal-700">{level.note}</div>}
          </div>
        ))}
      </div>
      {refTag}
    </SectionCard>
  )
}

type CertificateLevel = { level: string; code: string }

export function CertificateLevelsGrid({ items }: { items: readonly CertificateLevel[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.code}
          className="rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500">
            {item.level}
          </div>
          <div className="mt-2">
            <TitleBadge title={item.code} />
          </div>
        </div>
      ))}
    </div>
  )
}

type EventTitleItem = {
  abbr: string
  title: string
  condition: string
  ref: string
  abbrTitle?: string
}

export function EventTitlesGrid({ items }: { items: readonly EventTitleItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.abbr}
          className="rounded-lg border border-old-money-200 bg-old-money-50/60 p-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <AbbrTag abbr={item.abbr} title={item.abbrTitle} />
            <TitleBadge title={item.title} />
          </div>
          <p className="mt-2 text-sm">{item.condition}</p>
          <RefTag>{item.ref}</RefTag>
        </div>
      ))}
    </div>
  )
}

type CumulativeTitleItem = {
  abbr: string
  title: string
  summary: string
  ref: string
  abbrTitle?: string
}

export function CumulativeTitlesGrid({ items }: { items: readonly CumulativeTitleItem[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.abbr} className="rounded-lg border border-old-money-200 p-3">
          <AbbrTag abbr={item.abbr} title={item.abbrTitle} />
          <p className="mt-1 font-medium text-charcoal-800">{item.title}</p>
          <p className="mt-1 text-xs">{item.summary}</p>
          <RefTag>{item.ref}</RefTag>
        </div>
      ))}
    </div>
  )
}

type AbbreviationRow = { abbr: string; full: string }

export function AbbreviationsDropdown({
  rows,
  refTag,
}: {
  rows: readonly AbbreviationRow[]
  refTag?: ReactNode
}) {
  const [query, setQuery] = useState('')

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.abbr.toLowerCase().includes(q) || r.full.toLowerCase().includes(q)
    )
  }, [rows, query])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-charcoal-400">
            <Search className="h-4 w-4" aria-hidden />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Быстрый поиск по сокращению или расшифровке..."
            className="w-full rounded-lg border border-old-money-200 bg-white py-2 pl-9 pr-8 text-xs font-medium text-charcoal-800 placeholder-charcoal-400 shadow-2xs transition-colors hover:border-camel-300 focus:border-camel-400 focus:outline-none focus:ring-1 focus:ring-camel-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              aria-label="Очистить поиск"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="shrink-0 text-xs text-charcoal-500 font-medium">
          {filteredRows.length === rows.length
            ? `Всего: ${rows.length}`
            : `Найдено: ${filteredRows.length} из ${rows.length}`}
        </span>
      </div>

      {filteredRows.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filteredRows.map((row) => (
            <div
              key={row.abbr}
              className="flex items-start gap-2.5 rounded-lg border border-old-money-200 bg-white p-2.5 shadow-2xs transition-all hover:border-camel-300 hover:bg-cream-50/40"
            >
              <span className="shrink-0 rounded-md border border-camel-200/90 bg-camel-50 px-2 py-0.5 font-mono text-xs font-bold text-camel-800 shadow-2xs">
                {row.abbr}
              </span>
              <span className="min-w-0 flex-1 text-xs leading-relaxed text-charcoal-700 font-medium">
                {row.full}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-old-money-200 bg-cream-50/50 p-6 text-center">
          <p className="text-xs text-charcoal-600">
            Ничего не найдено по запросу «<span className="font-semibold text-charcoal-800">{query}</span>»
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-2 text-xs font-semibold text-camel-700 hover:text-camel-800 underline underline-offset-2 cursor-pointer"
          >
            Сбросить фильтр
          </button>
        </div>
      )}

      {refTag && <div className="pt-0.5">{refTag}</div>}
    </div>
  )
}

export function AbbreviationsTable({
  rows,
  abbrLookup,
  refTag,
}: {
  rows: readonly AbbreviationRow[]
  abbrLookup?: Record<string, string>
  refTag?: ReactNode
}) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] text-sm">
          <tbody className="divide-y divide-old-money-100">
            {rows.map((row) => (
              <tr key={row.abbr}>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <AbbrTag abbr={row.abbr} title={abbrLookup?.[row.abbr] ?? row.full} />
                </td>
                <td className="py-2 text-charcoal-700">{row.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {refTag}
    </>
  )
}

type PriorityAward = { rank: number; abbr: string; title: string; note: string; points?: string; abbrTitle?: string }

export function PriorityAwardsList({ items }: { items: readonly PriorityAward[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item) => (
        <li
          key={item.abbr}
          className="flex items-start gap-2.5 sm:gap-3 rounded-lg border border-old-money-200 bg-old-money-50/40 p-2.5 sm:px-3 sm:py-2.5 transition-colors hover:bg-cream-50"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-camel-100 text-xs font-bold text-camel-800 mt-0.5">
            {item.rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <AbbrTag abbr={item.abbr} title={item.abbrTitle} />
                <span className="text-sm font-semibold text-charcoal-800">{item.title}</span>
              </div>
              {item.points && (
                <span className="inline-flex items-center rounded-md border border-camel-200/90 bg-camel-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-camel-800">
                  {item.points}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-charcoal-600">{item.note}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

type FeatureItem = { label: string; text: string; ref: string }

export function FeatureNotesGrid({ items }: { items: readonly FeatureItem[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-old-money-500">{item.label}</div>
          <p className="mt-1">{item.text}</p>
          <RefTag>{item.ref}</RefTag>
        </div>
      ))}
    </div>
  )
}

export function TitleLadderList({ items }: { items: readonly TitleRankItem[] }) {
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
      {items.map((item, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={`${item.badge}-${item.rank}`}
            className={`rounded-lg border transition-all shadow-2xs ${tierBg[item.prestigeTier]}`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-start sm:items-center justify-between gap-2 sm:gap-2.5 p-2.5 sm:px-3 sm:py-2 text-left"
            >
              <div className="flex min-w-0 flex-1 items-start sm:items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-charcoal-700 shadow-2xs mt-0.5 sm:mt-0">
                  {item.rank}
                </span>
                <span
                  className={`inline-block shrink-0 rounded px-1.5 py-0.5 text-xs ${badgeFrame[item.prestigeTier]} mt-0.5 sm:mt-0`}
                >
                  {item.badge}
                </span>
                <span className="min-w-0 flex-1 font-serif text-xs font-bold leading-snug text-charcoal-900 sm:text-sm">
                  {item.name}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2 mt-0.5 sm:mt-0">
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
              <div className="border-t border-old-money-100 bg-white/80 px-3.5 py-3 text-xs sm:text-sm text-charcoal-600">
                <div className="mb-2 sm:hidden">
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-[10px] font-semibold shadow-2xs ${tagColor[item.prestigeTier]}`}
                  >
                    {item.prestigeLabel}
                  </span>
                </div>

                <p className="leading-relaxed text-charcoal-700">{item.details}</p>

                <div className="mt-2.5 rounded-lg border border-old-money-200 bg-old-money-50/70 p-2.5 text-xs">
                  <span className="font-semibold text-charcoal-900">Как получить:</span>
                  <div className="mt-1 leading-relaxed text-charcoal-800">{item.howToGet}</div>

                  {item.extraList && (
                    <div className="mt-2.5 pt-2 border-t border-old-money-200/80">
                      <span className="font-semibold text-charcoal-900">Официальные варианты набора (РКФ):</span>
                      <ul className="mt-1.5 list-disc pl-4 space-y-1 text-charcoal-700 leading-relaxed">
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

