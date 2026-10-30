import React from 'react'
import type { CriteriaStat } from './types'
import { getCriteriaMeta } from './utils'

interface JudgeCriteriaTabProps {
  sortedCriteria: CriteriaStat[]
}

export const JudgeCriteriaTab: React.FC<JudgeCriteriaTabProps> = ({ sortedCriteria }) => {
  if (sortedCriteria.length === 0) {
    return <p className="py-12 text-center text-sm text-charcoal-500">Нет данных о критериях</p>
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-charcoal-500 leading-relaxed max-w-2xl">
        В курсинге и бегах борзых оценка судьи состоит из 5 критериев правил FCI / РКФ. Каждый критерий оценивается максимум в 20 баллов, а суммарный забег — до 100 баллов.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sortedCriteria.map((stat, idx) => {
          const meta = getCriteriaMeta(stat.name || String(idx))
          const avg = stat.avg_score != null ? Number(stat.avg_score) : null
          const pct = avg != null ? Math.min(100, Math.max(0, (avg / 20) * 100)) : 0
          const Icon = meta.icon

          return (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-old-money-200/80 bg-white p-4 shadow-2xs hover:border-camel-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${meta.accentBorder} bg-cream-50`}>
                      <Icon className="h-4 w-4 text-camel-700" />
                    </div>
                    <span className="font-bold text-charcoal-900 text-sm">
                      {stat.name || meta.name}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-lg border border-old-money-200/80 bg-cream-50 px-2 py-0.5 text-xs font-bold tabular-nums text-charcoal-800">
                    {avg != null ? avg.toFixed(2) : '—'} / 20
                  </span>
                </div>

                <p className="text-xs text-charcoal-500 leading-relaxed mb-3">
                  {meta.desc}
                </p>

                <div className="h-2 w-full overflow-hidden rounded-full bg-old-money-100">
                  <div
                    className={`h-full rounded-full ${meta.color} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-old-money-100 flex items-center justify-between text-xs text-charcoal-500">
                <span>Оценок: <strong className="text-charcoal-800 tabular-nums">{stat.evaluations_count || 0}</strong></span>
                <span>Мин: <strong className="text-charcoal-800 tabular-nums">{stat.min_score ?? '—'}</strong></span>
                <span>Макс: <strong className="text-charcoal-800 tabular-nums">{stat.max_score ?? '—'}</strong></span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
