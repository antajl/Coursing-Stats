import { useCallback, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ToolbarSegmentControl from '../../components/toolbar/ToolbarSegmentControl'
import ProtocolTab from './components/ProtocolTab'
import SiteTab from './components/SiteTab'
import TitlesTab from './components/TitlesTab'

const GUIDE_SEGMENTS = [
  { id: 'titles', label: 'Титулы и сертификаты' },
  { id: 'protocol', label: 'Протоколы' },
  { id: 'site', label: 'О сайте' },
] as const

type TabId = (typeof GUIDE_SEGMENTS)[number]['id']

export default function Guide() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const tab = searchParams.get('tab')
    return GUIDE_SEGMENTS.some((t) => t.id === tab) ? (tab as TabId) : 'titles'
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

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-cream-300 bg-cream-50/90 p-4 shadow-xl backdrop-blur-lg dark:border-charcoal-700 dark:bg-charcoal-800/90 md:p-8">
        <h1 className="mb-4 font-serif text-2xl font-bold text-charcoal-900 dark:text-charcoal-100 md:text-3xl">
          Справочник
        </h1>

        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <ToolbarSegmentControl
            segments={[...GUIDE_SEGMENTS]}
            value={activeTab}
            onChange={(tab) => handleTabChange(tab as TabId)}
            ariaLabel="Разделы справочника"
          />
        </div>

        {activeTab === 'titles' && <TitlesTab />}
        {activeTab === 'protocol' && <ProtocolTab />}
        {activeTab === 'site' && <SiteTab />}
      </div>
    </div>
  )
}
