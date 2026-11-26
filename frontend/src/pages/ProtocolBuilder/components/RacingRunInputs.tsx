import React from 'react'
import type { DogParticipant } from '../types'

interface RacingRunInputsProps {
  catId: string
  dog: DogParticipant
  updateDog: (catId: string, dogId: string, updates: Partial<DogParticipant>) => void
}

export const RacingRunInputs: React.FC<RacingRunInputsProps> = ({ catId, dog, updateDog }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:flex xl:items-end gap-2 xl:gap-1.5 bg-cream-50 p-2.5 xl:px-2 xl:py-1.5 rounded-xl border border-om-200 shrink-0">
      <label className="flex flex-col gap-0.5 xl:w-12">
        <span className="text-[10px] font-semibold text-charcoal-600">Бокс</span>
        <input
          type="text"
          value={dog.racing_box}
          onChange={(e) => updateDog(catId, dog.id, { racing_box: e.target.value })}
          className="w-full min-h-[44px] xl:min-h-[34px] px-2 py-1 bg-white border border-om-300 rounded-lg text-center text-xs font-bold text-charcoal-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          placeholder="1"
        />
      </label>

      <label className="flex flex-col gap-0.5 xl:w-20">
        <span className="text-[10px] font-semibold text-charcoal-600">1-й заезд</span>
        <input
          type="text"
          value={dog.racing_time1}
          onChange={(e) => updateDog(catId, dog.id, { racing_time1: e.target.value })}
          className="w-full min-h-[44px] xl:min-h-[34px] px-2 py-1 bg-white border border-om-300 rounded-lg text-center font-mono text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          placeholder="сек"
        />
      </label>

      <label className="flex flex-col gap-0.5 xl:w-20">
        <span className="text-[10px] font-semibold text-charcoal-600">2-й заезд</span>
        <input
          type="text"
          value={dog.racing_time2}
          onChange={(e) => updateDog(catId, dog.id, { racing_time2: e.target.value })}
          className="w-full min-h-[44px] xl:min-h-[34px] px-2 py-1 bg-white border border-om-300 rounded-lg text-center font-mono text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-camel-500/40"
          placeholder="сек"
        />
      </label>

      <label className="flex flex-col gap-0.5 xl:w-24">
        <span className="text-[10px] font-semibold text-camel-800">Финал</span>
        <input
          type="text"
          value={dog.racing_final_time}
          onChange={(e) => updateDog(catId, dog.id, { racing_final_time: e.target.value })}
          className="w-full min-h-[44px] xl:min-h-[34px] px-2 py-1 bg-white border border-camel-400 rounded-lg text-center font-mono font-bold text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-camel-500/50"
          placeholder="сек"
        />
      </label>
    </div>
  )
}
