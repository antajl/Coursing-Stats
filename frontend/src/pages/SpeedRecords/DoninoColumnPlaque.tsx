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
}

export default function DoninoColumnPlaque({ title, count }: DoninoColumnPlaqueProps) {
  return (
    <div className="donino-column-plaque mb-3 flex items-center justify-between gap-3 rounded-xl border border-old-money-200 bg-cream-100/90 px-3.5 py-2.5 dark:border-charcoal-600 dark:bg-charcoal-800/90">
      <h2 className="font-mono text-[11px] font-bold uppercase tracking-widest text-camel-700 dark:text-camel-400">
        {title}
      </h2>
      <span className="shrink-0 text-xs font-semibold text-old-money-600 dark:text-old-money-400">
        {formatDogCount(count)}
      </span>
    </div>
  )
}
