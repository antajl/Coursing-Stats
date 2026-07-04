import { useCallback, useEffect, useRef, useState } from 'react'
import type { Heat, RawScores } from '../Events/EventResults/types'
import { parseRawScores } from '../Events/EventResults/utils'

const SCORE_LABELS = ['М', 'Р', 'В', 'П', 'Э'] as const
const MAX_HEATS = 6
const AUTOSAVE_MS = 500

const BIB_COLOR_OPTIONS = [
  { value: '', label: '—' },
  { value: 'red', label: 'Красный' },
  { value: 'white', label: 'Белый' },
  { value: 'blue', label: 'Синий' },
  { value: 'black', label: 'Чёрный' },
  { value: 'green', label: 'Зелёный' },
  { value: 'yellow', label: 'Жёлтый' },
]

function emptyHeat(index: number): Heat {
  return {
    heat_number: index,
    bib_number: index,
    bib_color: '',
    judges: [{ scores: [null, null, null, null, null], sum: null }],
    total: null,
    disqualified: false,
  }
}

function normalizeHeat(heat: Heat, index: number): Heat {
  const judges = heat.judges?.length
    ? heat.judges.map((j) => ({
        ...j,
        scores: [
          j.scores?.[0] ?? null,
          j.scores?.[1] ?? null,
          j.scores?.[2] ?? null,
          j.scores?.[3] ?? null,
          j.scores?.[4] ?? null,
        ],
      }))
    : [{ scores: [null, null, null, null, null], sum: null }]

  return {
    ...heat,
    heat_number: heat.heat_number ?? index,
    bib_number: heat.bib_number ?? index,
    bib_color: heat.bib_color ?? '',
    judges,
  }
}

function parseDraft(rawScoresJson: string | null | undefined): RawScores {
  const parsed = parseRawScores(rawScoresJson)
  if (parsed?.heats?.length) {
    return {
      ...parsed,
      heats: parsed.heats.map((h, i) => normalizeHeat(h, i + 1)),
    }
  }
  return { heats: [emptyHeat(1), emptyHeat(2)] }
}

function toPayloadJson(draft: RawScores): string {
  const heats = draft.heats || []
  const payload: RawScores = {
    heats: heats.map((h, i) => normalizeHeat(h, i + 1)),
    grand_total: draft.grand_total ?? null,
  }
  return JSON.stringify(payload)
}

interface ResultScoresEditorProps {
  rawScoresJson: string | null | undefined
  saving?: boolean
  compact?: boolean
  onSave: (rawScoresJson: string) => void | Promise<void>
}

const fieldInput =
  'px-1.5 py-0.5 border border-om-200 rounded dark:bg-charcoal-800 dark:border-charcoal-600 dark:text-charcoal-100 text-sm'

const scoreInput =
  `${fieldInput} w-11 min-w-[2.75rem] text-center tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`

const iconBtn =
  'shrink-0 w-6 h-6 flex items-center justify-center rounded border border-om-200 dark:border-charcoal-600 text-sm leading-none hover:bg-om-100 dark:hover:bg-charcoal-700 disabled:opacity-40 disabled:pointer-events-none'

export default function ResultScoresEditor({
  rawScoresJson,
  saving,
  compact,
  onSave,
}: ResultScoresEditorProps) {
  const [draft, setDraft] = useState<RawScores>(() => parseDraft(rawScoresJson))
  const [dirty, setDirty] = useState(false)
  const [savedOk, setSavedOk] = useState(false)
  const draftRef = useRef(draft)
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  draftRef.current = draft

  useEffect(() => {
    setDraft(parseDraft(rawScoresJson))
    setDirty(false)
    setSavedOk(false)
  }, [rawScoresJson])

  useEffect(() => {
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
      if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current)
    }
  }, [])

  const commitSave = useCallback(
    async (nextDraft?: RawScores) => {
      const payload = toPayloadJson(nextDraft ?? draftRef.current)
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current)
        autosaveTimer.current = null
      }
      try {
        await onSave(payload)
        setDirty(false)
        setSavedOk(true)
        if (savedFlashTimer.current) clearTimeout(savedFlashTimer.current)
        savedFlashTimer.current = setTimeout(() => setSavedOk(false), 2000)
      } catch {
        setDirty(true)
        setSavedOk(false)
      }
    },
    [onSave]
  )

  const scheduleSave = useCallback(
    (nextDraft: RawScores) => {
      setDraft(nextDraft)
      setDirty(true)
      setSavedOk(false)
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
      autosaveTimer.current = setTimeout(() => {
        void commitSave(nextDraft)
      }, AUTOSAVE_MS)
    },
    [commitSave]
  )

  const heats = draft.heats || []

  const addHeat = () => {
    if (heats.length >= MAX_HEATS) return
    const next: RawScores = { ...draft, heats: [...heats, emptyHeat(heats.length + 1)] }
    setDraft(next)
    void commitSave(next)
  }

  const removeHeat = (heatIdx: number) => {
    const next: RawScores = { ...draft, heats: heats.filter((_, i) => i !== heatIdx) }
    setDraft(next)
    void commitSave(next)
  }

  const updateHeat = (heatIdx: number, patch: Partial<Heat>) => {
    const nextHeats = heats.map((h, i) => (i === heatIdx ? { ...h, ...patch } : h))
    scheduleSave({ ...draft, heats: nextHeats })
  }

  const updateScore = (heatIdx: number, judgeIdx: number, scoreIdx: number, value: string) => {
    const next = [...heats]
    const heat = { ...next[heatIdx] }
    const judges = [...(heat.judges || [{ scores: [null, null, null, null, null] }])]
    const judge = { ...judges[judgeIdx] }
    const scores = [...(judge.scores || [null, null, null, null, null])]
    scores[scoreIdx] = value === '' ? null : Number(value)
    judge.scores = scores
    judges[judgeIdx] = judge
    heat.judges = judges
    next[heatIdx] = heat
    scheduleSave({ ...draft, heats: next })
  }

  const wrapperClass = compact
    ? 'pt-1.5 space-y-2'
    : 'mt-3 rounded-lg border border-om-200 dark:border-charcoal-600 bg-cream-50 dark:bg-charcoal-900/40 p-4 space-y-4'

  return (
    <div className={wrapperClass}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide">
          Забеги
        </span>
        {saving && (
          <span className="text-[10px] text-charcoal-400">сохранение…</span>
        )}
        {!saving && savedOk && (
          <span className="text-[10px] text-forest-600 dark:text-forest-400">сохранено</span>
        )}
        {!saving && dirty && !savedOk && (
          <span className="text-[10px] text-amber-600 dark:text-amber-400">есть изменения</span>
        )}
      </div>

      <div className={compact ? 'space-y-1.5' : 'space-y-3'}>
        {heats.map((heat, heatIdx) => (
          <div
            key={heatIdx}
            className={
              compact
                ? 'rounded border border-om-200/80 dark:border-charcoal-600/80 bg-white/80 dark:bg-charcoal-800/80 px-2 py-1.5'
                : 'rounded-lg border border-om-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 p-3 space-y-3'
            }
          >
            <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-xs font-semibold text-charcoal-700 dark:text-charcoal-200 shrink-0">
                {heatIdx + 1}
              </span>
              <label className="flex items-center gap-1 text-[10px] text-charcoal-500">
                №
                <input
                  type="text"
                  value={heat.bib_number ?? ''}
                  onChange={(e) => updateHeat(heatIdx, { bib_number: e.target.value })}
                  className={`${fieldInput} w-10`}
                />
              </label>
              <label className="flex items-center gap-1 text-[10px] text-charcoal-500">
                Попона
                <select
                  value={heat.bib_color ?? ''}
                  onChange={(e) => updateHeat(heatIdx, { bib_color: e.target.value })}
                  className={`${fieldInput} w-24`}
                >
                  {BIB_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value || 'none'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              {(heat.judges || []).map((judge, judgeIdx) => (
                <div key={judgeIdx} className="flex items-end gap-0.5">
                  {judgeIdx > 0 && (
                    <span className="text-[10px] text-charcoal-400 mr-1">С{judgeIdx + 1}</span>
                  )}
                  {SCORE_LABELS.map((label, scoreIdx) => (
                    <label key={label} className="flex flex-col items-center">
                      <span className="text-[9px] text-charcoal-400 leading-none mb-0.5">{label}</span>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={judge.scores?.[scoreIdx] ?? ''}
                        onChange={(e) => updateScore(heatIdx, judgeIdx, scoreIdx, e.target.value)}
                        className={scoreInput}
                      />
                    </label>
                  ))}
                </div>
              ))}

              <div className="flex items-center gap-1 ml-auto shrink-0">
                <button
                  type="button"
                  onClick={() => removeHeat(heatIdx)}
                  className={iconBtn}
                  title="Удалить забег"
                  aria-label="Удалить забег"
                >
                  −
                </button>
                {heatIdx === heats.length - 1 && (
                  <button
                    type="button"
                    onClick={addHeat}
                    disabled={heats.length >= MAX_HEATS}
                    className={iconBtn}
                    title="Добавить забег"
                    aria-label="Добавить забег"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {heats.length === 0 && (
          <button
            type="button"
            onClick={addHeat}
            className={`${iconBtn} w-auto px-2`}
            title="Добавить забег"
          >
            + забег
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <button
          type="button"
          disabled={saving || !dirty}
          onClick={() => void commitSave()}
          className="px-3 py-1 bg-camel-600 text-white rounded hover:bg-camel-700 text-xs disabled:opacity-40"
        >
          {saving ? 'Сохранение…' : 'Сохранить забеги'}
        </button>
        <span className="text-[10px] text-charcoal-400">
          +/− сохраняют сразу; оценки — через {AUTOSAVE_MS / 1000} с
        </span>
      </div>
    </div>
  )
}
