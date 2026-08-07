import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateDogId, validateYear, validateSearchQuery } from './validators';

describe('validators', () => {
  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test');
    });

    it('should limit length to 100 characters', () => {
      const longInput = 'a'.repeat(150);
      expect(sanitizeInput(longInput)).toHaveLength(100);
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeInput('test<script>')).toBe('testscript');
      expect(sanitizeInput('test{}')).toBe('test');
    });

    it('should remove control characters', () => {
      expect(sanitizeInput('test\x00test')).toBe('testtest');
    });

    it('should handle empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle normal input', () => {
      expect(sanitizeInput('normal text')).toBe('normal text');
    });
  });

  describe('validateDogId', () => {
    it('should accept valid dog IDs', () => {
      expect(validateDogId('1')).toBe(true);
      expect(validateDogId('12345')).toBe(true);
      expect(validateDogId('9999999999')).toBe(true);
    });

    it('should reject non-numeric IDs', () => {
      expect(validateDogId('abc')).toBe(false);
      expect(validateDogId('123abc')).toBe(false);
      expect(validateDogId('12-34')).toBe(false);
    });

    it('should reject IDs longer than 10 digits', () => {
      expect(validateDogId('12345678901')).toBe(false);
    });

    it('should reject zero', () => {
      expect(validateDogId('0')).toBe(false);
    });

    it('should reject negative numbers', () => {
      expect(validateDogId('-1')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateDogId('')).toBe(false);
    });
  });

  describe('validateYear', () => {
    it('should accept valid years', () => {
      expect(validateYear('2015')).toBe(true);
      expect(validateYear('2026')).toBe(true);
      expect(validateYear('2030')).toBe(true);
    });

    it('should reject years before 2015', () => {
      expect(validateYear('2014')).toBe(false);
      expect(validateYear('2000')).toBe(false);
    });

    it('should reject years after 2030', () => {
      expect(validateYear('2031')).toBe(false);
      expect(validateYear('2050')).toBe(false);
    });

    it('should reject non-numeric input', () => {
      expect(validateYear('abc')).toBe(false);
      expect(validateYear('202abc')).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateYear('')).toBe(false);
    });
  });

  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      expect(validateSearchQuery('rex')).toBe(true);
      expect(validateSearchQuery('golden retriever')).toBe(true);
      expect(validateSearchQuery('test dog name')).toBe(true);
    });

    it('should reject queries shorter than 2 characters after sanitization', () => {
      expect(validateSearchQuery('a')).toBe(false);
      expect(validateSearchQuery('x')).toBe(false);
    });

    it('should accept queries within 100 characters after sanitization', () => {
      const longQuery = 'a'.repeat(150);
      expect(validateSearchQuery(longQuery)).toBe(true); // After sanitization, it's 100 chars (within limit)
    });

    it('should sanitize input before validation', () => {
      expect(validateSearchQuery('  a  ')).toBe(false); // After sanitization, it's 'a' (1 char, too short)
      expect(validateSearchQuery('  ab  ')).toBe(true); // After sanitization, it's 'ab' (2 chars, valid)
      expect(validateSearchQuery('test<script>')).toBe(true); // After sanitization, it's 'testscript' (9 chars, valid)
    });

    it('should reject empty string', () => {
      expect(validateSearchQuery('')).toBe(false);
    });
  });
});
