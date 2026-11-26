import { getTrackerCompetitions } from './competitions';
import type { TrackerUserRecord } from './types';

export const TRACKER_WEBAPP_URL = 'https://coursing-stats.ru/tracker/';

export const BOOKMARKLET_SNIPPET =
  `javascript:(function(){var k=(localStorage.getItem('apikey')||'').replace(/['"]/g,'').trim();if(!k){alert('Сначала войдите в аккаунт на rkf.online, затем нажмите эту закладку.');return;}fetch('https://coursing-stats.ru/api/auth/ticket',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apikey:k})}).then(function(r){return r.json()}).then(function(d){if(d&&d.ok&&d.botUrl){window.location.href=d.botUrl;}else{alert('Не удалось создать ссылку привязки.');}}).catch(function(){alert('Ошибка сети.');});})();`;

export function buildTrackerHubText(user: TrackerUserRecord | null): string {
  const totalEvents = getTrackerCompetitions().length;
  if (!user || !user.rkfToken) {
    return (
      `📋 <b>Трекер заявок и графика РКФ</b>\n\n` +
      `• Аккаунт rkf.online: не подключен\n` +
      `• Мероприятий в графике 2026: ${totalEvents}\n` +
      `• Подписок на состязания: ${user?.competitions?.length || 0}\n\n` +
      `Подключите профиль rkf.online, чтобы получать уведомления о готовности дипломов и сертификатов.`
    );
  }

  const cached = Object.values(user.cachedApps || {});
  const ready = cached.filter((a) => a.statusGroup === 'ready').length;
  const active = cached.filter((a) => a.statusGroup === 'active').length;
  const lastCheck = user.lastCheckedAt
    ? new Date(user.lastCheckedAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })
    : 'ещё не выполнялась';

  return (
    `📋 <b>Личный кабинет РКФ</b>\n\n` +
    `• Всего заявок: ${cached.length}\n` +
    `• Готово к выдаче: ${ready}\n` +
    `• В обработке: ${active}\n` +
    `• Подписок на состязания: ${user.competitions?.length || 0}\n` +
    `• Последняя проверка: ${lastCheck} (МСК)\n\n` +
    `Фоновый опрос выполняется автоматически каждые 15 минут.`
  );
}

export function getAuthPromptMessage(): string {
  return (
    `🔑 <b>Подключение аккаунта rkf.online</b>\n\n` +
    `Выберите удобный способ привязки:\n` +
    `• <b>Веб-кабинет</b> — безопасный вход через WebApp\n` +
    `• <b>С компьютера</b> — привязка в 1 клик через расширение или программу\n` +
    `• <b>Умная закладка</b> — для браузера без расширений`
  );
}
