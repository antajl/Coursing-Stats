import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'ghost' | 'outline'
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function Button({ children, variant = 'primary', onClick, className = '', type = 'button' }: ButtonProps) {
  const baseClasses = 'rounded-xl font-semibold transition-colors'
  
  const variantClasses = {
    primary: 'bg-camel-600 text-white hover:bg-camel-700',
    ghost: 'bg-transparent text-charcoal-700 hover:bg-old-money-50',
    outline: 'bg-transparent border-2 border-old-money-300 text-charcoal-700 hover:bg-old-money-50',
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
