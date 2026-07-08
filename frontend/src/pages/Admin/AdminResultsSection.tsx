import { useMemo, useState } from 'react'
import ResultScoresEditor from './ResultScoresEditor'

export interface AdminResult {
  id?: number | null
  dog_id?: number | null
  catalog_no?: number | null
  name_lat: string
  name_ru: string
  breed: string
  breed_class: string
  placement: number | null
  total_score: number | null
  qualification: string
  vc: string
  status: string
  raw_scores_json?: string | null
}

interface AdminResultsSectionProps {
  results: AdminResult[]
  originalResults?: AdminResult[]
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
  originalResults,
  savingResultId,
  onUpdate,
  onUpdateRawScores,
  onDelete,
  onGroupRename,
}: AdminResultsSectionProps) {
  const diffSummary = useMemo(() => {
    if (!originalResults || originalResults.length === 0) return null

    const norm = (s: string | null | undefined) =>
      (s || '')
        .toUpperCase()
        .replace(/[Ё]/g, 'Е')
        .replace(/[.,;:()[\]{}"'`]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\s*\/\s*/g, '/')
        .trim()

    const nameVariants = (r: AdminResult) => {
      const base = [r.name_lat, r.name_ru]
      const variants = new Set<string>()

      for (const raw of base) {
        const cleaned = norm(raw)
        if (!cleaned) continue
        variants.add(cleaned)
        for (const part of cleaned.split('/')) {
          const p = norm(part)
          if (p) variants.add(p)
        }
      }

      const joined = norm(base.filter(Boolean).join('/'))
      if (joined) variants.add(joined)

      return [...variants]
    }

    const keysOf = (r: AdminResult) => {
      const keys: string[] = []
      if (r.catalog_no != null) keys.push(`catalog:${r.catalog_no}`)

      const breed = norm(r.breed)
      const breedClass = norm(r.breed_class)
      for (const name of nameVariants(r)) {
        if (breed) keys.push(`breed:${breed}|name:${name}`)
        if (breedClass) keys.push(`class:${breedClass}|name:${name}`)
        keys.push(`name:${name}`)
      }

      return [...new Set(keys)]
    }

    const origMap = new Map<string, number[]>()
    for (let idx = 0; idx < originalResults.length; idx++) {
      for (const key of keysOf(originalResults[idx])) {
        const list = origMap.get(key) || []
        list.push(idx)
        origMap.set(key, list)
      }
    }

    const missingInOriginal: AdminResult[] = []
    const matchedPairs: Array<{ cur: AdminResult; orig: AdminResult }> = []
    const usedOriginalIndexes = new Set<number>()

    for (const cur of results) {
      let matchedIndex: number | null = null

      for (const key of keysOf(cur)) {
        const list = origMap.get(key)
        const candidate = list?.find((idx) => !usedOriginalIndexes.has(idx))
        if (candidate != null) {
          matchedIndex = candidate
          break
        }
      }

      if (matchedIndex == null) {
        missingInOriginal.push(cur)
        continue
      }

      usedOriginalIndexes.add(matchedIndex)
      matchedPairs.push({ cur, orig: originalResults[matchedIndex] })
    }

    const extraInOriginal = originalResults.filter((_, idx) => !usedOriginalIndexes.has(idx))

    let fieldDiffs = 0
    for (const { cur, orig } of matchedPairs) {
      if ((cur.placement ?? null) !== (orig.placement ?? null)) fieldDiffs++
      if ((cur.total_score ?? null) !== (orig.total_score ?? null)) fieldDiffs++
      if ((cur.vc ?? '') !== (orig.vc ?? '')) fieldDiffs++
      if ((cur.qualification ?? '') !== (orig.qualification ?? '')) fieldDiffs++
      if ((cur.status ?? '') !== (orig.status ?? '')) fieldDiffs++
    }

    return {
      currentCount: results.length,
      originalCount: originalResults.length,
      missingInOriginalCount: missingInOriginal.length,
      extraInOriginalCount: extraInOriginal.length,
      matchedCount: matchedPairs.length,
      fieldDiffs,
      missingInOriginalPreview: missingInOriginal.slice(0, 10),
      extraInOriginalPreview: extraInOriginal.slice(0, 10),
    }
  }, [originalResults, results])

  const { grouped, sortedGroups } = useMemo(() => {
    const grouped = results.reduce<Record<string, AdminResult[]>>((acc, result) => {
      const groupKey = result.breed_class || 'Другие'
      if (!acc[groupKey]) acc[groupKey] = []
      acc[groupKey].push(result)
      return acc
    }, {})

    const sortedGroups = Object.keys(grouped).sort((a, b) => {
      if (a === 'Неприбывшие участники') return 1
      if (b === 'Неприбывшие участники') return -1
      return a.localeCompare(b)
    })

    for (const groupKey of sortedGroups) {
      grouped[groupKey].sort((a, b) => (a.placement || 999) - (b.placement || 999))
    }

    return { grouped, sortedGroups }
  }, [results])
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
      {diffSummary && (
        <div className="rounded-lg border border-om-200 bg-white/80 p-3 text-sm text-charcoal-700 dark:border-charcoal-600 dark:bg-charcoal-900/30 dark:text-charcoal-200">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Текущее: <b>{diffSummary.currentCount}</b>
            </span>
            <span>
              Оригинал: <b>{diffSummary.originalCount}</b>
            </span>
            <span>
              Совпало по имени+породе: <b>{diffSummary.matchedCount}</b>
            </span>
            <span>
              Нет в оригинале: <b>{diffSummary.missingInOriginalCount}</b>
            </span>
            <span>
              Лишнее в оригинале: <b>{diffSummary.extraInOriginalCount}</b>
            </span>
            <span>
              Расхождений по полям: <b>{diffSummary.fieldDiffs}</b>
            </span>
          </div>
          {(diffSummary.missingInOriginalCount > 0 || diffSummary.extraInOriginalCount > 0) && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-charcoal-500 dark:text-charcoal-400">
                Показать примеры
              </summary>
              {diffSummary.missingInOriginalPreview.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-red-700 dark:text-red-300">Нет в оригинале (первые 10)</div>
                  <ul className="mt-1 list-disc pl-5 text-xs">
                    {diffSummary.missingInOriginalPreview.map((r, i) => (
                      <li key={`m-${i}`}>
                        {r.name_lat} · {r.breed}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {diffSummary.extraInOriginalPreview.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Лишнее в оригинале (первые 10)</div>
                  <ul className="mt-1 list-disc pl-5 text-xs">
                    {diffSummary.extraInOriginalPreview.map((r, i) => (
                      <li key={`e-${i}`}>
                        {r.name_lat} · {r.breed}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </details>
          )}
        </div>
      )}
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
              {groupResults.map((result, idx) => (
                <div
                  key={result.id || `orig-${idx}`}
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
                    {result.id && (
                      <button
                        type="button"
                        onClick={() => onDelete(result.id)}
                        className="ml-auto shrink-0 text-xs text-red-600 hover:text-red-700"
                      >
                        Удалить
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap items-end gap-x-3 gap-y-1 px-2 py-1.5">
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
                      <span className="text-[10px] text-charcoal-500">Место</span>
                      <input
                        type="number"
                        value={result.placement || ''}
                        disabled={!result.id}
                        onChange={(e) =>
                          result.id && onUpdate(result.id, 'placement', parseInt(e.target.value, 10) || null)
                        }
                        className={`${fieldInput} w-12 ${!result.id ? 'bg-gray-100 dark:bg-charcoal-700' : ''}`}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
                      <span className="text-[10px] text-charcoal-500">Очки</span>
                      <input
                        type="number"
                        value={result.total_score || ''}
                        disabled={!result.id}
                        onChange={(e) =>
                          result.id && onUpdate(result.id, 'total_score', parseFloat(e.target.value) || null)
                        }
                        className={`${fieldInput} w-16 ${!result.id ? 'bg-gray-100 dark:bg-charcoal-700' : ''}`}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400 min-w-0 flex-1">
                      <span className="text-[10px] text-charcoal-500 shrink-0">Квал.</span>
                      <input
                        type="text"
                        value={result.qualification || ''}
                        disabled={!result.id}
                        onChange={(e) => result.id && onUpdate(result.id, 'qualification', e.target.value)}
                        className={`${fieldInput} w-full max-w-[180px] ${!result.id ? 'bg-gray-100 dark:bg-charcoal-700' : ''}`}
                      />
                    </label>
                    <label className="flex items-center gap-1 text-xs text-charcoal-600 dark:text-charcoal-400">
                      <span className="text-[10px] text-charcoal-500">Статус</span>
                      <select
                        value={result.status || 'finished'}
                        disabled={!result.id}
                        onChange={(e) => result.id && onUpdate(result.id, 'status', e.target.value)}
                        className={`${fieldInput} w-28 ${!result.id ? 'bg-gray-100 dark:bg-charcoal-700' : ''}`}
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
                      onSave={(json) => result.id && onUpdateRawScores(result.id, json)}
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
