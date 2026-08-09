import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './env'
import { authRoutes } from './routes/auth'
import { favoritesRoutes, meRoutes } from './routes/me'
import { oauthRoutes } from './routes/oauth'

const app = new Hono<{ Bindings: Env }>()

app.use(
  '/*',
  cors({
    origin: [
      'https://coursing-stats.ru',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:53813',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.get('/', (c) => c.json({ status: 'ok', service: 'auth-worker' }))
app.route('/v1/auth', authRoutes)
app.route('/v1/me', meRoutes)
app.route('/v1/me/favorites', favoritesRoutes)
app.route('/v1/oauth', oauthRoutes)

export default app
