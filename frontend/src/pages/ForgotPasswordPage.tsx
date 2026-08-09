import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../lib/authApi'

type ForgotResult = {
  message: string
  email_sent?: boolean
  mail_configured?: boolean
  code?: string
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ForgotResult | null>(null)

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const accountRedirect = isLocalhost ? 'http://localhost:5173/account' : 'https://coursing-stats.ru/account'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = (await authApi.forgotPassword(email)) as ForgotResult
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка запроса')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 dark:text-cream-100 mb-2">
            Сброс пароля
          </h1>
          <p className="text-charcoal-600 dark:text-cream-300">
            Для аккаунта через Яндекс проще войти через Яндекс и задать пароль в настройках.
          </p>
        </div>

        {result ? (
          <div className="space-y-4">
            <div
              className={
                result.email_sent
                  ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded'
                  : 'bg-camel-50 dark:bg-camel-900/20 border border-camel-300 dark:border-camel-700 text-charcoal-800 dark:text-cream-100 px-4 py-3 rounded'
              }
            >
              {result.message}
            </div>

            {!result.email_sent && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `https://auth-worker.antajltube.workers.dev/v1/oauth/yandex/authorize?state=${encodeURIComponent(accountRedirect)}`
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-700"
                >
                  <span className="text-sm font-medium">Войти через Яндекс</span>
                </button>
                <p className="text-sm text-charcoal-600 dark:text-cream-300 text-center">
                  После входа: Настройки → задать пароль.
                </p>
              </div>
            )}

            <Link to="/login" className="inline-block text-camel-700 hover:text-camel-800 font-medium">
              ← На страницу входа
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-terracotta-100 dark:bg-terracotta-900/30 border border-terracotta-300 dark:border-terracotta-700 text-terracotta-800 dark:text-terracotta-200 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 dark:text-cream-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-camel-600 hover:bg-camel-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Отправка…' : 'Отправить ссылку'}
            </button>
            <p className="text-center text-sm text-charcoal-600 dark:text-cream-300">
              <Link to="/login" className="text-camel-700 hover:text-camel-800">
                ← Назад ко входу
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
