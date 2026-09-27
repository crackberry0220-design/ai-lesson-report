export type AlertKind = 'price_above' | 'price_below' | 'accumulation' | 'rsi_oversold' | 'rsi_overbought'

export type PriceAlert = {
  id: string
  ticker: string
  name: string
  kind: AlertKind
  threshold: number
  createdAt: string
  triggeredAt?: string
  active: boolean
  note?: string
}

const STORAGE_KEY = 'gaemi-radar-alerts-v1'

export function loadAlerts(): PriceAlert[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as PriceAlert[]
  } catch {
    return []
  }
}

export function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts))
}

export function createAlert(
  partial: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>,
): PriceAlert {
  return {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    active: true,
  }
}

export const alertKindLabel: Record<AlertKind, string> = {
  price_above: '목표가 돌파 (매도·익절 관심)',
  price_below: '지지가 이탈 (손절·비중축소)',
  accumulation: '매집봉 점수 이상',
  rsi_oversold: 'RSI 과매도',
  rsi_overbought: 'RSI 과매수',
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notify(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, icon: '/favicon.svg' })
  } catch {
    // ignore
  }
}
