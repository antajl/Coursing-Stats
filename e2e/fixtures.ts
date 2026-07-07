import type { APIRequestContext } from '@playwright/test'

const API_BASE = 'http://127.0.0.1:8787'

export interface TestData {
  hasDb: boolean
  eventId: number | null
  eventWithResults: boolean
  dogId: number | null
  judgeId: string | null
  judgeName: string | null
}

let cached: TestData | null = null

async function waitForApi(request: APIRequestContext, attempts = 45): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await request.get(`${API_BASE}/api/stats`)
      if (res.ok()) return true
    } catch {
      // dev server / wrangler ещё поднимается
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  return false
}

export async function getTestData(request: APIRequestContext): Promise<TestData> {
  if (cached) return cached

  const empty: TestData = {
    hasDb: false,
    eventId: null,
    eventWithResults: false,
    dogId: null,
    judgeId: null,
    judgeName: null,
  }

  const apiReady = await waitForApi(request)
  if (!apiReady) {
    cached = empty
    return empty
  }

  const [competitionsRes, dogsRes, judgesRes] = await Promise.all([
    request.get(`${API_BASE}/api/competitions`),
    request.get(`${API_BASE}/api/dogs?limit=10`),
    request.get(`${API_BASE}/api/judges`),
  ])

  if (!competitionsRes.ok() && !dogsRes.ok()) {
    cached = empty
    return empty
  }

  const data: TestData = { ...empty, hasDb: true }

  if (competitionsRes.ok()) {
    const body = await competitionsRes.json()
    const events = (body.data ?? []) as Array<{ id: number; participants_count?: number }>
    const withResults = events.find((e) => (e.participants_count ?? 0) > 0)
    const anyEvent = events[0]
    const picked = withResults ?? anyEvent
    if (picked) {
      data.eventId = picked.id
      data.eventWithResults = (picked.participants_count ?? 0) > 0
    }
  }

  if (dogsRes.ok()) {
    const body = await dogsRes.json()
    const dogs = (body.data ?? []) as Array<{ id: number }>
    if (dogs[0]) data.dogId = dogs[0].id
  }

  if (judgesRes.ok()) {
    const body = await judgesRes.json()
    const judges = (body.data?.judges ?? []) as Array<{ id: string; name: string }>
    if (judges[0]) {
      data.judgeId = judges[0].id
      data.judgeName = judges[0].name
    }
  }

  cached = data
  return data
}
