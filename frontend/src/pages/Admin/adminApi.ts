import { API_URL } from '../../services/api'

import { queryClient } from '../../lib/query-client'

/** В dev — через Vite proxy (/api → :8787), в prod — прямой URL Worker */
export function getAdminApiBase(): string {
  return import.meta.env.DEV ? '' : API_URL
}

/** Сброс кэша React Query после правок в админке */
export async function invalidatePublicEventCaches(eventId: number) {
  await queryClient.invalidateQueries({ queryKey: ['events'] })
  await queryClient.invalidateQueries({ queryKey: ['event', String(eventId)] })
  await queryClient.invalidateQueries({ queryKey: ['eventResults', String(eventId)] })
}

type ApiJson = { success?: boolean; error?: string; data?: unknown; message?: string }

export async function adminFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem('admin_token') || ''
  return fetch(`${getAdminApiBase()}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      'X-Admin-Token': token,
      ...init?.headers,
    },
  })
}

export async function parseAdminResponse(response: Response): Promise<{
  ok: boolean
  data: ApiJson | null
  error: string
}> {
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return {
      ok: false,
      data: null,
      error:
        response.status === 404
          ? 'Маршрут API не найден — задеплойте Worker (npx wrangler deploy)'
          : `Сервер вернул не JSON (HTTP ${response.status})`,
    }
  }

  let data: ApiJson
  try {
    data = await response.json()
  } catch {
    return { ok: false, data: null, error: 'Не удалось разобрать ответ сервера' }
  }

  if (!response.ok) {
    return {
      ok: false,
      data,
      error: data.error || `HTTP ${response.status}`,
    }
  }

  if (data.success === false) {
    return {
      ok: false,
      data,
      error: data.error || 'Ошибка API',
    }
  }

  return { ok: true, data, error: '' }
}
