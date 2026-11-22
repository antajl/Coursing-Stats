import React from 'react'
import type { BreedCardProps, BreedCardDesignVariant, BreedStatsData } from './BreedCard/types'
import { BreedCardPassport } from './BreedCard/BreedCardPassport'
import { BreedCardShowcase } from './BreedCard/BreedCardShowcase'
import { BreedCardEditorial } from './BreedCard/BreedCardEditorial'
import { BreedCardLegacy } from './BreedCard/BreedCardLegacy'

export type { BreedCardProps, BreedCardDesignVariant, BreedStatsData }

export default function BreedCard(props: BreedCardProps) {
  const layout = props.layoutVariant || 'passport'

  switch (layout) {
    case 'showcase':
      return <BreedCardShowcase {...props} />
    case 'editorial':
      return <BreedCardEditorial {...props} />
    case 'legacy':
      return <BreedCardLegacy {...props} />
    case 'passport':
    default:
      return <BreedCardPassport {...props} />
  }
}
