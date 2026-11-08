import { useState } from 'react'
import { Award, ChevronRight, Crown, Layers, Medal, Ribbon, Sparkles, Trophy } from 'lucide-react'
import {
  SHOW_ABBREVIATIONS,
  SHOW_CAREER_TITLES,
  SHOW_CLASSES,
  SHOW_GRADES,
  SHOW_OFFICIAL_SOURCES,
  SHOW_RANKS,
  SHOW_REQUIREMENTS,
  SHOW_RING_AWARDS,
} from '../showConstants'
import { GUIDE_SHOWS_FAQS } from '../guideFaqs'
import {
  AbbreviationsDropdown,
  OfficialSourcesList,
  RefTag,
  SectionCard,
  TitleLadderList,
} from './GuideUi'

export default function ShowsTab() {
  const [mode, setMode] = useState<'ring' | 'titles'>('ring')

  return (
    <div className="space-y-6">
      {/* Сегментированный переключатель разделов выставки */}
      <div className="flex items-center justify-between flex-wrap gap-2 rounded-xl border border-old-money-200 bg-white p-2 shadow-2xs">
        <div className="text-xs font-bold text-charcoal-900 px-2">Раздел справки по выставкам:</div>
        <div className="inline-flex rounded-lg bg-old-money-100 p-0.5">
          <button
            type="button"
            onClick={() => setMode('ring')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mode === 'ring'
                ? 'bg-white text-camel-950 shadow-2xs font-bold'
                : 'text-charcoal-700 hover:text-charcoal-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-camel-700" aria-hidden />
            <span>В ринге одного дня (CW → BIS)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('titles')}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              mode === 'titles'
                ? 'bg-white text-camel-950 shadow-2xs font-bold'
                : 'text-charcoal-700 hover:text-charcoal-900'
            }`}
          >
            <Crown className="h-3.5 w-3.5 text-camel-700" aria-hidden />
            <span>Титулы в родословную (ЧР / FCI)</span>
          </button>
        </div>
      </div>

      {mode === 'ring' ? (
        <>
          {/* 1. Пошаговый роадмап ринга одного дня */}
          <SectionCard title="Роадмап выставки: путь от класса до Best in Show">
            <p className="text-xs text-charcoal-600">
              Как устроена последовательность сравнений на выставке РКФ одного дня:
            </p>

            <div className="grid gap-2 sm:grid-cols-5 pt-1">
              <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  Шаг 1 · Класс
                </div>
                <div className="mt-1 text-sm font-bold text-charcoal-900">CW (Победитель)</div>
                <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
                  1-е место в своём классе с высшей оценкой «отлично».
                </p>
              </div>

              <div className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                  Шаг 2 · Сертификат
                </div>
                <div className="mt-1 text-sm font-bold text-camel-900">CAC / CACIB</div>
                <p className="mt-1 text-[11px] text-charcoal-600 leading-snug">
                  Сравнение победителей взрослых классов между кобелями и суками.
                </p>
              </div>

              <div className="rounded-xl border border-camel-200 bg-camel-50/50 p-3 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-camel-800">
                  Шаг 3 · Порода
                </div>
                <div className="mt-1 text-sm font-bold text-charcoal-900">BOB (ЛПП) / BOS</div>
                <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
                  Сравнение лучшего юниора, кобеля, суки и ветерана за звание лучшего в породе.
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                  Шаг 4 · Группа FCI
                </div>
                <div className="mt-1 text-sm font-bold text-charcoal-900">BIG (Best in Group)</div>
                <p className="mt-1 text-[11px] text-charcoal-700 leading-snug">
                  Главный ринг: сравнение всех обладателей BOB 10-й группы борзых.
                </p>
              </div>

              <div className="rounded-xl border border-camel-300 bg-linear-to-b from-camel-100/70 to-cream-50 p-3 shadow-2xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-camel-900">
                  Шаг 5 · Финал
                </div>
                <div className="mt-1 text-sm font-bold text-camel-950">BIS (Best in Show)</div>
                <p className="mt-1 text-[11px] text-camel-900 leading-snug">
                  Суперфинал дня: выбор абсолютно лучшей собаки всей выставки.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* 2. Награды ринга одного дня с очками сайта */}
          <SectionCard title="Награды ринга одного дня (ценность и очки рейтинга)">
            <p className="text-xs text-charcoal-600">
              Иерархия наград на одной выставке и точные веса очков в рейтинге сайта Coursing Stats (клик раскроет подробности):
            </p>

            <TitleLadderList items={SHOW_RING_AWARDS} />
          </SectionCard>

          {/* 3. Выставочные классы собак по возрасту */}
          <SectionCard title="Выставочные классы и возрастные рамки">
            <p className="text-xs text-charcoal-600">
              Официальные половозрастные классы по Положению о сертификатных выставках РКФ:
            </p>

            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 pt-1">
              {SHOW_CLASSES.map((cls) => (
                <div
                  key={cls.name}
                  className="rounded-xl border border-old-money-200 bg-white p-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1 border-b border-old-money-100 pb-1.5">
                    <span className="text-xs font-bold text-charcoal-900">{cls.name}</span>
                    <span className="rounded bg-camel-100 px-1.5 py-0.5 text-[10px] font-bold text-camel-900">
                      {cls.age}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-camel-800">
                    Награды: {cls.certs}
                  </div>
                  <p className="mt-1 text-[11px] leading-snug text-charcoal-600">{cls.note}</p>
                </div>
              ))}
            </div>
            <RefTag>Положение о сертификатных выставках РКФ, п. 8.2</RefTag>
          </SectionCard>

          {/* 4. Оценки и цвета наградных лент */}
          <SectionCard title="Шкала оценок в ринге и цвета наградных лент РКФ">
            <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
              {SHOW_GRADES.map((g) => (
                <div
                  key={g.grade}
                  className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-2">
                    <div>
                      <span className="text-xs font-bold text-charcoal-900">{g.grade}</span>{' '}
                      <span className="text-[11px] text-charcoal-500">({g.en})</span>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold shadow-2xs ${g.ribbonClass}`}>
                      {g.ribbonColor}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-charcoal-700">{g.desc}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 5. Ранги выставок РКФ */}
          <SectionCard title="Ранги сертификатных выставок в системе РКФ">
            <p className="text-xs text-charcoal-600">
              Ранг выставки определяет статус присуждаемых сертификатов и правила их распределения:
            </p>

            <div className="space-y-2.5 pt-1">
              {SHOW_RANKS.map((r) => (
                <div
                  key={r.rank}
                  className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-camel-100 px-2 py-0.5 font-mono text-xs font-bold text-camel-900">
                        {r.rank}
                      </span>
                      <span className="text-xs font-bold text-charcoal-900">{r.scope}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-charcoal-600">{r.certs}</p>
                  </div>
                  <span className="shrink-0 self-start sm:self-center rounded-md border border-old-money-200 bg-cream-50 px-2.5 py-1 text-[10px] font-semibold text-charcoal-700">
                    {r.highlight}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      ) : (
        <>
          {/* 1. Карьерные титулы в родословную (Дипломы РКФ и FCI) */}
          <SectionCard title="Пожизненные чемпионские титулы в родословную">
            <p className="text-xs text-charcoal-600">
              Титулы, которые официально регистрируются в РКФ и вносятся в родословные потомков по набору сертификатов:
            </p>

            <TitleLadderList items={SHOW_CAREER_TITLES} />
          </SectionCard>

          {/* 2. Ключевые регламенты (Памятка участника) */}
          <SectionCard title="Памятка участника: регламент и правила выставок">
            <div className="grid gap-3 sm:grid-cols-2">
              {SHOW_REQUIREMENTS.map((req) => (
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

          {/* 3. Словарь сокращений */}
          <SectionCard title="Словарь сокращений выставочных протоколов">
            <p className="text-xs text-charcoal-600">
              Выберите официальное сокращение титула или сертификата, чтобы увидеть его расшифровку:
            </p>
            <AbbreviationsDropdown
              rows={SHOW_ABBREVIATIONS}
              refTag={
                <RefTag>
                  Положение о сертификатных выставках РКФ · Список титулов и принятые сокращения в родословных РКФ
                </RefTag>
              }
            />
          </SectionCard>

          {/* 4. Официальные первоисточники */}
          <SectionCard title="Официальные первоисточники и регламенты">
            <p className="text-xs text-charcoal-600">
              Нормативные документы РКФ и FCI, регламентирующие выставочные правила и присвоение титулов:
            </p>
            <OfficialSourcesList sources={SHOW_OFFICIAL_SOURCES} />
          </SectionCard>

          {/* 5. Частые вопросы */}
          <SectionCard title="Частые вопросы о выставках">
            <dl className="space-y-3 sm:space-y-3.5">
              {GUIDE_SHOWS_FAQS.map((faq) => (
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
        </>
      )}
    </div>
  )
}
