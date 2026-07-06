import type { ReactNode } from 'react'
import { Crown } from 'lucide-react'
import { hasOwnerCrown } from '../lib/ownerMarks'

interface OwnerCrownNameProps {
  children: ReactNode
  name: string
  breed?: string
  dogId?: number | null
  kind: 'donino' | 'competition'
  className?: string
}

export default function OwnerCrownName({
  children,
  name,
  breed,
  dogId,
  kind,
  className = '',
}: OwnerCrownNameProps) {
  if (!hasOwnerCrown(kind, { name, breed, dogId })) {
    return <>{children}</>
  }

  return (
    <span className={`owner-crown-name ${className}`.trim()}>
      <Crown className="owner-crown-name__icon" aria-hidden strokeWidth={2.25} />
      {children}
    </span>
  )
}
