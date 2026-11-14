import { Link } from 'react-router-dom'

const CONTACT_EMAIL = 'antajl@yandex.ru'
const DISCLAIMER =
  'Независимая статистика по открытым протоколам. Не является официальным рейтингом РКФ.'

export function HomeFooter() {
  return (
    <footer className="home-v2-foot" data-home-reveal>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs mb-2">
        <Link to="/breeds/" className="text-charcoal-700 hover:text-camel-800 font-medium hover:underline">
          Каталог пород
        </Link>
        <span className="text-cream-400 select-none">·</span>
        <Link to="/guide/" className="text-charcoal-700 hover:text-camel-800 font-medium hover:underline">
          Справочник и правила
        </Link>
        <span className="text-cream-400 select-none">·</span>
        <Link to="/about/" className="text-charcoal-700 hover:text-camel-800 font-medium hover:underline">
          О проекте
        </Link>
      </div>
      <p className="home-v2-disclaimer">{DISCLAIMER}</p>
      <p className="home-v2-contact">
        Вопросы и правки данных:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </footer>
  )
}
