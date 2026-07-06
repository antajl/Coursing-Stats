import { useEffect, useRef, useState } from 'react'

interface StatCounterProps {
  value: number
  className?: string
}

export default function StatCounter({ value, className = '' }: StatCounterProps) {
  const [count, setCount] = useState(value)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hasSetInitial = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    if (value <= 0) {
      setCount(0)
      hasSetInitial.current = true
      return
    }

    if (!hasSetInitial.current) {
      setCount(value)
      hasSetInitial.current = true
      return
    }

    const duration = 1500
    const steps = 60
    const stepValue = value / steps
    let current = count

    const timer = setInterval(() => {
      current += stepValue
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, value])

  return (
    <div ref={ref} className={className}>
      {count.toLocaleString('ru-RU')}
    </div>
  )
}
