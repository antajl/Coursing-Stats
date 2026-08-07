import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const shouldBeDark = savedTheme === 'dark'
    
    setIsDark(shouldBeDark)
    
    // Apply class to html element
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    // Apply class to html element
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-11 h-11 border-2 border-old-money-300 dark:border-charcoal-600 rounded-lg bg-old-money-50 dark:bg-charcoal-800 hover:bg-old-money-100 dark:hover:bg-charcoal-700 transition-colors flex items-center justify-center"
      aria-label={isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
    >
      {isDark ? (
        // Sun icon (dark mode active, show sun to switch to light)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-camel-600 dark:text-camel-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon (light mode active, show moon to switch to dark)
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-old-money-700 dark:text-charcoal-200"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}
