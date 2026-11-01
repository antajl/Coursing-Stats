import { useState } from 'react'
import {
  Bot,
  Check,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  Zap,
} from 'lucide-react'
import { ExternalHref } from './Guide/components/GuideUi'
import { SEO } from '../components/SEO'

function ContactCard({
  label,
  value,
  href,
  icon: Icon,
  external,
  iconBgClass = 'bg-white text-camel-700 border-old-money-200/80',
}: {
  label: string
  value: string
  href: string
  icon: typeof Mail
  external?: boolean
  iconBgClass?: string
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-3 rounded-xl border border-old-money-200/90 bg-cream-50/50 p-3.5 transition-all hover:border-camel-300 hover:bg-cream-100/60"
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition-transform group-hover:scale-105 ${iconBgClass}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-charcoal-900 group-hover:text-camel-800">
          {value}
        </span>
      </span>
    </a>
  )
}

function DiscordContact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('antajl')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group flex w-full items-center gap-3 rounded-xl border border-old-money-200/90 bg-cream-50/50 p-3.5 text-left transition-all hover:border-camel-300 hover:bg-cream-100/60 cursor-pointer"
      title="Скопировать ник Discord"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200/80 bg-indigo-50/70 text-indigo-700 shadow-sm transition-transform group-hover:scale-105">
        <MessageCircle className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
          Discord
        </span>
        <span className="block truncate text-sm font-semibold text-charcoal-900 group-hover:text-camel-800">
          antajl
        </span>
      </span>
      {copied ? (
        <span className="flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
          <Check className="h-3 w-3 text-emerald-600" aria-hidden />
          <span>Скопировано</span>
        </span>
      ) : (
        <Copy className="h-4 w-4 shrink-0 text-charcoal-400 group-hover:text-charcoal-600" aria-hidden />
      )}
    </button>
  )
}

const DATA_SOURCES = [
  {
    name: 'Procoursing.ru',
    role: 'Специализированный портал соревнований по курсингу и круговому треку: официальные календари, составы судейских бригад и полные балльные протоколы забегов.',
    url: 'http://procoursing.ru',
  },
  {
    name: 'Российская кинологическая федерация (РКФ)',
    role: 'Главная кинологическая организация страны: официальные регламенты, единый календарь выставок всех рангов и каталоги результатов породных рингов.',
    url: 'https://rkf.org.ru/dressirovka-i-sport/polozhenija/',
  },
  {
    name: 'Беговой клуб «Курсинг в Донино» (runningdog.ru)',
    role: 'Официальные чемпионаты РКФ по курсингу и БЗМП, беговые тренировки, электронные замеры пиковой скорости (км/ч) и спринты на дистанции 350 метров.',
    url: 'https://runningdog.ru/',
  },
] as const

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-full space-y-6 pb-8">
      <SEO
        title="О проекте Coursing Stats — независимый архив соревнований и выставок собак в России"
        description="Некоммерческий электронный архив соревнований по курсингу, бегов борзых, выставок РКФ и замеров Донино в России. Профили собак, протоколы забегов и статистика."
        keywords="Coursing Stats, архив соревнований, курсинг, бега борзых, выставки собак, РКФ, протоколы, Донино, рейтинг борзых, Россия"
        canonicalUrl="https://coursing-stats.ru/about/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'О проекте Coursing Stats',
          description: 'Некоммерческий электронный архив соревнований по курсингу, бегов борзых и выставок собак в России',
          url: 'https://coursing-stats.ru/about',
          mainEntity: {
            '@type': 'Organization',
            name: 'Coursing Stats',
            url: 'https://coursing-stats.ru',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'RU',
            },
          },
        }}
      />

      {/* Hero section */}
      <section className="rounded-2xl border border-old-money-200/90 bg-white/90 p-4 sm:p-6 shadow-sm">
        <h1 className="font-serif text-xl font-bold tracking-tight text-charcoal-900 sm:text-2xl">
          О проекте Coursing Stats
        </h1>

        <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-charcoal-700">
          <p>
            Проект задумывался из простого и практичного интереса: собрать объективную статистику работы
            судей, объединить разрозненные результаты состязаний прошлых лет и сделать удобные интерактивные
            профили собак, где наглядно видны все их забеги, оценки, медали, скоростные замеры и движение в
            рейтингах.
          </p>

          <p>
            Огромный и тяжелый труд по организации состязаний, судейству, составлению регламентов и подсчету
            результатов на полях ведут кинологические клубы, секретариат и судьи на местах. Coursing Stats
            ничего не регламентирует самостоятельно — сервис лишь бережно систематизирует уже опубликованные
            официальные протоколы в единый структурированный архив.
          </p>

          <p>
            Сайт не претендует на официальный статус и не конкурирует с другими ресурсами, существуя как
            удобный параллельный справочник для всех любителей борзых и спортивных собак.
          </p>
        </div>
      </section>

      {/* Scope & Numbers */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-old-money-200/90 bg-white/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Спорт и забеги</div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-charcoal-900">10+ лет</div>
          <div className="mt-1 text-xs leading-relaxed text-charcoal-600">С 2015 года: курсинг, БЗМП, бега и связка с календарём</div>
        </div>
        <div className="rounded-xl border border-old-money-200/90 bg-white/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Выставки РКФ</div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-charcoal-900">51 400+</div>
          <div className="mt-1 text-xs leading-relaxed text-charcoal-600">Официальных протоколов 2019–2026 гг. и судьи</div>
        </div>
        <div className="rounded-xl border border-old-money-200/90 bg-white/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Полигон Донино</div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-charcoal-900">100%</div>
          <div className="mt-1 text-xs leading-relaxed text-charcoal-600">Замеры км/ч, спринты 350 м и Чемпионат 2026</div>
        </div>
        <div className="rounded-xl border border-old-money-200/90 bg-white/90 p-3.5 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">Архитектура</div>
          <div className="mt-1 font-serif text-xl sm:text-2xl font-bold text-camel-800">CDN Edge</div>
          <div className="mt-1 text-xs leading-relaxed text-charcoal-600">Мгновенный отклик даже при слабом интернете в полях</div>
        </div>
      </section>

      {/* Two columns: Sources and Tools */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sources */}
        <section className="flex flex-col justify-between rounded-xl border border-old-money-200/90 bg-white/80 p-4 sm:p-5">
          <div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-charcoal-900">
              Первоисточники данных
            </h2>
            <p className="mt-1 text-xs text-charcoal-500">
              Сведения агрегируются исключительно из публичных официальных ресурсов:
            </p>
            <ul className="mt-3 space-y-3">
              {DATA_SOURCES.map((source) => (
                <li key={source.name} className="border-b border-old-money-100 pb-3 last:border-0 last:pb-0">
                  <ExternalHref href={source.url}>
                    <span className="text-sm font-semibold text-charcoal-900">{source.name}</span>
                  </ExternalHref>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal-600">
                    {source.role}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Telegram bot & Open source */}
        <section className="flex flex-col justify-between rounded-xl border border-old-money-200/90 bg-white/80 p-4 sm:p-5">
          <div className="space-y-4">
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-charcoal-900">
                Telegram-бот и инструменты
              </h2>
              <div className="mt-3 rounded-xl border border-sky-200/80 bg-sky-50/40 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                      <Bot className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="text-xs font-semibold text-charcoal-900">@coursing_stats_bot</span>
                  </div>
                  <span className="rounded-full border border-sky-200/80 bg-sky-100/60 px-2 py-0.5 text-[10px] font-semibold text-sky-800">
                    Telegram
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-charcoal-600">
                  Карманный помощник для смартфонов: быстрый поиск карточки любой собаки по кличке,
                  просмотр судей и свежих результатов состязаний прямо на поле или у ринга.
                </p>
                <div className="mt-2.5">
                  <a
                    href="https://t.me/coursing_stats_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300/80 bg-sky-100/80 px-2.5 py-1 text-xs font-semibold text-sky-900 hover:bg-sky-200/80 transition-colors"
                  >
                    <span>Открыть бота в Telegram</span>
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-sm font-bold text-charcoal-900">
                Векторные протоколы и документы
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-charcoal-600">
                Для каждого турнира формируется автономный векторный HTML/PDF-протокол эталонной вёрстки с переключением этапов серии и прямыми ссылками на каталоги, регламенты и документы состязаний.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-sm font-bold text-charcoal-900">
                Двуязычная картотека собак
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-charcoal-600">
                Кириллическое имя имеет безусловный приоритет отображения в интерфейсе и таблицах, а международная латиница сохраняется для сквозного поиска и трансграничной родословной.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-sm font-bold text-charcoal-900">
                Открытость и исходный код
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-charcoal-600">
                Проект с открытым исходным кодом под лицензией MIT. Легковесная архитектура без серверных баз данных
                обеспечивает быструю работу даже при слабом мобильном интернете.
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-old-money-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-charcoal-500">Репозиторий:</span>
              <span className="rounded border border-emerald-200/80 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                Open Source
              </span>
            </div>
            <a
              href="https://github.com/antajl/Coursing-Stats"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-sm transition-colors hover:border-camel-300 hover:text-camel-800"
            >
              <Code2 className="h-4 w-4 text-camel-700" aria-hidden />
              <span>GitHub (MIT)</span>
              <ExternalLink className="h-3 w-3 text-charcoal-400" aria-hidden />
            </a>
          </div>
        </section>
      </div>

      {/* Contacts & Regionality */}
      <section className="rounded-2xl border border-old-money-200/90 bg-white/90 p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h2 className="font-serif text-base sm:text-lg font-bold text-charcoal-900">
            Контакты и география проекта
          </h2>
          <span className="text-xs text-charcoal-500">
            Для сообщений об ошибках в кличках или отправки протоколов
          </span>
        </div>

        <div className="mt-3.5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-old-money-200/90 bg-cream-50/50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sky-200/80 bg-sky-50/80 text-sky-700 shadow-sm">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
                Регион
              </span>
              <span className="block truncate text-sm font-semibold text-charcoal-900">
                Россия
              </span>
            </span>
          </div>

          <ContactCard
            label="Telegram автора"
            value="@antajl"
            href="https://t.me/antajl"
            icon={Send}
            iconBgClass="border-sky-200/80 bg-sky-50/80 text-sky-600"
            external
          />

          <ContactCard
            label="Электронная почта"
            value="antajl@yandex.ru"
            href="mailto:antajl@yandex.ru"
            icon={Mail}
            iconBgClass="border-amber-200/80 bg-amber-50/80 text-amber-700"
          />

          <DiscordContact />
        </div>
      </section>

      {/* Legal disclaimer */}
      <footer className="rounded-xl border border-old-money-100 bg-cream-50/30 p-3 text-center sm:text-left">
        <p className="text-xs leading-relaxed text-charcoal-500">
          <strong>Правовая оговорка:</strong> Coursing Stats — независимый некоммерческий электронный архив.
          Проект не является официальным сайтом Российской кинологической федерации (РКФ) или портала ProCoursing.ru.
          Результаты соревнований, судейские оценки и титулы являются общедоступными спортивными фактами (ст. 1259 ГК РФ),
          систематизируемыми исключительно в справочно-информационных целях. Проект уважает труд организаторов состязаний
          и профильных ресурсов и всегда сохраняет прямые ссылки на опубликованные первоисточники.
        </p>
      </footer>
    </div>
  )
}
