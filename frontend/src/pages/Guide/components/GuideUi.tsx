import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import HoverTooltip from '../../../components/ui/HoverTooltip'
import { titleBadgeClass } from '../../../lib/qualificationTitles'
import { ABBREVIATIONS } from '../constants'

const ABBR_LOOKUP = Object.fromEntries(ABBREVIATIONS.map((row) => [row.abbr, row.full]))

export function abbrExpansion(abbr: string): string | undefined {
  return ABBR_LOOKUP[abbr]
}

const ABBR_CLASS = 'font-mono text-xs font-bold text-camel-700 dark:text-camel-400'

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
    <section className="rounded-xl border border-old-money-200 bg-white/80 p-4 dark:border-charcoal-600 dark:bg-charcoal-800/50 md:p-6">
      <h2 className="mb-3 font-serif text-lg font-bold text-charcoal-900 dark:text-charcoal-100 md:text-xl">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-charcoal-700 dark:text-charcoal-300">{children}</div>
    </section>
  )
}

export function ExternalHref({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-camel-700 underline decoration-camel-300 underline-offset-2 transition-colors hover:text-camel-800 dark:text-camel-400 dark:decoration-camel-700 dark:hover:text-camel-300"
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
    <span className="mt-1 block text-[11px] text-old-money-500 dark:text-old-money-400">{children}</span>
  )
}

export function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-camel-200 bg-camel-50/80 px-3 py-2.5 text-sm text-camel-900 dark:border-camel-800 dark:bg-camel-950/30 dark:text-camel-200">
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
              ? 'border-old-money-200 bg-old-money-50/50 dark:border-charcoal-600 dark:bg-charcoal-800/40'
              : 'border-camel-200 bg-white dark:border-camel-900/50 dark:bg-charcoal-800/60'
          }`}
        >
          <ExternalHref href={src.href}>{src.label}</ExternalHref>
          <p className="mt-1 text-xs text-old-money-600 dark:text-old-money-400">{src.note}</p>
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
    prestige:
      'rounded-lg border-2 border-camel-400 bg-camel-50 px-4 py-3 dark:border-camel-500 dark:bg-camel-950/30',
    certificate:
      'rounded-lg border border-old-money-400 bg-old-money-50 px-4 py-3 dark:border-charcoal-500 dark:bg-charcoal-800/80',
    diploma:
      'rounded-lg border border-camel-300 bg-camel-50/70 px-4 py-3 dark:border-camel-800 dark:bg-camel-950/20',
    cumulative:
      'rounded-lg border-2 border-camel-500 bg-cream-50 px-4 py-3 dark:border-camel-400 dark:bg-charcoal-800/60',
  }
  const labelClass = {
    prestige: 'text-[10px] font-semibold uppercase tracking-wide text-camel-800 dark:text-camel-300',
    certificate: 'text-[10px] font-semibold uppercase tracking-wide text-old-money-600 dark:text-old-money-400',
    diploma: 'text-[10px] font-semibold uppercase tracking-wide text-camel-700 dark:text-camel-400',
    cumulative: 'text-[10px] font-semibold uppercase tracking-wide text-camel-800 dark:text-camel-300',
  }
  const wrapClass = {
    prestige: '',
    certificate: 'ml-3 border-l-2 border-old-money-300 pl-4 dark:border-charcoal-600',
    diploma: 'ml-6 border-l-2 border-camel-300 pl-4 dark:border-camel-700',
    cumulative: 'ml-9 border-l-2 border-camel-400 pl-4 dark:border-camel-600',
  }

  return (
    <SectionCard title={title}>
      <div className="space-y-2">
        {levels.map((level) => (
          <div key={level.label} className={wrapClass[level.tier]}>
            <div className={tierClass[level.tier]}>
              <div className={labelClass[level.tier]}>{level.label}</div>
              {level.badges && level.badges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {level.badges.map((badge) => (
                    <TitleBadge key={badge} title={badge} />
                  ))}
                </div>
              )}
              {level.note && <div className="mt-2 text-xs">{level.note}</div>}
            </div>
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
          className="rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 dark:border-charcoal-600 dark:bg-charcoal-800/50"
        >
          <div className="text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
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
          className="rounded-lg border border-old-money-200 bg-old-money-50/60 p-3 dark:border-charcoal-600 dark:bg-charcoal-800/50"
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
        <div key={item.abbr} className="rounded-lg border border-old-money-200 p-3 dark:border-charcoal-600">
          <AbbrTag abbr={item.abbr} title={item.abbrTitle} />
          <p className="mt-1 font-medium text-charcoal-800 dark:text-charcoal-200">{item.title}</p>
          <p className="mt-1 text-xs">{item.summary}</p>
          <RefTag>{item.ref}</RefTag>
        </div>
      ))}
    </div>
  )
}

type AbbreviationRow = { abbr: string; full: string }

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
          <tbody className="divide-y divide-old-money-100 dark:divide-charcoal-700">
            {rows.map((row) => (
              <tr key={row.abbr}>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <AbbrTag abbr={row.abbr} title={abbrLookup?.[row.abbr] ?? row.full} />
                </td>
                <td className="py-2 text-charcoal-700 dark:text-charcoal-300">{row.full}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {refTag}
    </>
  )
}

type PriorityAward = { rank: number; abbr: string; title: string; note: string; abbrTitle?: string }

export function PriorityAwardsList({ items }: { items: readonly PriorityAward[] }) {
  return (
    <ol className="space-y-2">
      {items.map((item) => (
        <li
          key={item.abbr}
          className="flex gap-3 rounded-lg border border-old-money-200 bg-old-money-50/40 px-3 py-2.5 dark:border-charcoal-600 dark:bg-charcoal-800/40"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-camel-100 text-xs font-bold text-camel-800 dark:bg-charcoal-700 dark:text-camel-300">
            {item.rank}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <AbbrTag abbr={item.abbr} title={item.abbrTitle} />
              <span className="text-sm font-semibold text-charcoal-800 dark:text-charcoal-100">{item.title}</span>
            </div>
            <p className="mt-0.5 text-xs text-charcoal-600 dark:text-charcoal-400">{item.note}</p>
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
          className="rounded-lg border border-old-money-200 bg-old-money-50/50 px-3 py-2.5 dark:border-charcoal-600 dark:bg-charcoal-800/40"
        >
          <div className="text-xs font-semibold uppercase tracking-wide text-old-money-500">{item.label}</div>
          <p className="mt-1">{item.text}</p>
          <RefTag>{item.ref}</RefTag>
        </div>
      ))}
    </div>
  )
}
