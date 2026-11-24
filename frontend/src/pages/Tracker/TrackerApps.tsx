import { useState, useEffect } from 'react';
import {
  Bot,
  Puzzle,
  Monitor,
  Smartphone,
  Download,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { getStoredToken } from './trackerData';
import { TrackerAppCard } from './TrackerAppCard';
import {
  TelegramBotVisual,
  ExtensionVisual,
  WindowsToastVisual,
  PwaHomeVisual,
} from './TrackerAppVisuals';

const EXTENSION_ZIP_URL =
  'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Chrome-Extension.zip';
const DESKTOP_EXE_URL =
  'https://github.com/antajl/Coursing-Stats/releases/download/v1.0.0-tracker/CoursingStats-Tracker-Windows-x64.exe';
const TELEGRAM_BOT_URL = 'https://t.me/coursing_stats_notify_bot';

let globalDeferredPrompt: any = null;
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e;
  });
}

export function TrackerApps() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => globalDeferredPrompt);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [installHint, setInstallHint] = useState<string | null>(null);
  const token = getStoredToken();

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };
    const handleAppInstalled = () => {
      setPwaInstalled(true);
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const choice = await promptToUse.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setPwaInstalled(true);
        }
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA install error:', err);
      }
    } else {
      setInstallHint(
        'В Safari на iOS нажмите кнопку «Поделиться» → «На экран "Домой"». В Chrome на Android выберите в меню «Установить приложение».'
      );
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto py-1">
      {/* 4 Cards Grid - Straight to practical tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Card 1: Telegram Bot */}
        <TrackerAppCard
          icon={<Bot className="w-5 h-5" />}
          iconContainerClass="bg-sky-50 text-sky-700 border-sky-200/60"
          badgeText="Мгновенные пуши"
          badgeClass="bg-emerald-50 text-emerald-800 border-emerald-200/80"
          title="Telegram-бот уведомлений"
          subtitle="@coursing_stats_notify_bot"
          description="Бот ежечасно опрашивает сервер РКФ Онлайн. Как только чемпионский титул или рабочий сертификат перейдет в статус «Изготовлено», вы сразу получите личное сообщение в Telegram."
          features={[
            'Оповещения об изготовлении дипломов и сертификатов',
            'Отслеживание согласования состязаний (РКФ)',
            'Быстрая привязка через защищенный код',
          ]}
          visual={<TelegramBotVisual />}
          action={
            <a
              href={token ? `${TELEGRAM_BOT_URL}?start=bind_${encodeURIComponent(token)}` : TELEGRAM_BOT_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[44px] h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>{token ? 'Привязать аккаунт в Telegram' : 'Открыть бота в Telegram'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          }
        />

        {/* Card 2: Browser Extension */}
        <TrackerAppCard
          icon={<Puzzle className="w-5 h-5" />}
          iconContainerClass="bg-amber-50 text-amber-800 border-amber-200/60"
          badgeText="Вход без пароля"
          badgeClass="bg-amber-50 text-amber-900 border-amber-200/80"
          title="Расширение для браузера"
          subtitle="Chrome, Яндекс.Браузер, Edge, Opera"
          description="Автоматически подхватывает открытый сеанс с официального сайта rkf.online без ввода пароля. Встраивается в тулбар браузера и показывает список готовых документов в один клик."
          features={[
            'Авторизация в 1 клик прямо из открытой вкладки РКФ',
            'Умная кнопка «Обновить» с таймером кулдауна',
            'Прямая синхронизация с сайтом CoursingStats',
          ]}
          visual={<ExtensionVisual />}
          action={
            <a
              href={EXTENSION_ZIP_URL}
              download
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[44px] h-11 rounded-xl cs-glass-pill-active font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-camel-700" />
              <span>Скачать расширение (.zip)</span>
            </a>
          }
        />

        {/* Card 3: Windows Desktop App */}
        <TrackerAppCard
          icon={<Monitor className="w-5 h-5" />}
          iconContainerClass="bg-camel-100 text-camel-900 border-camel-200/60"
          badgeText="Автономно в трее"
          badgeClass="bg-camel-50 text-camel-900 border-camel-200/80"
          title="Программа для Windows"
          subtitle="Windows 10 / Windows 11 (x64)"
          description="Нативное приложение для ПК. Сворачивается в системный трей возле часов и присылает системные всплывающие уведомления Windows при изменении статусов документов."
          features={[
            'Работает в фоне без открытых вкладок браузера',
            'Формат Portable: запускается сразу, не требует установки',
            'Потребляет менее 30 МБ оперативной памяти',
          ]}
          visual={<WindowsToastVisual />}
          action={
            <a
              href={DESKTOP_EXE_URL}
              download
              target="_blank"
              rel="noreferrer"
              className="w-full min-h-[44px] h-11 rounded-xl cs-glass-pill-active font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-camel-700" />
              <span>Скачать для Windows (.exe)</span>
            </a>
          }
        />

        {/* Card 4: Mobile Web App (PWA) */}
        <TrackerAppCard
          icon={<Smartphone className="w-5 h-5" />}
          iconContainerClass="bg-cream-200 text-charcoal-800 border-old-money-200"
          badgeText="iOS и Android"
          badgeClass="bg-cream-100 text-charcoal-800 border-old-money-200"
          title="Веб-приложение (PWA)"
          subtitle="Safari на iPhone / Chrome на Android"
          description="Полноэкранная версия сайта, запускающаяся с рабочего стола телефона как обычное приложение без адресной строки. Не занимает лишнее место в памяти смартфона."
          features={[
            'Быстрый вход в 1 касание с иконки на главном экране',
            'Полноэкранный режим без элементов управления браузера',
            'Мгновенная загрузка из локального кэша',
          ]}
          visual={<PwaHomeVisual />}
          action={
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleInstallPwa}
                className="w-full min-h-[44px] h-11 rounded-xl cs-glass-pill-active font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-camel-700" />
                <span>{pwaInstalled ? 'Приложение уже установлено' : 'Установить на устройство'}</span>
              </button>
              {installHint && (
                <p className="text-[11px] text-charcoal-600 leading-snug bg-cream-50 p-2.5 rounded-lg border border-old-money-200/60">
                  {installHint}
                </p>
              )}
            </div>
          }
        />
      </div>

      {/* Security Banner */}
      <div className="rounded-2xl border border-old-money-200/80 bg-cream-50/70 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-sand-200/80 text-camel-800 flex items-center justify-center shrink-0 border border-sand-300/80">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-charcoal-900">
            Гарантия конфиденциальности и безопасности
          </h4>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Все инструменты экосистемы обращаются к сервисам РКФ Онлайн напрямую через защищенный
            протокол HTTPS. Ваши пароли не сохраняются на серверах CoursingStats и не передаются
            третьим лицам. Исходный код расширения и клиентов открыт для независимого аудита.
          </p>
        </div>
      </div>
    </div>
  );
}
