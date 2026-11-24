// Text templates and guides for the 4 authentication methods (Strict Zero Emoji)
export const BOOKMARKLET_CODE =
  `javascript:(function(){var k=(localStorage.getItem('apikey')||'').replace(/['"]/g,'').trim();if(!k){alert('Сначала войдите в аккаунт на rkf.online, затем нажмите эту закладку.');return;}window.location.href='https://t.me/coursing_stats_notify_bot?start=bind_'+encodeURIComponent(k);})();`;

export function getAuthPromptText(): string {
  return (
    `Подключение аккаунта rkf.online\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Бот автоматически отслеживает готовность дипломов и сертификатов РКФ.\n\n` +
    `Выберите удобный способ привязки:\n` +
    `1. Вход по E-mail и паролю (в кабинете бота)\n` +
    `2. Через расширение для ПК (в 1 клик)\n` +
    `3. Через сайт РКФ (Умная закладка без расширений)\n` +
    `4. Ввести API-токен вручную (для опытных)`
  );
}

export function getAuthLoginText(webAppUrl: string): string {
  return (
    `Способ 1. Вход по E-mail и паролю\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Самый простой способ:\n` +
    `1. Нажмите системную кнопку «Кабинет» слева от поля ввода (или откройте веб-кабинет).\n` +
    `2. Введите ваш E-mail и пароль от rkf.online.\n\n` +
    `Либо отправьте боту команду:\n` +
    `/login <email> <пароль>\n\n` +
    `Бот мгновенно удалит сообщение с паролем из чата ради вашей безопасности.`
  );
}

export function getAuthExtText(): string {
  return (
    `Способ 2. Через расширение для ПК\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Если вы заходите на rkf.online с компьютера:\n\n` +
    `1. Установите бесплатное расширение CoursingStats Tracker в Chrome или Яндекс.Браузер.\n` +
    `2. Откройте rkf.online — в правом верхнем углу появится панель трекера.\n` +
    `3. Нажмите одну кнопку: «Подключить Telegram».\n\n` +
    `Бот свяжет аккаунт автоматически без ввода паролей.\n\n` +
    `Инструкция и ссылка: coursing-stats.ru/tracker/#extension`
  );
}

export function getAuthBookmarkletText(): string {
  return (
    `Способ 3. Умная закладка для браузера\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Работает на телефонах (Safari iOS, Chrome Android) и ПК без установки каких-либо приложений:\n\n` +
    `1. Скопируйте код закладки ниже (нажмите на него):\n\n` +
    `<code>${BOOKMARKLET_CODE}</code>\n\n` +
    `2. Создайте в браузере любую закладку и в поле адреса (URL) вставьте скопированный код.\n` +
    `3. Откройте rkf.online и войдите в свой аккаунт.\n` +
    `4. Нажмите сохраненную закладку — браузер перенаправит вас в бота, и аккаунт привяжется сам!`
  );
}

export function getAuthManualText(): string {
  return (
    `Способ 4. Прямой ввод токена\n` +
    `— — — — — — — — — — — — — — —\n` +
    `Для опытных пользователей:\n\n` +
    `1. На rkf.online откройте DevTools (F12) -> вкладка Application / Хранилище -> Local Storage -> ключ "apikey".\n` +
    `2. Отправьте скопированный токен в этот чат или командой:\n` +
    `/auth <токен>\n\n` +
    `Бот сразу удалит сообщение с токеном ради безопасности.`
  );
}
