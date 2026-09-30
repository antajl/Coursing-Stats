import { parseDogName } from '../../../../lib/dogName'
import HoverTooltip from '../../../../components/ui/HoverTooltip'
import type { Result } from '../types'

interface DogNameLinkProps {
  result: Result
}

export default function DogNameLink({ result }: DogNameLinkProps) {
  const { primary, secondary } = parseDogName(result.name_lat, result.name_ru)
  
  // Generate sex icon from sex field if not already present
  const sex = result.dog?.sex || ''
  const sexIcon = result.dog?.sex_icon || (sex === 'Кобель' ? '♂' : sex === 'Сука' ? '♀' : '')
  const sexLabel = sex === 'Кобель' ? 'Кобель' : sex === 'Сука' ? 'Сука' : ''
  
  // Extract class from breed_class (format: "Порода - Класс")
  const breedClass = result.breed_class || ''
  const parts = breedClass.split(' - ')
  const className = parts.length >= 2 ? parts[1] : ''

  const nameElement = (
    <span className="min-w-0 break-words text-sm font-medium text-old-money-800 md:text-base">
      {primary}
    </span>
  )

  if (secondary) {
    return (
      <div className="flex items-center gap-1.5">
        <HoverTooltip label={secondary} placement="top" variant="site" delayMs={0} portal>
          <div className="flex items-center gap-1.5 cursor-help">
            {nameElement}
            <div className="flex items-center gap-1.5 text-xs text-old-money-600">
              {sexIcon && (
                <HoverTooltip label={sexLabel} placement="top" variant="site" delayMs={0} portal>
                  <span className="opacity-70 cursor-help">{sexIcon}</span>
                </HoverTooltip>
              )}
              {className && <span className="opacity-60">{className}</span>}
            </div>
          </div>
        </HoverTooltip>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {nameElement}
      <div className="flex items-center gap-1.5 text-xs text-old-money-600">
        {sexIcon && (
          <HoverTooltip label={sexLabel} placement="top" variant="site" delayMs={0} portal>
            <span className="opacity-70 cursor-help">{sexIcon}</span>
          </HoverTooltip>
        )}
        {className && <span className="opacity-60">{className}</span>}
      </div>
    </div>
  )
}
