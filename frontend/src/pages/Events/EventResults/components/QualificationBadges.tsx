interface QualificationBadgesProps {
  qualification: string
}

export default function QualificationBadges({ qualification }: QualificationBadgesProps) {
  return (
    <div className="flex gap-1 mt-1 flex-wrap">
      {qualification.split(',').map((title, i) => {
        const titleLower = title.trim().toLowerCase()
        const isChampion = titleLower.includes('чемпион') || titleLower.includes('champion')
        const isCACL = titleLower.includes('cacl')
        const isReg = titleLower.includes('reg')
        return (
          <span key={i} className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${
            isChampion ? 'border border-camel-300 dark:border-camel-600 bg-camel-100 dark:bg-camel-900 text-camel-800 dark:text-camel-300' :
            isCACL ? 'bg-old-money-100 dark:bg-charcoal-700 text-old-money-700 dark:text-old-money-300 border border-old-money-300 dark:border-charcoal-600' :
            isReg ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500' :
            'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600'
          }`}>
            {title.trim()}
          </span>
        )
      })}
    </div>
  )
}
