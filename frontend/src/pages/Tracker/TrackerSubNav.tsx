import { useMemo } from 'react';
import { MobileSubNavTabs, type SubNavTabItem } from '../../components/ui/MobileSubNavTabs';
import type { TrackerTab } from './trackerTypes';

interface TrackerSubNavProps {
  activeTab: TrackerTab;
  onSelectTab: (tab: TrackerTab) => void;
  competitionsCount: number;
}

export function TrackerSubNav({
  activeTab,
  onSelectTab,
  competitionsCount,
}: TrackerSubNavProps) {
  const tabs = useMemo<readonly SubNavTabItem<TrackerTab>[]>(
    () => [
      {
        id: 'applications',
        label: (
          <>
            <span className="sm:hidden">Заявки</span>
            <span className="hidden sm:inline">Заявки на титулы</span>
          </>
        ),
      },
      {
        id: 'competitions',
        label: (
          <span className="inline-flex items-center gap-1.5">
            <span className="sm:hidden">Соревнования</span>
            <span className="hidden sm:inline">Соревнования РКФ</span>
            <span className="text-[10.5px] font-mono px-1.5 py-0.5 rounded-full bg-sand-200/80 text-charcoal-700 leading-none">
              {competitionsCount}
            </span>
          </span>
        ),
      },
      {
        id: 'apps',
        label: (
          <>
            <span className="sm:hidden">Приложения</span>
            <span className="hidden sm:inline">Приложения и бот</span>
          </>
        ),
      },
    ],
    [competitionsCount],
  );

  return (
    <MobileSubNavTabs<TrackerTab>
      tabs={tabs}
      activeTab={activeTab}
      onChange={onSelectTab}
      layout="fill"
      breakpoint="none"
      ariaLabel="Разделы трекера РКФ"
      className="!mb-0"
    />
  );
}
