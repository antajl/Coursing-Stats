import { Link } from 'react-router-dom'
import { SEO } from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена. Возможно, собака убежала за приманкой в другом направлении."
        keywords="404, страница не найдена, курсинг, борзые"
      />
      <div className="min-h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900 flex items-center justify-center p-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Эмодзи собаки */}
          <div className="mb-8">
            <div className="text-8xl">🐕</div>
          </div>

          {/* Заголовок */}
          <h1 className="text-6xl md:text-8xl font-bold text-camel-600 dark:text-camel-400 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-semibold text-charcoal-900 dark:text-charcoal-100 mb-4">
            Собака убежала за приманкой!
          </h2>
          
          <p className="text-lg text-old-money-600 dark:text-old-money-400 mb-8 max-w-md mx-auto">
            Страница, которую вы ищете, не найдена.
          </p>
        </div>
      </div>
    </>
  )
}
