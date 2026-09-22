import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'coursing' | 'bzmp' | 'racing' | 'other' | 'gold' | 'neutral' | 'danger'
  className?: string
}

export default function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold'
  
  const toneClasses = {
    coursing: 'bg-forest-100 text-forest-700',
    bzmp: 'bg-warm-blue-100 text-warm-blue-700',
    racing: 'bg-rose-100 text-rose-700',
    other: 'bg-amber-100 text-amber-700',
    gold: 'bg-camel-100 text-camel-700',
    neutral: 'bg-old-money-100 text-old-money-700',
    danger: 'bg-terra-100 text-terra-700',
  }
  
  return (
    <span className={`${baseClasses} ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  )
}
