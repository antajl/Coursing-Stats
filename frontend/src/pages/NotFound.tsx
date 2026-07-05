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
          {/* Анимированная приманка */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto relative">
              <div className="absolute inset-0 bg-camel-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute inset-2 bg-camel-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-4 bg-camel-600 rounded-full flex items-center justify-center">
                <span className="text-4xl">🐕</span>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-dashed border-camel-400 rounded-full animate-spin"></div>
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

          {/* Интересные факты о курсинге */}
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl p-6 mb-8 shadow-lg border-2 border-old-money-200 dark:border-charcoal-600">
            <p className="text-sm text-old-money-600 dark:text-old-money-400 mb-2">
              🎯 Знаете ли вы, что в курсинге борзые оцениваются по 5 критериям?
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <span className="px-3 py-1 bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-300 rounded-full">Маневренность</span>
              <span className="px-3 py-1 bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-300 rounded-full">Резвость</span>
              <span className="px-3 py-1 bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-300 rounded-full">Выносливость</span>
              <span className="px-3 py-1 bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-300 rounded-full">Преследование</span>
              <span className="px-3 py-1 bg-camel-100 dark:bg-camel-900 text-camel-700 dark:text-camel-300 rounded-full">Энтузиазм</span>
            </div>
          </div>

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

          {/* Декоративный элемент */}
          <div className="mt-12 text-old-money-500 dark:text-old-money-400 text-sm">
            <p>🏃‍♂️ Приманка всегда убегает вперёд — это суть курсинга!</p>
          </div>
        </div>
      </div>
    </>
  )
}
