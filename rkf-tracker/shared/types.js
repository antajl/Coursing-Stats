// Event Status and Approval Constants for RKF Competition Calendars

export const APPROVAL_STATUS = {
  APPROVED: 'APPROVED',     // Регламент утвержден РКФ
  DELAYED: 'DELAYED',       // Задержано секретариатом / комиссией РКФ (КРАСНЫЙ СТАТУС)
  PENDING: 'PENDING',       // На согласовании (заявка принята либо статуса еще нет)
  REJECTED: 'REJECTED',     // Отклонено / Отказано комиссией
  CANCELLED: 'CANCELLED'    // Отменено организатором
};

export const STATUS_LABELS = {
  [APPROVAL_STATUS.APPROVED]: 'Утверждено',
  [APPROVAL_STATUS.DELAYED]: 'Задержано',
  [APPROVAL_STATUS.PENDING]: 'На согласовании',
  [APPROVAL_STATUS.REJECTED]: 'Отклонено',
  [APPROVAL_STATUS.CANCELLED]: 'Отменено'
};

export const STATUS_COLORS = {
  [APPROVAL_STATUS.APPROVED]: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },
  [APPROVAL_STATUS.DELAYED]: { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239' },
  [APPROVAL_STATUS.PENDING]: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  [APPROVAL_STATUS.REJECTED]: { bg: '#FFF1F2', border: '#FECDD3', text: '#9F1239' },
  [APPROVAL_STATUS.CANCELLED]: { bg: '#F5F5F4', border: '#E7E5E4', text: '#78716C' }
};

export const DISCIPLINES = {
  COURSING: 'Курсинг борзых',
  RACING: 'Бега борзых',
  BZMP: 'Бега за механической приманкой'
};
