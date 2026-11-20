import { FileText, Trophy, Award, CheckCircle2 } from 'lucide-react'
import {
  SPORT_TIER_CERTIFICATES,
  SPORT_TIER_ANNUAL_EVENTS,
  SPORT_TIER_CUMULATIVE,
  NATIONAL_CHAMPION_VARIANTS,
} from '../../../constants'
import { RefTag, SectionCard, TitleLadderList } from '../../GuideUi'

export function TitlesHierarchySection() {
  return (
    <div id="sec-hierarchy">
      <SectionCard id="titles" title="Иерархия спортивных сертификатов и титулов РКФ">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          Все спортивные награды борзых выстроены в естественном порядке от первой квалификационной книжки до высших званий (клик по строке раскроет условия и правила):
        </p>

        <div className="space-y-4 pt-1">
          {/* 1. Допуск и сертификаты */}
          <div className="rounded-xl border border-old-money-200 bg-cream-50/40 p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-old-money-200 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-old-money-100 text-charcoal-800">
                <FileText className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                  1. Базовый старт: беговой допуск и сертификаты состязаний
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Зарабатываются непосредственно в поле или на треке по результатам забегов
                </p>
              </div>
            </div>

            <div className="mt-3">
              <TitleLadderList items={SPORT_TIER_CERTIFICATES} />
            </div>
          </div>

          {/* 2. Главные турниры года */}
          <div className="rounded-xl border border-amber-300/80 bg-amber-50/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-amber-200 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-200 text-amber-900">
                <Trophy className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                  2. Главные турниры года: победы в финалах
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Разыгрываются 1 раз в год. Присуждаются исключительно за 1-е место при норме от 75% баллов
                </p>
              </div>
            </div>

            <div className="mt-3">
              <TitleLadderList items={SPORT_TIER_ANNUAL_EVENTS} />
            </div>
          </div>

          {/* 3. Накопительные карьерные титулы */}
          <div className="rounded-xl border border-camel-300 bg-camel-50/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 border-b border-camel-200 pb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-camel-200 text-camel-900">
                <Award className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-900">
                  3. Накопительные титулы стабильности и мультиспорт
                </h3>
                <p className="text-[11px] text-charcoal-500">
                  Оформляются по сумме побед за карьеру или за объединение спорта и выставок
                </p>
              </div>
            </div>

            <div className="mt-3">
              <TitleLadderList items={SPORT_TIER_CUMULATIVE} />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export function TitleSchemesSection() {
  return (
    <div id="sec-schemes">
      <SectionCard id="schemes" title="6 схем оформления титула «Национальный чемпион по РК» (НЧ РК)">
        <p className="text-xs text-charcoal-600 sm:text-sm">
          С 15.12.2022 титул Чемпиона России набором сертификатов больше не оформляется — вместо него присваивается накопительный титул <strong>НЧ РК</strong> по одной из 6 схем на выбор:
        </p>

        <div className="grid gap-2.5 sm:grid-cols-2 pt-1">
          {NATIONAL_CHAMPION_VARIANTS.map((v, idx) => (
            <div
              key={v.combo}
              className="rounded-xl border border-old-money-200 bg-white p-3.5 shadow-2xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-old-money-100 pb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-charcoal-900">
                  <CheckCircle2 className="h-3.5 w-3.5 text-camel-600 shrink-0" aria-hidden />
                  Схема {idx + 1}
                </span>
                <span className="rounded bg-old-money-100 px-2 py-0.5 text-[10px] font-semibold text-charcoal-700">
                  {v.judges}
                </span>
              </div>
              <div className="mt-2 font-mono text-xs font-bold text-camel-900">{v.combo}</div>
              <p className="mt-1 text-[11px] text-charcoal-600">{v.notes}</p>
            </div>
          ))}
        </div>
        <RefTag>Положение РКФ о порядке присвоения титулов по состязаниям, п. 3.3.1</RefTag>
      </SectionCard>
    </div>
  )
}
