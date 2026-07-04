import { useMemo, useState } from 'react'
import { groupResultsByBreedClass } from '../Events/EventResults/utils'
import ResultScoresEditor from './ResultScoresEditor'

export interface AdminResult {
  id: number
  dog_id: number
  name_lat: string
  name_ru: string
  breed: string
  breed_class: string
  placement: number
  total_score: number
  qualification: string
  vc: string
  status: string
  raw_scores_json?: string | null
}

interface AdminResultsSectionProps {
  results: AdminResult[]
  savingResultId: number | null
  onUpdate: (resultId: number, field: string, value: unknown) => void
  onUpdateRawScores: (resultId: number, rawScoresJson: string) => void
  onDelete: (resultId: number) => void
  onGroupRename: (oldGroupKey: string, newGroupKey: string) => Promise<void>
}

const fieldInput =
  'px-1.5 py-0.5 border border-om-200 rounded text-sm dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100'

export default function AdminResultsSection({
  results,
  savingResultId,
  onUpdate,
  onUpdateRawScores,
  onDelete,
  onGroupRename,
}: AdminResultsSectionProps) {
  const { grouped, sortedGroups } = useMemo(() => groupResultsByBreedClass(results), [results])
  const [groupDrafts, setGroupDrafts] = useState<Record<string, string>>({})
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null)

  const getGroupDraft = (groupKey: string) =>
    groupDrafts[groupKey] !== undefined ? groupDrafts[groupKey] : groupKey

  const applyGroupRename = async (groupKey: string) => {
    const newName = getGroupDraft(groupKey).trim()
    if (!newName || newName === groupKey) return
    setRenamingGroup(groupKey)
    try {
      await onGroupRename(groupKey, newName)
      setGroupDrafts((prev) => {
        const next = { ...prev }
        delete next[groupKey]
        return next
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка переименования')
    } finally {
      setRenamingGroup(null)
    }
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-charcoal-500 dark:text-charcoal-400">
        Нет результатов
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {sortedGroups.map((groupKey) => {
        const groupResults = grouped[groupKey]

        return (
          <section key={groupKey}>
            <div className="mb-3 flex flex-wrap items-end gap-2 border-b border-om-200 dark:border-charcoal-600 pb-2">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] font-medium text-charcoal-500 dark:text-charcoal-400 mb-0.5">
                  Группа
                </label>
                <input
                  type="text"
                  value={getGroupDraft(groupKey)}
                  onChange={(e) =>
                    setGroupDrafts((prev) => ({ ...prev, [groupKey]: e.target.value }))
                  }
                  className="w-full px-2 py-1 border border-om-200 rounded-lg dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100 text-sm font-semibold"
                />
              </div>
              <button
                type="button"
                disabled={renamingGroup === groupKey}
                onClick={() => applyGroupRename(groupKey)}
                className="px-2 py-1 text-xs bg-om-100 dark:bg-charcoal-700 rounded-lg hover:bg-om-200 dark:hover:bg-charcoal-600 disabled:opacity-50"
              >
                {renamingGroup === groupKey ? '…' : 'Переименовать'}
              </button>
            </div>

            <div className="space-y-2">
              {groupResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-lg border border-om-200 dark:border-charcoal-600 bg-cream-50/50 dark:bg-charcoal-900/30 overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-2 py-1.5 border-b border-om-200/80 dark:border-charcoal-600/80">
                    <span className="text-sm font-medium text-charcoal-900 dark:text-charcoal-100 min-w-0">
                      {result.placement ? `${result.placement}. ` : ''}
                      {result.name_lat}
                      {result.name_ru &&
                        result.name_ru.toUpperCase() !== result.name_lat.toUpperCase() && (
                          <span className="font-normal text-charcoal-500"> · {result.name_ru}</span>
                        )}
                      <span className="font-normal text-charcoal-500"> · {result.breed}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(result.id)}
                      className="ml-auto shrink-0 text-xs text-red-600 hover:text-red-700"
                    >
                      Удалить
                    </button>
                  </div>

                  <div className="flex flex-wrap items-end gap-x-3 gap-y-1 px-2 py-1.5">
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
                      <span className="text-[10px] text-charcoal-500">Место</span>
                      <input
                        type="number"
                        value={result.placement || ''}
                        onChange={(e) =>
                          onUpdate(result.id, 'placement', parseInt(e.target.value, 10) || null)
                        }
                        className={`${fieldInput} w-12`}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
                      <span className="text-[10px] text-charcoal-500">Очки</span>
                      <input
                        type="number"
                        value={result.total_score || ''}
                        onChange={(e) =>
                          onUpdate(result.id, 'total_score', parseFloat(e.target.value) || null)
                        }
                        className={`${fieldInput} w-16`}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400 min-w-0 flex-1">
                      <span className="text-[10px] text-charcoal-500 shrink-0">Квал.</span>
                      <input
                        type="text"
                        value={result.qualification || ''}
                        onChange={(e) => onUpdate(result.id, 'qualification', e.target.value)}
                        className={`${fieldInput} w-full max-w-[180px]`}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
                      <span className="text-[10px] text-charcoal-500">Статус</span>
                      <select
                        value={result.status || 'finished'}
                        onChange={(e) => onUpdate(result.id, 'status', e.target.value)}
                        className={`${fieldInput} w-28`}
                      >
                        <option value="finished">Завершено</option>
                        <option value="dns">Не явился</option>
                        <option value="disqualified">Дисквалификация</option>
                        <option value="withdrawn">Снят</option>
                      </select>
                    </label>
                  </div>

                  <div className="px-2 pb-2 border-t border-om-200/60 dark:border-charcoal-600/60">
                    <ResultScoresEditor
                      compact
                      rawScoresJson={result.raw_scores_json}
                      saving={savingResultId === result.id}
                      onSave={(json) => onUpdateRawScores(result.id, json)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
