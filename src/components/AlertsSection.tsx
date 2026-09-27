import { useEffect, useMemo, useState } from 'react'
import { watchlist, type StockProfile } from '../data/stocks'
import {
  analyzeTiming,
  detectAccumulation,
  generateCandles,
} from '../lib/market'
import {
  alertKindLabel,
  createAlert,
  ensureNotificationPermission,
  loadAlerts,
  notify,
  saveAlerts,
  type AlertKind,
  type PriceAlert,
} from '../lib/alerts'

type Toast = { id: string; title: string; body: string }

type Props = {
  draft?: { stock: StockProfile; price: number; token: number } | null
}

export function AlertsSection({ draft }: Props) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(() => loadAlerts())
  const initialTicker = draft?.stock.ticker ?? watchlist[0].ticker
  const [ticker, setTicker] = useState(initialTicker)
  const [kind, setKind] = useState<AlertKind>('price_below')
  const [threshold, setThreshold] = useState(
    String(draft ? Math.round(draft.price * 100) / 100 : watchlist[0].basePrice),
  )
  const [appliedToken, setAppliedToken] = useState(0)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [perm, setPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )

  if (draft && draft.token !== appliedToken) {
    setAppliedToken(draft.token)
    setTicker(draft.stock.ticker)
    setThreshold(String(Math.round(draft.price * 100) / 100))
    setKind('price_below')
    queueMicrotask(() => {
      document.getElementById('alerts')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  useEffect(() => {
    saveAlerts(alerts)
  }, [alerts])

  const selected = useMemo(
    () => watchlist.find((s) => s.ticker === ticker) ?? watchlist[0],
    [ticker],
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setAlerts((prev) => {
        let changed = false
        const next = prev.map((a) => {
          if (!a.active || a.triggeredAt) return a
          const stock = watchlist.find((s) => s.ticker === a.ticker)
          if (!stock) return a
          const candles = generateCandles(stock.ticker, stock.basePrice, 100)
          const timing = analyzeTiming(candles)
          const acc = detectAccumulation(candles)
          const latestAcc = acc.find((s) => s.index >= candles.length - 3)

          let hit = false
          let body = ''
          if (a.kind === 'price_above' && timing.lastClose >= a.threshold) {
            hit = true
            body = `${stock.name} 종가 ${timing.lastClose.toFixed(2)} ≥ 목표가 ${a.threshold}`
          } else if (a.kind === 'price_below' && timing.lastClose <= a.threshold) {
            hit = true
            body = `${stock.name} 종가 ${timing.lastClose.toFixed(2)} ≤ 지지가 ${a.threshold}`
          } else if (
            a.kind === 'accumulation' &&
            latestAcc &&
            latestAcc.score >= a.threshold
          ) {
            hit = true
            body = `${stock.name} 매집봉 점수 ${latestAcc.score} (기준 ${a.threshold})`
          } else if (
            a.kind === 'rsi_oversold' &&
            timing.rsi != null &&
            timing.rsi <= a.threshold
          ) {
            hit = true
            body = `${stock.name} RSI ${timing.rsi.toFixed(1)} ≤ ${a.threshold}`
          } else if (
            a.kind === 'rsi_overbought' &&
            timing.rsi != null &&
            timing.rsi >= a.threshold
          ) {
            hit = true
            body = `${stock.name} RSI ${timing.rsi.toFixed(1)} ≥ ${a.threshold}`
          }

          if (!hit) return a
          changed = true
          const title = `개미레이더 알림 · ${alertKindLabel[a.kind]}`
          notify(title, body)
          const toastId = crypto.randomUUID()
          setToasts((t) => [...t, { id: toastId, title, body }])
          window.setTimeout(() => {
            setToasts((t) => t.filter((x) => x.id !== toastId))
          }, 6000)
          return { ...a, triggeredAt: new Date().toISOString(), active: false }
        })
        return changed ? next : prev
      })
    }, 4000)
    return () => window.clearInterval(timer)
  }, [])

  async function enableNotifications() {
    const ok = await ensureNotificationPermission()
    setPerm(typeof Notification !== 'undefined' ? Notification.permission : 'denied')
    if (ok) {
      notify('개미레이더', '브라우저 알림이 켜졌습니다. 조건을 충족하면 알려드릴게요.')
    }
  }

  function addAlert() {
    const value = Number(threshold)
    if (!Number.isFinite(value) || value <= 0) return
    const alert = createAlert({
      ticker: selected.ticker,
      name: selected.name,
      kind,
      threshold: value,
      note: alertKindLabel[kind],
    })
    setAlerts((prev) => [alert, ...prev])
  }

  return (
    <section id="alerts">
      <div className="section-head">
        <div className="eyebrow">타이밍 알림</div>
        <h2>매수·매도 타이밍을 놓치지 않게</h2>
        <p>
          목표가·지지가·매집봉 점수·RSI 조건을 저장해 두면, 페이지를 연 동안
          주기적으로 점검하고 브라우저 알림으로 알려줍니다.
        </p>
      </div>

      <div className="panel">
        <div className="cta-row" style={{ marginBottom: '1rem' }}>
          <button type="button" className="btn btn-primary" onClick={enableNotifications}>
            브라우저 알림 {perm === 'granted' ? '켜짐' : '허용하기'}
          </button>
          <span className="chip">현재 권한: {perm}</span>
        </div>

        <div className="alert-form">
          <div className="field">
            <label>종목</label>
            <select
              value={ticker}
              onChange={(e) => {
                const next = e.target.value
                setTicker(next)
                const s = watchlist.find((x) => x.ticker === next)
                if (s) setThreshold(String(s.basePrice))
              }}
            >
              {watchlist.map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.market} · {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>조건</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as AlertKind)}>
              {(Object.keys(alertKindLabel) as AlertKind[]).map((k) => (
                <option key={k} value={k}>
                  {alertKindLabel[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>
              {kind.startsWith('rsi')
                ? 'RSI 기준'
                : kind === 'accumulation'
                  ? '매집봉 점수'
                  : '가격'}
            </label>
            <input
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              inputMode="decimal"
            />
          </div>
          <div className="field">
            <label>미리보기</label>
            <input value={selected.name} readOnly />
          </div>
          <button type="button" className="btn btn-primary" onClick={addAlert}>
            알림 추가
          </button>
        </div>

        <div className="alert-list">
          {alerts.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>
              아직 알림이 없습니다. 종목 분석에서 「이 종목 알림 만들기」를 눌러도
              됩니다.
            </p>
          )}
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`alert-row ${a.triggeredAt ? 'triggered' : ''}`}
            >
              <div>
                <strong>
                  {a.name} · {alertKindLabel[a.kind]}
                </strong>
                <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>
                  기준 {a.threshold}
                  {a.triggeredAt
                    ? ` · 발동 ${new Date(a.triggeredAt).toLocaleString('ko-KR')}`
                    : ' · 대기 중'}
                </div>
              </div>
              <span className={`chip ${a.triggeredAt ? 'signal' : 'brand'}`}>
                {a.triggeredAt ? '발동됨' : '감시 중'}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setAlerts((prev) => prev.filter((x) => x.id !== a.id))}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <strong>{t.title}</strong>
            <span>{t.body}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
