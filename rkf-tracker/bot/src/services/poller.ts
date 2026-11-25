// Background poller orchestrator for Cloudflare Workers Cron Trigger
import type { Env, UserRecord } from '../types.js';
import { getUserIndex, getUser, saveUser } from '../storage/index.js';
import { fetchRkfApplications } from './rkf-api.js';
import { detectStatusChanges, formatChangeMessage } from './diff-engine.js';
import { formatApprovalAlert, formatCompetitionStatusChangeAlert, type CompetitionEvent } from './competition-tracker.js';
import { syncRkfCalendar, getLiveCompetitions } from './calendar-sync.js';

export async function runBackgroundPolling(env: Env): Promise<{ checkedUsers: number; alertsSent: number }> {
  const token = env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[Poller] No Telegram bot token configured');
    return { checkedUsers: 0, alertsSent: 0 };
  }

  // 0. Sync latest RKF 2026 calendar into KV_STORAGE before checking user subscriptions
  let liveEvents: CompetitionEvent[] = [];
  try {
    const snap = await syncRkfCalendar(env.KV_STORAGE);
    liveEvents = snap.events;
  } catch (err) {
    console.warn('[Poller] Calendar sync failed, falling back to cached:', err);
    const cached = await getLiveCompetitions(env.KV_STORAGE);
    liveEvents = cached.events;
  }
  const eventMap = new Map(liveEvents.map((ev) => [ev.id, ev]));

  const userIds = await getUserIndex(env.KV_STORAGE);
  let checkedUsers = 0;
  let alertsSent = 0;

  for (const userId of userIds) {
    const user = await getUser(env.KV_STORAGE, userId);
    if (!user || !user.notificationsEnabled) continue;

    checkedUsers++;
    let userModified = false;

    // 1. Check RKF Applications
    if (user.rkfToken) {
      try {
        const apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
        const changes = detectStatusChanges(user.cachedApps || {}, apps, user.receivedBarcodes || []);

        for (const change of changes) {
          const text = formatChangeMessage(change);
          const ok = await sendTelegramMessage(token, user.chatId, text);
          if (ok) alertsSent++;
        }

        // Update cache
        const nextCache: UserRecord['cachedApps'] = {};
        for (const app of apps) {
          nextCache[app.barcode] = {
            status: app.currentStatus,
            statusGroup: app.statusGroup,
            lastUpdated: app.lastUpdated
          };
        }
        user.cachedApps = nextCache;
        user.lastCheckedAt = new Date().toISOString();
        user.authExpiredNotifiedAt = undefined;
        userModified = true;
      } catch (err: any) {
        if (err?.message === 'AUTH_EXPIRED' && !user.authExpiredNotifiedAt) {
          const sent = await sendTelegramMessage(
            token,
            user.chatId,
            '[ВНИМАНИЕ] Срок действия токена RKF.Online истек. Пожалуйста, обновите токен через команду /auth.'
          );
          if (sent) {
            user.authExpiredNotifiedAt = new Date().toISOString();
            userModified = true;
          }
        }
      }
    }

    // 2. Check Competition Subscriptions (2026 Calendar)
    if (user.competitions && user.competitions.length > 0) {
      for (const comp of user.competitions) {
        try {
          const ev = eventMap.get(comp.id);
          if (!ev) continue;
          if (ev.status === 'APPROVED' && comp.lastStatus !== 'APPROVED') {
            const text = formatApprovalAlert(ev);
            const ok = await sendTelegramMessage(token, user.chatId, text);
            if (ok) alertsSent++;
            comp.lastStatus = ev.status;
            userModified = true;
          } else if (comp.lastStatus && ev.status !== comp.lastStatus) {
            const text = formatCompetitionStatusChangeAlert(ev, comp.lastStatus);
            const ok = await sendTelegramMessage(token, user.chatId, text);
            if (ok) alertsSent++;
            comp.lastStatus = ev.status;
            userModified = true;
          } else if (!comp.lastStatus) {
            comp.lastStatus = ev.status;
            userModified = true;
          }
        } catch {
          // Ignore individual check errors
        }
      }
    }

    if (userModified) {
      await saveUser(env.KV_STORAGE, user);
    }
  }

  return { checkedUsers, alertsSent };
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string): Promise<boolean> {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true
      })
    });
    return res.ok;
  } catch {
    return false;
  }
}
