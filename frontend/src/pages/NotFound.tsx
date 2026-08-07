import { SEO } from '../components/SEO'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
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
      <div className="fixed inset-0 z-40 overflow-hidden">
        <picture>
          <source srcSet="/assets/errors/404-dogs-mobile.png" media="(max-width: 768px)" />
          <img
            src="/assets/errors/404-dogs.png"
            alt="Силуэты борзых"
            className="absolute top-16 left-0 right-0 bottom-0 h-full w-full object-cover"
          />
        </picture>
      </div>
    </>
  )
}
