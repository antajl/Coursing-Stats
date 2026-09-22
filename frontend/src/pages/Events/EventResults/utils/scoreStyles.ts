export function scoreCellClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return ''
  if (score >= 19) return 'bg-camel-50 font-semibold text-camel-800 rounded'
  if (score <= 13) return 'text-old-money-400'
  return ''
}

export function placementAccentClass(placement: number | null | undefined): string {
  if (placement === 1) {
    return 'border-l-[3px] border-l-camel-500 open:border-l-camel-500 shadow-sm shadow-camel-200/50'
  }
  if (placement === 2) {
    return 'border-l-[3px] border-l-old-money-500 open:border-l-old-money-500'
  }
  if (placement === 3) {
    return 'border-l-[3px] border-l-terra-500 open:border-l-terra-500'
  }
  return ''
}
