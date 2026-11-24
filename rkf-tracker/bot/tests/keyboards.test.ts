import { describe, it, expect } from 'vitest';
import {
  getMainMenuKeyboard,
  getReplyMenuKeyboard,
  getBackToMenuKeyboard,
  getStatusKeyboard,
  getAuthPromptKeyboard,
  getAuthHowKeyboard,
  getCompetitionsMenuKeyboard,
  getCompetitionsPageKeyboard
} from '../src/keyboards.js';

describe('keyboards (Old Money / Zero Emoji compliance)', () => {
  const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

  it('main menu keyboard contains no emojis and includes WebApp button', () => {
    const kbUnlinked = getMainMenuKeyboard('https://my.coursing-stats.ru', false);
    const jsonUnlinked = JSON.stringify(kbUnlinked);
    expect(emojiRegex.test(jsonUnlinked)).toBe(false);
    expect(jsonUnlinked).toContain('web_app');
    expect(jsonUnlinked).toContain('cmd_auth_prompt');

    const kbLinked = getMainMenuKeyboard('https://my.coursing-stats.ru', true);
    const jsonLinked = JSON.stringify(kbLinked);
    expect(emojiRegex.test(jsonLinked)).toBe(false);
    expect(jsonLinked).toContain('cmd_apps');
  });

  it('auth onboarding keyboards contain no emojis', () => {
    const promptKb = getAuthPromptKeyboard('https://my.coursing-stats.ru');
    const promptJson = JSON.stringify(promptKb);
    expect(emojiRegex.test(promptJson)).toBe(false);
    expect(promptJson).toContain('web_app');
    expect(promptJson).toContain('Привязать на телефоне (WebApp)');
    expect(promptJson).toContain('cmd_auth_ext');
    expect(promptJson).toContain('cmd_auth_bookmarklet');
    expect(promptJson).toContain('cmd_start');
    expect(promptJson).not.toContain('cmd_auth_manual');

    const howKb = getAuthHowKeyboard();
    const howJson = JSON.stringify(howKb);
    expect(emojiRegex.test(howJson)).toBe(false);
    expect(howJson).toContain('cmd_auth_prompt');
  });

  it('competitions browser keyboards contain no emojis and correct facets', () => {
    const compMenu = getCompetitionsMenuKeyboard();
    const menuJson = JSON.stringify(compMenu);
    expect(emojiRegex.test(menuJson)).toBe(false);
    expect(menuJson).toContain('comp_disc:coursing');
    expect(menuJson).toContain('comp_disc:approved');

    const dummyEvents = [
      { id: 'ev_1', location: 'Ставрополь' },
      { id: 'ev_2', location: 'Тверь' }
    ];
    const pageKb = getCompetitionsPageKeyboard(dummyEvents, 0, 5, new Set(['ev_1']), 'coursing');
    const pageJson = JSON.stringify(pageKb);
    expect(emojiRegex.test(pageJson)).toBe(false);
    expect(pageJson).toContain('csub_off:ev_1:coursing:0');
    expect(pageJson).toContain('csub_on:ev_2:coursing:0');
    expect(pageJson).toContain('comp_p:coursing:1');
  });

  it('status and navigation keyboards contain no emojis', () => {
    const backKb = getBackToMenuKeyboard();
    expect(emojiRegex.test(JSON.stringify(backKb))).toBe(false);

    const statusLinked = getStatusKeyboard(true);
    expect(emojiRegex.test(JSON.stringify(statusLinked))).toBe(false);
    expect(JSON.stringify(statusLinked)).toContain('cmd_apps');

    const statusUnlinked = getStatusKeyboard(false);
    expect(emojiRegex.test(JSON.stringify(statusUnlinked))).toBe(false);
    expect(JSON.stringify(statusUnlinked)).toContain('cmd_auth_prompt');
  });

  it('reply menu keyboard contains no emojis (backward compat)', () => {
    const kb = getReplyMenuKeyboard('https://my.coursing-stats.ru');
    const json = JSON.stringify(kb);
    expect(emojiRegex.test(json)).toBe(false);
    expect(json).toContain('web_app');
    expect(json).toContain('Мои заявки');
  });
});
