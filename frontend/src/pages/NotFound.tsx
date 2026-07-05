import { SEO } from '../components/SEO'

export default function NotFound() {
  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
      />
      <div className="flex flex-col items-center justify-center p-4 pt-12 h-screen overflow-hidden">
        <div className="w-full max-w-4xl mb-8">
          <img 
            src="/assets/404-dogs.svg" 
            alt="Силуэты борзых" 
            className="w-full h-auto"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-old-money-400 dark:text-charcoal-500">
          Страница не найдена
        </h1>
      </div>
    </>
  )
}
