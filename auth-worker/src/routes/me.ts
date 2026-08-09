import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../env'
import { isOAuthOnly } from '../env'
import { hashToken } from '../lib/crypto'
import {
  addFavorite,
  getFavorites,
  getUserBySessionToken,
  removeFavorite,
  updateUserDisplayName,
} from '../lib/db'

type Authed = {
  Bindings: Env
  Variables: {
    user: {
      id: string
      email: string
      display_name: string
      created_at: number | string
      password_hash?: string
    }
  }
}

async function requireUser(c: any, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  const sessionToken = authHeader?.replace('Bearer ', '')
  if (!sessionToken) return c.json({ error: 'Unauthorized' }, 401)
  const user = await getUserBySessionToken(c.env.DB, await hashToken(sessionToken))
  if (!user) return c.json({ error: 'Invalid session' }, 401)
  c.set('user', user)
  await next()
}

export const meRoutes = new Hono<Authed>()
meRoutes.use('/*', requireUser)

meRoutes.get('/', (c) => {
  const user = c.get('user')
  return c.json({
    id: user.id,
    email: user.email,
    display_name: user.display_name,
    created_at: user.created_at,
    has_password: !isOAuthOnly(user.password_hash),
    auth_provider: isOAuthOnly(user.password_hash) ? 'oauth' : 'password',
  })
})

meRoutes.patch(
  '/',
  zValidator('json', z.object({ display_name: z.string().min(1).max(50) })),
  async (c) => {
    const { display_name } = c.req.valid('json')
    const user = c.get('user')
    await updateUserDisplayName(c.env.DB, user.id, display_name)
    return c.json({ display_name })
  },
)

export const favoritesRoutes = new Hono<Authed>()
favoritesRoutes.use('/*', requireUser)

favoritesRoutes.get('/', async (c) => {
  const user = c.get('user')
  const favorites = await getFavorites(c.env.DB, user.id)
  return c.json({ favorites })
})

favoritesRoutes.put('/:dogId', async (c) => {
  const dogId = c.req.param('dogId')
  const user = c.get('user')
  await addFavorite(c.env.DB, user.id, dogId)
  return c.json({ success: true })
})

favoritesRoutes.delete('/:dogId', async (c) => {
  const dogId = c.req.param('dogId')
  const user = c.get('user')
  await removeFavorite(c.env.DB, user.id, dogId)
  return c.json({ success: true })
})
