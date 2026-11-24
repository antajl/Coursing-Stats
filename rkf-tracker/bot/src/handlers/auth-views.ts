// Text templates and guides for the authentication methods (Strict Zero Emoji)
export const BOOKMARKLET_CODE =
  `javascript:(function(){var k=(localStorage.getItem('apikey')||'').replace(/['"]/g,'').trim();if(!k){alert('Сначала войдите в аккаунт на rkf.online, затем нажмите эту закладку.');return;}window.location.href='https://t.me/coursing_stats_notify_bot?start=bind_'+encodeURIComponent(k);})();`;

export function getAuthPromptText(): string {
  return (
    `Подключение аккаунта rkf.online\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Бот автоматически отслеживает готовность дипломов и официальное утверждение состязаний РКФ.\n\n` +
    `Выберите способ привязки:\n` +
    `• На телефоне: защищенный вход через форму WebApp (в 1 клик)\n` +
    `• С компьютера: моментальная привязка через расширение браузера\n` +
    `• Без приложений: умная закладка в браузере мобильного`
  );
}

export function getAuthLoginText(webAppUrl: string): string {
  return (
    `Вход в РКФ Онлайн (на телефоне)\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Для вашей безопасности пароли никогда не пересылаются открытым текстом в чат Telegram.\n\n` +
    `Нажмите кнопку ниже — откроется защищенная форма входа rkf.online внутри мессенджера.\n` +
    `Пароль отправляется напрямую на сервер РКФ один раз и нигде не сохраняется.`
  );
}

export function getAuthExtText(): string {
  return (
    `Привязка в 1 клик с компьютера\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Если вы подаете заявки на rkf.online с компьютера:\n\n` +
    `1. Откройте сайт rkf.online в Chrome или Яндекс.Браузере.\n` +
    `2. В расширении или десктопном приложении нажмите: «Подключить Telegram».\n` +
    `3. Бот мгновенно свяжет ваш аккаунт без ввода паролей и покажет найденные документы.`
  );
}

export function getAuthBookmarkletText(): string {
  return (
    `Умная закладка без расширений\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Работает в Safari на iPhone и Chrome на Android:\n\n` +
    `1. Скопируйте код закладки (нажмите на него):\n\n` +
    `<code>${BOOKMARKLET_CODE}</code>\n\n` +
    `2. Сохраните в браузере любую закладку и вставьте этот код в поле адреса (URL).\n` +
    `3. Откройте rkf.online, войдите в личный кабинет и нажмите сохраненную закладку.\n` +
    `4. Браузер перенаправит вас в бота, и аккаунт привяжется сам.`
  );
}
