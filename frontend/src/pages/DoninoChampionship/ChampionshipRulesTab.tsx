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
  Ruler,
  CalendarCheck2,
} from 'lucide-react'

interface ChampionshipRulesTabProps {
  reglamentUrl?: string | null
  spreadsheetUrl?: string | null
}

export default function ChampionshipRulesTab({ reglamentUrl, spreadsheetUrl }: ChampionshipRulesTabProps) {
  return (
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
      {/* 2-Column Responsive Grid Layout (matches Standings tab) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-w-0">
        {/* Left Column: Rules, Leagues Pyramid, Rotation Rules, Specs */}
        <div className="lg:col-span-8 space-y-4 min-w-0">
          {/* Section 1: Pyramid of Leagues */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-camel-700 shrink-0" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Пирамида лиг чемпионата
              </h2>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Согласно разделу 3 официального регламента, в чемпионате действуют <b>три соревновательные лиги</b> с бессрочной системой долгосрочной спортивной прогрессии. Молодые собаки бегут в обособленном подготовительном классе.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
              {/* Progress */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-stone-300 bg-stone-50/70 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-stone-200 text-stone-800 border border-stone-300">
                    Лига «Прогресс»
                  </span>
                  <span className="text-[10px] text-stone-600 font-medium">Стартовая</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Базовая лига для взрослых собак без титулов в бегах борзых. Все новые участники без подтверждённых титулов начинают участие строго с этой ступени (п. 3.2).
                </p>
              </div>

              {/* Champions */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-camel-300 bg-camel-50/70 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-camel-200 text-charcoal-900 border border-camel-300">
                    Лига «Чемпионов»
                  </span>
                  <span className="text-[10px] text-camel-800 font-medium">Титулованные</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Для собак с подтверждёнными беговыми титулами (ЧРКФ, ПЧРКФ, «Чемпион России», «Победитель Кубка России»), а также для <b>победителей финалов Лиги «Прогресс»</b> (п. 3.1).
                </p>
              </div>

              {/* Absolute */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-amber-300 bg-amber-50/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-200 text-amber-950 border border-amber-300">
                    Лига «Абсолют»
                  </span>
                  <span className="text-[10px] text-amber-800 font-medium">Высшая элита</span>
                </div>
                <p className="text-xs text-charcoal-700 leading-relaxed">
                  Высшая ступень турнира. Допускаются <b>исключительно победители чемпионатов в Лиге Чемпионов</b>. Сильнейший дивизион с максимальной спортивной конкуренцией (п. 3.1).
                </p>
              </div>
            </div>

            {/* Juniors Distinct Note */}
            <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60 space-y-1.5 text-xs text-charcoal-700">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300 max-w-full">
                  Класс «Юниоры» (вне взрослой системы лиг)
                </span>
                <span className="text-[10px] text-sky-800 font-medium shrink-0">Подготовительный зачёт</span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                Специальный возрастной класс для молодых собак с 9 месяцев до наступления взрослого класса (15 месяцев для пород группы А, 18 месяцев для остальных). Юниоры бегут обособленным зачётом без межлиговой ротации, набираясь опыта на овальном треке перед переходом во взрослые лиги.
              </p>
            </div>
          </div>

          {/* Section 2: Rotation Rules (Promotions and Relegations) */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-camel-700 shrink-0" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Правила ротации и переходов между лигами
              </h2>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Согласно разделу 4 регламента, составы лиг обновляются по итогам каждого этапа. Переводы осуществляются строго по спортивным критериям побед и поражений.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Promotion Up */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-cream-100/70 border border-emerald-200 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-900 font-bold font-serif text-sm">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Повышение в лиге (перевод вверх)</span>
                </div>
                <p className="text-charcoal-700 leading-relaxed">
                  Основанием для обязательного перевода собаки в следующую лигу является <b>одна победа в финальном забеге</b> своего класса (п. 4.1).
                </p>
                <div className="text-[11px] text-emerald-900/80 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                  Перевод вступает в силу с момента начала следующего соревновательного этапа.
                </div>
              </div>

              {/* Relegation Down */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-cream-100/70 border border-rose-200 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-900 font-bold font-serif text-sm">
                  <ArrowDownRight className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Понижение в лиге (перевод вниз)</span>
                </div>
                <p className="text-charcoal-700 leading-relaxed">
                  <b>Три поражения подряд</b> в классе влекут за собой обязательный перевод собаки в предыдущую лигу (п. 4.2).
                </p>
                <div className="text-[11px] text-rose-900/80 bg-rose-50/80 p-2 rounded-lg border border-rose-200/60">
                  Поражением считается любое место ниже первого в финале, сход с трассы, неявка или дисквалификация. Серия не обнуляется при перерывах между этапами (п. 9.5).
                </div>
              </div>
            </div>

            {/* Invariant Note on Series & Classes */}
            <div className="p-3.5 rounded-xl bg-cream-100/50 border border-old-money-200/80 text-xs text-charcoal-700 space-y-1">
              <div className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                <span>Учёт серий и отсутствие требований к кворуму</span>
              </div>
              <p className="text-[11px] text-charcoal-600 leading-relaxed">
                Серии побед и поражений ведутся последовательно в рамках одной лиги и одного класса (п. 4.3). Согласно п. 7.6 регламента, <b>кворумы не требуются</b>: минимальное количество участников для старта забега — одна собака. Одиночный пуск фиксируется в протоколе и идёт в официальный зачёт.
              </p>
            </div>
          </div>

          {/* Section 3: Height and Age Classes */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-camel-700 shrink-0" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Ростовые и возрастные стандарты классов
              </h2>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Деление на классы регламентировано разделами 5–8 официального регламента на основе промеров в холке и подтверждённого возраста.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Whippets */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-old-money-200 bg-cream-100/50 space-y-2">
                <div className="font-semibold font-serif text-charcoal-900 border-b border-old-money-200/70 pb-1">
                  Уиппеты (деление по росту)
                </div>
                <ul className="space-y-1.5 text-[11px] text-charcoal-700 leading-relaxed">
                  <li>
                    <strong className="text-charcoal-900">Стандартный класс</strong>: кобели — до 51,0 см; суки — до 48,0 см включительно.
                  </li>
                  <li>
                    <strong className="text-charcoal-900">Спринтеры</strong>: кобели — от 51,1 до 56,0 см; суки — от 48,1 до 53,0 см включительно.
                  </li>
                  <li>
                    <strong className="text-charcoal-900">Оверсайз</strong>: кобели выше 56,0 см; суки выше 53,0 см.
                  </li>
                </ul>
              </div>

              {/* Italian Greyhounds */}
              <div className="p-3.5 sm:p-4 rounded-xl border border-old-money-200 bg-cream-100/50 space-y-2">
                <div className="font-semibold font-serif text-charcoal-900 border-b border-old-money-200/70 pb-1">
                  Левретки (деление по росту)
                </div>
                <ul className="space-y-1.5 text-[11px] text-charcoal-700 leading-relaxed">
                  <li>
                    <strong className="text-charcoal-900">Стандартный класс</strong>: до 38,0 см включительно (кобели и суки).
                  </li>
                  <li>
                    <strong className="text-charcoal-900">Спринтеры</strong>: от 38,1 до 41,0 см включительно (кобели и суки).
                  </li>
                  <li>
                    <strong className="text-charcoal-900">Оверсайз</strong>: выше 41,0 см в холке.
                  </li>
                </ul>
              </div>
            </div>

            {/* Age Limits */}
            <div className="p-3.5 rounded-xl border border-old-money-200/80 bg-cream-100/30 text-xs text-charcoal-700 space-y-1.5">
              <div className="font-semibold text-charcoal-900 flex items-center gap-1.5">
                <CalendarCheck2 className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                <span>Возрастные границы участников (раздел 8)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-cream-50 border border-old-money-200/60">
                  <div className="font-semibold text-charcoal-900">Группа А (взрослые)</div>
                  <div className="text-charcoal-600 mt-0.5">С 15 месяцев до 8 лет (уиппет, левретка, басенджи, чирнеко дель Этна).</div>
                </div>
                <div className="p-2 rounded-lg bg-cream-50 border border-old-money-200/60">
                  <div className="font-semibold text-charcoal-900">Остальные породы</div>
                  <div className="text-charcoal-600 mt-0.5">С 18 месяцев до 8 лет (грейхаунд, салюки, РПБ, фараонова собака и др.).</div>
                </div>
                <div className="p-2 rounded-lg bg-cream-50 border border-old-money-200/60">
                  <div className="font-semibold text-charcoal-900">Ветераны</div>
                  <div className="text-charcoal-600 mt-0.5">С 8 до 10 лет включительно для всех зарегистрированных пород.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Race Format, Zig-Zag & Final Heats */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-camel-700" />
              <h2 className="text-base sm:text-lg font-serif font-bold text-charcoal-900">
                Формат заездов, система «зиг-заг» и финалы
              </h2>
            </div>

            <ul className="space-y-2.5 text-xs text-charcoal-700 pt-1">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Дистанция 350 метров</strong>: специально оборудованный овальный трек для бегов борзых в д. Донино (Раменский район МО) (п. 1.4, 7.5).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Старт из закрытых боксов</strong>: одновременный старт участников из 4-местных боксов за механическим зайцем, исключающий фальстарты (п. 7.3). В одном забеге стартует не более 4 собак.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Формула соревновательных кругов (п. 8.1–8.2)</strong>:
                  <div className="text-[11px] text-charcoal-600 mt-0.5">
                    • <i>Более 4 собак в классе</i>: проводятся <b>два отборочных забега + финал</b> (всего до 3 забегов). В финал выходят до 4 лучших собак по времени любого из отборов.<br />
                    • <i>4 собаки и менее</i>: проводятся <b>один отборочный забег + финал</b> (всего 2 забега).
                  </div>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Система «зиг-заг» и распределение попон</strong>: в 1-м круге забеги формируются жеребьёвкой; во 2-м отборе действует система «зиг-заг» (сильнейшие лидеры 1-го круга разводятся по разным забегам). В финале попоны выдаются строго по лучшему времени отбора (1-й номер — быстрейшей собаке, п. 8.5).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Определение мест при сходе в финале (п. 9.4)</strong>: места финалистов фиксируются по фактическому порядку пересечения створа финиша. Места не вышедших в финал — по их лучшему времени в отборе. Если финалист сошёл, места собак вне финала не сдвигаются (5-е место остаётся 5-м).
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-charcoal-900">Система фотофиниша</strong>: аппаратная фиксация времени забега до 0.01 с. Субъективная судейская коллегия отсутствует — результат определяется объективным хронометражем (п. 9.1).
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Official Documents & Quick Facts Sidebar */}
        <div className="lg:col-span-4 space-y-5 min-w-0">
          {/* Document Card */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-camel-700 shrink-0" />
              <h3 className="text-xs font-bold font-serif text-charcoal-900">
                Официальный регламент
              </h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Полный текст утверждённого регламента серии клубных чемпионатов Донино по рейсингу со всеми приложениями и правилами безопасности.
            </p>

            {reglamentUrl ? (
              <a
                href={reglamentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-camel-400 bg-cream-100/90 hover:bg-cream-100 text-charcoal-900 transition-colors shadow-2xs min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-camel-700 shrink-0" />
                  <span className="truncate">Открыть регламент (PDF)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-500 shrink-0 ml-2" />
              </a>
            ) : (
              <div className="text-xs text-charcoal-500 italic">
                Ссылка на документ временно обновляется
              </div>
            )}
          </div>

          {/* Quick Specifications Card */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-camel-700 shrink-0" />
              <h3 className="text-xs font-bold font-serif text-charcoal-900">
                Сводные параметры серии
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Дистанция</span>
                <span className="font-semibold text-charcoal-900 text-right">350 метров</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Конфигурация</span>
                <span className="font-semibold text-charcoal-900 text-right">Овальный трек</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Тип старта</span>
                <span className="font-semibold text-charcoal-900 text-right">Закрытые боксы (4)</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Кворум</span>
                <span className="font-semibold text-emerald-800 text-right">Не требуется (от 1 собаки)</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Кругов на этапе</span>
                <span className="font-semibold text-charcoal-900 text-right">2–3 (отборы + финал)</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Финалистов</span>
                <span className="font-semibold text-charcoal-900 text-right">До 4 собак в классе</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Фиксация</span>
                <span className="font-semibold text-charcoal-900 text-right">Фотофиниш (0.01 с)</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1 border-b border-old-money-200/60">
                <span className="text-charcoal-500 shrink-0">Переход вверх</span>
                <span className="font-semibold text-emerald-800 text-right">1 победа в финале</span>
              </div>
              <div className="flex items-center justify-between gap-2 py-1">
                <span className="text-charcoal-500 shrink-0">Переход вниз</span>
                <span className="font-semibold text-rose-800 text-right">3 поражения подряд</span>
              </div>
            </div>
          </div>

          {/* Qualification Requirement Card */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-camel-700 shrink-0" />
              <h3 className="text-xs font-bold font-serif text-charcoal-900">
                Допуск к участию
              </h3>
            </div>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Обязательным условием участия является наличие бегового допуска / квалификации по одной из дисциплин: курсинг, БЗМП или бега борзых, с подтверждением в квалификационной книжке (п. 6.1–6.3).
            </p>
          </div>

          {/* Organizer & Official Website */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-camel-700 shrink-0" />
              <h3 className="text-xs font-bold font-serif text-charcoal-900">
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
                className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-charcoal-800 transition-colors shadow-2xs min-w-0"
                title="Официальный сайт бегового клуба «Курсинг в Донино»"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-0.5 rounded border border-old-money-200/90 bg-white shadow-2xs flex items-center justify-center shrink-0">
                    <img
                      src="/assets/icons/runningdog.png"
                      alt=""
                      width={22}
                      height={14}
                      className="w-[22px] h-[14px] object-contain shrink-0"
                    />
                  </span>
                  <span className="font-semibold truncate">Курсинг в Донино</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400 shrink-0 ml-2" />
              </a>

              <a
                href={spreadsheetUrl || 'https://docs.google.com/spreadsheets/d/1PGrVO98HfxwzoOxHmd8eRaygvl3iJryIXYfPd7vmyNQ/edit?gid=0#gid=0'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] inline-flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl border border-old-money-200 bg-cream-100/70 hover:bg-cream-100 text-charcoal-800 transition-colors shadow-2xs min-w-0"
                title="Официальная сводная таблица чемпионата в Google Таблицах"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-1 rounded border border-emerald-300/80 bg-emerald-50 text-emerald-800 shadow-2xs flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  </span>
                  <span className="font-semibold truncate">Таблица чемпионата (Google)</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-charcoal-400 shrink-0 ml-2" />
              </a>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="rounded-2xl border border-old-money-200 bg-cream-50 p-4 sm:p-5 shadow-2xs space-y-2.5">
            <div className="text-[11px] font-bold font-serif text-charcoal-500">
              Быстрый переход
            </div>
            <div className="space-y-1.5">
              <Link
                to="/donino/championship?tab=standings"
                className="w-full min-h-[44px] inline-flex items-center justify-between py-2 px-3 rounded-xl border border-old-money-200 bg-cream-100/60 text-xs font-medium text-charcoal-700 hover:bg-cream-100 transition-colors min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Trophy className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                  <span className="truncate">Рейтинг</span>
                </div>
                <span className="text-[10px] text-charcoal-400 shrink-0 ml-2">таблица →</span>
              </Link>
              <Link
                to="/speed-records/"
                className="w-full min-h-[44px] inline-flex items-center justify-between py-2 px-3 rounded-xl border border-old-money-200 bg-cream-100/60 text-xs font-medium text-charcoal-700 hover:bg-cream-100 transition-colors min-w-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Clock className="w-3.5 h-3.5 text-camel-700 shrink-0" />
                  <span className="truncate">Все рекорды скорости Донино</span>
                </div>
                <span className="text-[10px] text-charcoal-400 shrink-0 ml-2">раздел →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
