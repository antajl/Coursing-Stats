import type { KVNamespace } from '../handlers/context';
import type { TrackerWorkerEnv } from './types';
import { getAllTrackerUserIds, getTrackerUser, saveTrackerUser } from './storage';
import { fetchRkfApplications } from './rkfApi';
import { detectStatusChanges, formatChangeMessage } from './diffEngine';

const MAX_RKF_POLLS_PER_CRON = 8;
const POLL_BATCH_SIZE = 4;
const CURSOR_KEY = 'trk:poll_cursor';

async function sendTelegramNotification(botToken: string, chatId: number, text: string): Promise<void> {
  if (!botToken) return;
  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[tracker-poller] Telegram notify failed:', err);
  }
}

export async function runTrackerCron(env: TrackerWorkerEnv): Promise<void> {
  const kv: KVNamespace | undefined = env.TRACKER_KV || env.CACHE;
  if (!kv) return;

  const userIds = await getAllTrackerUserIds(kv);
  if (userIds.length === 0) return;

  const total = userIds.length;
  let cursor = 0;
  try {
    const rawCursor = await kv.get(CURSOR_KEY);
    if (rawCursor) cursor = Math.max(0, parseInt(rawCursor, 10) || 0);
  } catch {
    cursor = 0;
  }

  const orderedIds: number[] = [];
  for (let i = 0; i < total; i++) {
    orderedIds.push(userIds[(cursor + i) % total]);
  }

  const pollQueue: Array<{ userId: number; stepIndex: number }> = [];
  let maxStepScanned = 0;
  for (let i = 0; i < orderedIds.length; i++) {
    maxStepScanned = i + 1;
    const uid = orderedIds[i];
    const u = await getTrackerUser(kv, uid, env.TOKEN_ENC_KEY);
    if (u && u.rkfToken) {
      pollQueue.push({ userId: uid, stepIndex: i });
      if (pollQueue.length >= MAX_RKF_POLLS_PER_CRON) break;
    }
  }

  const nextCursor = total > 0 ? (cursor + maxStepScanned) % total : 0;
  await kv.put(CURSOR_KEY, String(nextCursor)).catch(() => {});

  for (let i = 0; i < pollQueue.length; i += POLL_BATCH_SIZE) {
    const batch = pollQueue.slice(i, i + POLL_BATCH_SIZE);
    await Promise.allSettled(
      batch.map(async ({ userId }) => {
        const user = await getTrackerUser(kv, userId, env.TOKEN_ENC_KEY);
        if (!user || !user.rkfToken) return;

        try {
          const currentApps = await fetchRkfApplications(user.rkfToken, user.receivedBarcodes || []);
          const changes = detectStatusChanges(
            user.cachedApps || {},
            currentApps,
            user.receivedBarcodes || [],
          );

          for (const ch of changes) {
            await sendTelegramNotification(env.BOT_TOKEN, user.chatId, formatChangeMessage(ch));
          }

          user.cachedApps = {};
          for (const app of currentApps) {
            user.cachedApps[app.barcode] = {
              status: app.currentStatus,
              statusGroup: app.statusGroup,
              lastUpdated: app.lastUpdated,
            };
          }
          user.lastCheckedAt = new Date().toISOString();
          user.authExpiredNotifiedAt = undefined;
          await saveTrackerUser(kv, user, env.TOKEN_ENC_KEY);
        } catch (err: any) {
          if (err?.message === 'AUTH_EXPIRED' && !user.authExpiredNotifiedAt) {
            user.authExpiredNotifiedAt = new Date().toISOString();
            await saveTrackerUser(kv, user, env.TOKEN_ENC_KEY);
            await sendTelegramNotification(
              env.BOT_TOKEN,
              user.chatId,
              '<b>Сессия rkf.online устарела</b>\nВыполните /auth или войдите через веб-кабинет, чтобы возобновить мониторинг заявок.',
            );
          }
        }
      }),
    );
  }
}
