import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({ children, variant = 'primary', onClick, className = '', type = 'button' }: ButtonProps) {
  const baseClasses = 'rounded-xl font-semibold transition-all duration-300'
  
  const variantClasses = {
    primary: 'bg-camel-600 dark:bg-camel-700 text-white hover:bg-camel-700 dark:hover:bg-camel-600',
    ghost: 'bg-transparent text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700',
    outline: 'bg-transparent border-2 border-old-money-300 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-200 hover:bg-old-money-50 dark:hover:bg-charcoal-700',
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
