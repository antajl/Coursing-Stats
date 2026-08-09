import { describe, it, expect } from 'vitest';
import {
  getMainInlineMenu,
  getNavigationButtons,
  getCategoriesMenu,
  getYearsMenu,
  getDogSelectionKeyboard,
  getDoninoMenu,
  getJudgesMenu,
  getJudgesKeyboard,
  getRatingKeyboard,
  getCalendarKeyboard,
  getDogCardKeyboard,
  getFavoritesKeyboard
} from './keyboards';

describe('Keyboards', () => {
  describe('getMainInlineMenu', () => {
    it('should return main menu keyboard with favorites', () => {
      const keyboard = getMainInlineMenu();
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();
      expect(inlineKeyboard.length).toBeGreaterThan(0);
      const callbacks = inlineKeyboard.flat().map((b) => ('callback_data' in b ? b.callback_data : null));
      expect(callbacks).toContain('favorites');
      expect(callbacks).toContain('search_dog');
    });
  });

  describe('getNavigationButtons', () => {
    it('should return navigation buttons', () => {
      const keyboard = getNavigationButtons('back', 'home');
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();
      expect(inlineKeyboard.length).toBe(1);
      expect(inlineKeyboard[0].length).toBe(2);
    });
  });

  describe('getCategoriesMenu', () => {
    it('should return categories menu', () => {
      const keyboard = getCategoriesMenu();
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();
      expect(inlineKeyboard.length).toBeGreaterThan(0);
    });
  });

  describe('getYearsMenu', () => {
    it('should return years menu with all years option', () => {
      const keyboard = getYearsMenu('rating');
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();
      // First row should have "Все года" button
      expect(inlineKeyboard[0][0].text).toBe('Все года');
    });

    it.skip('should include years from current year back to 2015', () => {
      const keyboard = getYearsMenu('rating_score', true);
      const inlineKeyboard = keyboard.inline_keyboard;
      const currentYear = new Date().getFullYear();

      // Count year buttons (excluding navigation row)
      let yearCount = 0;
      for (const row of inlineKeyboard) {
        for (const button of row) {
          if ('callback_data' in button && typeof button.callback_data === 'string' && button.callback_data.match(/^rating_\d{4}$/)) {
            yearCount++;
          }
        }
      }

      expect(yearCount).toBe(currentYear - 2015 + 1);
    });

    it('should emit rating_shows_{year} for show rankings', () => {
      const year = new Date().getFullYear().toString();
      const keyboard = getYearsMenu('rating_shows', false);
      const callbacks = keyboard.inline_keyboard.flat()
        .map((b) => ('callback_data' in b ? b.callback_data : null))
        .filter(Boolean);
      expect(callbacks).toContain(`rating_shows_${year}`);
      expect(callbacks.some((c) => typeof c === 'string' && c.startsWith('shows_') && !c.startsWith('rating_shows_'))).toBe(false);
    });
  });

  describe('getDogCardKeyboard', () => {
    it('should use add_favorite and profile site URL matching handlers', () => {
      const keyboard = getDogCardKeyboard('123');
      const buttons = keyboard.inline_keyboard.flat();
      const favorite = buttons.find((b) => 'callback_data' in b && b.callback_data === 'add_favorite:123');
      const site = buttons.find((b) => 'url' in b && b.url === 'https://coursing-stats.ru/dog/123');
      expect(favorite).toBeDefined();
      expect(favorite && 'text' in favorite ? favorite.text : null).toBe('В избранное');
      expect(site).toBeDefined();
      expect(site && 'text' in site ? site.text : null).toBe('Профиль на сайте');
    });

    it('shows favorite state when already saved', () => {
      const keyboard = getDogCardKeyboard('123', 'main_menu', { isFavorite: true });
      const buttons = keyboard.inline_keyboard.flat();
      const favorite = buttons.find((b) => 'callback_data' in b && b.callback_data === 'remove_favorite:123');
      expect(favorite).toBeDefined();
      expect(favorite && 'text' in favorite ? favorite.text : null).toBe('⭐ В избранном');
    });
  });

  describe('getFavoritesKeyboard', () => {
    it('emits dog:{id} callbacks for each favorite', () => {
      const keyboard = getFavoritesKeyboard([
        { id: 10, name_lat: 'A' },
        { id: 20, name_ru: 'B' },
      ]);
      const callbacks = keyboard.inline_keyboard.flat()
        .map((b) => ('callback_data' in b ? b.callback_data : null));
      expect(callbacks).toContain('dog:10');
      expect(callbacks).toContain('dog:20');
    });
  });

  describe('site links on list keyboards', () => {
    it('calendar competitions has site URL', () => {
      const keyboard = getCalendarKeyboard(0, false, 'all');
      const urls = keyboard.inline_keyboard.flat().map((b) => ('url' in b ? b.url : null));
      expect(urls).toContain('https://coursing-stats.ru/competitions?tab=calendar');
    });

    it('judges shows has site URL', () => {
      const keyboard = getJudgesKeyboard('shows');
      const urls = keyboard.inline_keyboard.flat().map((b) => ('url' in b ? b.url : null));
      expect(urls).toContain('https://coursing-stats.ru/shows?tab=judges');
    });
  });

  describe('getDogSelectionKeyboard', () => {
    it('should return keyboard with dog selection buttons', () => {
      const dogs = [
        { id: 1, name: 'Dog1' },
        { id: 2, name: 'Dog2' },
        { id: 3, name: 'Dog3' },
        { id: 4, name: 'Dog4' },
        { id: 5, name: 'Dog5' },
      ];
      const keyboard = getDogSelectionKeyboard(dogs);
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();

      // Should have 2 rows of 3 buttons + cancel row
      expect(inlineKeyboard.length).toBe(3);
    });

    it('should have cancel button', () => {
      const dogs = [{ id: 1, name: 'Dog1' }];
      const keyboard = getDogSelectionKeyboard(dogs);
      const inlineKeyboard = keyboard.inline_keyboard;
      const lastRow = inlineKeyboard[inlineKeyboard.length - 1];
      expect(lastRow[0].text).toContain('Отмена');
      if ('callback_data' in lastRow[0]) {
        expect(lastRow[0].callback_data).toBe('cancel_search');
      }
    });
  });

  describe('getDoninoMenu', () => {
    it('should return donino menu', () => {
      const keyboard = getDoninoMenu();
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();
      expect(inlineKeyboard.length).toBe(2);
    });
  });

  describe('getJudgesMenu', () => {
    it('should return judges menu', () => {
      const keyboard = getJudgesMenu();
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();
      expect(inlineKeyboard.length).toBe(2);
    });
  });

  describe('getRatingKeyboard', () => {
    it.skip('should return rating keyboard with pagination', () => {
      const keyboard = getRatingKeyboard('coursing', 'score', '2026', '0');
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();

      // Check pagination button
      const firstRow = inlineKeyboard[0];
      const paginationButton = firstRow.find(btn => 'callback_data' in btn && btn.callback_data === 'rating_coursing_score_2026_5');
      expect(paginationButton).toBeDefined();
      if (paginationButton && 'callback_data' in paginationButton) {
        expect(paginationButton.text).toBe('➡️ Ещё 5');
      }
    });

    it.skip('should show back button when offset is not 0', () => {
      const keyboard = getRatingKeyboard('coursing', 'score', '2026', '5');
      const inlineKeyboard = keyboard.inline_keyboard;
      const firstRow = inlineKeyboard[0];
      const paginationButton = firstRow.find(btn => 'callback_data' in btn && btn.callback_data === 'rating_coursing_score_2026_0');
      expect(paginationButton).toBeDefined();
      if (paginationButton && 'callback_data' in paginationButton) {
        expect(paginationButton.text).toBe('⬅️ Назад');
      }
    });

    it.skip('should toggle category', () => {
      const keyboard = getRatingKeyboard('coursing', 'score', '2026', '0');
      const inlineKeyboard = keyboard.inline_keyboard;
      const firstRow = inlineKeyboard[0];
      const toggleButton = firstRow.find(btn => 'callback_data' in btn && btn.callback_data === 'rating_coursing_placement_2026');
      expect(toggleButton).toBeDefined();
      if (toggleButton && 'callback_data' in toggleButton) {
        expect(toggleButton.text).toBe('🥇 По медалям');
      }
    });
  });

  describe('getCalendarKeyboard', () => {
    it.skip('should return calendar keyboard with pagination', () => {
      const keyboard = getCalendarKeyboard('0');
      expect(keyboard).toBeDefined();
      const inlineKeyboard = keyboard.inline_keyboard;
      expect(inlineKeyboard).toBeDefined();

      // Check pagination button
      const firstRow = inlineKeyboard[0];
      const paginationButton = firstRow.find(btn => 'callback_data' in btn && btn.callback_data === 'calendar_10');
      expect(paginationButton).toBeDefined();
      if (paginationButton && 'callback_data' in paginationButton) {
        expect(paginationButton.text).toBe('➡️ Ещё 10');
      }
    });

    it.skip('should show back button when offset is not 0', () => {
      const keyboard = getCalendarKeyboard('10');
      const inlineKeyboard = keyboard.inline_keyboard;
      const firstRow = inlineKeyboard[0];
      const paginationButton = firstRow.find(btn => 'callback_data' in btn && btn.callback_data === 'calendar_0');
      expect(paginationButton).toBeDefined();
      if (paginationButton && 'callback_data' in paginationButton) {
        expect(paginationButton.text).toBe('⬅️ Назад');
      }
    });
  });
});
