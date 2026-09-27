import { useMemo, useState } from 'react'
import { formatPrice, watchlist } from '../data/stocks'
import { detectAccumulation, generateCandles } from '../lib/market'

export function ScannerSection() {
  const [minScore, setMinScore] = useState(60)

  const rows = useMemo(() => {
    return watchlist
      .map((s) => {
        const candles = generateCandles(s.ticker, s.basePrice, 100)
        const signals = detectAccumulation(candles)
        const best = signals[0]
        const recent = signals.filter((x) => x.index >= candles.length - 10)
        return {
          stock: s,
          best,
          recentCount: recent.length,
          lastClose: candles[candles.length - 1]?.close ?? s.basePrice,
        }
      })
      .filter((r) => (r.best?.score ?? 0) >= minScore)
      .sort((a, b) => (b.best?.score ?? 0) - (a.best?.score ?? 0))
  }, [minScore])

  return (
    <section id="scanner">
      <div className="section-head">
        <div className="eyebrow">매집봉 스캐너</div>
        <h2>거래량·아랫꼬리·종가 회복으로 매집 후보 찾기</h2>
        <p>
          20일 평균 거래량 배수, 긴 아랫꼬리, 종가 위치, 20일선 지지를 점수화합니다.
          점수가 높을수록 “매집 의심 봉”에 가깝습니다.
        </p>
      </div>

      <div className="panel">
        <div className="filters" style={{ alignItems: 'center' }}>
          <span className="chip">최소 점수 {minScore}</span>
          <input
            type="range"
            min={50}
            max={90}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ width: 220 }}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem' }}>
            <thead>
              <tr style={{ color: 'var(--dim)', textAlign: 'left' }}>
                <th style={{ padding: '0.55rem' }}>종목</th>
                <th style={{ padding: '0.55rem' }}>시장</th>
                <th style={{ padding: '0.55rem' }}>최고 점수</th>
                <th style={{ padding: '0.55rem' }}>일자</th>
                <th style={{ padding: '0.55rem' }}>최근 10일 신호</th>
                <th style={{ padding: '0.55rem' }}>근거</th>
                <th style={{ padding: '0.55rem' }}>참고가</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.stock.ticker} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '0.7rem 0.55rem' }}>
                    <strong>{r.stock.name}</strong>
                    <div className="ticker" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--dim)' }}>
                      {r.stock.ticker}
                    </div>
                  </td>
                  <td style={{ padding: '0.7rem 0.55rem' }}>{r.stock.market}</td>
                  <td style={{ padding: '0.7rem 0.55rem' }}>
                    <span className="chip signal">{r.best?.score ?? 0}</span>
                  </td>
                  <td style={{ padding: '0.7rem 0.55rem', fontFamily: 'var(--font-mono)' }}>
                    {r.best?.date ?? '—'}
                  </td>
                  <td style={{ padding: '0.7rem 0.55rem' }}>{r.recentCount}회</td>
                  <td style={{ padding: '0.7rem 0.55rem', color: 'var(--muted)', maxWidth: 320 }}>
                    {r.best?.reasons.slice(0, 2).join(' · ') ?? '—'}
                  </td>
                  <td style={{ padding: '0.7rem 0.55rem', fontFamily: 'var(--font-mono)' }}>
                    {formatPrice(r.lastClose, r.stock.currency)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '1rem', color: 'var(--muted)' }}>
                    조건에 맞는 매집봉이 없습니다. 최소 점수를 낮춰 보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
