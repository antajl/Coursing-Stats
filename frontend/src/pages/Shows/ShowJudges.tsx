import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SkeletonLoader from '../../components/SkeletonLoader'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { getShowJudges } from '../../lib/staticData'
import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'

interface ShowJudge {
  name: string
  total_judged: number
  breeds: string[]
}

export default function ShowJudges() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [judges, setJudges] = useState<ShowJudge[]>([])
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '')
  const [filterYear, setFilterYear] = useState(() => searchParams.get('year') || '2026')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getShowJudges()
      if (result.success && result.data) {
        // Convert string array to ShowJudge format
        const judgesData = result.data.map(name => ({
          name,
          total_judged: 0,
          breeds: []
        }))
        setJudges(judgesData)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredJudges = judges.filter(judge => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return judge.name.toLowerCase().includes(query)
    }
    return true
  })

  const handleResetFilters = () => {
    setSearchQuery('')
    setFilterYear('2026')
  }

  const activeFilterChips: ActiveFilterChip[] = searchQuery
    ? [{ key: 'search', label: `Поиск: ${searchQuery}`, onRemove: () => setSearchQuery('') }]
    : []

  if (loading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <SkeletonLoader variant="card" count={3} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto pb-2 sm:pb-4">
      <PageToolbar
        bare
        activeFilterChips={activeFilterChips}
        onClearAllFilters={searchQuery ? handleResetFilters : undefined}
        filters={
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Судья…"
            className="!w-auto min-w-[200px] flex-1 max-w-lg"
          />
        }
      />

      {judges.length === 0 ? (
        <div className="text-center py-12 bg-cream-50 dark:bg-charcoal-800 rounded-xl">
          <p className="text-charcoal-700 dark:text-charcoal-300">
            Данные пока не загружены. Скрапинг lc.rkfshow.ru требует дополнительной настройки.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-old-money-100 dark:bg-charcoal-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
                  Судья
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
                  Выставок
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
                  Породы
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredJudges.map((judge, index) => (
                <tr
                  key={index}
                  className="border-b border-cream-200 dark:border-charcoal-700 hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-charcoal-900 dark:text-charcoal-100 font-semibold">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal-900 dark:text-charcoal-100">
                    {judge.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-charcoal-900 dark:text-charcoal-100">
                    {judge.total_judged}
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                    {judge.breeds.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
