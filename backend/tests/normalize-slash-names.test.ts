import { describe, expect, it } from 'vitest'
import { splitBilingualSlashNames } from '../scripts/ops/normalize-slash-dog-names'

describe('splitBilingualSlashNames', () => {
  it('splits identical bilingual slash string in both fields into separate ru/lat', () => {
    const res = splitBilingualSlashNames(
      'МОНАННА РЕПАБЛИК ХИДАН /MONANNA REPUBLIC HIDAN',
      'МОНАННА РЕПАБЛИК ХИДАН /MONANNA REPUBLIC HIDAN',
    )
    expect(res).toEqual({
      name_lat: 'MONANNA REPUBLIC HIDAN',
      name_ru: 'МОНАННА РЕПАБЛИК ХИДАН',
      changed: true,
    })
  })

  it('splits partial slash in name_ru when name_lat already holds latin', () => {
    const res = splitBilingualSlashNames(
      'VALPAIN PEK KLARISSA',
      'ВАЛЬПАЙН ПЭК КЛАРИССА /VALPAIN PEK KLARISSA',
    )
    expect(res).toEqual({
      name_lat: 'VALPAIN PEK KLARISSA',
      name_ru: 'ВАЛЬПАЙН ПЭК КЛАРИССА',
      changed: true,
    })
  })

  it('collapses identical X / X duplicate', () => {
    const res = splitBilingualSlashNames('PANDORA / PANDORA', 'PANDORA / PANDORA')
    expect(res).toEqual({
      name_lat: 'PANDORA',
      name_ru: '',
      changed: true,
    })
  })

  it('preserves distinct same-script nicknames untouched', () => {
    const res = splitBilingualSlashNames('ALFA / OMEGA', '')
    expect(res.changed).toBe(false)
  })
})
