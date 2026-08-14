import { useCallback } from 'react'

interface KeyboardNavigationOptions {
  onEnter?: () => void
  onSpace?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  disabled?: boolean
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions) {
  const {
    onEnter,
    onSpace,
    onEscape,
    onArrowUp,
    onArrowDown,
    onArrowLeft,
    onArrowRight,
    disabled = false,
  } = options

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case 'Enter':
          e.preventDefault()
          onEnter?.()
          break
        case ' ':
        case 'Spacebar':
          e.preventDefault()
          onSpace?.()
          break
        case 'Escape':
          e.preventDefault()
          onEscape?.()
          break
        case 'ArrowUp':
          e.preventDefault()
          onArrowUp?.()
          break
        case 'ArrowDown':
          e.preventDefault()
          onArrowDown?.()
          break
        case 'ArrowLeft':
          e.preventDefault()
          onArrowLeft?.()
          break
        case 'ArrowRight':
          e.preventDefault()
          onArrowRight?.()
          break
      }
    },
    [disabled, onEnter, onSpace, onEscape, onArrowUp, onArrowDown, onArrowLeft, onArrowRight]
  )

  return { handleKeyDown }
}

export function createKeyboardAccessibleButton(
  onClick: () => void,
  ariaLabel: string
): Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onKeyDown' | 'aria-label' | 'role' | 'tabIndex'> {
  const { handleKeyDown } = useKeyboardNavigation({
    onEnter: onClick,
    onSpace: onClick,
  })

  return {
    onClick,
    onKeyDown: handleKeyDown,
    'aria-label': ariaLabel,
    role: 'button',
    tabIndex: 0,
  }
}
