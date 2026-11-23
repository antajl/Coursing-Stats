import { describe, it, expect } from 'vitest';
import { getMainMenuKeyboard, getReplyMenuKeyboard } from '../src/keyboards.js';

describe('keyboards (Old Money / Zero Emoji compliance)', () => {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  it('main menu keyboard contains no emojis and includes WebApp button', () => {
    const kb = getMainMenuKeyboard('https://my.coursing-stats.ru');
    const json = JSON.stringify(kb);

    expect(emojiRegex.test(json)).toBe(false);
    expect(json).toContain('web_app');
    expect(json).toContain('https://my.coursing-stats.ru');
  });

  it('reply menu keyboard contains no emojis and includes WebApp button', () => {
    const kb = getReplyMenuKeyboard('https://my.coursing-stats.ru');
    const json = JSON.stringify(kb);

    expect(emojiRegex.test(json)).toBe(false);
    expect(json).toContain('web_app');
    expect(json).toContain('Мои заявки');
  });
});
