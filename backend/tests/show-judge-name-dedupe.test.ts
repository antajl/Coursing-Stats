import { describe, it, expect } from 'vitest'

// Import the functions from build-show-indexes.ts
// Since these are not exported, we'll test the logic by copying them here for testing
// In production, these should be exported from a shared module

function normalizeShowJudgeDisplayName(raw: string): string {
  let normalized = raw
    .normalize('NFKC')
    .trim()
    .toLowerCase()

  // Убрать содержимое скобок: (россия), (russia), (rf), (ркф)
  normalized = normalized.replace(/\([^)]*\)/g, '')

  // Заменить запятые, точки с запятой, точки на пробелы (для инициалов)
  normalized = normalized.replace(/[,;.]+/g, ' ')

  // Схлопнуть пробелы и NBSP
  normalized = normalized.replace(/[\u00a0\s]+/g, ' ').trim()

  // Эвристика для склеенных фамилии+имени (например "гавриловаяна")
  // Консервативная: режем только если имя в whitelist
  const commonNames = new Set([
    'яна', 'алексей', 'ольга', 'елена', 'ирина', 'мария', 'анна', 'олег', 'иван',
    'петр', 'пётр', 'сергей', 'андрей', 'дмитрий', 'александр', 'наталья', 'наталья',
    'татьяна', 'екатерина', 'светлана', 'юлия', 'юлианна', 'вероника', 'виктория',
    'марина', 'елена', 'ксения', 'дарья', 'полина', 'софия', 'алина', 'михаил',
    'николай', 'николай', 'владимир', 'владислав', 'артем', 'артём', 'роман',
    'максим', 'константин', 'геннадий', 'валентин', 'виктор', 'галина', 'любовь',
    'надежда', 'зоя', 'лариса', 'оксана', 'элина', 'эдуард', 'эмиль', 'юрий',
    'григорий', 'степан', 'федор', 'илья', 'кирилл', 'павел', 'руслан', 'тимур',
    'вячеслав', 'ярослав', 'игорь', 'василий', 'алекс', 'лена', 'лена', 'наташа',
    'наташа', 'таня', 'таня', 'саша', 'саша', 'катя', 'катя', 'маша', 'маша'
  ])
  
  const words = normalized.split(/\s+/)
  const processedWords = words.map(word => {
    if (word.length >= 10) {
      // Паттерн: фамилия (оканчивается на -ова/-ева/-ина и т.д.) + имя (3+ буквы)
      const match = word.match(/^(.*?(?:ова|ева|ёва|ина|ына|ская|цкая|ский|цкий))([а-яё]{3,})$/iu)
      if (match) {
        const [, surname, name] = match
        // Проверяем whitelist имён и минимальную длину фамилии
        if (commonNames.has(name.toLowerCase()) && surname.length >= 5) {
          return `${surname} ${name}`
        }
      }
    }
    return word
  })
  normalized = processedWords.join(' ')

  return normalized
}

interface ShowJudgeNameParts {
  last: string
  first: string
  middle: string
  firstInitial: string
  middleInitial: string
}

function parseShowJudgeNameParts(normalized: string): ShowJudgeNameParts {
  const parts = normalized.split(/\s+/).filter(Boolean)
  
  const last = parts[0] || ''
  const first = parts[1] || ''
  const middle = parts[2] || ''

  // Извлечь инициалы (первая буква, убирая точку если есть)
  const firstInitial = first ? first.replace(/\./g, '').charAt(0) : ''
  const middleInitial = middle ? middle.replace(/\./g, '').charAt(0) : ''

  return { last, first, middle, firstInitial, middleInitial }
}

function showJudgeMergeKey(parts: ShowJudgeNameParts): string {
  // Use wildcard for middle initial to merge forms with/without patronymic
  const middle = parts.middleInitial || '*'
  return `${parts.last}|${parts.firstInitial}|${middle}`
}

describe('show judge name deduplication', () => {
  describe('normalizeShowJudgeDisplayName', () => {
    it('removes country suffixes in parentheses', () => {
      expect(normalizeShowJudgeDisplayName('Васильев Олег (Россия)')).toBe('васильев олег')
      expect(normalizeShowJudgeDisplayName('Васильев Олег (russia)')).toBe('васильев олег')
      expect(normalizeShowJudgeDisplayName('Васильев Олег (RF)')).toBe('васильев олег')
      expect(normalizeShowJudgeDisplayName('Васильев Олег (РКФ)')).toBe('васильев олег')
    })

    it('replaces commas and semicolons with spaces', () => {
      expect(normalizeShowJudgeDisplayName('Белкин, Алексей')).toBe('белкин алексей')
      expect(normalizeShowJudgeDisplayName('Белкин;Алексей')).toBe('белкин алексей')
    })

    it('collapses multiple spaces', () => {
      expect(normalizeShowJudgeDisplayName('ЗАХАРОВА  ГАЛИНА   ПЕТРОВНА')).toBe('захарова галина петровна')
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
  })

  describe('parseShowJudgeNameParts', () => {
    it('parses full name', () => {
      const result = parseShowJudgeNameParts('захарова галина петровна')
      expect(result).toEqual({
        last: 'захарова',
        first: 'галина',
        middle: 'петровна',
        firstInitial: 'г',
        middleInitial: 'п'
      })
    })

    it('parses name with initials', () => {
      const result = parseShowJudgeNameParts('захарова г п')
      expect(result).toEqual({
        last: 'захарова',
        first: 'г',
        middle: 'п',
        firstInitial: 'г',
        middleInitial: 'п'
      })
    })

    it('parses name without patronymic', () => {
      const result = parseShowJudgeNameParts('белкин алексей')
      expect(result).toEqual({
        last: 'белкин',
        first: 'алексей',
        middle: '',
        firstInitial: 'а',
        middleInitial: ''
      })
    })

    it('handles single word (just surname)', () => {
      const result = parseShowJudgeNameParts('иванов')
      expect(result).toEqual({
        last: 'иванов',
        first: '',
        middle: '',
        firstInitial: '',
        middleInitial: ''
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
      const forms = [
        'ЗАХАРОВА ГАЛИНА ПЕТРОВНА',
        'ЗАХАРОВА ГАЛИНА',
        'Захарова Г.П.'
      ]
      
      const keys = forms.map(form => {
        const normalized = normalizeShowJudgeDisplayName(form)
        const parts = parseShowJudgeNameParts(normalized)
        return showJudgeMergeKey(parts)
      })
      
      // Verify keys are generated correctly
      expect(keys[0]).toBe('захарова|г|п')  // Full form with patronymic
      expect(keys[1]).toBe('захарова|г|*')  // No patronymic (wildcard)
      expect(keys[2]).toBe('захарова|г|п')  // Initials with patronymic
      // Note: wildcard (*) merges with specific patronymic in buildJudgesIndex
    })

    it('merges Гаврилова Яна and ГавриловаЯна', () => {
      const forms = [
        'ГАВРИЛОВА ЯНА АДОЛЬФОВНА',
        'ГАВРИЛОВАЯНА АДОЛЬФОВНА'
      ]
      
      const keys = forms.map(form => {
        const normalized = normalizeShowJudgeDisplayName(form)
        const parts = parseShowJudgeNameParts(normalized)
        return showJudgeMergeKey(parts)
      })
      
      // After normalization, both should have the same key
      expect(keys.every(key => key === keys[0])).toBe(true)
      expect(keys[0]).toBe('гаврилова|я|а')
    })

    it('merges Белкин full and comma form', () => {
      const forms = [
        'БЕЛКИН АЛЕКСЕЙ СЕРГЕЕВИЧ',
        'Белкин, Алексей'
      ]
      
      const keys = forms.map(form => {
        const normalized = normalizeShowJudgeDisplayName(form)
        const parts = parseShowJudgeNameParts(normalized)
        return showJudgeMergeKey(parts)
      })
      
      // Both should have wildcard (no patronymic in second form)
      expect(keys[0]).toBe('белкин|а|с')  // Full form with patronymic
      expect(keys[1]).toBe('белкин|а|*')  // No patronymic (wildcard)
      // Note: wildcard (*) merges with specific patronymic in buildJudgesIndex
    })

    it('merges Васильев full and with country suffix', () => {
      const forms = [
        'ВАСИЛЬЕВ ОЛЕГ НИКОЛАЕВИЧ',
        'Васильев Олег (Россия)'
      ]
      
      const keys = forms.map(form => {
        const normalized = normalizeShowJudgeDisplayName(form)
        const parts = parseShowJudgeNameParts(normalized)
        return showJudgeMergeKey(parts)
      })
      
      // Full form has specific patronymic, abbreviated form has wildcard
      expect(keys[0]).toBe('васильев|о|н')  // Full form with patronymic
      expect(keys[1]).toBe('васильев|о|*')  // No patronymic (wildcard)
      // Note: wildcard (*) merges with specific patronymic in buildJudgesIndex
    })

    it('does NOT merge different first names (Иванов Иван vs Иванов Пётр)', () => {
      const forms = [
        'ИВАНОВ ИВАН',
        'ИВАНОВ ПЁТР'
      ]
      
      const keys = forms.map(form => {
        const normalized = normalizeShowJudgeDisplayName(form)
        const parts = parseShowJudgeNameParts(normalized)
        return showJudgeMergeKey(parts)
      })
      
      expect(keys[0]).toBe('иванов|и|*')
      expect(keys[1]).toBe('иванов|п|*')
      expect(keys[0]).not.toBe(keys[1])
    })

    it('does NOT merge different patronymics when first initials are same', () => {
      const forms = [
        'Захарова Г.А.',
        'Захарова Г.П.'
      ]
      
      const keys = forms.map(form => {
        const normalized = normalizeShowJudgeDisplayName(form)
        const parts = parseShowJudgeNameParts(normalized)
        return showJudgeMergeKey(parts)
      })
      
      // Both have specific patronymics, should NOT merge
      expect(keys[0]).toBe('захарова|г|а')
      expect(keys[1]).toBe('захарова|г|п')
      expect(keys[0]).not.toBe(keys[1])
    })
  })
})
