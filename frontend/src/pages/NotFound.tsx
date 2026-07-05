import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
      />
      <div className="fixed inset-0 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900 z-50 overflow-hidden">
        <div className="w-full max-w-4xl mb-6 max-h-[60vh]">
          <img 
            src="/assets/404-dogs.svg" 
            alt="Силуэты борзых" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-old-money-400 dark:text-charcoal-500 mb-8">
          Страница не найдена
        </h1>
        <Link
          to="/"
          className="px-8 py-3 bg-camel-600 hover:bg-camel-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          На главную
        </Link>
      </div>
    </>
  )
}
