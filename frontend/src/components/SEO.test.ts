import { describe, expect, it } from 'vitest'
import { cleanOgTitle, cleanOgDescription } from './SEO'

describe('SEO component helpers', () => {
  describe('cleanOgTitle', () => {
    it('handles undefined and empty string gracefully without throwing', () => {
      expect(cleanOgTitle(undefined)).toBe('')
      expect(cleanOgTitle('')).toBe('')
    })

    it('cleans site name branding from title', () => {
      expect(cleanOgTitle('Курсинг Статс — Выставка РКФ')).toBe('Выставка РКФ')
      expect(cleanOgTitle('Выставка собак | Курсинг Статс')).toBe('Выставка собак')
      expect(cleanOgTitle('Dog Profile | Coursing Stats')).toBe('Dog Profile')
    })
  })

  describe('cleanOgDescription', () => {
    it('handles undefined and empty string gracefully without throwing', () => {
      expect(cleanOgDescription(undefined)).toBe('')
      expect(cleanOgDescription('')).toBe('')
      expect(cleanOgDescription(undefined, 'Title')).toBe('')
    })

    it('removes site branding phrases from description', () => {
      const desc = 'Результаты выставки на портале Курсинг Статс.'
      expect(cleanOgDescription(desc)).toBe('Результаты выставки.')
    })

    it('removes duplicate entity prefixes when title is provided', () => {
      const title = 'Арктик Терра — результаты'
      const desc = 'Арктик Терра: Выставка РКФ: Арктик Терра. 145 собак.'
      const cleaned = cleanOgDescription(desc, title)
      expect(cleaned).not.toContain('Арктик Терра: Арктик Терра')
    })
  })
})
