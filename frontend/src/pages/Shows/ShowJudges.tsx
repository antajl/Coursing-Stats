import { useState, useEffect, useMemo } from 'react'
import SkeletonLoader from '../../components/SkeletonLoader'
import RKFAttribution from '../../components/RKFAttribution'
import PageToolbar from '../../components/toolbar/PageToolbar'
import ToolbarSearch from '../../components/toolbar/ToolbarSearch'
import { getShowJudges, type ShowJudge } from '../../lib/staticData'
import type { ActiveFilterChip } from '../../components/toolbar/ToolbarActiveFilters'

export default function ShowJudges() {
  const [loading, setLoading] = useState(true)
  const [judges, setJudges] = useState<ShowJudge[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const result = await getShowJudges()
      if (result.success && result.data) {
        setJudges(result.data)
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredJudges = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return judges
    return judges.filter(
      (judge) =>
        judge.name.toLowerCase().includes(q) ||
        judge.breeds.some((b) => b.toLowerCase().includes(q)),
    )
  }, [judges, searchQuery])

  const handleResetFilters = () => {
    setSearchQuery('')
  }

  const activeFilterChips: ActiveFilterChip[] = []

  if (loading) {
    return (
      <div className="max-w-full mx-auto pb-2 sm:pb-4">
        <SkeletonLoader variant="card" count={3} />
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-4 pb-2 sm:pb-4">
      <PageToolbar
        bare
        trailing={<RKFAttribution />}
        activeFilterChips={activeFilterChips}
        onClearAllFilters={searchQuery ? handleResetFilters : undefined}
        filters={
          <ToolbarSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Судья, порода…"
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
                  key={judge.name}
                  className="border-b border-cream-200 dark:border-charcoal-700 hover:bg-old-money-50 dark:hover:bg-charcoal-700 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-charcoal-900 dark:text-charcoal-100 font-semibold">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal-900 dark:text-charcoal-100">
                    {judge.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-center tabular-nums text-charcoal-900 dark:text-charcoal-100">
                    {judge.total_judged}
                  </td>
                  <td className="px-4 py-3 text-sm text-charcoal-700 dark:text-charcoal-300">
                    {judge.breeds.length > 0 ? (
                      <span title={judge.breeds.join(', ')}>
                        {judge.breeds.length <= 4
                          ? judge.breeds.join(', ')
                          : `${judge.breeds.slice(0, 3).join(', ')} +${judge.breeds.length - 3}`}
                      </span>
                    ) : (
                      <span className="text-charcoal-400 dark:text-charcoal-500">—</span>
                    )}
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
