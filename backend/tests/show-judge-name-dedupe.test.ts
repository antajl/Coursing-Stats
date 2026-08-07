import { describe, it, expect } from 'vitest'
import {
  normalizeShowJudgeDisplayName,
  parseShowJudgeNameParts,
  showJudgeMergeKey,
  showJudgeMergeKeyFromRaw,
} from '../lib/show-judge-name'

describe('show judge name deduplication', () => {
  describe('normalizeShowJudgeDisplayName', () => {
    it('removes country suffixes in parentheses', () => {
      expect(normalizeShowJudgeDisplayName('Васильев Олег (Россия)')).toBe('васильев олег')
      expect(normalizeShowJudgeDisplayName('Васильев Олег (russia)')).toBe('васильев олег')
      expect(normalizeShowJudgeDisplayName('Васильев Олег (RF)')).toBe('васильев олег')
      expect(normalizeShowJudgeDisplayName('Васильев Олег (РКФ)')).toBe('васильев олег')
    })

    it('strips country after dash', () => {
      expect(normalizeShowJudgeDisplayName('Dusan Paunovic - Serbia')).toBe('dusan paunovic')
      expect(normalizeShowJudgeDisplayName('Zaur Agabeyli - Azerbaydzhan')).toBe('zaur agabeyli')
    })

    it('replaces commas and semicolons with spaces', () => {
      expect(normalizeShowJudgeDisplayName('Белкин, Алексей')).toBe('белкин алексей')
      expect(normalizeShowJudgeDisplayName('Белкин;Алексей')).toBe('белкин алексей')
    })

    it('collapses multiple spaces and maps ё→е', () => {
      expect(normalizeShowJudgeDisplayName('ЗАХАРОВА  ГАЛИНА   ПЕТРОВНА')).toBe('захарова галина петровна')
      expect(normalizeShowJudgeDisplayName('КРЕМНЁВ МИХАИЛ')).toBe('кремнев михаил')
      expect(normalizeShowJudgeDisplayName('ПОТЁМКИНА ЕЛЕНА')).toBe('потемкина елена')
    })

    it('handles glued surname+name (Гаврилова Яна -> ГавриловаЯна)', () => {
      expect(normalizeShowJudgeDisplayName('ГАВРИЛОВАЯНА АДОЛЬФОВНА')).toBe('гаврилова яна адольфовна')
    })

    it('normalizes case', () => {
      expect(normalizeShowJudgeDisplayName('ЗАХАРОВА ГАЛИНА ПЕТРОВНА')).toBe('захарова галина петровна')
    })

    it('handles initials with dots', () => {
      expect(normalizeShowJudgeDisplayName('ЗАХАРОВА Г.П.')).toBe('захарова г п')
    })

    it('fixes Latin C in Cyrillic name (КИЧ CВЕТЛАНА)', () => {
      expect(normalizeShowJudgeDisplayName('КИЧ CВЕТЛАНА НИКОЛАЕВНА')).toBe('кич светлана николаевна')
    })

    it('drops doubled surname', () => {
      expect(normalizeShowJudgeDisplayName('ВАСИЛЕНКО ТАТЬЯНА ВАСИЛЕНКО')).toBe('василенко татьяна')
      expect(normalizeShowJudgeDisplayName('ШИЯН ВЛАДИМИР ШИЯН')).toBe('шиян владимир')
    })

    it('fixes known typos', () => {
      expect(normalizeShowJudgeDisplayName('БЕЛКИ АЛЕКСЕЙ СЕРГЕЕВИЧ')).toBe('белкин алексей сергеевич')
      expect(normalizeShowJudgeDisplayName('Покровскя Ю.В.')).toBe('покровская ю в')
    })

    it('canonicalizes Latin given-name spellings', () => {
      expect(normalizeShowJudgeDisplayName('Tatiana GRIGORENKO')).toBe('tatyana grigorenko')
      expect(normalizeShowJudgeDisplayName('Dmitrii TROFIMOV')).toBe('dmitry trofimov')
      expect(normalizeShowJudgeDisplayName('Dmitriy TROFIMOV')).toBe('dmitry trofimov')
    })
  })

  describe('parseShowJudgeNameParts', () => {
    it('parses full name', () => {
      const result = parseShowJudgeNameParts('захарова галина петровна')
      expect(result).toEqual({
        last: 'захарова',
        first: 'галина',
        middle: 'петровна',
        firstInitial: 'г',
        middleInitial: 'п',
      })
    })

    it('parses name with initials', () => {
      const result = parseShowJudgeNameParts('захарова г п')
      expect(result).toEqual({
        last: 'захарова',
        first: 'г',
        middle: 'п',
        firstInitial: 'г',
        middleInitial: 'п',
      })
    })

    it('parses name without patronymic', () => {
      const result = parseShowJudgeNameParts('белкин алексей')
      expect(result).toEqual({
        last: 'белкин',
        first: 'алексей',
        middle: '',
        firstInitial: 'а',
        middleInitial: '',
      })
    })

    it('handles single word (just surname)', () => {
      const result = parseShowJudgeNameParts('иванов')
      expect(result).toEqual({
        last: 'иванов',
        first: '',
        middle: '',
        firstInitial: '',
        middleInitial: '',
      })
    })
  })

  describe('showJudgeMergeKey', () => {
    it('creates merge key from full name', () => {
      const parts = parseShowJudgeNameParts('захарова галина петровна')
      expect(showJudgeMergeKey(parts)).toBe('захарова|г|п')
    })

    it('creates merge key from initials', () => {
      const parts = parseShowJudgeNameParts('захарова г п')
      expect(showJudgeMergeKey(parts)).toBe('захарова|г|п')
    })

    it('creates merge key without patronymic', () => {
      const parts = parseShowJudgeNameParts('белкин алексей')
      expect(showJudgeMergeKey(parts)).toBe('белкин|а|*')
    })
  })

  describe('deduplication scenarios', () => {
    it('merges different forms of Захарова', () => {
      const forms = ['ЗАХАРОВА ГАЛИНА ПЕТРОВНА', 'ЗАХАРОВА ГАЛИНА', 'Захарова Г.П.']
      const keys = forms.map((form) => showJudgeMergeKeyFromRaw(form))
      expect(keys[0]).toBe('захарова|г|п')
      expect(keys[1]).toBe('захарова|г|*')
      expect(keys[2]).toBe('захарова|г|п')
    })

    it('merges Гаврилова Яна and ГавриловаЯна', () => {
      const forms = ['ГАВРИЛОВА ЯНА АДОЛЬФОВНА', 'ГАВРИЛОВАЯНА АДОЛЬФОВНА']
      const keys = forms.map((form) => showJudgeMergeKeyFromRaw(form))
      expect(keys.every((key) => key === keys[0])).toBe(true)
      expect(keys[0]).toBe('гаврилова|я|а')
    })

    it('merges Белкин full and comma form', () => {
      const forms = ['БЕЛКИН АЛЕКСЕЙ СЕРГЕЕВИЧ', 'Белкин, Алексей']
      const keys = forms.map((form) => showJudgeMergeKeyFromRaw(form))
      expect(keys[0]).toBe('белкин|а|с')
      expect(keys[1]).toBe('белкин|а|*')
    })

    it('merges ё/е and typo variants to same key', () => {
      expect(showJudgeMergeKeyFromRaw('КРЕМНЕВ МИХАИЛ ЮРЬЕВИЧ')).toBe(
        showJudgeMergeKeyFromRaw('КРЕМНЁВ МИХАИЛ ЮРЬЕВИЧ'),
      )
      expect(showJudgeMergeKeyFromRaw('БЕЛКИ АЛЕКСЕЙ СЕРГЕЕВИЧ')).toBe(
        showJudgeMergeKeyFromRaw('БЕЛКИН АЛЕКСЕЙ СЕРГЕЕВИЧ'),
      )
      expect(showJudgeMergeKeyFromRaw('КИЧ CВЕТЛАНА НИКОЛАЕВНА')).toBe(
        showJudgeMergeKeyFromRaw('КИЧ СВЕТЛАНА НИКОЛАЕВНА'),
      )
    })

    it('merges Latin spelling variants', () => {
      expect(showJudgeMergeKeyFromRaw('Tatiana GRIGORENKO')).toBe(
        showJudgeMergeKeyFromRaw('Tatyana Grigorenko'),
      )
      expect(showJudgeMergeKeyFromRaw('Dmitrii TROFIMOV')).toBe(
        showJudgeMergeKeyFromRaw('Dmitry TROFIMOV'),
      )
      expect(showJudgeMergeKeyFromRaw('Dusan Paunovic - Serbia')).toBe(
        showJudgeMergeKeyFromRaw('Dusan Paunovic'),
      )
      // разные фамилии на Yulia — не сливать
      expect(showJudgeMergeKeyFromRaw('Yulia OVSYANNIKOVA')).not.toBe(
        showJudgeMergeKeyFromRaw('Yulia Olkova - Kazahstan'),
      )
      expect(showJudgeMergeKeyFromRaw('Natalia Sedykh')).not.toBe(
        showJudgeMergeKeyFromRaw('Nikolay Sedykh'),
      )
    })

    it('does not merge clearly different people', () => {
      expect(showJudgeMergeKeyFromRaw('Madina TEMIROVA')).not.toBe(
        showJudgeMergeKeyFromRaw('Marina TIKHOMIROVA'),
      )
      expect(showJudgeMergeKeyFromRaw('Nikola SMOLIC')).not.toBe(
        showJudgeMergeKeyFromRaw('Nikolay Sedykh'),
      )
    })
  })
})
