import React from 'react'

export default function ChampionshipPointsRulesWidget() {
  return (
    <div className="rounded-2xl border border-old-money-200 bg-cream-50/90 p-4 shadow-2xs space-y-3 text-xs text-charcoal-700">
      <h3 className="text-xs font-bold font-serif text-charcoal-900">
        Начисление баллов и бонусы
      </h3>

      {/* Base Points for Places */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-charcoal-800 ">
          Баллы за занятое место:
        </div>
        <div className="grid grid-cols-4 gap-1 text-center font-mono text-[11px]">
          <div className="p-1 rounded bg-cream-100 border border-old-money-200">
            <span className="text-charcoal-500 text-[10px] block">1 место</span>
            <span className="font-bold text-amber-950">10 б.</span>
          </div>
          <div className="p-1 rounded bg-cream-100 border border-old-money-200">
            <span className="text-charcoal-500 text-[10px] block">2 место</span>
            <span className="font-bold text-amber-950">9 б.</span>
          </div>
          <div className="p-1 rounded bg-cream-100 border border-old-money-200">
            <span className="text-charcoal-500 text-[10px] block">3 место</span>
            <span className="font-bold text-amber-950">8 б.</span>
          </div>
          <div className="p-1 rounded bg-cream-100 border border-old-money-200">
            <span className="text-charcoal-500 text-[10px] block">4+ место</span>
            <span className="font-bold text-amber-950">7..1 б.</span>
          </div>
        </div>
      </div>

      {/* 4 Speed Bonuses */}
      <div className="space-y-1.5 pt-1 border-t border-old-money-200">
        <div className="text-[11px] font-bold text-charcoal-800 ">
          4 бонуса за скорость (по +1 б.):
        </div>
        <ul className="space-y-1 text-[11px] text-charcoal-600">
          <li className="flex items-start gap-1.5">
            <span className="text-amber-600 font-bold shrink-0">+1</span>
            <span>Лучшее время финала в классе</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-camel-700 font-bold shrink-0">+1</span>
            <span>Лучшее время во всём классе</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-forest-700 font-bold shrink-0">+1</span>
            <span>Лучшее время в породе</span>
          </li>
          <li className="flex items-start gap-1.5">
            <span className="text-rose-700 font-bold shrink-0">+1</span>
            <span>Рекорд клубного чемпионата</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
