import { useState, useEffect } from 'react';
import { X, Key, Check, Puzzle } from 'lucide-react';
import {
  getStoredToken,
  getStoredEmail,
  setStoredAuth,
  clearStoredAuth,
} from './trackerData';
import { TrackerAuthActive } from './TrackerAuthActive';
import { TrackerAuthPasswordForm } from './TrackerAuthPasswordForm';
import { TrackerAuthManualToken } from './TrackerAuthManualToken';

interface TrackerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthChange: () => void;
}

const EXTENSION_ZIP_URL =
  'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Chrome-Extension.zip';

export function TrackerAuthModal({ isOpen, onClose, onAuthChange }: TrackerAuthModalProps) {
  const [extensionToken, setExtensionToken] = useState<string | null>(null);
  const [extensionUserUuid, setExtensionUserUuid] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // Ping extension bridge to query token
    window.postMessage({ type: 'CS_GET_EXTENSION_TOKEN' }, '*');

    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      const { type, token, userUuid } = e.data;
      if (
        type === 'CS_EXTENSION_TOKEN_RESPONSE' ||
        type === 'CS_EXTENSION_TOKEN_AVAILABLE' ||
        type === 'RKF_TRACKER_TOKEN_SYNC' ||
        type === 'RKF_TOKEN_TRANSFER'
      ) {
        if (token && typeof token === 'string' && token.trim().length >= 20) {
          setExtensionToken(token.trim());
          if (userUuid && typeof userUuid === 'string') {
            setExtensionUserUuid(userUuid);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentToken = getStoredToken();
  const currentEmail = getStoredEmail();

  const handlePasswordSuccess = (token: string, email: string) => {
    setStoredAuth(token, email);
    setErrorMsg('');
    onAuthChange();
    onClose();
  };

  const handleSyncExtension = () => {
    if (!extensionToken) return;
    setStoredAuth(extensionToken, 'rkf.online', extensionUserUuid || undefined);
    setErrorMsg('');
    onAuthChange();
    onClose();
  };

  const handleManualTokenSave = (token: string) => {
    setStoredAuth(token, 'rkf.online');
    setErrorMsg('');
    onAuthChange();
    onClose();
  };

  const handleLogout = () => {
    clearStoredAuth();
    onAuthChange();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-old-money-200/90 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-old-money-100 bg-cream-50 shrink-0">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-camel-700" />
            <h3 className="text-sm font-bold text-charcoal-900">
              {currentToken ? 'Токен РКФ Онлайн' : 'Подключение к РКФ Онлайн'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 rounded-full flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {currentToken ? (
            <TrackerAuthActive
              token={currentToken}
              email={currentEmail}
              onLogout={handleLogout}
              onClose={onClose}
            />
          ) : (
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                  {errorMsg}
                </div>
              )}

              {/* Блок 1: Если расширение обнаружено через postMessage */}
              {extensionToken && (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                      <Puzzle className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-emerald-950 leading-snug">
                        Обнаружено расширение CoursingStats с активным аккаунтом РКФ
                      </h4>
                      <p className="text-[11.5px] text-emerald-800/90 mt-1 leading-relaxed">
                        Сессия rkf.online готова к безопасной синхронизации без ввода логина и пароля.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSyncExtension}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Синхронизировать в 1 клик</span>
                  </button>
                </div>
              )}

              {/* Блок 2: Форма входа по E-mail и паролю от РКФ Онлайн */}
              <TrackerAuthPasswordForm
                hasExtension={Boolean(extensionToken)}
                onSuccess={handlePasswordSuccess}
                onError={setErrorMsg}
              />

              {/* Блок 3: Альтернатива без ввода пароля */}
              <div className="p-3.5 rounded-xl border border-old-money-200/80 bg-cream-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-charcoal-900 block">
                    Альтернатива без ввода пароля
                  </span>
                  <p className="text-[11px] text-charcoal-600 leading-relaxed mt-0.5">
                    Расширение подхватит ваш уже открытый сеанс на rkf.online без ввода пароля.
                  </p>
                </div>
                <a
                  href={EXTENSION_ZIP_URL}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-old-money-200 bg-white hover:bg-cream-100 text-charcoal-800 text-[11.5px] font-semibold flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Puzzle className="w-3.5 h-3.5 text-camel-700" />
                  <span>Установить расширение</span>
                </a>
              </div>

              {/* Блок 4: Скрытый подвал (Ручной ввод токена) */}
              <TrackerAuthManualToken
                onSaveToken={handleManualTokenSave}
                onError={setErrorMsg}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
