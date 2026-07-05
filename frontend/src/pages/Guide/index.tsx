import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProtocolTab from './components/ProtocolTab'
import SiteTab from './components/SiteTab'
import TitlesTab from './components/TitlesTab'

const TABS = [
  { id: 'titles', label: 'Титулы и сертификаты', mobileLabel: 'Титулы' },
  { id: 'protocol', label: 'Протоколы', mobileLabel: 'Протоколы' },
  { id: 'site', label: 'О сайте', mobileLabel: 'О сайте' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Guide() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tab = searchParams.get('tab')
    return TABS.some((t) => t.id === tab) ? (tab as TabId) : 'titles'
  })

  const handleTabChange = useCallback(
    (tab: TabId) => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams)
      params.set('tab', tab)
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  const tabClass = (tab: TabId) =>
    `flex-1 min-w-[88px] px-3 py-3 rounded-lg font-semibold text-sm transition-all duration-300 md:px-4 ${
      activeTab === tab
        ? 'bg-white dark:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-200 shadow-sm'
        : 'text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-700 dark:hover:text-charcoal-200'
    }`

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cream-300 bg-cream-50/90 p-4 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-800/90 md:p-8">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
            Справочник
          </h1>
          <p className="mt-2 text-sm text-old-money-600 dark:text-old-money-400 md:text-base">
            Титулы и сертификаты РКФ по курсингу, расшифровка протоколов, устройство сайта
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Разделы справочника"
          className="mb-6 flex gap-2 rounded-xl bg-old-money-100 p-1 dark:bg-charcoal-700"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={tabClass(tab.id)}
            >
              <span className="md:hidden">{tab.mobileLabel}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'titles' && <TitlesTab />}
        {activeTab === 'protocol' && <ProtocolTab />}
        {activeTab === 'site' && <SiteTab />}
      </div>
    </div>
  )
}
