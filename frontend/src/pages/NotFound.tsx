import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { SEO } from '../components/SEO'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <>
      <SEO
        title="Страница не найдена"
        description="Страница не найдена."
        keywords="404, страница не найдена"
        noIndex
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

        {/* Плавающая кнопка возврата на главную с поддержкой Safe Area на мобильных */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-8 z-50">
          <Link
            to="/"
            className="cs-glass-pill-active inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-charcoal-900 shadow-xl transition-transform active:scale-95 cursor-pointer min-h-[44px]"
            style={{
              marginBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))',
            }}
          >
            <Home className="w-4 h-4 text-camel-800" aria-hidden />
            <span>На главную</span>
          </Link>
        </div>
      </div>
    </>
  )
}
