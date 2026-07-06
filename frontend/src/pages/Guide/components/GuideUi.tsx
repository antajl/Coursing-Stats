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