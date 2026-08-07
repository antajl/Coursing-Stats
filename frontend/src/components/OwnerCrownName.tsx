import type { ReactNode } from 'react'
import { hasOwnerCrown } from '../lib/ownerMarks'

interface OwnerCrownNameProps {
  children: ReactNode
  name: string
  breed?: string
  dogId?: number | null
  kind: 'donino' | 'competition'
  className?: string
}

/** Личная метка владельца: лёгкий перелив цвета на кличке (без иконки). */
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

  return <span className={`owner-mark-name ${className}`.trim()}>{children}</span>
}
