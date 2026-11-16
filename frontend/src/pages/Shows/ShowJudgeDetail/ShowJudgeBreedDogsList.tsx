import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import DogSexIcon from '../../../components/DogSexIcon'
import ShowGradeChip from '../../../lib/ShowGradeChip'
import DoninoColumnPlaque, { DoninoColumnShell } from '../../SpeedRecords/DoninoColumnPlaque'
import { exhibitionDogProfilePath } from '../ShowExhibitionDetail/exhibitionDetailUtils'
import { formatShowGradeDisplay } from '../../../../../backend/lib/show-grades'
import { showJudgeMergeKeyFromRaw } from '../../../../../backend/lib/show-judge-name'
import { canonicalBreed, formatBreedSentenceCase } from '../../../lib/breedMapping'
import { getShowExhibition } from '../../../lib/staticData'
import type { GradeScope } from '../../../components/ShowJudgeCard'

export interface ShowJudgeBreedDogEntry {
  id: string | number
  dog_name: string
  breed: string
  class: string
  placement?: number
  grade?: string
  title?: string
  sex?: string
  catalog_number?: number
  owner?: string
  exhibition_id: number
  exhibition_title: string
  exhibition_date: string
}

function isBreedMatch(b1: string, b2: string): boolean {
  if (b1 === b2) return true
  const c1 = canonicalBreed(b1)
  const c2 = canonicalBreed(b2)
  if (c1 && c2 && c1 === c2) return true
  const n1 = b1.toLowerCase().trim()
  const n2 = b2.toLowerCase().trim()
  return n1.includes(n2) || n2.includes(n1)
}

function matchesJudge(rowJudge: string | undefined, judgeId: string, judgeName: string): boolean {
  if (!rowJudge) return true
  const normRow = rowJudge.toLowerCase().trim()
  const normId = judgeId.toLowerCase().trim()
  const normName = judgeName.toLowerCase().trim()
  if (showJudgeMergeKeyFromRaw(rowJudge) === judgeId) return true
  if (normRow.includes(normName) || normName.includes(normRow)) return true
  const parts = normName.split(/\s+/)
  const surname = parts[0]
  if (surname && surname.length > 2 && normRow.includes(surname)) return true
  return false
}

function getAwardPriority(title: string): number {
  if (!title) return 0
  const t = title.toUpperCase()
  if (t.includes('BOB') || t.includes('ЛПП')) return 100
  if (t.includes('BOS') || t.includes('ЛПП/BOS')) return 95
  if (t.includes('CACIB')) return 90
  if (t.includes('КЧК') || t.includes('ЧК')) return 85
  if (t.includes('ЮКЧК') || t.includes('ВКЧК')) return 82
  if (t.includes('CAC') || t.includes('САС') || t.includes('ЧФ')) return 80
  if (t.includes('JCAC') || t.includes('ЮСАС') || t.includes('ЮЧФ')) return 78
  if (t.includes('VCAC') || t.includes('ВЕТ.САС') || t.includes('ВЧФ')) return 76
  if (t.includes('CW') || t.includes('ПОБЕДИТЕЛЬ КЛАССА')) return 70
  if (t.includes('СС') || t.includes('ЮСС')) return 65
  return 50
}

function getGradePriority(grade: string): number {
  if (!grade) return 0
  const g = grade.toUpperCase()
  if (g.includes('ОТЛ') || g.includes('EXCELLENT') || g === 'ОО') return 50
  if (g.includes('ОЧ.ХОР') || g.includes('VERY GOOD')) return 40
  if (g.includes('ОП') || g.includes('ОЧ.ПЕРСП') || g.includes('VERY PROMISING')) return 35
  if (g.includes('ХОР') || g.includes('GOOD')) return 30
  if (g.includes('ПЕРСП') || g === 'П' || g.includes('PROMISING')) return 25
  if (g.includes('УДОВЛ') || g.includes('SATISFACTORY')) return 15
  if (g.includes('ДИСКВ') || g.includes('DQ')) return 5
  return 10
}

function sortShowJudgeDogs(dogs: ShowJudgeBreedDogEntry[]): ShowJudgeBreedDogEntry[] {
  return [...dogs].sort((a, b) => {
    const aAward = getAwardPriority(a.title || '')
    const bAward = getAwardPriority(b.title || '')
    if (aAward !== bAward) return bAward - aAward

    if (a.placement && b.placement && a.placement !== b.placement) {
      return a.placement - b.placement
    }
    if (a.placement && !b.placement) return -1
    if (!a.placement && b.placement) return 1

    const aGrade = getGradePriority(a.grade || '')
    const bGrade = getGradePriority(b.grade || '')
    if (aGrade !== bGrade) return bGrade - aGrade

    if (a.catalog_number && b.catalog_number && a.catalog_number !== b.catalog_number) {
      return a.catalog_number - b.catalog_number
    }

    return a.dog_name.localeCompare(b.dog_name, 'ru')
  })
}

function formatDogCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} собак`
  if (mod10 === 1) return `${count} собака`
  if (mod10 >= 2 && mod10 <= 4) return `${count} собаки`
  return `${count} собак`
}

function formatPuppyCount(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod100 >= 11 && mod100 <= 14) return `${count} щенков`
  if (mod10 === 1) return `${count} щенок`
  if (mod10 >= 2 && mod10 <= 4) return `${count} щенка`
  return `${count} щенков`
}

export function isPuppyClassOrGrade(dogClass?: string, dogGrade?: string): boolean {
  if (dogClass) {
    const c = dogClass.toLowerCase().trim()
    if (
      c.includes('бэби') ||
      c.includes('беби') ||
      c.includes('baby') ||
      c.includes('щенок') ||
      c.includes('щенк') ||
      c.includes('puppy') ||
      c === 'б' ||
      c === 'беб' ||
      c === 'щен'
    ) {
      return true
    }
  }
  if (dogGrade) {
    const g = dogGrade.toUpperCase().trim()
    if (
      g.includes('ОП') ||
      g.includes('ОЧ.ПЕРСП') ||
      g.includes('ОЧЕНЬ ПЕРСПЕКТИВНЫЙ') ||
      g.includes('VERY PROMISING') ||
      g.includes('ПЕРСП') ||
      g.includes('ПЕРСПЕКТИВНЫЙ') ||
      g.includes('PROMISING') ||
      g.includes('НЕПЕРСП') ||
      g.includes('НЕ ПЕРСП')
    ) {
      return true
    }
  }
  return false
}

function cleanDogName(rawName: string): { name: string; parsedCatalogNumber?: number } {
  let name = (rawName || '').trim()
  let parsedCatalogNumber: number | undefined

  const match = name.match(/^\s*\((\d+)\)\s*(.*)$/) || name.match(/^\s*(\d+)[\.\)]\s*(.*)$/)
  if (match) {
    parsedCatalogNumber = parseInt(match[1], 10)
    name = match[2].trim()
  }

  return { name, parsedCatalogNumber }
}

interface ShowJudgeBreedDogsListProps {
  judgeId: string
  judgeName: string
  breed: string
  periodExhibitions: Array<{
    id: number
    date: string
    title: string
    rkf_url?: string
    breed_counts?: Record<string, number>
  }>
  searchQuery?: string
  gradeScope?: GradeScope
  embedded?: boolean
}

export function ShowJudgeBreedDogsList({
  judgeId,
  judgeName,
  breed,
  periodExhibitions,
  searchQuery = '',
  gradeScope = 'adult',
  embedded = false,
}: ShowJudgeBreedDogsListProps) {
  const matchingExhibitions = useMemo(() => {
    return periodExhibitions.filter((ex) => {
      if (!ex.breed_counts) return false
      return Object.keys(ex.breed_counts).some((b) => isBreedMatch(b, breed))
    })
  }, [periodExhibitions, breed])

  const exhibitionIds = useMemo(
    () => matchingExhibitions.map((e) => String(e.id)).sort(),
    [matchingExhibitions],
  )

  const { data: dogs = [], isLoading } = useQuery({
    queryKey: ['showJudgeBreedDogs', judgeId, breed, exhibitionIds.join(',')],
    queryFn: async () => {
      if (matchingExhibitions.length === 0) return []
      const protocols = await Promise.all(
        matchingExhibitions.map(async (ex) => {
          try {
            const res = await getShowExhibition(String(ex.id))
            if (res.success && res.data) {
              return { exhibition: ex, protocol: res.data }
            }
          } catch (e) {
            console.error('Failed to load exhibition protocol:', ex.id, e)
          }
          return null
        }),
      )

      const extractedDogs: ShowJudgeBreedDogEntry[] = []
      for (const item of protocols) {
        if (!item || !item.protocol.results) continue
        const { exhibition, protocol } = item
        for (const r of protocol.results) {
          if (!isBreedMatch(r.breed, breed)) continue
          const rowJudge = (r.breed_judge || r.judge || '').trim()
          if (!matchesJudge(rowJudge, judgeId, judgeName)) continue

          const { name: cleanedName, parsedCatalogNumber } = cleanDogName(r.dog_name)
          const catalogNumber = r.catalog_number || parsedCatalogNumber

          extractedDogs.push({
            id: r.dog_breed_id || `${protocol.id}-${catalogNumber || cleanedName}`,
            dog_name: cleanedName || r.dog_name,
            breed: r.breed,
            class: r.class || '',
            placement: r.placement || 0,
            grade: r.grade || '',
            title: r.title || '',
            sex:
              r.sex ||
              (r.dog_name?.includes('♀') ? 'F' : r.dog_name?.includes('♂') ? 'M' : undefined),
            catalog_number: catalogNumber,
            owner: r.owner,
            exhibition_id: protocol.id,
            exhibition_title: protocol.title || exhibition.title,
            exhibition_date: protocol.date || exhibition.date,
          })
        }
      }

      return sortShowJudgeDogs(extractedDogs)
    },
    staleTime: 5 * 60 * 1000,
  })

  const scopeFilteredDogs = useMemo(() => {
    if (!gradeScope || gradeScope === 'all') return dogs
    if (gradeScope === 'puppy') {
      return dogs.filter((d) => isPuppyClassOrGrade(d.class, d.grade))
    }
    return dogs.filter((d) => !isPuppyClassOrGrade(d.class, d.grade))
  }, [dogs, gradeScope])

  const filteredDogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return scopeFilteredDogs
    return scopeFilteredDogs.filter(
      (d) =>
        d.dog_name.toLowerCase().includes(q) ||
        d.class?.toLowerCase().includes(q) ||
        d.owner?.toLowerCase().includes(q) ||
        String(d.catalog_number || '').includes(q),
    )
  }, [scopeFilteredDogs, searchQuery])

  const content = (
    <div className={embedded ? 'bg-cream-50/25 border-t border-old-money-100/70' : ''}>
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 py-6 text-xs text-charcoal-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-old-money-300 border-t-camel-600" />
          <span>Загрузка списка собак из каталогов РКФ...</span>
        </div>
      )}

      {!isLoading && filteredDogs.length === 0 && (
        <div className="py-5 px-4 text-center text-xs text-charcoal-500">
          {dogs.length === 0
            ? 'Подробный каталог с кличками собак по данной породе не найден в опубликованных протоколах РКФ.'
            : searchQuery
              ? `Собаки по запросу «${searchQuery}» не найдены`
              : gradeScope === 'puppy'
                ? `В ринге не найдено щенков и бэби по породе «${breed}» (всего в каталогах ${dogs.length} взрослых)`
                : `В ринге не найдено взрослых собак по породе «${breed}»`}
        </div>
      )}

      {!isLoading && filteredDogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-cream-100/50 text-[11px] sm:text-xs font-semibold text-charcoal-700 border-b border-old-money-100/70 select-none">
            <span className="flex items-center gap-1.5">
              <span className="text-charcoal-500 font-normal">
                {gradeScope === 'puppy'
                  ? 'Щенки и бэби:'
                  : gradeScope === 'all'
                    ? 'Все собаки:'
                    : 'Взрослые классы:'}
              </span>
              <strong className="text-charcoal-900 font-bold tabular-nums">
                {gradeScope === 'puppy'
                  ? formatPuppyCount(filteredDogs.length)
                  : formatDogCount(filteredDogs.length)}
              </strong>
            </span>
            {dogs.length > filteredDogs.length && (
              <span className="text-[10.5px] text-charcoal-400 font-normal">
                из {dogs.length} всего в каталогах
              </span>
            )}
          </div>
          <div className="divide-y divide-old-money-100/50">
            {filteredDogs.map((dog, idx) => {
            const dogProfileUrl = exhibitionDogProfilePath(dog.dog_name, dog.breed)

            return (
              <div
                key={`${dog.exhibition_id}-${dog.catalog_number || dog.dog_name}-${idx}`}
                className="flex flex-row items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 hover:bg-cream-100/50 transition-colors gap-3"
              >
                {/* Dog Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {dogProfileUrl ? (
                      <Link
                        to={dogProfileUrl}
                        className="font-bold text-sm sm:text-[15px] leading-snug text-charcoal-900 truncate hover:text-camel-800 hover:underline transition-colors"
                        title={dog.dog_name}
                      >
                        {dog.dog_name}
                      </Link>
                    ) : (
                      <span
                        className="font-bold text-sm sm:text-[15px] leading-snug text-charcoal-900 truncate"
                        title={dog.dog_name}
                      >
                        {dog.dog_name}
                      </span>
                    )}
                  </div>

                  {/* Subtitle 1: Class + Sex + Exhibition */}
                  <div className="flex items-center gap-1.5 text-[10.5px] sm:text-xs text-charcoal-500 font-medium mt-0.5">
                    <span className="truncate">{dog.class || 'Класс не указан'}</span>
                    {dog.sex && (
                      <>
                        <span className="text-charcoal-300">·</span>
                        <DogSexIcon sex={dog.sex} size={11} variant="neutral" strokeWidth={2.25} />
                      </>
                    )}
                    {dog.exhibition_title && (
                      <>
                        <span className="text-charcoal-300 hidden md:inline">·</span>
                        <span className="truncate hidden md:inline text-charcoal-400">
                          {dog.exhibition_title}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Subtitle 2: Grade + Title tags */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs font-medium mt-0.5">
                    {dog.grade && (
                      <span className="text-charcoal-700">
                        Оценка:{' '}
                        <strong className="font-semibold text-charcoal-900">
                          {formatShowGradeDisplay(dog.grade)}
                        </strong>
                      </span>
                    )}
                    {dog.placement != null && dog.placement > 0 && (
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-camel-100 text-camel-900 border border-camel-300/80 leading-none shadow-3xs"
                        title={`Место в классе: ${dog.placement}`}
                      >
                        {dog.placement} в классе
                      </span>
                    )}
                    {dog.title && (
                      <div className="flex flex-wrap items-center gap-1">
                        {dog.title
                          .split(/[,;\s]+/)
                          .filter(Boolean)
                          .map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100/90 text-amber-950 border border-amber-300/80 leading-none shadow-3xs"
                            >
                              {t}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Catalog Number & Grade Badge */}
                <div className="shrink-0 flex flex-col items-end justify-center gap-1 pl-2 text-right">
                  <div className="text-xs text-charcoal-600 font-medium">
                    {dog.catalog_number ? (
                      <>
                        Каталог{' '}
                        <span className="font-bold text-charcoal-900 text-sm ml-0.5 tabular-nums">
                          № {dog.catalog_number}
                        </span>
                      </>
                    ) : (
                      <span className="text-[11px] text-charcoal-400">
                        {dog.exhibition_date || '—'}
                      </span>
                    )}
                  </div>
                  {dog.grade && <ShowGradeChip grade={dog.grade} />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      )}
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <DoninoColumnShell
      plaque={
        <DoninoColumnPlaque
          asHeader
          title={formatBreedSentenceCase(breed).toUpperCase()}
          count={filteredDogs.length}
          countLabel={
            gradeScope === 'puppy'
              ? formatPuppyCount(filteredDogs.length)
              : formatDogCount(filteredDogs.length)
          }
        />
      }
    >
      {content}
    </DoninoColumnShell>
  )
}
