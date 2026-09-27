import type { AccumulationSignal, TimingReport } from './market'

export type AlertKind =
  | 'price_above'
  | 'price_below'
  | 'accumulation'
  | 'rsi_oversold'
  | 'rsi_overbought'

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

/** 알림 조건 충족 시 본문 문자열, 아니면 null */
export function evaluateAlert(
  alert: PriceAlert,
  timing: TimingReport,
  acc: AccumulationSignal[],
  candleCount: number,
): string | null {
  if (alert.kind === 'price_above' && timing.lastClose >= alert.threshold) {
    return `${alert.name} 종가 ${timing.lastClose.toFixed(2)} ≥ 목표가 ${alert.threshold}`
  }
  if (alert.kind === 'price_below' && timing.lastClose <= alert.threshold) {
    return `${alert.name} 종가 ${timing.lastClose.toFixed(2)} ≤ 지지가 ${alert.threshold}`
  }
  if (alert.kind === 'accumulation') {
    const near = acc.find(
      (s) => s.index >= candleCount - 3 && s.score >= alert.threshold,
    )
    if (near) {
      return `${alert.name} 매집봉 점수 ${near.score} (기준 ${alert.threshold}) · ${near.date}`
    }
  }
  if (
    alert.kind === 'rsi_oversold' &&
    timing.rsi != null &&
    timing.rsi <= alert.threshold
  ) {
    return `${alert.name} RSI ${timing.rsi.toFixed(1)} ≤ ${alert.threshold}`
  }
  if (
    alert.kind === 'rsi_overbought' &&
    timing.rsi != null &&
    timing.rsi >= alert.threshold
  ) {
    return `${alert.name} RSI ${timing.rsi.toFixed(1)} ≥ ${alert.threshold}`
  }
  return null
}
