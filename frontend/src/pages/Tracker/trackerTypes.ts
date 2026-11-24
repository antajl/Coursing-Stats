export interface ApplicationHistoryItem {
  date: string;
  status: string;
}

export interface TrackerApplication {
  barcode: string;
  dogName: string;
  documentName: string;
  pedigreeNumber: string;
  currentStatus: string;
  lastUpdated: string;
  statusGroup: 'ready' | 'active' | 'rejected';
  history: ApplicationHistoryItem[];
  isReceived?: boolean;
}

export interface TrackerCompetition {
  id: string;
  sheetName: string;
  dateRaw: string;
  discipline: string;
  rank: string;
  location: string;
  club: string;
  status: 'APPROVED' | 'DELAYED' | 'PENDING';
  reglament: string;
  summary: string;
  decision?: string;
  judges?: string;
  notes?: string;
  updatedAt?: string;
  eventId?: number;
}

export type TrackerTab = 'applications' | 'competitions' | 'apps';
export type DisciplineKey = 'Курсинг борзых' | 'Бега борзых' | 'БЗМП';
export type ApplicationFilter = 'all' | 'active' | 'to_pickup' | 'collected' | 'rejected';
export type CompetitionStatusFilter = 'all' | 'APPROVED' | 'DELAYED' | 'PENDING';
