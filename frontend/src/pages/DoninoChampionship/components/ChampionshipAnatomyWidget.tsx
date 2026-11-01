import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { formatBreedName } from '../../../lib/breedMapping'
import { parseDogName } from '../../../lib/dogName'
import type { ChampionshipStanding } from '../../../lib/staticData/donino'

interface ChampionshipAnatomyWidgetProps {
  standings: ChampionshipStanding[]
  selectedBreed?: string
}

export default function ChampionshipAnatomyWidget({
  standings,
  selectedBreed,
}: ChampionshipAnatomyWidgetProps) {
  const { top5AnatomyDogs, maxAnatomyPts } = useMemo(() => {
    const list = standings
      .filter((d) => d.total_points != null && d.total_points > 0)
      .map((d) => {
        let placePts = 0
        let bonusPts = 0
        for (const h of d.history) {
          const b = h.points_breakdown
          if (b) {
            placePts += b.place_points || 0
            bonusPts +=
              (b.best_final_points || 0) +
              (b.best_class_points || 0) +
              (b.best_breed_points || 0) +
              (b.track_record_points || 0)
          }
        }
        const total = d.total_points || placePts + bonusPts
        const placePct = total > 0 ? Math.round((placePts / total) * 100) : 100
        const bonusPct = total > 0 ? 100 - placePct : 0
        return {
          dog: d,
          total,
          placePts,
          bonusPts,
          placePct,
          bonusPct,
        }
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    const maxPts = list.length > 0 ? Math.max(...list.map((item) => item.total)) : 1
    return { top5AnatomyDogs: list, maxAnatomyPts: maxPts }
  }, [standings])

  return (
    <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3 text-xs text-charcoal-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
            Анатомия баллов: Топ-5
          </h3>
          {selectedBreed && (
            <span className="text-[10px] text-charcoal-500 font-medium">
              · {formatBreedName(selectedBreed)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[10px] shrink-0 font-medium">
          <span className="flex items-center gap-1.5 text-charcoal-700">
            <span className="w-2 h-2 rounded-full bg-om-700 inline-block shrink-0" />
            <span>Места</span>
          </span>
          <span className="flex items-center gap-1.5 text-charcoal-800 font-semibold">
            <span className="w-2 h-2 rounded-full bg-om-300 border border-om-400/60 inline-block shrink-0" />
            <span>Бонусы</span>
          </span>
        </div>
      </div>

      <p className="text-[11px] text-charcoal-500 leading-tight">
        Базовые баллы за места в забегах vs скоростные бонусы (+1 б.) в текущей выборке
      </p>

      {top5AnatomyDogs.length === 0 ? (
        <div className="text-center py-3 text-charcoal-500 text-[11px] italic">
          Нет собак с начисленными баллами
        </div>
      ) : (
        <div className="space-y-2.5 pt-0.5">
          {top5AnatomyDogs.map((item, idx) => {
            const { primary, secondary } = parseDogName(
              item.dog.name_lat || item.dog.name,
              item.dog.name_ru
            )
            const barWidthPct = Math.max(
              12,
              Math.min(100, Math.round((item.total / maxAnatomyPts) * 100))
            )

            return (
              <div key={item.dog.dog_key} className="space-y-1">
                <div className="flex items-baseline justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0 pr-2">
                    <span className="w-4 text-center font-bold text-charcoal-400 text-[10px] shrink-0">
                      #{idx + 1}
                    </span>
                    {item.dog.dog_id ? (
                      <Link
                        to={`/dog/${item.dog.dog_id}`}
                        title={secondary || undefined}
                        className="font-serif font-bold text-charcoal-900 hover:text-camel-800 truncate"
                      >
                        {primary}
                      </Link>
                    ) : (
                      <span
                        title={secondary || undefined}
                        className="font-serif font-bold text-charcoal-900 truncate"
                      >
                        {primary}
                      </span>
                    )}
                    {!selectedBreed && (
                      <span className="text-[10px] text-charcoal-400 truncate hidden sm:inline">
                        · {formatBreedName(item.dog.breed)}
                      </span>
                    )}
                  </div>

                  {/* Points breakdown */}
                  <div className="shrink-0 flex items-center gap-1.5 text-right font-mono">
                    <span className="text-[10px] text-charcoal-500">
                      {item.placePts}&nbsp;б. + {item.bonusPts}&nbsp;б.
                    </span>
                    <span className="font-bold text-xs text-charcoal-900 min-w-[28px]">
                      {item.total}&nbsp;б.
                    </span>
                  </div>
                </div>

                {/* Stacked progress bar: Walnut & Cream */}
                <div className="h-1.5 w-full bg-om-100 rounded-full overflow-hidden flex">
                  <div style={{ width: `${barWidthPct}%` }} className="h-full flex items-center gap-0.5">
                    <div
                      style={{ width: `${item.placePct}%` }}
                      className={`h-full bg-om-700 transition-all duration-300 ${
                        item.bonusPts > 0 ? 'rounded-l-full' : 'rounded-full'
                      }`}
                      title={`Баллы за места: ${item.placePts} б.`}
                    />
                    {item.bonusPts > 0 && (
                      <div
                        style={{ width: `${item.bonusPct}%` }}
                        className="h-full bg-om-300 rounded-r-full transition-all duration-300"
                        title={`Скоростные бонусы: +${item.bonusPts} б.`}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
