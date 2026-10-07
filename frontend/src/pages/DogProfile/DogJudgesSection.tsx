import { useState, useMemo, Fragment } from 'react'
import { Link } from 'react-router-dom'
import {
  Scale,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
} from 'lucide-react'

export interface DogJudgeEventDetail {
  event_id: number
  title: string
  date: string
  avg_score: number
  scores: number[]
  role?: string
}

export interface DogJudgeItem {
  judge_name: string
  judge_key: string
  starts_count: number
  starts_percent: number
  evaluations_count: number
  avg_score: number
  min_score: number
  max_score: number
  delta_vs_dog_avg: number
  events: DogJudgeEventDetail[]
}

export interface DogJudgesStats {
  total_starts: number
  total_judges: number
  global_avg_score: number
  highest_concentration?: {
    judge_name: string
    starts_count: number
    starts_percent: number
  } | null
  judges: DogJudgeItem[]
}

interface DogJudgesSectionProps {
  judgeStats: DogJudgesStats
}

type SortField = 'score' | 'starts' | 'name'
type SortOrder = 'asc' | 'desc'

export function DogJudgesSection({ judgeStats }: DogJudgesSectionProps) {
  const [expandedJudge, setExpandedJudge] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('score')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const toggleExpand = (judgeName: string) => {
    setExpandedJudge((prev) => (prev === judgeName ? null : judgeName))
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder(field === 'name' ? 'asc' : 'desc')
    }
  }

  const sortedJudges = useMemo(() => {
    const list = [...judgeStats.judges]
    list.sort((a, b) => {
      let comparison = 0
      if (sortField === 'score') {
        comparison = a.avg_score - b.avg_score
      } else if (sortField === 'starts') {
        comparison = a.starts_count - b.starts_count || a.evaluations_count - b.evaluations_count
      } else if (sortField === 'name') {
        comparison = a.judge_name.localeCompare(b.judge_name, 'ru')
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })
    return list
  }, [judgeStats.judges, sortField, sortOrder])

  if (!judgeStats || judgeStats.judges.length === 0) {
    return null
  }

  return (
    <section className="mb-6 rounded-2xl border border-old-money-200/80 bg-white p-5 shadow-xs transition-shadow">
      {/* Шапка: Идеальный баланс Left/Right */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-old-money-100 pb-4">
        {/* Слева: Иконка + Заголовок + Спокойная статистика */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-charcoal-700">
            <Scale className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 leading-snug">
              Судейская статистика
            </h3>
            <p className="text-xs text-charcoal-500">
              <span className="font-medium text-charcoal-800">{judgeStats.total_starts}</span>{' '}
              {judgeStats.total_starts === 1 ? 'старт' : judgeStats.total_starts < 5 ? 'старта' : 'стартов'}
              <span className="mx-1.5 text-charcoal-300">·</span>
              средний балл{' '}
              <span className="font-semibold text-charcoal-800">
                {judgeStats.global_avg_score.toFixed(2)}
              </span>
              <span className="mx-1.5 text-charcoal-300">·</span>
              {judgeStats.total_judges}{' '}
              {judgeStats.total_judges === 1 ? 'судья' : judgeStats.total_judges < 5 ? 'судьи' : 'судей'}
            </p>
          </div>
        </div>

        {/* Справа: Минималистичные кнопки сортировки */}
        <div className="flex items-center gap-1 self-start sm:self-auto rounded-lg bg-cream-100/70 p-1 text-xs">
          <button
            type="button"
            onClick={() => handleSort('score')}
            className={`flex items-center gap-1 rounded-md px-3 py-1 font-medium transition-all ${
              sortField === 'score'
                ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <span>По ср. баллу</span>
            {sortField === 'score' && (
              <span className="text-[10px] text-charcoal-500">
                {sortOrder === 'desc' ? '▼' : '▲'}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSort('starts')}
            className={`flex items-center gap-1 rounded-md px-3 py-1 font-medium transition-all ${
              sortField === 'starts'
                ? 'bg-white text-charcoal-900 shadow-2xs font-semibold'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <span>По стартам</span>
            {sortField === 'starts' && (
              <span className="text-[10px] text-charcoal-500">
                {sortOrder === 'desc' ? '▼' : '▲'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Оповещение о высокой концентрации, если есть */}
      {judgeStats.highest_concentration && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-xs text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <div>
            <span className="font-semibold">Концентрация стартов: </span>
            {judgeStats.highest_concentration.starts_percent}% соревнований (
            {judgeStats.highest_concentration.starts_count} из {judgeStats.total_starts}) собака
            провела под экспертизой <strong>{judgeStats.highest_concentration.judge_name}</strong>.
          </div>
        </div>
      )}

      {/* Таблица судей */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-old-money-200/70 text-[11px] font-medium text-charcoal-500">
              <th className="py-2.5 pr-3 pl-2">
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className={`flex items-center gap-1 hover:text-charcoal-900 ${
                    sortField === 'name' ? 'font-bold text-charcoal-900' : ''
                  }`}
                >
                  Судья
                  {sortField === 'name' && (
                    <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                  )}
                </button>
              </th>
              <th className="px-3 py-2.5 text-center">
                <button
                  type="button"
                  onClick={() => handleSort('starts')}
                  className={`mx-auto flex items-center gap-1 hover:text-charcoal-900 ${
                    sortField === 'starts' ? 'font-bold text-charcoal-900' : ''
                  }`}
                >
                  Старты
                  {sortField === 'starts' && (
                    <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                  )}
                </button>
              </th>
              <th className="px-3 py-2.5 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('score')}
                  className={`ml-auto flex items-center gap-1 hover:text-charcoal-900 ${
                    sortField === 'score' ? 'font-bold text-charcoal-900' : ''
                  }`}
                >
                  Ср. балл
                  {sortField === 'score' && (
                    <span>{sortOrder === 'desc' ? '▼' : '▲'}</span>
                  )}
                </button>
              </th>
              <th className="px-3 py-2.5 text-right font-medium text-charcoal-500">
                Дельта (Δ)
              </th>
              <th className="py-2.5 pr-2 pl-2 text-right w-8">
                <span className="sr-only">Действия</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-old-money-100">
            {sortedJudges.map((judge) => {
              const isExpanded = expandedJudge === judge.judge_name
              const hasLowData = judge.evaluations_count < 2 && judgeStats.total_starts < 3
              const delta = judge.delta_vs_dog_avg

              let deltaBadgeClass = 'border-old-money-200/60 bg-cream-50/60 text-charcoal-600'
              let DeltaIcon: any = null
              if (!hasLowData) {
                if (delta >= 2.5) {
                  deltaBadgeClass = 'border-forest-200/80 bg-forest-50/60 text-forest-800'
                  DeltaIcon = TrendingUp
                } else if (delta <= -2.5) {
                  deltaBadgeClass = 'border-rose-200/80 bg-rose-50/60 text-rose-800'
                  DeltaIcon = TrendingDown
                }
              }

              return (
                <Fragment key={judge.judge_name}>
                  <tr
                    onClick={() => toggleExpand(judge.judge_name)}
                    className="group cursor-pointer transition-colors hover:bg-cream-100/50"
                  >
                    {/* Судья */}
                    <td className="py-2.5 pr-3 pl-2 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/judges/${encodeURIComponent(judge.judge_name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-charcoal-900 transition-colors hover:text-camel-700 hover:underline"
                          title="Перейти к профилю судьи"
                        >
                          {judge.judge_name}
                        </Link>
                        <Link
                          to={`/judges/${encodeURIComponent(judge.judge_name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-charcoal-400 opacity-0 transition-opacity hover:text-camel-700 group-hover:opacity-100"
                          aria-label={`Профиль судьи ${judge.judge_name}`}
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden />
                        </Link>
                      </div>
                      <div className="text-[10px] text-charcoal-400 tabular-nums">
                        диапазон:{' '}
                        {judge.min_score === judge.max_score
                          ? `${judge.min_score} б.`
                          : `${judge.min_score}–${judge.max_score} б.`}
                      </div>
                    </td>

                    {/* Старты и забеги */}
                    <td className="px-3 py-2.5 text-center align-middle whitespace-nowrap">
                      <div className="font-semibold tabular-nums text-charcoal-800">
                        {judge.starts_count}{' '}
                        <span className="text-[10px] font-normal text-charcoal-400">
                          ({judge.starts_percent}%)
                        </span>
                      </div>
                      <div className="text-[10px] text-charcoal-400 tabular-nums">
                        {judge.evaluations_count}{' '}
                        {judge.evaluations_count === 1
                          ? 'оценка'
                          : judge.evaluations_count < 5
                          ? 'оценки'
                          : 'оценок'}
                      </div>
                    </td>

                    {/* Средний балл */}
                    <td className="px-3 py-2.5 text-right align-middle font-bold tabular-nums text-charcoal-800 whitespace-nowrap">
                      {judge.avg_score.toFixed(2)}
                    </td>

                    {/* Дельта */}
                    <td className="px-3 py-2.5 text-right align-middle whitespace-nowrap">
                      {hasLowData ? (
                        <span
                          className="inline-flex items-center rounded-md border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-charcoal-400"
                          title="Мало данных для объективной дельты"
                        >
                          мало данных
                        </span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${deltaBadgeClass}`}
                          title={`Разница со средним собаки: ${delta > 0 ? '+' : ''}${delta.toFixed(2)}`}
                        >
                          {DeltaIcon && <DeltaIcon className="h-3 w-3" aria-hidden />}
                          {delta > 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Кнопка раскрытия */}
                    <td className="py-2.5 pr-2 pl-2 text-right align-middle">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleExpand(judge.judge_name)
                        }}
                        className="rounded-md p-1 text-charcoal-400 transition-colors hover:bg-cream-200/70 hover:text-charcoal-700"
                        aria-label={isExpanded ? 'Свернуть детали' : 'Раскрыть детали'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" aria-hidden />
                        ) : (
                          <ChevronDown className="h-4 w-4" aria-hidden />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Раскрывающийся блок деталей */}
                  {isExpanded && (
                    <tr className="bg-cream-50/50">
                      <td colSpan={5} className="border-t border-old-money-100 px-4 py-3">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-500">
                          Соревнования под экспертизой {judge.judge_name}:
                        </div>
                        <div className="space-y-2">
                          {judge.events.map((ev, idx) => (
                            <div
                              key={idx}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-old-money-100 bg-white px-3 py-2 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-charcoal-800">{ev.title}</div>
                                <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500">
                                  <Calendar className="h-3 w-3" aria-hidden />
                                  <span>{ev.date}</span>
                                  {ev.role && (
                                    <span
                                      className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                        ev.role.includes('Главный')
                                          ? 'border border-amber-200/80 bg-amber-50 font-semibold text-amber-900'
                                          : 'bg-cream-100 text-charcoal-600'
                                      }`}
                                    >
                                      {ev.role}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 text-right">
                                <div>
                                  <div className="text-[10px] text-charcoal-400">Баллы за круги</div>
                                  <div className="font-mono text-xs tabular-nums text-charcoal-700">
                                    {ev.scores.join(' + ')}
                                  </div>
                                </div>
                                <div className="rounded-md bg-forest-50 px-2 py-1 text-center">
                                  <div className="text-[9px] uppercase tracking-wide text-forest-700">
                                    Ср. балл
                                  </div>
                                  <div className="font-bold tabular-nums text-forest-800">
                                    {ev.avg_score.toFixed(1)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Сноска и пояснение в стиле Old Money */}
      <div className="mt-4 border-t border-old-money-100 pt-3 text-[11px] leading-relaxed text-charcoal-500 space-y-1">
        <p>
          <strong>Курсинг и БЗМП:</strong> баллы выставлены экспертами по 5 критериям за забеги (в бегах борзых баллы не выставляются, применяется хронометраж).
        </p>
        <p>
          <strong>Дельта (Δ):</strong> разница между средней оценкой судьи и общим средним собаки. Отклонения в пределах ±2.5 б. считаются обычной судейской вариацией; мягкий индикатор подсвечивает выраженное отклонение.
        </p>
      </div>
    </section>
  )
}
