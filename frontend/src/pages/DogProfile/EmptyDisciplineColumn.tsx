import {
  DisciplineColumnShell,
  DisciplineStatsCard,
  disciplineTheme,
  type DisciplineTheme,
} from './DisciplineColumnShell'

type EmptyDisciplineColumnProps = {
  title: string
  theme: DisciplineTheme
}

/** Заглушка той же формы, что и заполненные колонки — без растягивания соседей. */
export function EmptyDisciplineColumn({ title, theme }: EmptyDisciplineColumnProps) {
  const t = disciplineTheme(theme)
  return (
    <DisciplineColumnShell>
      <DisciplineStatsCard theme={theme} title={title}>
        <div className="flex h-full flex-col justify-between gap-3">
          {/* Верх: Подиум / Рейтинг — внутренняя структура идентична заполненному подиуму для точной высоты */}
          <div
            className={`shrink-0 rounded-xl border border-dashed p-3 ${t.cellBorder} ${t.cellBg} opacity-50`}
          >
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="h-8 w-8 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold xl:text-base leading-tight select-none opacity-0">
                    &nbsp;
                  </div>
                  <div className="text-[11px] leading-tight mt-0.5 select-none opacity-0">
                    &nbsp;
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Центр: Главный результат — flex-1 автоматически заполняет ту же высоту */}
          <div
            className={`flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed p-3 text-center ${t.heroBorder} ${t.heroBg}`}
          >
            <p className="text-sm font-medium text-old-money-500">данных нет</p>
          </div>

          {/* Низ: 2 карточки показателей — внутренняя структура идентична заполненным карточкам метрик */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs shrink-0">
            <div
              className={`rounded-lg border border-dashed p-2 ${t.cellBorder} ${t.cellBg} opacity-50`}
            >
              <div className="text-[10px] uppercase mb-0.5 select-none opacity-0">&nbsp;</div>
              <div className="text-sm sm:text-base font-bold select-none opacity-0">&nbsp;</div>
            </div>
            <div
              className={`rounded-lg border border-dashed p-2 ${t.cellBorder} ${t.cellBg} opacity-50`}
            >
              <div className="text-[10px] uppercase mb-0.5 select-none opacity-0">&nbsp;</div>
              <div className="text-sm sm:text-base font-bold select-none opacity-0">&nbsp;</div>
            </div>
          </div>
        </div>
      </DisciplineStatsCard>
    </DisciplineColumnShell>
  )
}
