import {
  DisciplineColumnShell,
  DisciplineFooterRow,
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
        <div
          className={`mb-4 flex h-[7.25rem] shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed p-4 text-center ${t.heroBorder} ${t.heroBg}`}
        >
          <p className="text-sm font-medium text-old-money-500 dark:text-old-money-400">данных нет</p>
        </div>
        <div className="mb-4 grid shrink-0 grid-cols-2 gap-3">
          <div
            className={`min-h-[5.5rem] rounded-xl border border-dashed p-4 ${t.cellBorder} ${t.cellBg} opacity-50`}
          />
          <div
            className={`min-h-[5.5rem] rounded-xl border border-dashed p-4 ${t.cellBorder} ${t.cellBg} opacity-50`}
          />
        </div>
        <DisciplineFooterRow />
      </DisciplineStatsCard>
    </DisciplineColumnShell>
  )
}
