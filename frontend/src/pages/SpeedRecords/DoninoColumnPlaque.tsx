import type { ReactNode } from 'react'

function formatDogCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} собак`
  if (mod10 === 1) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count} собаки`
  return `${count} собак`
}

interface DoninoColumnPlaqueProps {
  title: string
  count: number
  action?: ReactNode
  /** Header bar inside DoninoColumnShell (no outer margin/border). */
  asHeader?: boolean
}

export default function DoninoColumnPlaque({
  title,
  count,
  action,
  asHeader = false,
}: DoninoColumnPlaqueProps) {
  const shellClass = asHeader
    ? 'donino-column-plaque relative flex h-10 min-h-10 items-center border-b border-old-money-200 bg-cream-100/90 px-3.5 dark:border-charcoal-600 dark:bg-charcoal-800/90'
    : 'donino-column-plaque relative mb-3 flex h-10 min-h-10 items-center rounded-xl border border-old-money-200 bg-cream-100/90 px-3.5 dark:border-charcoal-600 dark:bg-charcoal-800/90'

  return (
    <div className={shellClass}>
      <h2 className="relative z-[1] shrink-0 font-mono text-[11px] font-bold uppercase tracking-widest text-camel-700 dark:text-camel-400">
        {title}
      </h2>
      {action && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-24">
          <div className="pointer-events-auto">{action}</div>
        </div>
      )}
      <span className="relative z-[1] ml-auto shrink-0 text-xs font-semibold text-old-money-600 dark:text-old-money-400">
        {formatDogCount(count)}
      </span>
    </div>
  )
}

/** Plaque + list in one bordered column shell (rows should use embedded/flat style). */
export function DoninoColumnShell({
  plaque,
  children,
}: {
  plaque: ReactNode
  children: ReactNode
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
      {plaque}
      <div className="flex flex-col divide-y divide-old-money-100 dark:divide-charcoal-700">
        {children}
      </div>
    </section>
  )
}
