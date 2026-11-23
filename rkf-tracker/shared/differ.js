// Calendar Snapshot Differ — Detects Status and Approval Changes
import { APPROVAL_STATUS } from './types.js';

export function computeCalendarDiff(previousEvents = [], currentEvents = []) {
  const prevMap = new Map((previousEvents || []).map(e => [e.id, e]));
  const currMap = new Map((currentEvents || []).map(e => [e.id, e]));

  const newlyApproved = [];
  const statusChanges = [];
  const newEvents = [];
  const removedEvents = [];
  const rescheduled = [];

  for (const [id, curr] of currMap.entries()) {
    const prev = prevMap.get(id);

    if (!prev) {
      newEvents.push(curr);
      if (curr.status === APPROVAL_STATUS.APPROVED) {
        newlyApproved.push({ event: curr, previousStatus: null });
      }
      continue;
    }

    // Check Approval Status Change
    if (prev.status !== curr.status) {
      if (curr.status === APPROVAL_STATUS.APPROVED) {
        newlyApproved.push({ event: curr, previousStatus: prev.status });
      } else {
        statusChanges.push({ event: curr, previousStatus: prev.status, newStatus: curr.status });
      }
    }

    // Check Rescheduling
    if (prev.dateRaw !== curr.dateRaw) {
      rescheduled.push({ event: curr, oldDate: prev.dateRaw, newDate: curr.dateRaw });
    }
  }

  for (const [id, prev] of prevMap.entries()) {
    if (!currMap.has(id)) {
      removedEvents.push(prev);
    }
  }

  const hasChanges = newlyApproved.length > 0 || statusChanges.length > 0 || newEvents.length > 0 || rescheduled.length > 0;

  return {
    hasChanges,
    newlyApproved,
    statusChanges,
    newEvents,
    removedEvents,
    rescheduled,
    totalCurrent: currentEvents.length,
    timestamp: new Date().toISOString()
  };
}

export function formatApprovalAlert(diffItem) {
  const ev = diffItem.event;
  return `Состязание утверждено РКФ!\n\n` +
    `• Дисциплина: ${ev.discipline}\n` +
    `• Ранг: ${ev.rank || 'Сертификатные'}\n` +
    `• Дата: ${ev.dateRaw}\n` +
    `• Место: ${ev.location}\n` +
    `• Клуб: ${ev.club}\n` +
    (ev.calendarCode ? `• Номер в календаре РКФ: ${ev.calendarCode}\n` : '') +
    (ev.judges ? `• Судейская коллегия: ${ev.judges}\n` : '');
}
