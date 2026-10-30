import React from 'react'
import { ChevronDown, MoreVertical, Trash2 } from 'lucide-react'
import type {
  DogParticipant,
  CategoryGroup,
  CompetitionKind,
  CoursingScores,
  RunStatus,
  ActiveRunMenuState,
  ActiveSearchDogState,
  ActiveAwardsMenuState,
  ActiveDogSexMenuState
} from './types'
import {
  createRunData,
  calculateRoundSum,
  getDogOverallStatus
} from './types'

interface ProtocolParticipantRowProps {
  dog: DogParticipant
  category: CategoryGroup
  kind: CompetitionKind
  updateDog: (categoryId: string, dogId: string, updates: Partial<DogParticipant>) => void
  removeDogFromCategory: (categoryId: string, dogId: string) => void
  updateRunField: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    field: 'heat' | 'blanket',
    value: string
  ) => void
  cycleBlanket: (categoryId: string, dogId: string, runIndex: number) => void
  updateRunScore: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    criterion: keyof CoursingScores,
    value: string
  ) => void
  setRunStatus: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    status: RunStatus,
    reason?: string
  ) => void
  updateRunReason: (
    categoryId: string,
    dogId: string,
    runIndex: number,
    reason: string
  ) => void
  activeAwardsMenu: ActiveAwardsMenuState | null
  setActiveAwardsMenu: (state: ActiveAwardsMenuState | null) => void
  activeSearchDog: ActiveSearchDogState | null
  setActiveSearchDog: (state: ActiveSearchDogState | null) => void
  setSearchQuery: (query: string) => void
  activeRunMenu: ActiveRunMenuState | null
  setActiveRunMenu: (state: ActiveRunMenuState | null) => void
  setActiveDogSexMenu: (state: ActiveDogSexMenuState | null) => void
}

const COURSING_CRITERIA: Array<keyof CoursingScores> = [
  'speed',
  'enthusiasm',
  'intelligence',
  'agility',
  'endurance'
]

export const ProtocolParticipantRow: React.FC<ProtocolParticipantRowProps> = ({
  dog,
  category,
  kind,
  updateDog,
  removeDogFromCategory,
  updateRunField,
  cycleBlanket,
  updateRunScore,
  setRunStatus,
  updateRunReason,
  activeAwardsMenu,
  setActiveAwardsMenu,
  activeSearchDog,
  setActiveSearchDog,
  setSearchQuery,
  activeRunMenu,
  setActiveRunMenu,
  setActiveDogSexMenu
}) => {
  const isDogAbsent = (dog.runs || []).slice(0, category.runsCount).some(r => r?.status === 'absent')
  const isDogActive =
    activeAwardsMenu?.dogId === dog.id ||
    activeSearchDog?.dogId === dog.id ||
    activeRunMenu?.dogId === dog.id

  const runSlotWidth = category.runsCount === 3 ? 236 : category.runsCount === 1 ? 300 : 264

  return (
    <div
      className={`bg-om-50/70 hover:bg-cream-50 rounded-lg border border-om-200/70 p-2 transition-all shadow-2xs min-w-max ${
        isDogActive ? 'relative z-30' : 'relative z-0'
      }`}
    >
      <div className="flex items-center gap-3 text-xs min-w-max">
        {/* Номер по каталогу, кличка собаки с автокомплитом и пол */}
        <div className="relative flex items-center gap-1.5 shrink-0">
          <input
            type="text"
            value={dog.catalogNumber}
            onChange={e => updateDog(category.id, dog.id, { catalogNumber: e.target.value })}
            className="w-9 px-1 py-1 text-center font-bold bg-cream-50 rounded border border-om-200 text-xs text-char-900 shrink-0"
            placeholder="№"
            title="Номер по каталогу"
          />

          <div className="relative w-56 sm:w-60 md:w-64 lg:w-72 shrink-0">
            <input
              type="text"
              value={dog.dogName}
              onChange={e => {
                updateDog(category.id, dog.id, { dogName: e.target.value })
                setSearchQuery(e.target.value)
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveSearchDog({
                  catId: category.id,
                  dogId: dog.id,
                  rect: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width }
                })
              }}
              onFocus={e => {
                setSearchQuery(dog.dogName)
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveSearchDog({
                  catId: category.id,
                  dogId: dog.id,
                  rect: { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width }
                })
              }}
              className="w-full px-2 py-1 bg-cream-50 rounded border border-om-200 text-xs font-semibold text-char-900 focus:ring-1 focus:ring-camel-500 focus:outline-none"
              placeholder="Кличка собаки"
            />
          </div>

          <button
            type="button"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              setActiveDogSexMenu({
                catId: category.id,
                dogId: dog.id,
                rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right, width: rect.width }
              })
            }}
            className="w-[92px] px-2 py-1 bg-cream-50 hover:bg-cream-100 rounded border border-om-200 text-xs text-char-800 shrink-0 font-medium flex items-center justify-between transition-colors cursor-pointer"
            title="Пол собаки"
          >
            <span className="truncate">{dog.sex === 'male' ? 'Кобель' : 'Сука'}</span>
            <ChevronDown className="w-3 h-3 text-char-400 shrink-0" />
          </button>
        </div>

        {/* Блок баллов забегов (курсинг) или времени (рейсинг) */}
        {kind === 'coursing' ? (
          <div className="flex items-center gap-1.5 shrink-0">
            {Array.from({ length: category.runsCount }).map((_, rIdx) => {
              if (isDogAbsent && rIdx > 0) {
                return <div key={rIdx} style={{ width: runSlotWidth }} className="shrink-0" />
              }

              const prevCancelled = (dog.runs || []).slice(0, rIdx).some(pr => pr?.status === 'withdrawn')
              if (prevCancelled) {
                return <div key={rIdx} style={{ width: runSlotWidth }} className="shrink-0" />
              }

              const run = dog.runs[rIdx] || createRunData()
              const sum = calculateRoundSum(run.scores)
              const blanketColor = run.blanket || 'red'
              const blanketTitle = blanketColor === 'red' ? 'Красная' : blanketColor === 'blue' ? 'Синяя' : 'Белая'
              const blanketBg = blanketColor === 'red'
                ? 'bg-rose-50 border-rose-300 text-rose-950 focus-within:ring-rose-400'
                : blanketColor === 'blue'
                ? 'bg-sky-50 border-sky-300 text-sky-950 focus-within:ring-sky-400'
                : 'bg-white border-om-300 text-char-900 focus-within:ring-camel-400'

              const isWithdrawn = run.status === 'withdrawn'
              const isAbsent = run.status === 'absent'

              return (
                <div
                  key={rIdx}
                  className="flex items-center rounded border border-om-200 transition-all bg-cream-50 px-1.5 py-0.5 gap-1 shrink-0"
                  style={{ width: runSlotWidth }}
                >
                  {isAbsent ? (
                    <div className="flex items-center justify-between gap-1 bg-om-100/70 border border-om-200 rounded px-2.5 py-1 flex-1 min-w-0">
                      <span className="text-xs font-normal text-char-500">Неявка</span>
                      <button
                        type="button"
                        onClick={() => setRunStatus(category.id, dog.id, rIdx, 'normal')}
                        className="text-char-400 hover:text-char-700 text-xs px-1 py-0.5 rounded hover:bg-om-200/50 cursor-pointer"
                        title="Вернуть ввод оценок"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`flex items-center rounded border px-1 py-0.5 gap-1 transition-all shrink-0 ${blanketBg}`}
                        title={`Забег ${rIdx + 1}. Попона: ${blanketTitle}. Нажмите на кружок для смены цвета`}
                      >
                        <button
                          type="button"
                          onClick={() => cycleBlanket(category.id, dog.id, rIdx)}
                          className="w-3 h-3 rounded-full shrink-0 ring-1 cursor-pointer transition-transform hover:scale-115 active:scale-90"
                          style={{ backgroundColor: blanketColor === 'red' ? '#e11d48' : blanketColor === 'blue' ? '#0284c7' : '#ffffff' }}
                          title={`Попона: ${blanketTitle}. Нажмите для смены цвета`}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={run.heat}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 3)
                            updateRunField(category.id, dog.id, rIdx, 'heat', val)
                          }}
                          maxLength={3}
                          className="w-6 text-[11px] text-center bg-transparent font-bold focus:outline-none"
                          placeholder="№"
                          title={`Номер забега (${blanketTitle} попона)`}
                        />
                      </div>

                      {isWithdrawn && (
                        <div className="flex items-center gap-1 bg-om-100/60 border border-om-200 rounded px-1.5 py-0.5 flex-1 min-w-0">
                          <span className="text-[10px] font-medium text-char-600 uppercase tracking-wide shrink-0">
                            Дискв:
                          </span>
                          <input
                            type="text"
                            value={run.reason || ''}
                            onChange={e => updateRunReason(category.id, dog.id, rIdx, e.target.value)}
                            className="w-full px-1 py-0.2 bg-white border border-om-200 rounded text-[11px] text-char-800 focus:outline-none focus:ring-1 focus:ring-camel-500 font-medium truncate"
                            placeholder="Причина (травма...)"
                            title="Причина дисквалификации"
                          />
                          <button
                            type="button"
                            onClick={() => setRunStatus(category.id, dog.id, rIdx, 'normal')}
                            className="text-char-400 hover:text-char-700 text-xs px-0.5 shrink-0 cursor-pointer"
                            title="Вернуть ввод оценок"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {!isWithdrawn && !isAbsent && (
                    <div className="flex items-center gap-0.5 shrink-0">
                      {COURSING_CRITERIA.map(c => (
                        <input
                          key={c}
                          type="number"
                          min={0}
                          max={20}
                          value={run.scores[c]}
                          onChange={e => updateRunScore(category.id, dog.id, rIdx, c, e.target.value)}
                          className={`${
                            category.runsCount === 3 ? 'w-[22px] text-[10px]' : 'w-[26px] text-[11px]'
                          } text-center py-0.5 px-0 bg-om-50 border border-om-200 rounded font-bold tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-1 focus:ring-camel-500`}
                          placeholder="0"
                          title={
                            c === 'speed' ? 'Скорость (0-20)' :
                            c === 'enthusiasm' ? 'Энтузиазм (0-20)' :
                            c === 'intelligence' ? 'Интеллект (0-20)' :
                            c === 'agility' ? 'Маневренность (0-20)' : 'Выносливость (0-20)'
                          }
                        />
                      ))}
                    </div>
                  )}

                  {!isWithdrawn && !isAbsent && (
                    <span
                      className="text-[10px] font-bold text-camel-800 text-center w-5 shrink-0"
                      title={`Сумма баллов за забег ${rIdx + 1}`}
                    >
                      {sum}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation()
                      if (activeRunMenu && activeRunMenu.dogId === dog.id && activeRunMenu.rIdx === rIdx) {
                        setActiveRunMenu(null)
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect()
                        setActiveRunMenu({
                          catId: category.id,
                          dogId: dog.id,
                          rIdx,
                          rect: {
                            top: rect.top,
                            bottom: rect.bottom,
                            left: rect.left,
                            right: rect.right
                          }
                        })
                      }
                    }}
                    className="text-char-500 hover:text-char-900 hover:bg-om-200/80 p-0.5 rounded transition-colors focus:outline-none cursor-pointer shrink-0"
                    title="Опции забега (баллы, дисквалификация, неявка)"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-cream-50 px-2 py-1 rounded border border-om-200 text-xs shrink-0" style={{ width: 264 }}>
            <input
              type="text"
              value={dog.racing_box}
              onChange={e => updateDog(category.id, dog.id, { racing_box: e.target.value })}
              className="w-8 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center text-[11px]"
              placeholder="Бокс"
              title="Бокс"
            />
            <input
              type="text"
              value={dog.racing_time1}
              onChange={e => updateDog(category.id, dog.id, { racing_time1: e.target.value })}
              className="w-14 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center font-mono text-[11px]"
              placeholder="Заезд 1"
              title="Время заезд 1"
            />
            <input
              type="text"
              value={dog.racing_time2}
              onChange={e => updateDog(category.id, dog.id, { racing_time2: e.target.value })}
              className="w-14 px-1 py-0.5 bg-om-50 border border-om-200 rounded text-center font-mono text-[11px]"
              placeholder="Заезд 2"
              title="Время заезд 2"
            />
            <input
              type="text"
              value={dog.racing_final_time}
              onChange={e => updateDog(category.id, dog.id, { racing_final_time: e.target.value })}
              className="w-16 px-1 py-0.5 bg-om-50 border border-camel-300 rounded text-center font-mono font-bold text-xs"
              placeholder="Финал"
              title="Итоговое время"
            />
          </div>
        )}

        {/* Правая колонка: Итог, Меню титулов, Удаление */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {(() => {
            const overall = getDogOverallStatus(dog, category.runsCount)
            return (
              <div
                className={`border px-1.5 py-0.5 rounded text-center w-20 shrink-0 ${
                  overall.type === 'withdrawn' ? 'bg-om-100/80 border-om-200 text-char-600' :
                  overall.type === 'absent' ? 'bg-om-100/60 border-om-200 text-char-400' :
                  overall.type === 'disqualified' ? 'bg-om-100/80 border-om-200 text-char-600' :
                  'bg-camel-100/80 border-camel-300 text-char-900'
                }`}
                title={overall.reason ? `Статус: ${overall.label} (${overall.reason})` : 'Итоговая сумма баллов'}
              >
                <span className={`text-xs tabular-nums truncate block ${overall.type === 'normal' ? 'font-bold' : 'font-medium'}`}>
                  {overall.type === 'absent' ? 'Неявка' : (overall.type === 'withdrawn' || overall.type === 'disqualified') ? 'Дискв.' : overall.label}
                </span>
              </div>
            )
          })()}

          {isDogAbsent ? (
            <div className="w-28 shrink-0" />
          ) : (
            <div className="relative w-28 shrink-0">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  if (activeAwardsMenu && activeAwardsMenu.dogId === dog.id) {
                    setActiveAwardsMenu(null)
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setActiveAwardsMenu({
                      catId: category.id,
                      dogId: dog.id,
                      rect: {
                        top: rect.top,
                        bottom: rect.bottom,
                        left: rect.left,
                        right: rect.right,
                        width: rect.width
                      }
                    })
                  }
                }}
                className={`w-full flex items-center justify-between gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                  (dog.awards || []).length > 0
                    ? 'bg-camel-600 text-white border-camel-700 shadow-2xs'
                    : 'bg-cream-50 text-char-600 border-om-200 hover:border-camel-400'
                }`}
                title={(dog.awards || []).length > 0 ? `Титулы: ${(dog.awards || []).join(', ')}` : 'Назначить титулы и сертификаты'}
              >
                <span className="truncate flex-1 text-left">
                  {(dog.awards || []).length > 0 ? (dog.awards || []).join(', ') : 'Титулы'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
              </button>
            </div>
          )}

          <button
            onClick={() => removeDogFromCategory(category.id, dog.id)}
            disabled={category.dogs.length <= 1}
            className="w-7 h-7 flex items-center justify-center text-char-400 hover:text-terracotta-600 transition-colors rounded disabled:opacity-20 shrink-0"
            title="Удалить собаку"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
