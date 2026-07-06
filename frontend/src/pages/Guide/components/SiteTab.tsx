import { useState } from 'react'
import { Check, Copy, Mail, MessageCircle, Send } from 'lucide-react'
import { ExternalHref, SectionCard } from './GuideUi'

function ContactLink({
  label,
  value,
  href,
  icon: Icon,
  external,
}: {
  label: string
  value: string
  href: string
  icon: typeof Mail
  external?: boolean
}) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="flex items-center gap-3 rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 transition-colors hover:border-camel-300 hover:bg-camel-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/50 dark:hover:border-camel-800 dark:hover:bg-camel-950/20"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
        <Icon className="h-5 w-5 text-camel-700 dark:text-camel-400" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
          {label}
        </span>
        <span className="block font-medium text-camel-800 dark:text-camel-300">{value}</span>
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
      className="flex w-full items-center gap-3 rounded-lg border border-old-money-200 bg-old-money-50/60 px-4 py-3 text-left transition-colors hover:border-camel-300 hover:bg-camel-50/80 dark:border-charcoal-600 dark:bg-charcoal-800/50 dark:hover:border-camel-800 dark:hover:bg-camel-950/20"
      title="Скопировать ник Discord"
    >
      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-old-money-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800">
        <MessageCircle className="h-5 w-5 text-camel-700 dark:text-camel-400" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-old-money-500 dark:text-old-money-400">
          Discord
        </span>
        <span className="block font-medium text-camel-800 dark:text-camel-300">antajl</span>
        <span className="mt-0.5 block text-[11px] text-old-money-500 dark:text-old-money-400">
          {copied ? 'Ник скопирован' : 'Нажмите, чтобы скопировать ник'}
        </span>
      </span>
      {copied ? (
        <Check className="h-4 w-4 flex-shrink-0 text-camel-600 dark:text-camel-400" aria-hidden />
      ) : (
        <Copy className="h-4 w-4 flex-shrink-0 text-old-money-400" aria-hidden />
      )}
    </button>
  )
}

export default function SiteTab() {
  return (
    <div className="space-y-4">
      <SectionCard title="Что такое Coursing Stats">
        <p>
          Некоммерческий агрегатор статистики: результаты соревнований с procoursing.ru (курсинг, БЗМП, бега борзых)
          и рекорды полигона Донино. Проект не связан с ProCoursing и РКФ.
        </p>
      </SectionCard>

      <SectionCard title="Связь с автором">
        <div className="grid gap-2 md:grid-cols-3">
          <ContactLink label="Почта" value="antajl@yandex.ru" href="mailto:antajl@yandex.ru" icon={Mail} />
          <ContactLink label="Telegram" value="@antajl" href="https://t.me/antajl" icon={Send} external />
          <DiscordContact />
        </div>
      </SectionCard>

      <SectionCard title="Источники данных">
        <ul className="space-y-2">
          <li>
            <ExternalHref href="http://procoursing.ru">Procoursing.ru</ExternalHref> — календарь и протоколы
          </li>
          <li>
            <ExternalHref href="https://runningdog.ru/">Курсинг Донино</ExternalHref>
          </li>
          <li>
            <ExternalHref href="https://docs.google.com/spreadsheets/d/1NTiY3HXZIkXE8xTeXZESgMKaZsEXunmcWhTfhhkoKyE/edit?gid=1787526009#gid=1787526009">
              Рекорды Донино (курсинг)
            </ExternalHref>
          </li>
          <li>
            <ExternalHref href="https://docs.google.com/spreadsheets/d/1hpdA8vlIfeECgpnPvuk5xfezPsdUh1EXULjeATAF9dw/edit?pli=1&gid=0#gid=0">
              Рекорды Донино (бега борзых)
            </ExternalHref>
          </li>
          <li>
            <ExternalHref href="https://rkf.org.ru/dressirovka-i-sport/polozhenija/">Положения РКФ</ExternalHref>
          </li>
        </ul>
      </SectionCard>
    </div>
  )
}
