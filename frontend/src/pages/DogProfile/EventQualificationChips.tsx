import { renderQualificationChips } from '../../lib/awardChipRender'

export function EventQualificationChips({
  qualification,
  inline = false,
}: {
  qualification?: string | null
  inline?: boolean
}) {
  const chips = renderQualificationChips(qualification)
  if (!chips) return null

  return (
    <div className={`${inline ? 'mt-0' : 'mt-1.5'} flex flex-wrap items-center gap-1`}>
      {chips}
    </div>
  )
}
