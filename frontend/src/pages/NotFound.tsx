import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'
import { useDarkMode } from '../hooks/useDarkMode'

export default function NotFound() {
  const isDark = useDarkMode()

  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
      />
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900 z-50 overflow-hidden">
        <div className="w-full max-w-4xl p-8 rounded-2xl border-2 border-camel-200 dark:border-camel-800 bg-white/50 dark:bg-charcoal-800/50 backdrop-blur-sm shadow-xl">
          <div className="w-full mb-6 max-h-[50vh]">
            <img 
              src={isDark ? '/assets/404-dogs-dark.svg' : '/assets/404-dogs-light.svg'} 
              alt="Силуэты борзых" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center" style={{ color: isDark ? '#d97706' : '#78350f' }}>
            Страница не найдена
          </h1>
        </div>
        <div className="flex justify-center mt-6">
          <Link
            to="/"
            className="px-6 py-2 border-2 rounded-lg font-semibold transition-all hover:bg-camel-50 dark:hover:bg-charcoal-700"
            style={{ borderColor: isDark ? '#d97706' : '#78350f', color: isDark ? '#d97706' : '#78350f' }}
          >
            На главную
          </Link>
        </div>
      </div>
    </>
  )
}
