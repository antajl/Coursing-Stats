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
  city: string;
  date: string;
  lastStatus: string;
  createdAt: string;
}

export interface TrackerUserRecord {
  userId: number;
  chatId: number;
  rkfToken?: string;
  linkedAt?: string;
  lastCheckedAt?: string;
  notificationsEnabled?: boolean;
  receivedBarcodes: string[];
  cachedApps: Record<string, { status: string; statusGroup: StatusGroup; lastUpdated: string }>;
  competitions: CompetitionSubscription[];
  authExpiredNotifiedAt?: string;
  createdAt?: string;
}

export interface TrackerWorkerEnv {
  BOT_TOKEN: string;
  SITE_URL?: string;
  WEBHOOK_SECRET?: string;
  ADMIN_SECRET?: string;
  TOKEN_ENC_KEY?: string;
  BOT_USERNAME?: string;
  CACHE: KVNamespace;
  TRACKER_KV?: KVNamespace;
}
