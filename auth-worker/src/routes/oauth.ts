import { Hono } from 'hono'
import type { Env } from '../env'
import { OAUTH_PASSWORD_SENTINEL, isOAuthOnly, normalizeEmail } from '../env'
import { generateSessionToken, hashToken } from '../lib/crypto'
import {
  createOAuthProvider,
  createSession,
  createUser,
  getOAuthProvider,
  getUserByEmail,
} from '../lib/db'

export const oauthRoutes = new Hono<{ Bindings: Env }>()

oauthRoutes.get('/yandex/authorize', (c) => {
  const clientId = c.env.YANDEX_CLIENT_ID
  const redirectUri = c.env.YANDEX_REDIRECT_URI
  const state = c.req.query('state') || 'https://coursing-stats.ru/account'
  const authUrl = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`
  return c.redirect(authUrl)
})

oauthRoutes.get('/yandex/callback', async (c) => {
  const code = c.req.query('code')
  const state = c.req.query('state')
  const redirectUri = state || 'https://coursing-stats.ru/account'
  if (!code) return c.json({ error: 'Код авторизации не получен' }, 400)

  const tokenResponse = await fetch('https://oauth.yandex.ru/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: c.env.YANDEX_CLIENT_ID,
      client_secret: c.env.YANDEX_CLIENT_SECRET,
      redirect_uri: c.env.YANDEX_REDIRECT_URI,
    }),
  })
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text()
    console.error('Token exchange failed:', errorText)
    return c.json({ error: 'Не удалось получить токен', details: errorText }, 500)
  }

  const tokenData = (await tokenResponse.json()) as { access_token: string }
  const userResponse = await fetch('https://login.yandex.ru/info?format=json', {
    headers: { Authorization: `OAuth ${tokenData.access_token}` },
  })
  if (!userResponse.ok) {
    return c.json({ error: 'Не удалось получить данные пользователя' }, 500)
  }

  const yandexUser = (await userResponse.json()) as {
    default_email?: string
    real_name?: string
    display_name?: string
    id: string
  }
  const email = normalizeEmail(yandexUser.default_email || '')
  const displayName = yandexUser.real_name || yandexUser.display_name || 'Пользователь'
  const yandexUserId = yandexUser.id
  if (!email) return c.json({ error: 'У аккаунта Яндекс нет email' }, 400)

  const existingOAuth = await getOAuthProvider(c.env.DB, 'yandex', yandexUserId)
  if (existingOAuth) {
    const user2 = await getUserByEmail(c.env.DB, existingOAuth.email || email)
    if (user2) {
      const sessionToken2 = generateSessionToken()
      await createSession(c.env.DB, {
        user_id: user2.id,
        token_hash: await hashToken(sessionToken2),
      })
      return c.redirect(`${redirectUri}?token=${sessionToken2}`)
    }
  }

  const existingUser = await getUserByEmail(c.env.DB, email)
  if (existingUser) {
    // Password account exists — ask to link
    if (!isOAuthOnly(existingUser.password_hash)) {
      return c.redirect(
        `${redirectUri}?link_account=true&email=${encodeURIComponent(email)}&provider=yandex&provider_user_id=${yandexUserId}`,
      )
    }
    // OAuth-only already (maybe provider row missing) — just login
    try {
      await createOAuthProvider(c.env.DB, {
        user_id: existingUser.id,
        provider: 'yandex',
        provider_user_id: yandexUserId,
        email,
      })
    } catch {
      /* already linked */
    }
    const sessionToken = generateSessionToken()
    await createSession(c.env.DB, {
      user_id: existingUser.id,
      token_hash: await hashToken(sessionToken),
    })
    return c.redirect(`${redirectUri}?token=${sessionToken}`)
  }

  const userId = await createUser(c.env.DB, {
    email,
    password_hash: OAUTH_PASSWORD_SENTINEL,
    display_name: displayName,
    email_verified: true,
  })
  await createOAuthProvider(c.env.DB, {
    user_id: userId,
    provider: 'yandex',
    provider_user_id: yandexUserId,
    email,
  })

  const sessionToken = generateSessionToken()
  await createSession(c.env.DB, {
    user_id: userId,
    token_hash: await hashToken(sessionToken),
  })
  return c.redirect(`${redirectUri}?token=${sessionToken}`)
})

oauthRoutes.post('/link', async (c) => {
  const { email, provider, provider_user_id } = await c.req.json<{
    email: string
    password?: string
    provider: string
    provider_user_id: string
  }>()
  const user = await getUserByEmail(c.env.DB, email)
  if (!user) return c.json({ error: 'User not found' }, 404)

  try {
    await createOAuthProvider(c.env.DB, {
      user_id: user.id,
      provider,
      provider_user_id,
      email,
    })
    const sessionToken = generateSessionToken()
    await createSession(c.env.DB, {
      user_id: user.id,
      token_hash: await hashToken(sessionToken),
    })
    return c.json({ token: sessionToken, user_id: user.id, display_name: user.display_name })
  } catch {
    return c.json({ error: 'Failed to link account' }, 500)
  }
})
