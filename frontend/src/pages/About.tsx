import { useState } from 'react'
import {
  Bot,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Send,
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
  iconBgClass = 'bg-white text-camel-700 border-old-money-200/80',
}: {
  label: string
  value: string
  href: string
  icon: typeof Mail
  subtext?: string
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

const DATA_SOURCES = [
  {
    name: 'Procoursing.ru',
    badge: 'Курсинг и трек',
    badgeColor: 'border-emerald-200/80 bg-emerald-50 text-emerald-800',
    role: 'Протоколы и результаты соревнований по курсингу и круговому треку',
    url: 'http://procoursing.ru',
  },
  {
    name: 'Российская кинологическая федерация (РКФ)',
    badge: 'Выставки РКФ',
    badgeColor: 'border-amber-200/80 bg-amber-50 text-amber-800',
    role: 'Календарь, регламенты и каталоги выставок собак',
    url: 'https://rkf.org.ru/dressirovka-i-sport/polozhenija/',
  },
  {
    name: 'Полигон Донино (runningdog.ru)',
    badge: 'Рекорды скорости',
    badgeColor: 'border-sky-200/80 bg-sky-50 text-sky-800',
    role: 'Замеры максимальной скорости бега борзых (км/ч)',
    url: 'https://runningdog.ru/',
  },
  {
    name: 'Таблицы рекордов Донино',
    badge: 'Спринт 350 м',
    badgeColor: 'border-indigo-200/80 bg-indigo-50 text-indigo-800',
    role: 'Спринтерские результаты на дистанции 350 метров',
    url: 'https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009',
  },
] as const

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-full space-y-6 pb-8">
      <SEO
        title="О проекте Coursing Stats — независимый архив соревнований и выставок собак в России"
        description="Некоммерческий электронный архив соревнований по курсингу, бегов борзых, выставок РКФ и замеров Донино в России. Профили собак, протоколы стартов и статистика."
        keywords="Coursing Stats, архив соревнований, курсинг, бега борзых, выставки собак, РКФ, протоколы, Донино, рейтинг борзых, Россия"
        canonicalUrl="https://coursing-stats.ru/about"
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
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full border border-camel-200/80 bg-camel-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-camel-800">
            Некоммерческий проект
          </span>
          <span className="inline-flex items-center rounded-full border border-old-money-200 bg-cream-100/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-charcoal-600">
            Параллельный справочник
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-800">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
            Россия
          </span>
        </div>

        <h1 className="mt-3 font-serif text-xl font-bold tracking-tight text-charcoal-900 sm:text-2xl">
          О проекте Coursing Stats
        </h1>

        <p className="mt-2.5 text-sm leading-relaxed text-charcoal-700">
          Проект задумывался из простого и практичного интереса: собрать объективную статистику работы
          судей, объединить разрозненные результаты состязаний прошлых лет и сделать удобные интерактивные
          профили собак, где наглядно видны все их старты, оценки, медали, скоростные замеры и движение в
          рейтингах.
        </p>

        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-charcoal-600">
          Огромный и тяжелый труд по организации состязаний, судейству, составлению регламентов и подсчету
          результатов на полях ведут кинологические клубы, секретариат и судьи на местах. Coursing Stats
          ничего не регламентирует самостоятельно — сервис лишь бережно систематизирует уже опубликованные
          официальные протоколы в единый структурированный архив.
        </p>

        <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-charcoal-500">
          Сайт не претендует на официальный статус и не конкурирует с другими ресурсами, существуя как
          удобный параллельный справочник для всех любителей борзых и спортивных собак.
        </p>
      </section>

      {/* Two columns: Sources and Tools */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Sources */}
        <section className="flex flex-col justify-between rounded-xl border border-old-money-200/90 bg-white/80 p-4 sm:p-5">
          <div>
            <h2 className="font-serif text-sm sm:text-base font-bold text-charcoal-900">
              Первоисточники данных
            </h2>
            <p className="mt-1 text-xs text-charcoal-500">
              Сведения агрегируются исключительно из публичных официальных ресурсов:
            </p>
            <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-charcoal-700">
              {DATA_SOURCES.map((source) => (
                <li key={source.name} className="border-b border-old-money-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <ExternalHref href={source.url}>
                      <span className="font-semibold text-charcoal-900">{source.name}</span>
                    </ExternalHref>
                    <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold border ${source.badgeColor}`}>
                      {source.badge}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-charcoal-500">{source.role}</p>
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
          <h2 className="font-serif text-sm sm:text-base font-bold text-charcoal-900">
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
            iconBgClass="border-sky-200/80 bg-sky-50/80 text-sky-600"
            external
          />

          <ContactCard
            label="Электронная почта"
            value="antajl@yandex.ru"
            href="mailto:antajl@yandex.ru"
            icon={Mail}
            subtext="Для протоколов и файлов"
            iconBgClass="border-amber-200/80 bg-amber-50/80 text-amber-700"
          />

          <DiscordContact />
        </div>
      </section>

      {/* Legal disclaimer */}
      <footer className="rounded-xl border border-old-money-100 bg-cream-50/30 p-3 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs leading-relaxed text-charcoal-500">
          <strong>Правовая оговорка:</strong> Coursing Stats — независимый некоммерческий информационный
          проект. Сервис не является официальным сайтом Российской кинологической федерации (РКФ) или портала
          ProCoursing. Все товарные знаки, регламенты состязаний и официальные наименования принадлежат их
          законным правообладателям. Данные агрегируются исключительно из открытых протоколов соревнований и выставок.
        </p>
      </footer>
    </div>
  )
}
