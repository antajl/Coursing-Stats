export type DogTitle = {
  title: string
  count: number
}

export function formatTitleLine({ title, count }: DogTitle): string {
  return count > 1 ? `${title} X${count}` : title
}

export function titleBadgeClass(title: string): string {
  const titleLower = title.toLowerCase()
  const isChampion = titleLower.includes('чемпион') || titleLower.includes('champion')
  const isCACL = titleLower.includes('cacl')
  const isReg = titleLower.includes('reg')

  if (isChampion) {
    return 'border border-camel-300 dark:border-camel-600 bg-camel-100 dark:bg-camel-900 text-camel-800 dark:text-camel-300'
  }
  if (isReg && isCACL) {
    return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
  }
  if (isCACL) {
    return 'bg-old-money-100 dark:bg-charcoal-700 text-old-money-700 dark:text-old-money-300 border border-old-money-300 dark:border-charcoal-600'
  }
  return 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
}
