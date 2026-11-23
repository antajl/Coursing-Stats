import { describe, it, expect } from 'vitest';
import {
  getDisciplineCounts,
  filterCompetitions,
  findCompetitionById,
  formatCompetitionCard,
  formatApprovalAlert
} from '../src/services/competition-tracker.js';

describe('2026 Competitions Tracker Service', () => {
  it('returns valid counts for 3 target disciplines (72 total: 39 coursing, 14 racing, 19 bzmp)', () => {
    const counts = getDisciplineCounts();
    expect(counts.total).toBe(72);
    expect(counts.coursing).toBe(39);
    expect(counts.racing).toBe(14);
    expect(counts.bzmp).toBe(19);
    expect(counts.approved).toBeGreaterThan(0);
  });

  it('filters competitions by discipline correctly', () => {
    const coursing = filterCompetitions({ discipline: 'курсинг' });
    expect(coursing.length).toBe(39);

    const racing = filterCompetitions({ discipline: 'бега борзых' });
    expect(racing.length).toBe(14);

    const bzmp = filterCompetitions({ discipline: 'приманк' });
    expect(bzmp.length).toBe(19);
  });

  it('filters by status APPROVED', () => {
    const approved = filterCompetitions({ status: 'APPROVED' });
    expect(approved.length).toBeGreaterThan(0);
    for (const ev of approved) {
      expect(ev.status).toBe('APPROVED');
    }
  });

  it('finds competition by ID and formats card without emojis', () => {
    const ev = findCompetitionById('ev_td6lum');
    expect(ev).toBeDefined();
    if (!ev) return;

    expect(ev.discipline).toBe('Курсинг борзых');
    expect(ev.location).toContain('Ярославль');

    const card = formatCompetitionCard(ev);
    expect(card).toContain('[УТВЕРЖДЕНО]');
    expect(card).toContain('ev_td6lum');

    // Strict zero emoji verification
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(card)).toBe(false);

    const alert = formatApprovalAlert(ev);
    expect(alert).toContain('[УТВЕРЖДЕНО СОСТЯЗАНИЕ РКФ]');
    expect(emojiRegex.test(alert)).toBe(false);
  });
});
