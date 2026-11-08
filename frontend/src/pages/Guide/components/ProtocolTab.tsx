import { useState } from 'react'
import { AlertCircle, CheckCircle2, ChevronRight, FileText, Info, Layers, Lock, ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  COURSING_5_CRITERIA,
  DISQUALIFICATION_RULES,
  PROTOCOL_ABBREVIATIONS,
  PROTOCOL_LADDER,
  PROTOCOL_OFFICIAL_SOURCES,
  PROTOCOL_REQUIREMENTS,
} from '../protocolConstants'
import { GUIDE_PROTOCOL_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

type ProtocolColKey = 'catalog' | 'dog' | 'heat1' | 'heat2' | 'sum' | 'placement'

const COL_EXPLANATIONS: Record<ProtocolColKey, { title: string; desc: string }> = {
  catalog: {
    title: '№ по каталогу состязания',
    desc: 'Порядковый номер собаки в официальном каталоге турнира. По каталожному номеру формируется жеребьёвка забегов 1-го круга.',
  },
  dog: {
    title: 'Кличка собаки и владелец',
    desc: 'Официальное имя собаки по документам РКФ/FCI (с приоритетом кириллического написания), номер родословной и фамилия владельца.',
  },
  heat1: {
    title: '1 круг: цвет попоны и баллы судей',
    desc: 'В курсинге используются 2 попоны: Красная (№ 1) и Белая (№ 2). Балл — сумма оценок всех судей за первый пуск. Барьер допуска ко 2-му кругу — не менее 50% баллов.',
  },
  heat2: {
    title: '2 круг: смена напарника и трассы',
    desc: 'Во втором круге меняется конфигурация траектории и напарник. Баллы 2-го круга имеют решающее значение при равенстве итоговой суммы.',
  },
  sum: {
    title: 'Итог Σ (прямая сумма) и знак [ВС]',
    desc: 'Прямая сумма баллов всех судей за оба круга без деления. Золотистый бейдж [ВС] означает выполнение нормы Высшей квалификации (≥ 66,7% от максимума).',
  },
  placement: {
    title: 'Итоговое место и сертификат [CACL]',
    desc: 'Занятое место в породе/полу. Сертификат кандидата в чемпионы [CACL] присуждается 1-му месту только при одновременном наличии знака [ВС] и кворума от 3 собак.',
  },
}

export default function ProtocolTab() {
  const [activeCol, setActiveCol] = useState<ProtocolColKey>('sum')

  return (
    <div className="space-y-6">
      {/* 1. Образец строки протокола (Интерактивный макет) */}
      <SectionCard title="Анатомия строки протокола соревнований">
        <p className="text-xs text-charcoal-600">
          Нажмите на любую ячейку образца протокола, чтобы увидеть подробное объяснение колонки:
        </p>

        <div className="rounded-xl border border-camel-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="overflow-x-auto pb-1">
            <div className="min-w-[640px] font-sans text-xs">
              {/* Шапка примера */}
              <div className="grid grid-cols-12 pb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-old-money-100">
                <span className="col-span-1">№</span>
                <span className="col-span-4">Кличка собаки</span>
                <span className="col-span-2 text-center">1 круг</span>
                <span className="col-span-2 text-center">2 круг</span>
                <span className="col-span-2 text-center">Итог Σ</span>
                <span className="col-span-1 text-right">Место</span>
              </div>

              {/* Строка примера с интерактивными кнопками */}
              <div className="grid grid-cols-12 items-center py-2.5 font-medium text-charcoal-900 gap-1">
                <button
                  type="button"
                  onClick={() => setActiveCol('catalog')}
                  className={`col-span-1 text-left font-mono font-bold p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'catalog'
                      ? 'bg-camel-100 text-camel-950 ring-1 ring-camel-400'
                      : 'text-charcoal-500 hover:bg-old-money-50'
                  }`}
                >
                  12
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('dog')}
                  className={`col-span-4 min-w-0 pr-2 text-left p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'dog'
                      ? 'bg-camel-100 text-camel-950 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <div className="font-bold text-charcoal-900 truncate">ДИОНИС ДЕЛАНЖЕЛ</div>
                  <div className="text-[10px] text-charcoal-500 font-normal truncate">РКФ 5829104 · вл. Иванова А.</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('heat1')}
                  className={`col-span-2 flex items-center justify-center gap-1.5 font-mono text-[11px] p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'heat1'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-900 text-[10px]">Красн.</span>
                  <span>89 б.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('heat2')}
                  className={`col-span-2 flex items-center justify-center gap-1.5 font-mono text-[11px] p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'heat2'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="rounded border border-old-money-300 bg-white px-1.5 py-0.5 font-bold text-charcoal-800 text-[10px]">Бел.</span>
                  <span>90 б.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('sum')}
                  className={`col-span-2 flex items-center justify-center gap-1 font-mono p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'sum'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="font-bold text-sm text-charcoal-900">179</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-950 shadow-2xs">ВС</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCol('placement')}
                  className={`col-span-1 text-right p-1 rounded-md transition-all cursor-pointer ${
                    activeCol === 'placement'
                      ? 'bg-camel-100 ring-1 ring-camel-400'
                      : 'hover:bg-old-money-50'
                  }`}
                >
                  <span className="inline-flex items-center rounded-md bg-camel-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-camel-950 whitespace-nowrap">
                    1 [CACL]
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Интерактивная плашка-подсказка выбранной ячейки */}
          <div className="mt-3 rounded-lg border border-camel-200 bg-camel-50/70 p-3 transition-all">
            <div className="flex items-center gap-1.5 text-xs font-bold text-camel-950">
              <Info className="h-3.5 w-3.5 text-camel-700 shrink-0" aria-hidden />
              <span>{COL_EXPLANATIONS[activeCol].title}</span>
            </div>
            <p className="mt-1 text-xs text-charcoal-700 leading-relaxed">
              {COL_EXPLANATIONS[activeCol].desc}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 2. Линейная шкала квалификационных барьеров */}
      <SectionCard title="Шкала квалификационных барьеров соревнований">
        <p className="text-xs text-charcoal-600">
          Процент набранных баллов от максимальной суммы состязаний (по Правилам курсинга РКФ):
        </p>

        <div className="grid gap-2 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              Барьер 1 круга
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">&lt; 50% баллов</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Сход со состязаний: собака не допускается ко 2-му забегу.
            </p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
              Проходной зачёт
            </div>
            <div className="mt-1 text-sm font-bold text-charcoal-900">50 – 66,6%</div>
            <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
              Оценки «Удовлетворительно» и «Хорошо». Норматив ВС не выполнен.
            </p>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
              Высшая квалификация
            </div>
            <div className="mt-1 text-sm font-bold text-amber-950">≥ 66,7% (Норма ВС)</div>
            <p className="mt-1 text-[11px] text-amber-900 leading-snug">
              Обязательное условие для получения титульных сертификатов CACL/CACIL.
            </p>
          </div>

          <div className="rounded-xl border border-camel-300 bg-camel-100/50 p-3 shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-camel-900">
              Высший эталон
            </div>
            <div className="mt-1 text-sm font-bold text-camel-950">≥ 75% («Отлично»)</div>
            <p className="mt-1 text-[11px] text-camel-900 leading-snug">
              Безупречная работа; норматив победы на Чемпионате России (ЧР РК).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* 3. Острый вопрос: почему 1 место без CACL? */}
      <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-200 text-amber-900 shrink-0">
            <Lock className="h-3.5 w-3.5" aria-hidden />
          </span>
          <h3 className="font-serif text-sm font-bold text-amber-950 sm:text-base">
            Почему собака заняла 1-е место, но не получила сертификат CACL?
          </h3>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-charcoal-800">
          Для присуждения чемпионского сертификата CACL или CACIL победителю недостаточно просто опередить соперников. Регламент РКФ требует одновременного выполнения двух обязательных условий:
        </p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
              Условие 1 · Квалификационный балл ВС
            </div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              Собака обязана набрать не менее 50% баллов в 1-м круге и не менее <strong>66,7% (⅔)</strong> от максимальной суммы по итогам двух кругов. Если балл ниже — CACL не выдаётся.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden />
              Условие 2 · Официальный кворум
            </div>
            <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
              В породе на старт обязаны выйти <strong>не менее 3 собак</strong> (или 3 собак одного пола при раздельном забеге). При 1 или 2 участниках присуждается только место без CACL.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Шкала оценок и нормативов в протоколе */}
      <SectionCard title="Судейские оценки и нормативы в протоколе">
        <p className="text-xs text-charcoal-600">
          Официальные оценки качества бега по шкале 100 баллов судейской бригады (клик раскроет подробности):
        </p>

        <TitleLadderList items={PROTOCOL_LADDER} />
      </SectionCard>

      {/* 5. 5 официальных критериев курсинга и тай-брейк */}
      <SectionCard title="5 официальных критериев курсинга (М, Р, В, П, Э) и тай-брейк">
        <p className="text-xs text-charcoal-600">
          Каждый судья оценивает забег по 5 критериям (до 20 баллов каждый, максимум 100 баллов за забег). При равенстве итоговой суммы баллов эти критерии определяют победителя:
        </p>

        <div className="space-y-2 pt-1">
          {COURSING_5_CRITERIA.map((crit) => (
            <div
              key={crit.key}
              className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2"
            >
              <div className="flex items-start gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-camel-100 font-mono text-xs font-bold text-camel-900 mt-0.5">
                  {crit.key}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-900">{crit.name}</span>
                    <span className="text-[10px] text-charcoal-500 font-mono">до {crit.maxPoints} б.</span>
                  </div>
                  <p className="mt-1 text-xs text-charcoal-700 leading-relaxed">{crit.summary}</p>
                </div>
              </div>

              <span className="shrink-0 self-start sm:self-center rounded-md border border-camel-200/80 bg-camel-50 px-2 py-0.5 text-[10px] font-semibold text-camel-900">
                Приоритет {crit.priority} в тай-брейке
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-old-money-200 bg-old-money-50/70 p-2.5 text-xs text-charcoal-800">
          <span className="font-semibold text-charcoal-900">Порядок разрешения ничьих (Тай-брейк РКФ):</span>{' '}
          1) Балл во 2-м забеге $\rightarrow$ 2) Маневренность (М) $\rightarrow$ 3) Резвость (Р) $\rightarrow$ 4) Выносливость (В) $\rightarrow$ 5) Преследование (П) $\rightarrow$ 6) Энтузиазм (Э).
        </div>
      </SectionCard>

      {/* 6. Статусы сходов и накопительные дисквалификации */}
      <SectionCard title="Статусы вне зачёта и накопительные дисквалификации">
        <p className="text-xs text-charcoal-600">
          Причины отсутствия баллов в протоколе и шкала санкций за агрессию или помеху напарнику:
        </p>

        <div className="grid gap-2 sm:grid-cols-4 pt-1">
          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-charcoal-800">DNS</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Did Not Start</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Неявка на старт забега к моменту пуска.</p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-amber-800">DNF</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Did Not Finish</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Сход с дистанции или прекращение преследования.</p>
          </div>

          <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-sky-800">INJ</span>
            <div className="mt-0.5 text-xs font-semibold text-charcoal-900">Injured</div>
            <p className="mt-1 text-[11px] text-charcoal-600">Снятие ветеринарным врачом из-за травмы.</p>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 shadow-2xs">
            <span className="font-mono text-xs font-bold text-rose-800">DISQ</span>
            <div className="mt-0.5 text-xs font-semibold text-rose-950">Дисквалификация</div>
            <p className="mt-1 text-[11px] text-rose-900">Агрессия или умышленная помеха напарнику.</p>
          </div>
        </div>

        <div className="mt-3.5 rounded-xl border border-rose-200 bg-white p-3.5 shadow-2xs">
          <div className="text-xs font-bold text-charcoal-900">Накопительные санкции за дисквалификацию (РКФ):</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs">
            {DISQUALIFICATION_RULES.map((d) => (
              <div key={d.step} className="rounded-lg border border-old-money-200 bg-old-money-50/50 p-2.5">
                <div className="font-semibold text-charcoal-900">{d.step}:</div>
                <div className="font-medium text-rose-800 mt-0.5">{d.sanction}</div>
                <p className="mt-0.5 text-[11px] text-charcoal-600 leading-snug">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* 7. Ключевые регламенты чтения протоколов */}
      <SectionCard title="Памятка участника: правила чтения протоколов">
        <div className="grid gap-3 sm:grid-cols-2">
          {PROTOCOL_REQUIREMENTS.map((req) => (
            <div
              key={req.label}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="text-[11px] font-bold uppercase tracking-wider text-camel-800">
                {req.label}
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-charcoal-700">
                {req.text}
              </p>
              <RefTag>{req.ref}</RefTag>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 8. Словарь сокращений */}
      <SectionCard title="Словарь обозначений в протоколах">
        <p className="text-xs text-charcoal-600">
          Выберите обозначение оценки, статуса или судейского критерия, чтобы увидеть его расшифровку:
        </p>
        <AbbreviationsDropdown
          rows={PROTOCOL_ABBREVIATIONS}
          refTag={<RefTag>Правила проведения состязаний борзых РКФ · разд. IV, VI, VII</RefTag>}
        />
      </SectionCard>

      {/* 9. Официальные первоисточники */}
      <SectionCard title="Официальные первоисточники и регламенты">
        <p className="text-xs text-charcoal-600">
          Нормативные документы РКФ и FCI, определяющие правила судейства и оформления протоколов:
        </p>
        <OfficialSourcesList sources={PROTOCOL_OFFICIAL_SOURCES} />
      </SectionCard>

      {/* 10. Частые вопросы */}
      <SectionCard title="Частые вопросы о чтении протоколов">
        <dl className="space-y-3 sm:space-y-3.5">
          {GUIDE_PROTOCOL_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <dt className="text-xs font-bold text-charcoal-900 sm:text-sm">{faq.question}</dt>
              <dd className="mt-1.5 text-xs leading-relaxed text-charcoal-700 sm:text-sm">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </SectionCard>
    </div>
  )
}
