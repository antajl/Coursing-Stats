// Background poller orchestrator for Cloudflare Workers Cron Trigger
// Respects Cloudflare subrequest limits via round-robin cursor and bounded concurrency.
import type { Env, UserRecord } from '../types.js';
import { getUserIndex, getUser, saveUser, setTokenEncryptionSecret } from '../storage/index.js';
import { fetchRkfApplications } from './rkf-api.js';
import { detectStatusChanges, formatChangeMessage } from './diff-engine.js';
import { formatApprovalAlert, formatCompetitionStatusChangeAlert, type CompetitionEvent } from './competition-tracker.js';
import { syncRkfCalendar, getLiveCompetitions } from './calendar-sync.js';

const POLL_CURSOR_KEY = 'poll:rkf_cursor';
const MAX_RKF_POLLS_PER_CRON = 8;
const POLL_BATCH_SIZE = 4;

export async function runBackgroundPolling(env: Env): Promise<{ checkedUsers: number; alertsSent: number }> {
  const token = env.BOT_TOKEN || env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('[Poller] No Telegram bot token configured');
    return { checkedUsers: 0, alertsSent: 0 };
  }

  const encSecret = env.TOKEN_ENC_KEY || token;
  setTokenEncryptionSecret(encSecret);

  // 0. Sync latest RKF 2026 calendar ONCE per cron cycle
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
  if (userIds.length === 0) return { checkedUsers: 0, alertsSent: 0 };

  let cursor = 0;
  if (env.KV_STORAGE) {
    const rawCursor = await env.KV_STORAGE.get(POLL_CURSOR_KEY).catch(() => null);
    const parsed = rawCursor ? Number(rawCursor) : 0;
    if (Number.isFinite(parsed) && parsed >= 0 && parsed < userIds.length) {
      cursor = parsed;
    }
  }

  // Rotate list so every user gets fair RKF application polling across cron ticks
  const rotatedIds = [...userIds.slice(cursor), ...userIds.slice(0, cursor)];

  let checkedUsers = 0;
  let alertsSent = 0;
  let rkfPollsPerformed = 0;

  async function processSingleUser(user: UserRecord, pollRkfApps: boolean): Promise<number> {
    let sent = 0;
    let userModified = false;

    if (pollRkfApps && user.rkfToken) {
      try {
        const apps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
        const changes = detectStatusChanges(user.cachedApps || {}, apps, user.receivedBarcodes || []);

        for (const change of changes) {
          const text = formatChangeMessage(change);
          if (await sendTelegramMessage(token!, user.chatId, text)) sent++;
        }

        const nextCache: UserRecord['cachedApps'] = {};
        for (const app of apps) {
          nextCache[app.barcode] = {
            status: app.currentStatus,
            statusGroup: app.statusGroup,
            lastUpdated: app.lastUpdated,
          };
        }
        user.cachedApps = nextCache;
        user.lastCheckedAt = new Date().toISOString();
        user.authExpiredNotifiedAt = undefined;
        userModified = true;
      } catch (err: any) {
        if (err?.message === 'AUTH_EXPIRED' && !user.authExpiredNotifiedAt) {
          const ok = await sendTelegramMessage(
            token!,
            user.chatId,
            'Срок действия токена RKF.Online истек. Обновите токен через /auth.'
          );
          if (ok) {
            user.authExpiredNotifiedAt = new Date().toISOString();
            userModified = true;
          }
        }
      }
    }

    if (user.competitions && user.competitions.length > 0) {
      for (const comp of user.competitions) {
        try {
          const ev = eventMap.get(comp.id);
          if (!ev) continue;
          if (ev.status === 'APPROVED' && comp.lastStatus !== 'APPROVED') {
            if (await sendTelegramMessage(token!, user.chatId, formatApprovalAlert(ev))) sent++;
            comp.lastStatus = ev.status;
            userModified = true;
          } else if (comp.lastStatus && ev.status !== comp.lastStatus) {
            if (await sendTelegramMessage(token!, user.chatId, formatCompetitionStatusChangeAlert(ev, comp.lastStatus))) {
              sent++;
            }
            comp.lastStatus = ev.status;
            userModified = true;
          } else if (!comp.lastStatus) {
            comp.lastStatus = ev.status;
            userModified = true;
          }
        } catch {
          // Ignore per-competition diff failures
        }
      }
    }

    if (userModified) {
      await saveUser(env.KV_STORAGE, user, encSecret);
    }
    return sent;
  }

  const usersLoaded = await Promise.all(
    rotatedIds.map((id) => getUser(env.KV_STORAGE, id, encSecret)),
  );

  const tasks: Array<{ user: UserRecord; pollRkf: boolean }> = [];
  let scannedCount = 0;

  for (const user of usersLoaded) {
    scannedCount++;
    if (!user || !user.notificationsEnabled) continue;
    checkedUsers++;

    const wantsRkfPoll = Boolean(user.rkfToken) && rkfPollsPerformed < MAX_RKF_POLLS_PER_CRON;
    if (wantsRkfPoll) rkfPollsPerformed++;
    if (wantsRkfPoll || (user.competitions && user.competitions.length > 0)) {
      tasks.push({ user, pollRkf: wantsRkfPoll });
    }
    if (rkfPollsPerformed >= MAX_RKF_POLLS_PER_CRON && tasks.length >= MAX_RKF_POLLS_PER_CRON) {
      // Finish competition-only checks for remaining users in queue, skip extra external RKF polls
      for (let j = scannedCount; j < usersLoaded.length; j++) {
        const rem = usersLoaded[j];
        if (!rem || !rem.notificationsEnabled) continue;
        checkedUsers++;
        if (rem.competitions && rem.competitions.length > 0) {
          tasks.push({ user: rem, pollRkf: false });
        }
      }
      break;
    }
  }

  for (let i = 0; i < tasks.length; i += POLL_BATCH_SIZE) {
    const batch = tasks.slice(i, i + POLL_BATCH_SIZE);
    const results = await Promise.allSettled(batch.map((t) => processSingleUser(t.user, t.pollRkf)));
    for (const res of results) {
      if (res.status === 'fulfilled') alertsSent += res.value;
    }
  }

  if (env.KV_STORAGE && userIds.length > 0) {
    const nextCursor = (cursor + Math.min(scannedCount, userIds.length)) % userIds.length;
    await env.KV_STORAGE.put(POLL_CURSOR_KEY, String(nextCursor)).catch(() => {});
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
