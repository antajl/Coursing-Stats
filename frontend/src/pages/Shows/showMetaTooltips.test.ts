import { describe, it, expect } from 'vitest'
import { getClubTooltip, getFederationTooltip, getRankTooltip } from './showMetaTooltips'

describe('showMetaTooltips', () => {
  describe('getFederationTooltip', () => {
    it('returns null for empty values', () => {
      expect(getFederationTooltip(null)).toBeNull()
      expect(getFederationTooltip('')).toBeNull()
    })

    it('resolves РФСС correctly', () => {
      const tip = getFederationTooltip('РФСС')
      expect(tip).not.toBeNull()
      expect(tip?.title).toContain('РФСС — Российская федерация служебного собаководства')
      expect(tip?.description).toContain('РКФ')
    })

    it('resolves РФОС correctly', () => {
      const tip = getFederationTooltip('РФОС')
      expect(tip?.title).toContain('охотничьего собаководства')
    })

    it('resolves РФЛС correctly', () => {
      const tip = getFederationTooltip('РФЛС')
      expect(tip?.title).toContain('любительского собаководства')
    })

    it('resolves ОАНКОО and sub-divisions', () => {
      const tip = getFederationTooltip('ОАНКОО/РКК')
      expect(tip?.title).toContain('ОАНКОО')
      expect(tip?.title).toContain('РКК')
    })
  })

  describe('getRankTooltip', () => {
    it('resolves CAC ЧФ', () => {
      const tip = getRankTooltip('CAC ЧФ')
      expect(tip?.title).toContain('Чемпион Федерации')
      expect(tip?.description).toContain('3 сертификатов ЧФ')
    })

    it('resolves CAC ЧРКФ', () => {
      const tip = getRankTooltip('CAC ЧРКФ')
      expect(tip?.title).toContain('Чемпион РКФ')
      expect(tip?.description).toContain('чемпионы России')
    })

    it('resolves ЧРКФ с особым статусом', () => {
      const tip = getRankTooltip('ЧРКФ с особым статусом')
      expect(tip?.title).toContain('особым статусом')
      expect(tip?.description).toContain('каждого взрослого класса')
    })

    it('resolves CACIB FCI', () => {
      const tip = getRankTooltip('CACIB FCI')
      expect(tip?.title).toContain('CACIB FCI')
      expect(tip?.description).toContain('международные')
    })

    it('resolves КЧК and ПК', () => {
      expect(getRankTooltip('КЧК')?.title).toContain('Кандидат в чемпионы клуба')
      expect(getRankTooltip('ПК')?.title).toContain('Победитель клуба года')
    })
  })

  describe('getClubTooltip', () => {
    it('resolves РОО СОКК abbreviations', () => {
      const tip = getClubTooltip('РОО СОКК')
      expect(tip?.title).toBe('РОО СОКК')
      expect(tip?.description).toContain('Региональная общественная организация')
      expect(tip?.description).toContain('Саратовский областной кинологический клуб')
    })

    it('resolves РОКО ДРПЦС abbreviations', () => {
      const tip = getClubTooltip('РОКО ДРПЦС')
      expect(tip?.title).toBe('РОКО ДРПЦС')
      expect(tip?.description).toContain('Региональная общественная кинологическая организация')
      expect(tip?.description).toContain('Донецкий региональный племенной центр собаководства')
    })
  })
})
