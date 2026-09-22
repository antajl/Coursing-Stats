import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'highlight' | 'discipline'
  hover?: boolean
  className?: string
}

export default function Card({ children, variant = 'default', hover = false, className = '' }: CardProps) {
  const baseClasses = 'rounded-2xl border-2'
  
  const variantClasses = {
    default: 'bg-cream-50 border-old-money-200',
    highlight: 'bg-camel-100 border-camel-300',
    discipline: 'bg-cream-50 border-discipline',
  }
  
  const hoverClasses = hover
    ? 'cursor-pointer hover:border-camel-300 hover:bg-cream-100/80'
    : ''
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  )
}
