export function scoreCellClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return ''
  if (score >= 19) return 'bg-camel-50 dark:bg-camel-900/35 font-semibold text-camel-800 dark:text-camel-300 rounded'
  if (score <= 13) return 'text-old-money-400 dark:text-old-money-500'
  return ''
}

export function placementAccentClass(placement: number | null | undefined): string {
  if (placement === 1) {
    return 'border-l-[3px] border-l-camel-500 open:border-l-camel-500 dark:border-l-camel-400 dark:open:border-l-camel-400 shadow-sm shadow-camel-200/50 dark:shadow-none'
  }
  if (placement === 2) {
    return 'border-l-[3px] border-l-old-money-500 open:border-l-old-money-500 dark:border-l-charcoal-300 dark:open:border-l-charcoal-300'
  }
  if (placement === 3) {
    return 'border-l-[3px] border-l-terra-500 open:border-l-terra-500 dark:border-l-terra-400 dark:open:border-l-terra-400'
  }
  return ''
}
