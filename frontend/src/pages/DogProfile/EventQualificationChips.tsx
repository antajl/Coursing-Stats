import { renderQualificationChips } from '../../lib/awardChipRender'

export function EventQualificationChips({ qualification }: { qualification?: string | null }) {
  const chips = renderQualificationChips(qualification)
  if (!chips) return null

  return <div className="mt-1.5 flex flex-wrap items-center gap-1">{chips}</div>
}
