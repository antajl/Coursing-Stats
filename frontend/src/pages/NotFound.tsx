import { SEO } from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
      />
      <div className="h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900 flex flex-col items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-4xl mb-8">
          <img 
            src="/assets/404-dogs.svg" 
            alt="Силуэты борзых" 
            className="w-full h-auto opacity-40 dark:opacity-30"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-old-money-400 dark:text-charcoal-500 opacity-60">
          Страница не найдена
        </h1>
      </div>
    </>
  )
}
