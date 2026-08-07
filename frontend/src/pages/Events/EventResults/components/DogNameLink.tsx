import { parseDogName } from '../../../../lib/dogName'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result } from '../types'

interface DogNameLinkProps {
  result: Result
}

export default function DogNameLink({ result }: DogNameLinkProps) {
  const { primary, secondary } = parseDogName(result.name_lat, result.name_ru)
  const sexIcon = result.dog.sex_icon || ''
  const sexLabel = result.dog.sex === 'Кобель' ? 'Кобель' : 'Сука'

  const nameElement = (
    <span className="min-w-0 break-words text-sm font-medium text-old-money-800 dark:text-old-money-300 md:text-base">
      {primary}
    </span>
  )

  if (secondary) {
    return (
      <div className="flex items-center gap-1.5">
        <HoverTooltip label={secondary} placement="top" variant="site" delayMs={0} portal>
          <div className="flex items-center gap-1.5 cursor-help">
            {nameElement}
            {sexIcon && (
              <HoverTooltip label={sexLabel} placement="top" variant="site" delayMs={0} portal>
                <span className="text-sm opacity-70 cursor-help">{sexIcon}</span>
              </HoverTooltip>
            )}
          </div>
        </HoverTooltip>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {nameElement}
      {sexIcon && (
        <HoverTooltip label={sexLabel} placement="top" variant="site" delayMs={0} portal>
          <span className="text-sm opacity-70 cursor-help">{sexIcon}</span>
        </HoverTooltip>
      )}
    </div>
  )
}
