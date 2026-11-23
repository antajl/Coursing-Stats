import { useState } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';
import { getStoredToken, getStoredEmail, setStoredAuth, clearStoredAuth } from './trackerData';

interface TrackerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange: () => void;
}

export function TrackerAuthModal({ isOpen, onClose, onAuthChange }: TrackerAuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentToken = getStoredToken();
  const currentEmail = getStoredEmail();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Укажите E-mail и пароль');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/rkf/administration/authentication/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: email.trim(), password: password.trim() })
      });

      const data = await res.json().catch(() => ({}));
      const token = data.apikey || data.token || data.result?.apikey;

      if (res.ok && token) {
        setStoredAuth(token, email.trim());
        setEmail('');
        setPassword('');
        onAuthChange();
        onClose();
      } else {
        const msg = data.errors?.error || data.message || 'Неверный E-mail или пароль в РКФ';
        setErrorMsg(msg);
      }
    } catch {
      setErrorMsg('Сетевая ошибка при обращении к серверу РКФ');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    onAuthChange();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-old-money-200/90 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-old-money-100 bg-sand-50/50">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-camel-700" />
            <h3 className="text-base font-bold text-charcoal-900">Личный кабинет РКФ Онлайн</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-sand-100/80 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {currentToken ? (
            <div className="space-y-4">
              <p className="text-sm text-charcoal-600">
                Личный кабинет РКФ Онлайн успешно подключен.
              </p>
              <div className="p-3 rounded-xl bg-old-money-50 border border-old-money-200 text-xs text-charcoal-700">
                Аккаунт: <span className="font-semibold text-charcoal-900">{currentEmail || 'Сессия активна'}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200/80"
                >
                  Выйти из аккаунта
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-charcoal-700 bg-sand-100 hover:bg-sand-200 transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Введите E-mail и пароль от rkf.online для синхронизации ваших чемпионских титулов и рабочих дипломов.
              </p>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  E-mail в РКФ Онлайн
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.ru"
                  required
                  autoComplete="username"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-old-money-200/90 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Пароль от rkf.online
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-old-money-200/90 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 rounded-xl bg-old-money-50/80 border border-old-money-200/60 text-[11px] text-charcoal-500 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>Безопасное соединение. Авторизация выполняется напрямую через шлюз rkf.online. Пароль не сохраняется на сервере.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-charcoal-600 hover:bg-sand-100 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold rounded-xl text-white bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {loading ? 'Вход...' : 'Войти в личный кабинет'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
