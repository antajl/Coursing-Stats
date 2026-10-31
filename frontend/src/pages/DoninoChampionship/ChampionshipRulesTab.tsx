import React from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  FileSpreadsheet,
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  Sparkles,
  Info,
  Trophy,
} from 'lucide-react'

interface ChampionshipRulesTabProps {
  reglamentUrl?: string | null
  spreadsheetUrl?: string | null
}

export default function ChampionshipRulesTab({ reglamentUrl, spreadsheetUrl }: ChampionshipRulesTabProps) {
  return (
    <div className="space-y-6 w-full">
      {/* 2-Column Responsive Grid Layout (matches Standings tab) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Rules, Leagues Pyramid, Rotation Rules */}
        <div className="lg:col-span-8 space-y-4">
          {/* Section 1: Pyramid of Leagues */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-camel-700" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Пирамида лиг чемпионата
              </h2>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              В серии клубных чемпионатов Донино действует многоуровневая система лиг. Собаки распределяются по уровню подготовки и спортивному опыту, обеспечивая равную и честную конкуренцию в каждом классе.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {/* Juniors */}
              <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                    Лига «Юниоры»
                  </span>
                  <span className="text-[10px] text-sky-800 font-medium">До 18 месяцев</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Специальная категория для молодых собак в возрасте от 9 до 18 месяцев. Позволяет юниорам набраться бегового опыта на закрытой трассе перед переходом во взрослую систему состязаний.
                </p>
              </div>

              {/* Progress */}
              <div className="p-4 rounded-xl border border-stone-300 bg-stone-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-200 text-stone-800 border border-stone-300">
                    Лига «Прогресс»
                  </span>
                  <span className="text-[10px] text-stone-600 font-medium">Стартовая лига</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Базовая лига для взрослых собак без официальных беговых титулов. Все новые взрослые участники без квалификационных титулов начинают турнирный путь с этой ступени.
                </p>
              </div>

              {/* Champions */}
              <div className="p-4 rounded-xl border border-camel-300 bg-camel-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-camel-200 text-charcoal-900 border border-camel-300">
                    Лига «Чемпионов»
                  </span>
                  <span className="text-[10px] text-camel-800 font-medium">Титулованные</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Лига для собак с подтверждёнными беговыми титулами (ЧРКФ, Чемпион России, Победитель Кубка России по курсингу/рейсингу), а также для <b>победителей финалов Лиги «Прогресс»</b>.
                </p>
              </div>

              {/* Absolute */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                    Лига «Абсолют»
                  </span>
                  <span className="text-[10px] text-amber-800 font-medium">Высшая элита</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Высшая лига турнира. Допускаются <b>исключительно победители финалов в Лиге «Чемпионов»</b>. Сильнейший дивизион беговой серии с максимальной спортивной плотностью.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Rotation Rules (Promotions and Relegations) */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-camel-700" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Правила ротации и переходов между лигами
              </h2>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Составы лиг динамически обновляются по итогам каждого этапа. Переводы между ступенями пирамиды осуществляются строго по спортивным критериям побед и поражений.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Promotion Up */}
              <div className="p-4 rounded-xl bg-cream-100/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold font-serif text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Повышение в лиге (перевод вверх)</span>
                </div>
                <p className="text-charcoal-700 leading-relaxed">
                  Основанием для обязательного перевода собаки в высшую лигу является <b>одна победа в финальном забеге</b> своего класса (порода / пол / возрастная или ростовая категория).
                </p>
                <div className="text-[11px] text-emerald-900/80 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                  Перевод вступает в силу с момента начала следующего этапа чемпионата.
                </div>
              </div>

              {/* Relegation Down */}
              <div className="p-4 rounded-xl bg-cream-100/70 border border-rose-200 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-900 font-bold font-serif text-sm">
                  <ArrowDownRight className="w-4 h-4 text-rose-600" />
                  <span>Понижение в лиге (перевод вниз)</span>
                </div>
                <p className="text-charcoal-700 leading-relaxed">
                  <b>Три поражения подряд</b> в классе влекут за собой обязательный перевод собаки в предыдущую лигу.
                </p>
                <div className="text-[11px] text-rose-900/80 bg-rose-50/80 p-2 rounded-lg border border-rose-200/60">
                  Поражением считается любое место ниже первого в финале, сход с трассы, неявка или дисквалификация. Серия поражений сохраняется между этапами сезона.
                </div>
              </div>
            </div>

            {/* Classes Structure Note */}
            <div className="p-3.5 rounded-xl bg-cream-100/50 border border-old-money-200/80 text-xs text-charcoal-700 space-y-1">
              <div className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-camel-700" />
                <span>Формирование соревновательных классов</span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                Классы забегов формируются внутри каждой лиги с учётом породы, пола (при кворуме от 3 собак) и ростовой категории («стандарт» и «спринтер» для уиппетов). При малом числе участников однополые классы объединяются в смешанный («Микс»).
              </p>
            </div>
          </div>

          {/* Section 3: Technical Specs & Timing */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-camel-700" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Технические условия, трасса и хронометраж
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs text-charcoal-700 pt-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Дистанция 350 метров</strong>: специально оборудованный овальный трек для бегов борзых с песчаным покрытием на полигоне в д. Донино (Раменский район Московской области).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Старт из боксов</strong>: одновременный старт участников из 4-местных закрытых автоматических стартовых боксов, исключающий фальстарты.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Система «зиг-заг» (2 круга забегов)</strong>: турнир проводится в два круга — квалификационный и финальный. Во втором круге участники распределяются по забегам по результатам первого круга так, чтобы лидеры не встречались в одном забеге до решающего финала.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Электронный фотофиниш</strong>: фиксация времени забега аппаратно до 0.01 секунды с помощью фотофиниша на финишном створе. Субъективная судейская коллегия отсутствует — результаты определяются объективным таймингом.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Организатор серии</strong>: беговой клуб «Курсинг в Донино». Руководитель серии состязаний — Михаил Андреевич Манухин.
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Official Documents & Quick Facts Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Document Card */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-camel-700" />
              <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                Официальный регламент
              </h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Полный текст официального регламента серии клубных чемпионатов Донино по рейсингу с подробными схемами забегов и правилами безопасности.
            </p>

            {reglamentUrl ? (
              <a
                href={reglamentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-camel-400 bg-cream-100/90 hover:bg-cream-100 text-charcoal-900 transition-colors shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-camel-700" />
                  <span>Открыть регламент (PDF)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-500" />
              </a>
            ) : (
              <div className="text-xs text-charcoal-500 italic">
                Ссылка на документ временно обновляется
              </div>
            )}
          </div>

          {/* Quick Specifications Card */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-camel-700" />
              <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                Сводные параметры серии
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500">Дистанция</span>
                <span className="font-semibold text-charcoal-900">350 метров</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500">Покрытие трека</span>
                <span className="font-semibold text-charcoal-900">Песчаный грунт</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500">Тип старта</span>
                <span className="font-semibold text-charcoal-900">Закрытые боксы (4)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500">Кругов на этапе</span>
                <span className="font-semibold text-charcoal-900">2 (квалификация + финал)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500">Фиксация</span>
                <span className="font-semibold text-charcoal-900">Фотофиниш (0.01 с)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500">Переход вверх</span>
                <span className="font-semibold text-emerald-800">1 победа в финале</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-charcoal-500">Переход вниз</span>
                <span className="font-semibold text-rose-800">3 поражения подряд</span>
              </div>
            </div>
          </div>

          {/* Organizer & Official Website */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-camel-700" />
              <h3 className="text-xs font-bold font-serif uppercase tracking-wider text-charcoal-900">
                Организатор турнира
              </h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Беговой клуб «Курсинг в Донино». Руководитель серии чемпионатов — <b>Манухин Михаил Андреевич</b>.
            </p>

            <div className="space-y-2 pt-0.5">
              <a
                href="https://runningdog.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-charcoal-800 transition-colors shadow-2xs"
                title="Официальный сайт бегового клуба «Курсинг в Донино»"
              >
                <div className="flex items-center gap-2">
                  <span className="p-0.5 rounded border border-old-money-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                    <img
                      src="/assets/icons/runningdog.png"
                      alt=""
                      width={22}
                      height={14}
                      className="w-[22px] h-[14px] object-contain shrink-0"
                    />
                  </span>
                  <span className="font-semibold">Курсинг в Донино</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
              </a>

              <a
                href={spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-charcoal-800 transition-colors shadow-2xs"
                title="Официальная сводная таблица чемпионата в Google Таблицах"
              >
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded border border-emerald-300/80 bg-emerald-50 text-emerald-800 shadow-2xs flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  </span>
                  <span className="font-semibold">Таблица чемпионата (Google)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-5 shadow-2xs space-y-2.5">
            <div className="text-[11px] font-bold font-serif uppercase tracking-wider text-charcoal-500">
              Быстрый переход
            </div>
            <div className="space-y-1.5">
              <Link
                to="/donino/championship?tab=standings"
                className="w-full inline-flex items-center justify-between py-2 px-3 rounded-xl border border-old-money-200 bg-cream-100/60 text-xs font-medium text-charcoal-700 hover:bg-cream-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-camel-700" />
                  <span>Рейтинг</span>
                </div>
                <span className="text-[10px] text-charcoal-400">таблица →</span>
              </Link>
              <Link
                to="/speed-records/"
                className="w-full inline-flex items-center justify-between py-2 px-3 rounded-xl border border-old-money-200 bg-cream-100/60 text-xs font-medium text-charcoal-700 hover:bg-cream-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-camel-700" />
                  <span>Все рекорды скорости Донино</span>
                </div>
                <span className="text-[10px] text-charcoal-400">раздел →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
