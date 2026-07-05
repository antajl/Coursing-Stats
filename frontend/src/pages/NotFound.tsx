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
            Страница, которую вы ищете, не найдена. Возможно, она на другом участке трассы или уже завершила забег.
          </p>

          {/* Кнопки навигации */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-camel-600 hover:bg-camel-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              На главную
            </Link>
            <Link
              to="/competitions"
              className="px-6 py-3 bg-white dark:bg-charcoal-800 text-camel-700 dark:text-camel-300 font-semibold rounded-xl border-2 border-camel-300 dark:border-camel-600 hover:bg-camel-50 dark:hover:bg-charcoal-700 transition-all"
            >
              К соревнованиям
            </Link>
            <Link
              to="/dogs"
              className="px-6 py-3 bg-white dark:bg-charcoal-800 text-camel-700 dark:text-camel-300 font-semibold rounded-xl border-2 border-camel-300 dark:border-camel-600 hover:bg-camel-50 dark:hover:bg-charcoal-700 transition-all"
            >
              К собакам
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
