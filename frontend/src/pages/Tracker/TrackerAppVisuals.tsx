interface ScreenshotVisualProps {
  src: string;
  alt: string;
  badge: string;
}

function ScreenshotFrame({ src, alt, badge }: ScreenshotVisualProps) {
  return (
    <div className="relative group overflow-hidden rounded-xl border border-old-money-200/90 bg-sand-100 shadow-2xs hover:shadow-sm transition-all duration-300">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative aspect-[16/10] sm:aspect-[16/11] max-h-[220px] overflow-hidden bg-sand-100 cursor-zoom-in"
        title="Нажмите для просмотра в полном размере"
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-charcoal-900/80 backdrop-blur-md text-[10px] font-medium text-sand-100 tracking-wide border border-white/10 shadow-xs select-none">
          {badge}
        </div>
      </a>
    </div>
  );
}

/**
 * Screenshot Visual 1: Real Telegram Bot Chat Screen
 */
export function TelegramBotVisual() {
  return (
    <ScreenshotFrame
      src="/images/tracker/telegram-bot.webp"
      alt="Интерфейс Telegram-бота CoursingStats Tracker"
      badge="Telegram Bot"
    />
  );
}

/**
 * Screenshot Visual 2: Real Chrome Extension Popup in Browser
 */
export function ExtensionVisual() {
  return (
    <ScreenshotFrame
      src="/images/tracker/chrome-extension.webp"
      alt="Всплывающее окно расширения Chrome CoursingStats"
      badge="Chrome Extension"
    />
  );
}

/**
 * Screenshot Visual 3: Real Windows 11 Desktop Application
 */
export function WindowsToastVisual() {
  return (
    <ScreenshotFrame
      src="/images/tracker/windows-desktop.webp"
      alt="Окно десктопного приложения Windows 11"
      badge="Windows Desktop"
    />
  );
}

/**
 * Screenshot Visual 4: Real Mobile Smartphone PWA App
 */
export function PwaHomeVisual() {
  return (
    <ScreenshotFrame
      src="/images/tracker/mobile-pwa.webp"
      alt="Мобильное приложение PWA на смартфоне"
      badge="Mobile PWA"
    />
  );
}
