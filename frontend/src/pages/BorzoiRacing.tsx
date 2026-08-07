import { SEO } from '../components/SEO'
import { JsonLd, breadcrumbListSchema } from '../components/JsonLd'
import { useYandexGoal } from '../components/YandexMetrica'
import { Link } from 'react-router-dom'

function BorzoiRacing() {
  const { reachGoal } = useYandexGoal()

  useEffect(() => {
    reachGoal('borzoi_racing_view')
  }, [reachGoal])

  return (
    <div className="space-y-6 px-4 pb-4">
      <SEO
        title="Бега борзых — соревнования, правила и статистика"
        description="Бега борзых (coursing): официальные соревнования, правила, статистика и рекорды. Рейтинги борзых по скорости и результатам. Руководство для участников."
        canonicalUrl="https://coursing-stats.ru/borzoi-racing"
        keywords="бега борзых, курсинг, соревнования борзых, правила курсинга, статистика бега, рекорды скорости борзых"
        enableAIGeneration={true}
        enableRussianKeywords={true}
        aiGenerationData={{
          type: 'page',
          data: {
            context: 'Бега борзых (coursing): официальные соревнования, правила, статистика и рекорды. Рейтинги борзых по скорости и результатам.'
          }
        }}
      />
      <JsonLd data={breadcrumbListSchema([
        { name: 'Главная', url: '/' },
        { name: 'Бега борзых', url: '/borzoi-racing' }
      ])} />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 dark:text-cream-50 mb-4">
            Бега борзых — соревнования и статистика
          </h1>
          <p className="text-lg text-charcoal-700 dark:text-cream-200">
            Полная информация о соревнованиях по бегам борзых (coursing): правила, статистика, рейтинги и рекорды.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-cream-50 dark:bg-charcoal-800 p-6 rounded-xl border border-cream-200 dark:border-charcoal-700">
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-cream-50 mb-3">
              О бегах борзых
            </h2>
            <p className="text-charcoal-700 dark:text-cream-200 mb-4">
              Бега борзых (coursing) — это официальные соревнования, в которых борзые преследуют механическую приманку. Это безопасный и гуманный способ проявить естественные инстинкты собак.
            </p>
            <Link 
              to="/competitions?tab=ranking"
              className="inline-block px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
            >
              Смотреть рейтинги
            </Link>
          </div>

          <div className="bg-cream-50 dark:bg-charcoal-800 p-6 rounded-xl border border-cream-200 dark:border-charcoal-700">
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-cream-50 mb-3">
              Рекорды скорости
            </h2>
            <p className="text-charcoal-700 dark:text-cream-200 mb-4">
              Официальные рекорды замера скорости борзых на полигона Курсинг Донино. Рейтинги по породам и история рекордов.
            </p>
            <Link 
              to="/speed-records"
              className="inline-block px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
            >
              Смотреть рекорды
            </Link>
          </div>
        </div>

        <div className="bg-cream-50 dark:bg-charcoal-800 p-6 rounded-xl border border-cream-200 dark:border-charcoal-700">
          <h2 className="text-xl font-semibold text-charcoal-900 dark:text-cream-50 mb-3">
            Правила и регламент
          </h2>
          <p className="text-charcoal-700 dark:text-cream-200 mb-4">
            Соревнования проводятся согласно официальному регламенту РКФ по бегам борзых за механическую приманку. Основные дисциплины: курсинг на 400-800 м и бега на 350 м.
          </p>
          <Link 
            to="/guide"
            className="inline-block px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
            >
              Справочник
            </Link>
        </div>

        <div className="bg-cream-50 dark:bg-charcoal-800 p-6 rounded-xl border border-cream-200 dark:border-charcoal-700">
          <h2 className="text-xl font-semibold text-charcoal-900 dark:text-cream-50 mb-3">
            Породы-участницы
          </h2>
          <p className="text-charcoal-700 dark:text-cream-200 mb-4">
            Основные породы в бегах борзых: грейхаунд, уиппет, салюки, тайган, русская псовая борзая, deerhound и другие борзые породы.
          </p>
          <Link 
            to="/competitions?tab=ranking"
            className="inline-block px-4 py-2 bg-camel-600 text-white rounded-lg hover:bg-camel-700 transition-colors"
            >
              Все породы
            </Link>
        </div>
      </div>
    </div>
  )
}

export default BorzoiRacing