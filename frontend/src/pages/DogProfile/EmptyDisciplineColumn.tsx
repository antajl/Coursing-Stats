import {
  DisciplineColumnShell,
  DisciplineStatsCard,
  type DisciplineTheme,
} from './DisciplineColumnShell'

type EmptyDisciplineColumnProps = {
  title: string
  theme: DisciplineTheme
}

/** Заглушка той же компактной структуры, что и заполненные карточки дисциплин. */
export function EmptyDisciplineColumn({ title, theme }: EmptyDisciplineColumnProps) {
  return (
    <DisciplineColumnShell>
      <DisciplineStatsCard theme={theme} title={title}>
        <div className="flex flex-1 flex-col divide-y divide-old-money-100">
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-cream-50/40">
            <span className="text-xs text-old-money-400 select-none">&nbsp;</span>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center px-3.5 py-5 text-center">
            <p className="text-sm font-medium text-old-money-500">данных нет</p>
          </div>

          <div className="grid grid-cols-2 divide-x divide-old-money-100 bg-cream-50/50 px-2 py-2 text-center text-xs">
            <div className="px-2">
              <div className="text-[10px] uppercase select-none opacity-0">&nbsp;</div>
              <div className="text-sm font-bold select-none opacity-0">&nbsp;</div>
            </div>
            <div className="px-2">
              <div className="text-[10px] uppercase select-none opacity-0">&nbsp;</div>
              <div className="text-sm font-bold select-none opacity-0">&nbsp;</div>
            </div>
          </div>
        </div>
      </DisciplineStatsCard>
    </DisciplineColumnShell>
  )
}
