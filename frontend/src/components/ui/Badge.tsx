import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  tone?: 'coursing' | 'bzmp' | 'racing' | 'other' | 'gold' | 'neutral' | 'danger'
  className?: string
}

export default function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold'
  
  const toneClasses = {
    coursing: 'bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300',
    bzmp: 'bg-warm-blue-100 dark:bg-warm-blue-900 text-warm-blue-700 dark:text-warm-blue-300',
    racing: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
    other: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
    gold: 'bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-300',
    neutral: 'bg-old-money-100 dark:bg-charcoal-700 text-old-money-700 dark:text-charcoal-200',
    danger: 'bg-terra-100 dark:bg-terra-900 text-terra-700 dark:text-terra-300',
  }
  
  return (
    <span className={`${baseClasses} ${toneClasses[tone]} ${className}`}>
      {children}
    </span>
  )
}
