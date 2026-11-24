import { useState } from 'react';
import { X, Key, HelpCircle, Check, Trash2, ArrowUpRight } from 'lucide-react';
import { getStoredToken, setStoredAuth, clearStoredAuth } from './trackerData';

interface TrackerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange: () => void;
}

export function TrackerAuthModal({ isOpen, onClose, onAuthChange }: TrackerAuthModalProps) {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  if (!isOpen) return null;

  const currentToken = getStoredToken();

  const handleSaveToken = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = tokenInput.trim().replace(/^Bearer\s+/i, '');

    if (!cleanToken) {
      setErrorMsg('Вставьте токен авторизации');
      return;
    }

    if (cleanToken.length < 20) {
      setErrorMsg('Слишком короткий токен (проверьте правильность)');
      return;
    }

    setStoredAuth(cleanToken, 'rkf.online');
    setTokenInput('');
    setErrorMsg('');
    onAuthChange();
    onClose();
  };

  const handleImportFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleanToken = text.trim().replace(/^Bearer\s+/i, '');
      if (cleanToken.length >= 20) {
        setTokenInput(cleanToken);
        setErrorMsg('');
      } else {
        setErrorMsg('В буфере обмена нет подходящего токена');
      }
    } catch {
      setErrorMsg('Не удалось получить доступ к буферу обмена');
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    onAuthChange();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-old-money-200/90 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-old-money-100 bg-cream-50">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-camel-700" />
            <h3 className="text-sm font-bold text-charcoal-900">
              {currentToken ? 'Токен РКФ Онлайн' : 'Подключение к РКФ Онлайн'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {currentToken ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-900">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Токен активен и сохранён в браузере</span>
                </div>
                <p className="text-emerald-800/90 leading-relaxed font-mono break-all text-[11px]">
                  {currentToken.slice(0, 16)}••••••••••••••••{currentToken.slice(-12)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Отвязать токен (Выйти)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="cs-glass-pill-active px-5 py-2 rounded-full text-xs font-semibold"
                >
                  Готово
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveToken} className="space-y-4">
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Для отслеживания ваших персональных заявок на чемпионские титулы и сертификаты
                вставьте сессионный токен из личного кабинета РКФ Онлайн. Пароль от аккаунта вводить не нужно.
              </p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-charcoal-800">
                    Токен доступа (Bearer Token)
                  </label>
                  <button
                    type="button"
                    onClick={handleImportFromClipboard}
                    className="text-[11px] font-semibold text-camel-700 hover:text-camel-800 hover:underline cursor-pointer"
                  >
                    Вставить из буфера
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={tokenInput}
                  onChange={(e) => {
                    setTokenInput(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="Вставьте токен: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-old-money-200 bg-white text-charcoal-900 focus:border-camel-600 focus:ring-1 focus:ring-camel-600 outline-none transition-all placeholder:text-charcoal-300 resize-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-camel-700" />
                  <span>Где взять токен?</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-charcoal-600 hover:bg-cream-100 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="cs-glass-pill-active px-5 py-2 rounded-full text-xs font-semibold cursor-pointer"
                  >
                    Подключить
                  </button>
                </div>
              </div>

              {showHelp && (
                <div className="mt-3 p-3.5 rounded-xl bg-cream-100/70 border border-old-money-200/80 text-[11.5px] text-charcoal-700 space-y-2 leading-relaxed">
                  <p className="font-semibold text-charcoal-900">Как получить токен за 10 секунд:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>
                      <strong>Через расширение CoursingStats (самый простой способ):</strong> откройте расширение в браузере и нажмите «Копировать токен».
                    </li>
                    <li>
                      <strong>Вручную на сайте РКФ:</strong> войдите на{' '}
                      <a
                        href="https://rkf.online"
                        target="_blank"
                        rel="noreferrer"
                        className="text-camel-700 underline font-semibold inline-flex items-center gap-0.5"
                      >
                        rkf.online <ArrowUpRight className="w-3 h-3" />
                      </a>
                      , нажмите клавишу <strong>F12</strong> (Инструменты разработчика) $\to$ вкладка <strong>Application</strong> (Приложение) $\to$ слева <strong>Local Storage</strong> $\to$ скопируйте значение <code>access_token</code>.
                    </li>
                  </ol>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
