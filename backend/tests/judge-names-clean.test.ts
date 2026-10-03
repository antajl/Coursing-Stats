import { describe, expect, it } from 'vitest';
import { parseJudgeNames } from '../src/lib/judge-names';

describe('parseJudgeNames', () => {
  it('parses comma-separated judges with leading dashes and roles', () => {
    expect(parseJudgeNames('- Козлова И.В., - Карелина Н.В.')).toEqual(['Козлова И.В.', 'Карелина Н.В.']);
    expect(parseJudgeNames('- Лукина Д.М., судьи - Серова Т.Г., Куликова Г.В.')).toEqual([
      'Лукина Д.М.',
      'Серова Т.Г.',
      'Куликова Г.В.',
    ]);
  });

  it('handles numbered judges', () => {
    expect(
      parseJudgeNames('Главный судья - Козлова И.В., судья 2 - Крылова Е.В., судья 3 - Кузнецова Н.Н.'),
    ).toEqual(['Козлова И.В.', 'Крылова Е.В.', 'Кузнецова Н.Н.']);
  });

  it('handles "и" separated judges', () => {
    expect(parseJudgeNames('Иванова Г.С. и Гольдинова Л.М.')).toEqual(['Иванова Г.С.', 'Гольдинова Л.М.']);
  });

  it('returns empty array on empty input', () => {
    expect(parseJudgeNames('')).toEqual([]);
  });
});
