import { describe, it, expect } from 'vitest';
import { getDisplayName } from './helpers';
import { Rating } from '../../types';

describe('helpers', () => {
  describe('getDisplayName', () => {
    it('should prefer Russian name without slash', () => {
      const rating: Rating = {
        name_ru: 'Рекс',
        name_lat: 'Rex',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Рекс');
    });

    it('should prefer Latin name without slash if Russian has slash', () => {
      const rating: Rating = {
        name_ru: 'Рекс/Тор',
        name_lat: 'Rex',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Rex');
    });

    it('should take Russian part before slash if both have slash', () => {
      const rating: Rating = {
        name_ru: 'Рекс/Тор',
        name_lat: 'Rex/Thor',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Рекс');
    });

    it('should take Latin part before slash if only Latin has slash', () => {
      const rating: Rating = {
        name_ru: 'Рекс',
        name_lat: 'Rex/Thor',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Рекс');
    });

    it('should use generic name if both names have slash', () => {
      const rating: Rating = {
        name_ru: 'Рекс/Тор',
        name_lat: 'Rex/Thor',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Рекс');
    });

    it('should use generic name if Russian name is missing', () => {
      const rating: Rating = {
        name_lat: 'Rex',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Rex');
    });

    it('should use generic name if Latin name is missing', () => {
      const rating: Rating = {
        name_ru: 'Рекс',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Рекс');
    });

    it('should return N/A if no name is available', () => {
      const rating: Rating = {};
      expect(getDisplayName(rating)).toBe('N/A');
    });

    it('should handle empty Russian name', () => {
      const rating: Rating = {
        name_ru: '',
        name_lat: 'Rex',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Rex');
    });

    it('should handle empty Latin name', () => {
      const rating: Rating = {
        name_ru: 'Рекс',
        name_lat: '',
        name: 'Dog'
      };
      expect(getDisplayName(rating)).toBe('Рекс');
    });
  });
});
