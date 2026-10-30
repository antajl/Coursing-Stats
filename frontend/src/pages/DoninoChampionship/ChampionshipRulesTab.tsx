import React from 'react'
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Zap,
  Clock,
  Award,
  HelpCircle,
} from 'lucide-react'

interface ChampionshipRulesTabProps {
  reglamentUrl?: string | null
}

export default function ChampionshipRulesTab({ reglamentUrl }: ChampionshipRulesTabProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Intro Header */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-charcoal-900">
              Регламент серии клубных чемпионатов Донино
            </h2>
            <p className="text-xs text-charcoal-600 mt-0.5">
              Официальные правила организации бегов борзых (рейсинг 350 м) и ротации участников между лигами
            </p>
          </div>
          {reglamentUrl && (
            <a
              href={reglamentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-camel-400 bg-cream-100 hover:bg-cream-200 text-charcoal-900 transition-colors shrink-0"
            >
              <FileText className="w-4 h-4 text-camel-700" />
              <span>Скачать PDF регламента</span>
              <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
            </a>
          )}
        </div>
      </div>

      {/* 3 Leagues Pyramid */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-camel-700" />
          <span>Пирамида Лиг чемпионата</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Progress */}
          <div className="p-4 rounded-xl border border-stone-300 bg-stone-50/70 space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-200 text-stone-800 border border-stone-300">
              Лига «Прогресс»
            </div>
            <div className="text-xs text-charcoal-700">
              Стартовая лига для собак без официальных беговых титулов. Все новые участники без титулов начинают серию отсюда.
            </div>
          </div>

          {/* Champions */}
          <div className="p-4 rounded-xl border border-camel-300 bg-camel-50/70 space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-camel-200 text-charcoal-900 border border-camel-300">
              Лига «Чемпионов»
            </div>
            <div className="text-xs text-charcoal-700">
              Лига для собак с титулами (ЧРКФ, ПЧРКФ, Чемпион России, Победитель Кубка России), а также для{' '}
              <strong>победителей Лиги Прогресс</strong>.
            </div>
          </div>

          {/* Absolute */}
          <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-2">
            <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
              Лига «Абсолют»
            </div>
            <div className="text-xs text-charcoal-700">
              Высшая лига турнира. Допускаются <strong>только победители финалов в Лиге Чемпионов</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* Promotion and Relegation Rules */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 space-y-4 shadow-xs">
        <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-camel-700" />
          <span>Правила переходов (ротации) между лигами</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Move Up */}
          <div className="p-4 rounded-xl bg-cream-100/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold font-serif text-sm">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>Переход вверх (лифт вверх)</span>
            </div>
            <p className="text-charcoal-700 leading-relaxed">
              Основанием для обязательного перевода собаки в следующую лигу является <strong>одна победа в финале</strong> своего класса (порода / пол / возраст / рост) в текущей лиге.
            </p>
            <p className="text-charcoal-500 text-[11px]">
              Перевод вступает в силу со следующего этапа чемпионата.
            </p>
          </div>

          {/* Move Down */}
          <div className="p-4 rounded-xl bg-cream-100/70 border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold font-serif text-sm">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
              <span>Переход вниз (лифт вниз)</span>
            </div>
            <p className="text-charcoal-700 leading-relaxed">
              <strong>Три поражения подряд</strong> в классе приводят к обязательному переводу собаки в предыдущую лигу.
            </p>
            <p className="text-charcoal-500 text-[11px]">
              Поражением считается любое место ниже первого в финале, сход с дистанции, отказ от старта или дисквалификация. Серии поражений сохраняются сквозь все этапы!
            </p>
          </div>
        </div>
      </div>

      {/* Technical and Track Specs */}
      <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 space-y-3 shadow-xs">
        <h3 className="font-serif font-bold text-base text-charcoal-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-camel-700" />
          <span>Технические условия и регламент забегов</span>
        </h3>

        <ul className="space-y-2 text-xs text-charcoal-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
            <span><strong>Дистанция и трасса</strong>: 350 метров, овальная трасса для бегов борзых с песчаным покрытием в д. Донино.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
            <span><strong>Старт из боксов</strong>: одновременный и контролируемый старт участников из закрытых стартовых ячеек (до 4 собак в забеге).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
            <span><strong>Система «зиг-заг»</strong>: во 2-м круге забеги формируются на основе результатов 1-го круга так, чтобы сильнейшие участники не попали в один забег до финала, обеспечивая максимальную честность конкуренции.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
            <span><strong>Электронный хронометраж и фотофиниш</strong>: фиксация времени до сотых долей секунды при помощи специализированного оборудования фотофиниша.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
            <span><strong>Организатор</strong>: беговой клуб «Курсинг в Донино», руководитель серии — Михаил Андреевич Манухин (фиксация результатов: система фотофиниша и электронного хронометража).</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
