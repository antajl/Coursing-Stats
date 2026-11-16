import { describe, it, expect } from 'vitest'
import { loadKonuraJudges, matchKonuraJudge } from '../lib/konura-judges.js'

describe('konura judges enrichment', () => {
  it('loads all 304 judges from konura-judges.json', () => {
    const list = loadKonuraJudges()
    expect(list.length).toBe(304)
    expect(list[0].id).toBe(1)
    expect(list[list.length - 1].id).toBe(304)
  })

  it('matches prominent Russian judges by exact full name', () => {
    const belkin = matchKonuraJudge('Белкин Алексей Сергеевич')
    expect(belkin).not.toBeNull()
    expect(belkin?.id).toBe(11)
    expect(belkin?.city).toBe('Нижний Новгород')
    expect(belkin?.photo_url).toBe('http://www.konura.info/content/images/experts/11/thumb.jpg')
    expect(belkin?.konura_url).toBe('http://www.konura.info/experts/belkin-aleksey-sergeevich-11.html')

    const gavrilova = matchKonuraJudge('Гаврилова Яна Адольфовна')
    expect(gavrilova).not.toBeNull()
    expect(gavrilova?.id).toBe(16)
  })

  it('matches judges with inverted name order (Last First Patronymic)', () => {
    const abrakimov = matchKonuraJudge('Абракимов Шамиль Масумович')
    expect(abrakimov).not.toBeNull()
    expect(abrakimov?.id).toBe(1)
    expect(abrakimov?.city).toBe('Москва')
  })

  it('matches foreign judges with Latin names', () => {
    const paunovic = matchKonuraJudge('Paunovic Dusan')
    expect(paunovic).not.toBeNull()
    expect(paunovic?.id).toBe(126)
    expect(paunovic?.city).toBe('Белград')
  })

  it('returns null for non-existent judge', () => {
    const nonexistent = matchKonuraJudge('Несуществующий Судья РКФ 99999')
    expect(nonexistent).toBeNull()
  })
})
