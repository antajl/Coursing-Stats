// Diff detection between consecutive RKF sync snapshots
import type { ApplicationItem, StatusGroup } from '../types.js';

export interface StatusChangeNotification {
  barcode: string;
  dogName: string;
  documentName: string;
  oldStatus?: string;
  newStatus: string;
  statusGroup: StatusGroup;
  isImportant: boolean;
}

export function detectStatusChanges(
  previousApps: Record<string, { status: string; statusGroup: StatusGroup; lastUpdated: string }>,
  currentApps: ApplicationItem[],
  receivedBarcodes: string[] = []
): StatusChangeNotification[] {
  const notifications: StatusChangeNotification[] = [];

  for (const app of currentApps) {
    if (receivedBarcodes.includes(app.barcode)) {
      continue;
    }

    const prev = previousApps[app.barcode];
    if (!prev) {
      if (app.statusGroup === 'ready') {
        notifications.push({
          barcode: app.barcode,
          dogName: app.dogName,
          documentName: app.documentName,
          newStatus: app.currentStatus,
          statusGroup: app.statusGroup,
          isImportant: true
        });
      }
      continue;
    }

    if (prev.status !== app.currentStatus) {
      const isImportant = app.statusGroup === 'ready' || app.statusGroup === 'rejected';
      notifications.push({
        barcode: app.barcode,
        dogName: app.dogName,
        documentName: app.documentName,
        oldStatus: prev.status,
        newStatus: app.currentStatus,
        statusGroup: app.statusGroup,
        isImportant
      });
    }
  }

  return notifications;
}

export function formatChangeMessage(change: StatusChangeNotification): string {
  const badge = change.statusGroup === 'ready'
    ? '[ГОТОВО К ВЫДАЧЕ]'
    : change.statusGroup === 'rejected'
      ? '[ОТКЛОНЕНО]'
      : '[ОБНОВЛЕНИЕ СТАТУСА]';

  const dog = change.dogName ? `\nСобака: ${change.dogName}` : '';
  const oldSt = change.oldStatus ? `\nПредыдущий статус: ${change.oldStatus}` : '';

  return `${badge}\nДокумент: ${change.documentName} (№ ${change.barcode})${dog}${oldSt}\nНовый статус: ${change.newStatus}`;
}
