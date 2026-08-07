import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useDarkMode } from '../hooks/useDarkMode'
import { useEffect } from 'react'

export default function NotFound() {
  const isDark = useDarkMode()

  useEffect(() => {
    // Hide scrollbar on body when 404 is shown
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
      />
      <div className="fixed inset-0 z-40 overflow-hidden bg-om-50 dark:bg-charcoal-900">
        <div className="absolute top-16 left-0 right-0 bottom-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">404</h1>
            <p className="text-xl text-charcoal-600 dark:text-charcoal-400">Страница не найдена</p>
          </div>
        </div>
      </div>
    </>
  )
}
