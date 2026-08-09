import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env } from '../env'
import { isOAuthOnly, normalizeEmail } from '../env'
import { generateSessionToken, hashPassword, hashToken, verifyPassword } from '../lib/crypto'
import {
  createEmailVerification,
  createPasswordReset,
  createSession,
  createUser,
  deleteEmailVerification,
  deletePasswordReset,
  deleteSession,
  deleteUser,
  getEmailVerificationByToken,
  getPasswordResetByToken,
  getUserByEmail,
  getUserBySessionToken,
  setEmailVerified,
  updateUserPassword,
} from '../lib/db'
import { sendPasswordResetEmail, sendVerificationEmail } from '../lib/email'

export const authRoutes = new Hono<{ Bindings: Env }>()

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  display_name: z.string().min(1).max(50),
})

authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, display_name } = c.req.valid('json')
  const existingUser = await getUserByEmail(c.env.DB, email)
  if (existingUser) {
    if (isOAuthOnly(existingUser.password_hash)) {
      return c.json(
        {
          error:
            'Этот email уже используется через вход Яндекс. Войдите через Яндекс — пароль можно задать в настройках.',
          code: 'oauth_only',
        },
        400,
      )
    }
    return c.json({ error: 'Этот email уже зарегистрирован' }, 400)
  }

  const passwordHash = await hashPassword(password)
  const userId = await createUser(c.env.DB, {
    email,
    password_hash: passwordHash,
    display_name,
  })

  const verificationToken = crypto.randomUUID()
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000
  await createEmailVerification(c.env.DB, {
    user_id: userId,
    token: verificationToken,
    expires_at: expiresAt,
  })

  try {
    await sendVerificationEmail(normalizeEmail(email), verificationToken, c.env.RESEND_API_KEY)
  } catch (error) {
    console.error('Failed to send verification email:', error)
  }

  return c.json(
    {
      user_id: userId,
      display_name,
      message: 'Проверьте вашу почту для подтверждения аккаунта',
      requires_verification: true,
    },
    201,
  )
})

authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json<{ email?: string; password?: string }>()
    const email = body.email ?? ''
    const password = body.password ?? ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ error: 'Неверный формат email' }, 400)
    }

    const user = await getUserByEmail(c.env.DB, email)
    if (!user) {
      return c.json({ error: 'Аккаунт с таким email не найден' }, 401)
    }

    if (isOAuthOnly(user.password_hash)) {
      return c.json(
        {
          error:
            'Этот аккаунт создан через Яндекс — пароль ещё не задан. Войдите через Яндекс или нажмите «Забыли пароль», чтобы задать пароль.',
          code: 'oauth_only',
        },
        401,
      )
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return c.json({ error: 'Неверный пароль' }, 401)
    }

    if (!user.email_verified) {
      return c.json({ error: 'Пожалуйста, подтвердите ваш email' }, 401)
    }

    const sessionToken = generateSessionToken()
    const tokenHash = await hashToken(sessionToken)
    await createSession(c.env.DB, { user_id: user.id, token_hash: tokenHash })
    return c.json({ user_id: user.id, display_name: user.display_name, token: sessionToken })
  } catch (err) {
    console.error('Login error:', err)
    return c.json({ error: 'Неверный формат email или пароля' }, 400)
  }
})

authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  const sessionToken = authHeader?.replace('Bearer ', '')
  if (!sessionToken) return c.json({ error: 'Нет активной сессии' }, 400)
  await deleteSession(c.env.DB, await hashToken(sessionToken))
  return c.json({ success: true })
})

authRoutes.delete('/account', async (c) => {
  const authHeader = c.req.header('Authorization')
  const sessionToken = authHeader?.replace('Bearer ', '')
  if (!sessionToken) return c.json({ error: 'Нет активной сессии' }, 400)
  const user = await getUserBySessionToken(c.env.DB, await hashToken(sessionToken))
  if (!user) return c.json({ error: 'Сессия не найдена' }, 401)
  await deleteUser(c.env.DB, user.id)
  return c.json({ success: true, message: 'Аккаунт удалён' })
})

authRoutes.get('/verify-email', async (c) => {
  const token = c.req.query('token')
  if (!token) return c.json({ error: 'Токен не указан' }, 400)
  const verification = await getEmailVerificationByToken(c.env.DB, token)
  if (!verification) return c.json({ error: 'Неверный токен' }, 400)
  if (verification.expires_at < Date.now()) {
    await deleteEmailVerification(c.env.DB, token)
    return c.json({ error: 'Токен истёк' }, 400)
  }
  await setEmailVerified(c.env.DB, verification.user_id)
  await deleteEmailVerification(c.env.DB, token)
  return c.json({ message: 'Email успешно подтверждён' })
})

/** Logged-in user sets/changes password (for OAuth-only accounts). */
authRoutes.post(
  '/set-password',
  zValidator(
    'json',
    z.object({
      password: z.string().min(8).max(200),
    }),
  ),
  async (c) => {
    const authHeader = c.req.header('Authorization')
    const sessionToken = authHeader?.replace('Bearer ', '')
    if (!sessionToken) return c.json({ error: 'Unauthorized' }, 401)
    const user = await getUserBySessionToken(c.env.DB, await hashToken(sessionToken))
    if (!user) return c.json({ error: 'Unauthorized' }, 401)

    const { password } = c.req.valid('json')
    const passwordHash = await hashPassword(password)
    await updateUserPassword(c.env.DB, user.id, passwordHash)
    return c.json({ success: true, message: 'Пароль сохранён — можно входить по email' })
  },
)

authRoutes.post(
  '/forgot-password',
  zValidator('json', z.object({ email: z.string().email() })),
  async (c) => {
    const { email } = c.req.valid('json')
    const user = await getUserByEmail(c.env.DB, email)
    const mailConfigured = Boolean(c.env.RESEND_API_KEY)

    // Avoid email enumeration for existence, but be honest about mail delivery
    if (!user) {
      return c.json({
        message: mailConfigured
          ? 'Если аккаунт существует, мы отправили письмо со ссылкой.'
          : 'Отправка писем пока не настроена. Войдите через Яндекс (если так регистрировались) и задайте пароль в настройках аккаунта.',
        email_sent: false,
        mail_configured: mailConfigured,
      })
    }

    if (!mailConfigured) {
      return c.json({
        message: isOAuthOnly(user.password_hash)
          ? 'Письма пока не настроены. Войдите через Яндекс и задайте пароль в «Настройки аккаунта».'
          : 'Письма пока не настроены. Если помните пароль — войдите. Иначе напишите в поддержку или зайдите через Яндекс, если он привязан.',
        email_sent: false,
        mail_configured: false,
        code: isOAuthOnly(user.password_hash) ? 'oauth_only' : 'mail_not_configured',
      })
    }

    const token = crypto.randomUUID()
    const expiresAt = Date.now() + 60 * 60 * 1000
    await createPasswordReset(c.env.DB, {
      user_id: user.id,
      token,
      expires_at: expiresAt,
    })

    try {
      await sendPasswordResetEmail(
        normalizeEmail(user.email),
        token,
        c.env.RESEND_API_KEY,
        isOAuthOnly(user.password_hash),
      )
    } catch (error) {
      console.error('forgot-password mail failed:', error)
      return c.json({ error: 'Не удалось отправить письмо. Попробуйте позже.' }, 500)
    }

    return c.json({
      message: 'Письмо со ссылкой отправлено. Проверьте почту и «Спам».',
      email_sent: true,
      mail_configured: true,
    })
  },
)

authRoutes.post(
  '/reset-password',
  zValidator(
    'json',
    z.object({
      token: z.string().min(10),
      password: z.string().min(8).max(200),
    }),
  ),
  async (c) => {
    const { token, password } = c.req.valid('json')
    const row = await getPasswordResetByToken(c.env.DB, token)
    if (!row) return c.json({ error: 'Неверная или просроченная ссылка' }, 400)

    const passwordHash = await hashPassword(password)
    await updateUserPassword(c.env.DB, row.user_id, passwordHash)
    await deletePasswordReset(c.env.DB, token)
    return c.json({ success: true, message: 'Пароль обновлён. Можно войти по email.' })
  },
)
