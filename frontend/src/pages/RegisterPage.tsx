import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const result = await register(email, password, displayName);
      if (result.requires_verification) {
        // Show verification message instead of redirecting
        setInfo(result.message || 'Проверьте вашу почту для подтверждения аккаунта');
      } else {
        navigate('/account');
      }
    } catch (err) {
      let errorMessage = 'Ошибка регистрации';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        // Try to extract error message from object
        if ('error' in err) {
          errorMessage = String(err.error);
        } else if ('message' in err) {
          errorMessage = String(err.message);
        } else {
          errorMessage = JSON.stringify(err);
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const accountRedirect = isLocalhost ? 'http://localhost:5173/account' : 'https://coursing-stats.ru/account';
  const redirectUri = 'https://auth-worker.antajltube.workers.dev/v1/oauth/yandex/callback';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 dark:text-cream-100 mb-2">
            Создать аккаунт
          </h1>
          <p className="text-charcoal-600 dark:text-cream-300">
            Регистрация для сохранения избранных собак
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-terracotta-100 dark:bg-terracotta-900/30 border border-terracotta-300 dark:border-terracotta-700 text-terracotta-800 dark:text-terracotta-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {info && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 px-4 py-3 rounded">
              {info}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-charcoal-700 dark:text-cream-300 mb-1">
              Имя
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={1}
              maxLength={50}
              autoComplete="name"
              className="w-full px-4 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 focus:ring-2 focus:ring-camel-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-charcoal-700 dark:text-cream-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 focus:ring-2 focus:ring-camel-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-charcoal-700 dark:text-cream-300 mb-1">
              Пароль (минимум 12 символов)
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
              className="w-full px-4 py-2 pr-12 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-cream-100 focus:ring-2 focus:ring-camel-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="button"
              onMouseDown={() => setShowPassword(true)}
              onMouseUp={() => setShowPassword(false)}
              onMouseLeave={() => setShowPassword(false)}
              className="absolute right-3 top-8 text-charcoal-500 hover:text-charcoal-700 dark:text-charcoal-400 dark:hover:text-charcoal-200"
              disabled={loading}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-camel-600 hover:bg-camel-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-charcoal-300 dark:border-charcoal-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-charcoal-900 text-charcoal-600 dark:text-cream-300">или с помощью</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => window.location.href = `https://oauth.yandex.ru/authorize?response_type=code&client_id=165a25912ff74a4ca941c6048ece132e&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(accountRedirect)}`}
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path d="M2.04 12c0-5.523 4.476-10 10-10 5.522 0 10 4.477 10 10s-4.478 10-10 10c-5.524 0-10-4.477-10-10z" fill="#FC3F1D"/>
                <path d="M13.32 7.666h-.924c-1.694 0-2.585.858-2.585 2.123 0 1.43.616 2.1 1.881 2.959l1.045.704-3.003 4.487H7.49l2.695-4.014c-1.55-1.111-2.42-2.19-2.42-4.015 0-2.288 1.595-3.85 4.62-3.85h3.003v11.868H13.32V7.666z" fill="#fff"/>
              </svg>
              <span className="text-sm font-medium text-charcoal-900 dark:text-cream-100">Яндекс</span>
            </button>

            <button
              type="button"
              disabled={loading}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-charcoal-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed opacity-50 cursor-not-allowed"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0077FF">
                <path d="M12.785 16.241c-.692 0-1.313-.094-1.862-.281-.55-.188-.99-.458-1.322-.812-.332-.354-.588-.79-.768-1.307-.18-.517-.27-1.09-.27-1.719 0-.629.09-1.202.27-1.719.18-.517.436-.953.768-1.307.332-.354.772-.624 1.322-.812.55-.187 1.17-.281 1.862-.281.692 0 1.313.094 1.862.281.55.188.99.458 1.322.812.332.354.588.79.768 1.307.18.517.27 1.09.27 1.719 0 .629-.09 1.202-.27 1.719-.18.517-.436.953-.768 1.307-.332.354-.772.624-1.322.812-.55.187-1.17.281-1.862.281zm0-1.5c.475 0 .875-.062 1.2-.187.325-.125.588-.293.788-.506.2-.213.344-.463.432-.75.088-.287.132-.596.132-.928 0-.332-.044-.641-.132-.928-.088-.287-.232-.537-.432-.75-.2-.213-.463-.381-.788-.506-.325-.125-.725-.187-1.2-.187-.475 0-.875.062-1.2.187-.325.125-.588.293-.788.506-.2.213-.344.463-.432.75-.088.287-.132.596-.132.928 0 .332.044.641.132.928.088.287.232.537.432.75.2.213.463.381.788.506.325.125.725.187 1.2.187z"/>
              </svg>
              <span className="text-sm font-medium text-charcoal-900 dark:text-cream-100">ВКонтакте</span>
            </button>
          </div>
        </form>

        <p className="text-center mt-6 text-charcoal-600 dark:text-cream-300">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-camel-600 hover:text-camel-700 font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
