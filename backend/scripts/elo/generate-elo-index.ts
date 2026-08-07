/**
 * Generate Elo v2 indexes + sync dog-profiles.
 * Params from elo-v2-locked-params.json (scale=8, K0=50 after recalibration).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import {
  calculateEloRatings,
  type Race,
  type ByeRun,
  type SoloLoss,
} from '../../lib/rating/elo-calculator'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '../../..')
const RACES_FILE = join(ROOT, 'tasks/elo-calibration/races-data.json')
const LOCKED_PARAMS = join(ROOT, 'tasks/elo-calibration/elo-v2-locked-params.json')
const DOG_PROFILES_DIR = join(ROOT, 'data/v1/indexes/dog-profiles')
const OUTPUT_DIR = join(ROOT, 'data/v1/indexes')

/** Aligned with corpus: career median ~4, p75 ~6; season max ~14–28. */
const ELO_MIN_SHOW = 3
const ELO_LOW_DATA = 8

interface DogProfile {
  dog: {
    id: number
    name_lat: string
    name_ru: string
    breed: string
    sex: string | null
    owner: string | null
    pedigree_url: string | null
    coursing_stats?: {
      total_starts: number
      best_score: number
      best_judge_score: number
      avg_judge_score: number
      gold: number
      silver: number
      bronze: number
    }
  }
  competitions: Array<{
    event_id: number
    date_start: string
    status: string
  }>
  elo_rating?: number
  elo_races?: number
  elo_reliable?: boolean
  elo_low_data?: boolean
}

function loadParams() {
  let scale = 8
  let k0 = 50
  let unreliable: string[] = []
  if (existsSync(LOCKED_PARAMS)) {
    const p = JSON.parse(readFileSync(LOCKED_PARAMS, 'utf-8'))
    scale = p.scale ?? 8
    k0 = p.k0 ?? 50
    unreliable = p.unreliable_breeds ?? []
  }
  return { scale, k0, unreliable: new Set(unreliable), initial: 1500, breedPools: true }
}

function eloFlags(races: number, breed: string, unreliable: Set<string>) {
  const breedUnreliable = unreliable.has(breed)
  const elo_reliable = !breedUnreliable && races >= ELO_LOW_DATA
  const elo_low_data = !breedUnreliable && races >= ELO_MIN_SHOW && races < ELO_LOW_DATA
  const show_numeric = !breedUnreliable && races >= ELO_MIN_SHOW
  return { elo_reliable, elo_low_data, show_numeric, breed_unreliable: breedUnreliable }
}

function generateIndex(
  dogs: Array<DogProfile & { _rating?: number; _races?: number }>,
  fileName: string,
  unreliable: Set<string>,
  meta: { scale: number; k0: number }
) {
  const sortedDogs = [...dogs].sort((a, b) => (b.elo_rating || 0) - (a.elo_rating || 0))

  const items = sortedDogs.map((dog, index) => {
    const races = dog.elo_races || 0
    const flags = eloFlags(races, dog.dog.breed, unreliable)
    return {
      dog_id: dog.dog.id,
      name_lat: dog.dog.name_lat,
      name_ru: dog.dog.name_ru,
      breed: dog.dog.breed,
      sex: dog.dog.sex,
      owner: dog.dog.owner,
      pedigree_url: dog.dog.pedigree_url,
      total_starts: dog.dog.coursing_stats?.total_starts || 0,
      best_score: dog.dog.coursing_stats?.best_score || 0,
      avg_judge_score: dog.dog.coursing_stats?.avg_judge_score || 0,
      best_judge_score: dog.dog.coursing_stats?.best_judge_score || 0,
      gold: dog.dog.coursing_stats?.gold || 0,
      silver: dog.dog.coursing_stats?.silver || 0,
      bronze: dog.dog.coursing_stats?.bronze || 0,
      // Raw rating always stored; UI hides when elo_races < 20 or breed unreliable
      elo_rating: dog.elo_rating,
      elo_races: races,
      elo_reliable: flags.elo_reliable,
      elo_low_data: flags.elo_low_data,
      elo_insufficient: !flags.show_numeric,
      rank: index + 1,
    }
  })

  const output = {
    schema: 'coursing-stats/index-top-elo-v2',
    rating_version: 'elo-v2',
    elo_params: { scale: meta.scale, k0: meta.k0, initial_rating: 1500, breed_pools: true },
    exported_at: new Date().toISOString(),
    count: items.length,
    items,
  }

  const outputPath = join(OUTPUT_DIR, fileName)
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`Generated ${outputPath} with ${items.length} items`)
}

function writeUpdatedProfiles(
  dogProfiles: Map<number, DogProfile>,
  ratings: Map<number, { rating: number; starts_count: number; breed: string }>,
  unreliable: Set<string>
) {
  let updated = 0

  for (const profile of dogProfiles.values()) {
    delete profile.elo_rating
    delete profile.elo_races
    delete profile.elo_reliable
    delete profile.elo_low_data
  }

  for (const [dogId, rating] of ratings) {
    const profile = dogProfiles.get(dogId)
    if (!profile) continue

    const races = rating.starts_count
    const flags = eloFlags(races, profile.dog.breed || rating.breed, unreliable)
    // Always store raw computed values in profiles for verify; UI uses thresholds
    profile.elo_rating = Math.round(rating.rating)
    profile.elo_races = races
    profile.elo_reliable = flags.elo_reliable
    profile.elo_low_data = flags.elo_low_data
  }

  for (const profile of dogProfiles.values()) {
    if (profile.elo_rating == null || profile.elo_races == null) continue
    const filePath = join(DOG_PROFILES_DIR, `${profile.dog.id}.json`)
    writeFileSync(filePath, JSON.stringify(profile), 'utf-8')
    updated++
  }

  console.log(`Updated ${updated} dog profiles with Elo ratings`)
}

function main() {
  const params = loadParams()
  console.log(
    `Elo v2 generate: scale=${params.scale}, K0=${params.k0}, unreliable=${[...params.unreliable].join(',') || 'none'}`
  )

  const racesData = JSON.parse(readFileSync(RACES_FILE, 'utf-8'))
  const allRaces: Race[] = racesData.races
  const allByeRuns: ByeRun[] = racesData.bye_runs || []
  const allSoloLosses: SoloLoss[] = racesData.solo_losses || []

  console.log(`Races: ${allRaces.length}, bye: ${allByeRuns.length}, solo DQ: ${allSoloLosses.length}`)

  const dogProfiles: Map<number, DogProfile> = new Map()
  for (const file of readdirSync(DOG_PROFILES_DIR)) {
    if (!file.endsWith('.json')) continue
    const profile: DogProfile = JSON.parse(readFileSync(join(DOG_PROFILES_DIR, file), 'utf-8'))
    dogProfiles.set(profile.dog.id, profile)
  }
  console.log(`Loaded ${dogProfiles.size} dog profiles`)

  const allTimeRatings = calculateEloRatings(
    allRaces,
    allByeRuns,
    params.scale,
    params.k0,
    params.initial,
    params.breedPools,
    allSoloLosses
  )
  console.log(`Dogs with Elo (all-time): ${allTimeRatings.size}`)

  writeUpdatedProfiles(dogProfiles, allTimeRatings, params.unreliable)

  // Include dogs that have ratings + profiles; also create stub entries for rated dogs missing profiles
  const allTimeDogs: DogProfile[] = []
  let missingProfiles = 0
  for (const [dogId, rating] of allTimeRatings) {
    let profile = dogProfiles.get(dogId)
    if (!profile) {
      missingProfiles++
      profile = {
        dog: {
          id: dogId,
          name_lat: `DOG_${dogId}`,
          name_ru: `DOG_${dogId}`,
          breed: rating.breed,
          sex: null,
          owner: null,
          pedigree_url: null,
        },
        competitions: [],
        elo_rating: Math.round(rating.rating),
        elo_races: rating.starts_count,
      }
    }
    allTimeDogs.push(profile)
  }
  if (missingProfiles > 0) {
    console.log(`Note: ${missingProfiles} Elo dogs without dog-profiles (stubbed in top-elo only)`)
  }

  generateIndex(allTimeDogs, 'top-elo-all.json', params.unreliable, params)

  const years = [
    '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026',
  ]

  for (const year of years) {
    const yearRaces = allRaces.filter((r) => r.date.startsWith(year))
    const yearBye = allByeRuns.filter((b) => b.date.startsWith(year))
    const yearSolo = allSoloLosses.filter((s) => s.date.startsWith(year))
    if (yearRaces.length === 0 && yearBye.length === 0 && yearSolo.length === 0) continue

    const yearRatings = calculateEloRatings(
      yearRaces,
      yearBye,
      params.scale,
      params.k0,
      params.initial,
      params.breedPools,
      yearSolo
    )

    const yearDogs: DogProfile[] = []
    for (const [dogId, rating] of yearRatings) {
      const profile = dogProfiles.get(dogId)
      if (profile) {
        yearDogs.push({
          ...profile,
          elo_rating: Math.round(rating.rating),
          elo_races: rating.starts_count,
        })
      } else {
        yearDogs.push({
          dog: {
            id: dogId,
            name_lat: `DOG_${dogId}`,
            name_ru: `DOG_${dogId}`,
            breed: rating.breed,
            sex: null,
            owner: null,
            pedigree_url: null,
          },
          competitions: [],
          elo_rating: Math.round(rating.rating),
          elo_races: rating.starts_count,
        })
      }
    }

    if (yearDogs.length > 0) {
      generateIndex(yearDogs, `top-elo-${year}.json`, params.unreliable, params)
    }
  }

  console.log('Done!')
}

main()
