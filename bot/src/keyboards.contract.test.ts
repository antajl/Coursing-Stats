import { describe, it, expect } from 'vitest';
import {
  getMainInlineMenu,
  getCompetitionsMenu,
  getShowsMenu,
  getGuideMenu,
  getYearsMenu,
  getDogSelectionKeyboard,
  getDoninoMenu,
  getDoninoKeyboard,
  getJudgesMenu,
  getJudgesKeyboard,
  getRatingKeyboard,
  getCalendarKeyboard,
  getDogCardKeyboard,
  getFavoritesKeyboard,
  getCompareKeyboard,
  getNavigationButtons,
} from './keyboards';
import { matchesHandlerCallback } from './constants';

type KeyboardButton = {
  callback_data?: string;
  url?: string;
};

function extractCallbacks(keyboard: { inline_keyboard: KeyboardButton[][] }): string[] {
  return keyboard.inline_keyboard
    .flat()
    .map((btn) => btn.callback_data)
    .filter((cb): cb is string => typeof cb === 'string');
}

/** Собирает callback_data из всех клавиатур, которые реально используются в боте. */
function collectProductionKeyboardCallbacks(): { callback: string; source: string }[] {
  const year = new Date().getFullYear().toString();
  const samples: Array<{ source: string; keyboard: { inline_keyboard: KeyboardButton[][] } }> = [
    { source: 'getMainInlineMenu', keyboard: getMainInlineMenu() },
    { source: 'getCompetitionsMenu', keyboard: getCompetitionsMenu() },
    { source: 'getShowsMenu', keyboard: getShowsMenu() },
    { source: 'getGuideMenu', keyboard: getGuideMenu() },
    { source: 'getYearsMenu(coursing score)', keyboard: getYearsMenu('rating_coursing_score') },
    { source: 'getYearsMenu(shows)', keyboard: getYearsMenu('rating_shows', false) },
    { source: 'getDogSelectionKeyboard', keyboard: getDogSelectionKeyboard([{ id: 1, name_lat: 'A', name_ru: 'A', breed: 'B', competition_count: 1 }]) },
    { source: 'getDoninoMenu', keyboard: getDoninoMenu() },
    { source: 'getDoninoKeyboard(speed)', keyboard: getDoninoKeyboard('speed') },
    { source: 'getJudgesMenu', keyboard: getJudgesMenu() },
    { source: 'getJudgesKeyboard(competition)', keyboard: getJudgesKeyboard('competition') },
    { source: 'getJudgesKeyboard(shows)', keyboard: getJudgesKeyboard('shows') },
    { source: 'getRatingKeyboard(coursing)', keyboard: getRatingKeyboard('coursing', 'placement', year, '0') },
    { source: 'getRatingKeyboard(racing)', keyboard: getRatingKeyboard('racing', 'placement', year, '0') },
    { source: 'getRatingKeyboard(shows)', keyboard: getRatingKeyboard('shows', 'placement', year, '0') },
    { source: 'getCalendarKeyboard(competitions)', keyboard: getCalendarKeyboard(0, false, 'all') },
    { source: 'getCalendarKeyboard(shows)', keyboard: getCalendarKeyboard(0, true, 'shows') },
    { source: 'getCalendarKeyboard(page 10)', keyboard: getCalendarKeyboard(10, false, 'coursing') },
    { source: 'getDogCardKeyboard', keyboard: getDogCardKeyboard('42', 'favorites') },
    { source: 'getFavoritesKeyboard', keyboard: getFavoritesKeyboard([{ id: 10 }, { id: 20 }]) },
    { source: 'getCompareKeyboard', keyboard: getCompareKeyboard('5') },
    { source: 'getNavigationButtons', keyboard: getNavigationButtons('ratings', 'main_menu') },
  ];

  const out: { callback: string; source: string }[] = [];
  for (const { source, keyboard } of samples) {
    for (const callback of extractCallbacks(keyboard)) {
      out.push({ callback, source });
    }
  }
  return out;
}

describe('keyboard ↔ handler contract', () => {
  it('every production keyboard callback_data has a matching handler', () => {
    const entries = collectProductionKeyboardCallbacks();
    const orphans = entries.filter(({ callback }) => !matchesHandlerCallback(callback));

    expect(orphans, `Orphan callbacks:\n${orphans.map((o) => `  ${o.callback} (${o.source})`).join('\n')}`).toEqual([]);
  });

  it('covers critical favorites and dog card callbacks', () => {
    const all = collectProductionKeyboardCallbacks().map((e) => e.callback);
    expect(all).toContain('favorites');
    expect(all).toContain('add_favorite:42');
    expect(all).toContain('dog:10');
    expect(all.some((c) => c.startsWith('compare_start_'))).toBe(true);
  });
});
