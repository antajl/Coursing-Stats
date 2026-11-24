// Domain types for RKF Tracker Telegram Bot
import type { Context } from 'grammy';

export type StatusGroup = 'ready' | 'rejected' | 'active';

export interface ApplicationHistoryItem {
  date: string;
  status: string;
}

export interface ApplicationItem {
  barcode: string;
  dogName: string;
  documentName: string;
  pedigreeNumber: string;
  currentStatus: string;
  lastUpdated: string;
  statusGroup: StatusGroup;
  isReceived: boolean;
  history: ApplicationHistoryItem[];
}

export interface CompetitionSubscription {
  id: string;
  query: string;
  title: string;
  city?: string;
  date?: string;
  lastStatus: string;
  createdAt: string;
}

export interface UserRecord {
  userId: number;
  chatId: number;
  rkfToken?: string;
  profileId?: string;
  userUuid?: string;
  linkedAt?: string;
  lastCheckedAt?: string;
  notificationsEnabled: boolean;
  receivedBarcodes: string[];
  competitions: CompetitionSubscription[];
  cachedApps: Record<string, { status: string; statusGroup: StatusGroup; lastUpdated: string }>;
  lastBotMessageId?: number;
  authExpiredNotifiedAt?: string;
}

export interface Env {
  KV_STORAGE: KVNamespace;
  BOT_TOKEN?: string;
  TELEGRAM_BOT_TOKEN?: string;
  WEBHOOK_SECRET?: string;
  ADMIN_SECRET?: string;
  WEBAPP_URL?: string;
  BOT_USERNAME?: string;
  SITE_URL?: string;
}

export type BotContext = Context & {
  env: Env;
};
