import { useState } from 'react';
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { authenticateRkf } from './trackerData';

interface TrackerAuthPasswordFormProps {
  onSuccess: (token: string, email: string) => void;
  onError: (msg: string) => void;
  hasExtension: boolean;
}

export function TrackerAuthPasswordForm({
  onSuccess,
  onError,
  hasExtension,
}: TrackerAuthPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      onError('Укажите E-mail и пароль');
      return;
    }

    setIsSubmitting(true);
    onError('');

    try {
      const res = await authenticateRkf(cleanEmail, password);
      if (res.ok && res.token) {
        onSuccess(res.token, cleanEmail);
        setEmail('');
      } else {
        onError(res.error || 'Неверный логин или пароль на rkf.online');
      }
    } finally {
      // Wipe password from memory immediately
      setPassword('');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {hasExtension && (
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-old-money-200/70" />
          <span className="flex-shrink mx-3 text-[11px] text-charcoal-400 font-medium">
            или войти по E-mail и паролю
          </span>
          <div className="flex-grow border-t border-old-money-200/70" />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-charcoal-800">
          E-mail на rkf.online
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              onError('');
            }}
            placeholder="name@example.com"
            className="w-full min-h-[44px] h-11 pl-10 pr-3.5 rounded-xl border border-old-money-200 bg-white text-xs text-charcoal-900 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all placeholder:text-charcoal-300"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-charcoal-800">
          Пароль от личного кабинета
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              onError('');
            }}
            placeholder="••••••••••••"
            className="w-full min-h-[44px] h-11 pl-10 pr-3.5 rounded-xl border border-old-money-200 bg-white text-xs text-charcoal-900 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all placeholder:text-charcoal-300"
          />
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 rounded-xl bg-sand-100/70 border border-sand-200/80 text-[11px] text-charcoal-600 leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-camel-700 shrink-0 mt-0.5" />
        <span>
          Пароль не сохраняется на сайте. Он передается один раз напрямую в РКФ для получения зашифрованного ключа сессии.
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full min-h-[44px] h-11 rounded-xl cs-glass-pill-active font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-charcoal-800" />
            <span>Авторизация в РКФ...</span>
          </>
        ) : (
          <span>Войти в личный кабинет</span>
        )}
      </button>
    </form>
  );
}
