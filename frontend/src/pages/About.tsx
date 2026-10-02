import { useState } from 'react'
import {
  Award,
  Bot,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Flag,
  Gauge,
  Mail,
  MapPin,
  MessageCircle,
  Scale,
  Send,
  Trophy,
  Users,
} from 'lucide-react'
import { ExternalHref } from './Guide/components/GuideUi'
import { SEO } from '../components/SEO'

function ContactCard({
  label,
  value,
  href,
  icon: Icon,
  subtext,
  external,
}: {
  label: string
  value: string
  href: string
  icon: typeof Mail
  subtext?: string
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group flex items-center gap-3 rounded-xl border border-old-money-200/90 bg-cream-50/50 p-3.5 transition-all hover:border-camel-300 hover:bg-cream-100/60"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-old-money-200/80 bg-white text-camel-700 shadow-sm transition-transform group-hover:scale-105">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
          {label}
        </span>
        <span className="block truncate text-sm font-semibold text-charcoal-900 group-hover:text-camel-800">
          {value}
        </span>
        {subtext && (
          <span className="block text-[11px] text-charcoal-500">{subtext}</span>
        )}
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
      className="group flex w-full items-center gap-3 rounded-xl border border-old-money-200/90 bg-cream-50/50 p-3.5 text-left transition-all hover:border-camel-300 hover:bg-cream-100/60"
      title="Скопировать ник Discord"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-old-money-200/80 bg-white text-camel-700 shadow-sm transition-transform group-hover:scale-105">
        <MessageCircle className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
          Discord
        </span>
        <span className="block truncate text-sm font-semibold text-charcoal-900 group-hover:text-camel-800">
          antajl
        </span>
        <span className="block text-[11px] text-charcoal-500">
          {copied ? 'Ник скопирован' : 'Нажмите, чтобы скопировать'}
        </span>
      </span>
      {copied ? (
        <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="h-4 w-4 shrink-0 text-charcoal-400 group-hover:text-charcoal-600" aria-hidden />
      )}
    </button>
  )
}

const AUDIENCE_BENEFITS = [
  {
    icon: Trophy,
    title: 'Владельцам и заводчикам',
    description:
      'Полная история собаки: участия, баллы, медали, выставочные сертификаты и рекорды скорости Донино в едином профиле со ссылками на первоисточники.',
  },
  {
    icon: Users,
    title: 'Клубам и организаторам',
    description:
      'Рейтинги сезона и карьеры по породам, календарь состязаний и выставок, наглядная статистика участников без ручного сведения таблиц.',
  },
  {
    icon: Scale,
    title: 'Судьям и экспертам',
    description:
      'История судейских назначений, аналитика распределения оценок, индекс строгости экспертизы и прозрачная формула расчетных баллов CS.',
  },
] as const

const ECOSYSTEM_SECTIONS = [
  {
    icon: Flag,
    title: 'Соревнования',
    description:
      'Курсинг, БЗМП и бега борзых. Топ-медали, рейтинг очков CS, профили спортивных судей и детальные протоколы забегов.',
  },
  {
    icon: Award,
    title: 'Выставки РКФ',
    description:
      'Выставочные рейтинги собак, история титулов (CAC, CACIB, ЧРКФ, BIG, BIS) и объективная статистика строгости судейства.',
  },
  {
    icon: Gauge,
    title: 'Полигон Донино',
    description:
      'Замеры чистой скорости бега (км/ч) и спринтерские рекорды на дистанции 350 метров с электронным хронометражем.',
  },
  {
    icon: Bot,
    title: 'Telegram-бот',
    description:
      'Быстрый поиск собак, карточки участников, результаты состязаний и уведомления в кармане через @coursing_stats_bot.',
    href: 'https://t.me/coursing_stats_bot',
    linkText: 'Открыть бота',
  },
] as const

const DATA_SOURCES = [
  {
    name: 'Procoursing.ru',
    role: 'Календарь, результаты и протоколы соревнований по курсингу и бегам',
    url: 'http://procoursing.ru',
  },
  {
    name: 'Российская кинологическая федерация (РКФ)',
    role: 'Календарь и выставочные протоколы рингов собак',
    url: 'https://rkf.org.ru/dressirovka-i-sport/polozhenija/',
  },
  {
    name: 'Беговой полигон Донино',
    role: 'Замеры максимальной скорости бега борзых (runningdog.ru)',
    url: 'https://runningdog.ru/',
  },
  {
    name: 'Рекорды Донино (курсинг и бега)',
    role: 'Хронометраж и спринтерские рекорды на дистанции 350 м',
    url: 'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009',
  },
] as const

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-8">
      <SEO
        title="О проекте Coursing Stats — независимый агрегатор статистики борзых и спортивных собак в России"
        description="Единая база данных и аналитика соревнований по курсингу, бегов борзых, выставок РКФ и рекордов скорости в России. Рейтинги, профили собак и статистика судей."
        keywords="Coursing Stats, курсинг, бега борзых, выставки собак, РКФ, статистика судей, Донино, рейтинг борзых, Россия"
        canonicalUrl="https://coursing-stats.ru/about"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'О проекте Coursing Stats',
          description: 'Независимый агрегатор статистики борзых и спортивных собак в России',
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
      <section className="rounded-2xl border border-old-money-200/90 bg-white/90 p-5 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-camel-200/80 bg-camel-50 px-2.5 py-0.5 text-xs font-semibold text-camel-800">
            Некоммерческий проект
          </span>
          <span className="inline-flex items-center rounded-full border border-old-money-200 bg-cream-100/60 px-2.5 py-0.5 text-xs font-medium text-charcoal-600">
            Открытые данные
          </span>
        </div>

        <h1 className="mt-3.5 font-serif text-2xl font-bold tracking-tight text-charcoal-900 sm:text-3xl">
          О проекте Coursing Stats
        </h1>

        <p className="mt-3 text-base leading-relaxed text-charcoal-700 sm:text-lg">
          Единая независимая аналитическая база данных борзых и спортивных собак в России. Мы собираем,
          структурируем и связываем воедино результаты соревнований по курсингу и круговому треку,
          протоколы выставок РКФ и замеры скорости полигона Донино в удобные интерактивные профили.
        </p>

        <p className="mt-2 text-sm leading-relaxed text-charcoal-500">
          Проект создан энтузиастами кинологического спорта для прозрачности судейства, сохранения
          спортивной истории собак и популяризации рабочих качеств пород.
        </p>
      </section>

      {/* Audience benefits */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-charcoal-900 sm:text-xl">
          Кому полезен сервис
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {AUDIENCE_BENEFITS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="flex flex-col rounded-xl border border-old-money-200/80 bg-cream-50/50 p-4 sm:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-old-money-200/80 bg-white text-camel-700 shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="mt-3 font-serif text-base font-bold text-charcoal-900">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-charcoal-600">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Project Ecosystem */}
      <section className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-charcoal-900 sm:text-xl">
          Разделы платформы
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ECOSYSTEM_SECTIONS.map((sec) => {
            const Icon = sec.icon
            return (
              <div
                key={sec.title}
                className="flex flex-col justify-between rounded-xl border border-old-money-200/80 bg-white/80 p-4 sm:p-4.5"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-camel-700">
                    <Icon className="h-4.5 w-4.5" aria-hidden />
                  </div>
                  <h3 className="mt-2.5 font-serif text-base font-bold text-charcoal-900">
                    {sec.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-charcoal-600">
                    {sec.description}
                  </p>
                </div>
                {sec.href && (
                  <div className="mt-3 pt-2">
                    <a
                      href={sec.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-camel-700 transition-colors hover:text-camel-800"
                    >
                      {sec.linkText}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Data sources & Openness grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sources */}
        <section className="flex flex-col justify-between rounded-xl border border-old-money-200/90 bg-white/80 p-4 sm:p-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900">
              Источники данных
            </h2>
            <p className="mt-1 text-xs text-charcoal-500">
              Все сведения агрегируются исключительно из публичных официальных источников:
            </p>
            <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-charcoal-700">
              {DATA_SOURCES.map((source) => (
                <li key={source.name} className="border-b border-old-money-100 pb-2 last:border-0 last:pb-0">
                  <ExternalHref href={source.url}>
                    <span className="font-semibold text-charcoal-900">{source.name}</span>
                  </ExternalHref>
                  <p className="mt-0.5 text-xs text-charcoal-500">{source.role}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Open source & architecture */}
        <section className="flex flex-col justify-between rounded-xl border border-old-money-200/90 bg-white/80 p-4 sm:p-6">
          <div>
            <h2 className="font-serif text-lg font-bold text-charcoal-900">
              Открытость и технологии
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-charcoal-600">
              Проект ориентирован на максимальную скорость и автономность. Статическая архитектура с
              распределением данных через CDN обеспечивает моментальную загрузку каталогов и профилей даже
              в полевых условиях при нестабильной мобильной связи.
            </p>

            <div className="mt-4 space-y-2 rounded-lg border border-old-money-200/80 bg-cream-50/50 p-3 text-xs text-charcoal-700">
              <div className="flex justify-between">
                <span className="text-charcoal-500">Лицензия исходного кода:</span>
                <span className="font-mono font-semibold text-charcoal-900">MIT License</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Формат отдачи данных:</span>
                <span className="font-mono font-semibold text-charcoal-900">JSON API (CDN)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-500">Оптимизация под смартфоны:</span>
                <span className="font-semibold text-charcoal-900">Mobile-first</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-old-money-100 flex items-center justify-between">
            <span className="text-xs text-charcoal-500">Репозиторий на GitHub:</span>
            <a
              href="https://github.com/antajl/Coursing-Stats"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-old-money-200 bg-white px-3 py-1.5 text-xs font-semibold text-charcoal-800 shadow-sm transition-colors hover:border-camel-300 hover:text-camel-800"
            >
              <Code2 className="h-4 w-4 text-camel-700" aria-hidden />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 text-charcoal-400" aria-hidden />
            </a>
          </div>
        </section>
      </div>

      {/* Contacts & Regionality */}
      <section className="rounded-2xl border border-old-money-200/90 bg-white/90 p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
          <h2 className="font-serif text-lg font-bold text-charcoal-900 sm:text-xl">
            Контакты и география проекта
          </h2>
          <span className="text-xs text-charcoal-500">
            Для предложений, вопросов и исправлений в протоколах
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-old-money-200/90 bg-cream-50/50 p-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-old-money-200/80 bg-white text-camel-700 shadow-sm">
              <MapPin className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
                Регион
              </span>
              <span className="block truncate text-sm font-semibold text-charcoal-900">
                Россия
              </span>
              <span className="block text-[11px] text-charcoal-500">
                Все регионы РФ
              </span>
            </span>
          </div>

          <ContactCard
            label="Telegram автора"
            value="@antajl"
            href="https://t.me/antajl"
            icon={Send}
            subtext="Личные сообщения"
            external
          />

          <ContactCard
            label="Электронная почта"
            value="antajl@yandex.ru"
            href="mailto:antajl@yandex.ru"
            icon={Mail}
            subtext="Для обращений и файлов"
          />

          <DiscordContact />
        </div>
      </section>

      {/* Legal disclaimer */}
      <footer className="rounded-xl border border-old-money-100 bg-cream-50/30 p-4 text-center sm:text-left">
        <p className="text-xs leading-relaxed text-charcoal-500">
          <strong>Правовая оговорка:</strong> Coursing Stats — независимый некоммерческий
          информационно-аналитический проект. Сервис не является официальным сайтом или подразделением
          Российской кинологической федерации (РКФ) или портала ProCoursing. Все зарегистрированные
          наименования, товарные знаки и официальные регламенты состязаний принадлежат их законным
          правообладателям. Все данные агрегированы исключительно из публично открытых протоколов
          соревнований и выставок.
        </p>
      </footer>
    </div>
  )
}
