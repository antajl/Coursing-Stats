// Text templates and guides for the authentication methods (Strict Zero Emoji)
export const BOOKMARKLET_CODE =
  `javascript:(function(){var k=(localStorage.getItem('apikey')||'').replace(/['"]/g,'').trim();if(!k){alert('Сначала войдите в аккаунт на rkf.online, затем нажмите эту закладку.');return;}window.location.href='https://t.me/coursing_stats_notify_bot?start=bind_'+encodeURIComponent(k);})();`;

export function getAuthPromptText(): string {
  return (
    `Подключение мониторинга документов РКФ\n` +
    `— — — — — — — — — — — — — — —\n` +
    `CoursingStats Tracker — независимый сервис мониторинга.\n` +
    `Поскольку у портала rkf.online нет встроенной авторизации через Telegram, выберите удобный способ привязки:\n\n` +
    `1. С компьютера (Рекомендуется, без ввода паролей):\n` +
    `В браузере или приложении ПК нажмите «Подключить Telegram». Аккаунт свяжется в 1 клик через уже открытую сессию РКФ.\n\n` +
    `2. На телефоне (Через веб-кабинет трекера):\n` +
    `Защищенная форма WebApp на coursing-stats.ru/tracker/. Пароль передается напрямую в РКФ разово для выпуска ключа мониторинга и не сохраняется.`
  );
}

export function getAuthLoginText(webAppUrl: string): string {
  return (
    `Привязка через Кабинет трекера\n` +
    `— — — — — — — — — — — — — — —\n` +
    `По кнопке ниже откроется защищенная форма WebApp (coursing-stats.ru/tracker/):\n\n` +
    `• Пароли никогда не пересылаются открытым текстом в чат\n` +
    `• Данные отправляются напрямую на сервер РКФ один раз для получения ключа сессии\n` +
    `• Если вы не хотите вводить пароль на телефоне, используйте привязку в 1 клик с компьютера (без ввода паролей)`
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
