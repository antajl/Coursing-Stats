import React from 'react'
import { MoreVertical, X } from 'lucide-react'
import type { ActiveRunMenuState, CoursingScores, DogParticipant, RunStatus } from '../types'
import { COURSING_CRITERIA_META, calculateRoundSum, createRunData } from '../types'

interface CoursingRunBoxProps {
  catId: string
  dog: DogParticipant
  rIdx: number
  runsCount: 1 | 2 | 3
  activeRunMenu: ActiveRunMenuState | null
  setActiveRunMenu: (state: ActiveRunMenuState | null) => void
  updateRunField: (catId: string, dogId: string, rIdx: number, field: 'heat' | 'blanket', value: string) => void
  cycleBlanket: (catId: string, dogId: string, rIdx: number) => void
  updateRunScore: (catId: string, dogId: string, rIdx: number, criterion: keyof CoursingScores, value: string) => void
  setRunStatus: (catId: string, dogId: string, rIdx: number, status: RunStatus, reason?: string) => void
  updateRunReason: (catId: string, dogId: string, rIdx: number, reason: string) => void
}

export const CoursingRunBox: React.FC<CoursingRunBoxProps> = ({
  catId,
  dog,
  rIdx,
  runsCount,
  activeRunMenu,
  setActiveRunMenu,
  updateRunField,
  cycleBlanket,
  updateRunScore,
  setRunStatus,
  updateRunReason,
}) => {
  const run = dog.runs[rIdx] || createRunData()
  const sum = calculateRoundSum(run.scores)
  const blanketColor = run.blanket || 'red'
  const blanketTitle = blanketColor === 'red' ? 'Красная' : blanketColor === 'blue' ? 'Синяя' : 'Белая'
  const blanketBg =
    blanketColor === 'red'
      ? 'bg-rose-50 border-rose-300 text-rose-950'
      : blanketColor === 'blue'
      ? 'bg-sky-50 border-sky-300 text-sky-950'
      : 'bg-white border-om-300 text-charcoal-900'

  const isWithdrawn = run.status === 'withdrawn'
  const isAbsent = run.status === 'absent'
  const desktopCellWidth = runsCount === 3 ? 'xl:w-8' : 'xl:w-9'

  return (
    <div className="rounded-xl border border-om-200 bg-cream-50 p-2 xl:px-2 xl:py-1.5 space-y-2 xl:space-y-0 xl:flex xl:items-center xl:gap-1.5 shrink-0">
      {/* Шапка забега: попона, № забега, сумма (на мобильных), меню статуса */}
      <div className="flex items-center justify-between gap-1.5 xl:justify-start">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-semibold text-charcoal-600 xl:hidden">
            {rIdx + 1}-й забег
          </span>

          {!isAbsent && (
            <div
              className={`flex items-center rounded-lg border px-1 py-0.5 gap-1 ${blanketBg}`}
              title={`Забег ${rIdx + 1}. Попона: ${blanketTitle}. Нажмите кружок для смены цвета`}
            >
              <button
                type="button"
                onClick={() => cycleBlanket(catId, dog.id, rIdx)}
                className="relative w-7 h-7 xl:w-6 xl:h-6 flex items-center justify-center rounded-md cursor-pointer transition-transform active:scale-90 before:absolute before:-inset-2 xl:before:hidden"
                aria-label={`Сменить цвет попоны (${blanketTitle})`}
                title={`Попона: ${blanketTitle}. Нажмите для смены`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full ring-1 ring-charcoal-400/70 block"
                  style={{
                    backgroundColor:
                      blanketColor === 'red' ? '#e11d48' : blanketColor === 'blue' ? '#0284c7' : '#ffffff',
                  }}
                />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={run.heat}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                  updateRunField(catId, dog.id, rIdx, 'heat', val)
                }}
                maxLength={3}
                className="w-9 xl:w-7 min-h-[34px] xl:min-h-[28px] text-center bg-transparent font-bold text-xs focus:outline-none tabular-nums"
                placeholder="№"
                aria-label={`Номер ${rIdx + 1}-го забега`}
                title={`Номер забега (${blanketTitle} попона)`}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 xl:hidden">
          {!isWithdrawn && !isAbsent && (
            <span className="text-xs font-bold text-camel-800 bg-camel-100/80 border border-camel-200 px-2 py-1 rounded-md tabular-nums">
              {sum} б.
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (activeRunMenu && activeRunMenu.dogId === dog.id && activeRunMenu.rIdx === rIdx) {
                setActiveRunMenu(null)
              } else {
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveRunMenu({
                  catId,
                  dogId: dog.id,
                  rIdx,
                  rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
                })
              }
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 hover:bg-om-200/70 rounded-lg cursor-pointer"
            aria-label="Статус забега"
            title="Статус забега (баллы, дисквалификация, неявка)"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Тело забега: Неявка / Дискв. / 5 критериев М Р В П Э */}
      {isAbsent ? (
        <div className="flex items-center justify-between gap-2 bg-om-100/80 border border-om-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-[140px]">
          <span className="text-xs font-semibold text-charcoal-700">Неявка</span>
          <button
            type="button"
            onClick={() => setRunStatus(catId, dog.id, rIdx, 'normal')}
            className="min-w-[36px] min-h-[36px] xl:min-w-[28px] xl:min-h-[28px] relative flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 rounded-md hover:bg-om-200/60 cursor-pointer before:absolute before:-inset-1.5 xl:before:hidden"
            aria-label="Вернуть ввод оценок"
            title="Вернуть ввод оценок"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isWithdrawn ? (
        <div className="flex items-center gap-1.5 bg-terracotta-50/70 border border-terracotta-200 rounded-lg px-2 py-1 flex-1 min-w-[160px]">
          <span className="text-[11px] font-semibold text-terracotta-800 shrink-0">Дискв.:</span>
          <input
            type="text"
            value={run.reason || ''}
            onChange={(e) => updateRunReason(catId, dog.id, rIdx, e.target.value)}
            className="w-full min-h-[36px] xl:min-h-[28px] px-1.5 bg-white border border-om-200 rounded text-xs text-charcoal-900 focus:outline-none focus:ring-1 focus:ring-camel-500"
            placeholder="Причина..."
            aria-label="Причина дисквалификации"
          />
          <button
            type="button"
            onClick={() => setRunStatus(catId, dog.id, rIdx, 'normal')}
            className="min-w-[36px] min-h-[36px] xl:min-w-[28px] xl:min-h-[28px] relative flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 shrink-0 rounded hover:bg-om-200/60 cursor-pointer before:absolute before:-inset-1.5 xl:before:hidden"
            aria-label="Вернуть ввод оценок"
            title="Вернуть ввод оценок"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-1.5 xl:flex xl:items-end xl:gap-1 shrink-0">
          {COURSING_CRITERIA_META.map((c) => (
            <label key={c.key} className="flex flex-col items-center gap-0.5 min-w-0">
              <span
                className="text-[10px] font-bold text-charcoal-600 leading-none select-none cursor-help"
                title={`${c.label} (0–20)`}
              >
                {c.short}
              </span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={run.scores[c.key]}
                onChange={(e) => updateRunScore(catId, dog.id, rIdx, c.key, e.target.value)}
                className={`w-full ${desktopCellWidth} min-h-[44px] xl:min-h-[32px] xl:h-8 text-center px-0.5 bg-white border border-om-300/90 rounded-lg xl:rounded font-bold text-charcoal-900 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-camel-500/50 focus:border-camel-600`}
                placeholder="0"
                aria-label={`${c.label} (${rIdx + 1}-й забег)`}
                title={`${c.label} (0–20)`}
              />
            </label>
          ))}
        </div>
      )}

      {/* Сумма и кнопка статуса для широкого десктопа */}
      <div className="hidden xl:flex items-center gap-1 shrink-0 pl-0.5">
        {!isWithdrawn && !isAbsent && (
          <span
            className="text-xs font-bold text-camel-800 text-center w-8 tabular-nums"
            title={`Сумма баллов за ${rIdx + 1}-й забег`}
          >
            {sum}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (activeRunMenu && activeRunMenu.dogId === dog.id && activeRunMenu.rIdx === rIdx) {
              setActiveRunMenu(null)
            } else {
              const rect = e.currentTarget.getBoundingClientRect()
              setActiveRunMenu({
                catId,
                dogId: dog.id,
                rIdx,
                rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
              })
            }
          }}
          className="w-7 h-8 flex items-center justify-center text-charcoal-600 hover:text-charcoal-900 hover:bg-om-200/70 rounded-md transition-colors cursor-pointer"
          aria-label="Статус забега"
          title="Статус забега (баллы, дисквалификация, неявка)"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
