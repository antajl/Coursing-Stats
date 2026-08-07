// Типизация для Яндекс.Метрики
declare global {
  interface Window {
    ym: (
      counterId: number,
      method: 'init' | 'reachGoal' | string,
      ...args: (Record<string, unknown> | string | number | boolean)[]
    ) => void
  }
}

export {}
