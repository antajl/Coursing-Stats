import type { ReactNode, Ref } from 'react'

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
  countLabel?: string
  action?: ReactNode
  actionPlacement?: 'inline' | 'center'
  countClassName?: string
  titleClassName?: string
  /** Header bar inside DoninoColumnShell (no outer margin/border). */
  asHeader?: boolean
}

export default function DoninoColumnPlaque({
  title,
  count,
  countLabel,
  action,
  actionPlacement = 'center',
  countClassName,
  titleClassName,
  asHeader = false,
}: DoninoColumnPlaqueProps) {
  const shellClass = asHeader
    ? 'donino-column-plaque relative flex h-10 min-h-10 items-center justify-between border-b border-[rgba(195,168,128,0.55)] bg-cream-100/90 px-3.5'
    : 'donino-column-plaque relative mb-3 flex h-10 min-h-10 items-center justify-between rounded-xl border border-[rgba(195,168,128,0.75)] bg-cream-100/90 px-3.5 shadow-sm'

  const isInlineAction = actionPlacement === 'inline'

  return (
    <div className={shellClass}>
      <div className="relative z-[1] flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
        <h2 className={`text-xs font-bold uppercase tracking-wider text-camel-800 truncate ${titleClassName || ''}`}>
          {title}
        </h2>
        {action && isInlineAction && (
          <div className="flex items-center shrink-0">
            {action}
          </div>
        )}
        {action && !isInlineAction && (
          <div className="sm:hidden flex items-center shrink-0">
            {action}
          </div>
        )}
      </div>
      {action && !isInlineAction && (
        <div className="pointer-events-none absolute inset-0 hidden sm:flex items-center justify-center px-24">
          <div className="pointer-events-auto">{action}</div>
        </div>
      )}
      <span className={`relative z-[1] ml-auto shrink-0 pl-2 text-xs font-semibold text-old-money-600 ${countClassName || ''}`}>
        {countLabel ?? formatDogCount(count)}
      </span>
    </div>
  )
}

/** Plaque + list in one bordered column shell (rows should use embedded/flat style). */
export function DoninoColumnShell({
  plaque,
  children,
  listRef,
  className = '',
  bodyClassName = 'flex flex-col divide-y divide-old-money-100',
}: {
  plaque: ReactNode
  children: ReactNode
  /** Ref for list-reveal root (stagger only within this column). */
  listRef?: Ref<HTMLDivElement>
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={`cs-glass-card min-w-0 overflow-hidden rounded-2xl bg-white ${className}`}>
      {plaque}
      <div
        ref={listRef}
        className={bodyClassName}
      >
        {children}
      </div>
    </section>
  )
}
