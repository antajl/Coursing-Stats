import { SEO } from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
      />
      <div className="min-h-screen bg-gradient-to-br from-old-money-50 via-old-money-100 to-old-money-200 dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <img 
            src="/assets/404-dogs.svg" 
            alt="Силуэты борзых" 
            className="w-full h-auto"
          />
        </div>
      </div>
    </>
  )
}
