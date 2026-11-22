import { describe, it, expect } from 'vitest'
import { classifyShowScope, cleanNkpName } from '../lib/show-types'

describe('classifyShowScope & show-types', () => {
  it('correctly classifies standard mono exhibitions with NKP and KCHK', () => {
    const entry = {
      id: 115300,
      title: 'Монопородная выставка клуба ОРО РКЛС',
      ranks: 'КЧК',
      national_breed_club_name: 'НКП РУССКИЙ ТОЙ',
      breeds: 'Русский той',
    }
    const info = classifyShowScope(entry)
    expect(info.scope).toBe('mono')
    expect(info.isMono).toBe(true)
    expect(info.isAllBreed).toBe(false)
    expect(info.nkpName).toBe('РУССКИЙ ТОЙ')
    expect(info.targetBreed).toBe('Русский той')
  })

  it('correctly classifies mono exhibition with KCHK in each class', () => {
    const entry = {
      id: 115298,
      title: 'Монопородная выставка клуба МКОО "ИМПЕРИЯ ЗВЁЗД"',
      ranks: 'КЧК в каждом классе',
      national_breed_club_name: 'НКП ШИ ТЦУ',
      breeds: 'Ши тцу',
    }
    const info = classifyShowScope(entry)
    expect(info.scope).toBe('mono')
    expect(info.isMono).toBe(true)
    expect(info.nkpName).toBe('ШИ ТЦУ')
  })

  it('correctly classifies National Club Champion (ЧК) show', () => {
    const entry = {
      id: 99123,
      title: 'Национальная выставка породы Салюки "Победитель клуба года"',
      ranks: 'Национальная "Победитель клуба года"',
      national_breed_club_name: 'НКП САЛЮКИ',
      breeds: 'Салюки',
    }
    const info = classifyShowScope(entry)
    expect(info.scope).toBe('mono')
    expect(info.isMono).toBe(true)
    expect(info.nkpName).toBe('САЛЮКИ')
  })

  it('correctly classifies all-breed CAC ЧРКФ and CACIB shows', () => {
    const entry = {
      id: 88944,
      title: 'Рейтинговая выставка (ранг ЧРКФ с особым статусом) клуба "ХКОЛЖ "РЕГИОН ДВ""',
      ranks: 'ЧРКФ с особым статусом',
      national_breed_club_name: null,
      breeds: '',
    }
    const info = classifyShowScope(entry)
    expect(info.scope).toBe('all_breed')
    expect(info.isMono).toBe(false)
    expect(info.isAllBreed).toBe(true)
  })

  it('correctly classifies specialty ring inside an all-breed CAC show', () => {
    const entry = {
      id: 77123,
      title: 'Выставка собак всех пород САС ЧРКФ + Specialty',
      ranks: 'САС ЧРКФ, Specialty',
      national_breed_club_name: 'НКП СИБИРСКИЙ ХАСКИ',
      breeds: 'Сибирский хаски',
    }
    const info = classifyShowScope(entry)
    expect(info.scope).toBe('specialty')
    expect(info.isSpecialty).toBe(true)
    expect(info.isMono).toBe(false)
    expect(info.isAllBreed).toBe(false)
    expect(info.nkpName).toBe('СИБИРСКИЙ ХАСКИ')
  })

  it('cleanNkpName strips leading НКП / НКП: prefixes cleanly', () => {
    expect(cleanNkpName('НКП: САЛЮКИ')).toBe('САЛЮКИ')
    expect(cleanNkpName('НКП САЛЮКИ')).toBe('САЛЮКИ')
    expect(cleanNkpName('нкп: немецкий дог')).toBe('немецкий дог')
    expect(cleanNkpName(null)).toBeNull()
    expect(cleanNkpName('')).toBeNull()
  })
})
