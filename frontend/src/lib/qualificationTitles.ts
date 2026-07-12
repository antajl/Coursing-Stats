export type DogTitle = {
  title: string
  count: number
}

export function formatTitleLine({ title, count }: DogTitle): string {
  return count > 1 ? `${title} X${count}` : title
}

export function parseQualificationTitles(qualification: string | null | undefined): string[] {
  if (!qualification?.trim()) return []
  return qualification
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function titleBadgeClass(title: string): string {
  const titleLower = title.toLowerCase()
  const upper = title.toUpperCase()
  const isChampion = titleLower.includes('чемпион') || titleLower.includes('champion')
  const isCACL = titleLower.includes('cacl')
  const isReg = titleLower.includes('reg')

  if (upper === 'BIS') {
    return 'border-2 border-camel-400 dark:border-camel-500 bg-camel-100 dark:bg-camel-900/40 text-camel-900 dark:text-camel-100'
  }
  if (upper === 'BOB') {
    return 'border border-camel-300 dark:border-camel-600 bg-camel-50 dark:bg-camel-950/30 text-camel-800 dark:text-camel-200'
  }
  if (upper === 'CACIB') {
    return 'border border-old-money-400 dark:border-charcoal-500 bg-old-money-100 dark:bg-charcoal-700 text-old-money-900 dark:text-old-money-100'
  }
  if (upper === 'CAC') {
    return 'border border-old-money-300 dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-200'
  }

  if (isChampion) {
    return 'border border-camel-300 dark:border-camel-600 bg-camel-100 dark:bg-camel-700/40 text-camel-800 dark:text-camel-200'
  }
  if (isCACL && !isReg) {
    return 'border border-old-money-300 dark:border-charcoal-500 bg-old-money-100 dark:bg-charcoal-700 text-old-money-800 dark:text-old-money-200'
  }
  if (isReg) {
    return 'border border-old-money-200 dark:border-charcoal-600 bg-cream-100 dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300'
  }
  return 'border border-old-money-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-800 text-charcoal-500 dark:text-charcoal-400'
}
