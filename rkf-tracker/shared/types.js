// Event Status and Approval Constants for RKF Competition Calendars

export const APPROVAL_STATUS = {
  APPROVED: 'APPROVED',     // Утверждено РКФ, включено в официальный график
  PENDING: 'PENDING',       // На рассмотрении / подана заявка
  REJECTED: 'REJECTED',     // Отклонено комиссией РКФ
  CANCELLED: 'CANCELLED',   // Отменено организатором
  UNKNOWN: 'UNKNOWN'        // Статус не указан
};

export const STATUS_LABELS = {
  [APPROVAL_STATUS.APPROVED]: 'Утверждено',
  [APPROVAL_STATUS.PENDING]: 'На согласовании',
  [APPROVAL_STATUS.REJECTED]: 'Отклонено',
  [APPROVAL_STATUS.CANCELLED]: 'Отменено',
  [APPROVAL_STATUS.UNKNOWN]: 'Не указан'
};

export const DISCIPLINES = {
  COURSING: 'Курсинг борзых',
  RACING: 'Бега борзых',
  BZMP: 'Бега за мех. приманкой',
  AGILITY: 'Аджилити',
  OBEDIENCE: 'Обидиенс',
  MONDIO: 'Мондьоринг',
  NOSEWORK: 'Ноузворк',
  HERDING: 'Пастушья служба',
  IGP: 'IGP (Служебное двоеборье/троеборье)',
  OTHER: 'Другая дисциплина'
};
