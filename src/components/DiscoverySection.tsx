import { useMemo, useState } from 'react'
import { formatPrice, watchlist, type StockProfile } from '../data/stocks'
import {
  analyzeTiming,
  detectAccumulation,
  generateCandles,
} from '../lib/market'
import { CandleChart } from './CandleChart'

type Props = {
  onPickForAlert?: (stock: StockProfile, price: number) => void
}

export function DiscoverySection({ onPickForAlert }: Props) {
  const [market, setMarket] = useState<'ALL' | 'KR' | 'US'>('ALL')
  const [selectedTicker, setSelectedTicker] = useState(watchlist[0].ticker)

  const filtered = useMemo(
    () =>
      watchlist.filter((s) => (market === 'ALL' ? true : s.market === market)),
    [market],
  )

  const stock =
    filtered.find((s) => s.ticker === selectedTicker) ?? filtered[0] ?? watchlist[0]

  const candles = useMemo(
    () => generateCandles(stock.ticker, stock.basePrice, 100),
    [stock.ticker, stock.basePrice],
  )
  const signals = useMemo(() => detectAccumulation(candles), [candles])
  const timing = useMemo(() => analyzeTiming(candles), [candles])

  const biasClass =
    timing.bias === '매수 관심' ? 'buy' : timing.bias === '관망' ? 'hold' : 'sell'

  return (
    <section id="discover">
      <div className="section-head">
        <div className="eyebrow">종목 발굴 · 분석</div>
        <h2>우량주 · 성장 후보를 이유와 함께</h2>
        <p>
          국내·해외 대표 종목의 투자 논리, 성장 동력, 리스크와 함께 매집봉·타이밍
          지표를 보여줍니다. (차트는 교육용 시드 시세입니다)
        </p>
      </div>

      <div className="filters">
        {(
          [
            ['ALL', '전체'],
            ['KR', '국내'],
            ['US', '해외'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={market === key ? 'active' : ''}
            onClick={() => {
              setMarket(key)
              const next = watchlist.find((s) =>
                key === 'ALL' ? true : s.market === key,
              )
              if (next) setSelectedTicker(next.ticker)
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="stock-layout">
        <div className="stock-list panel">
          {filtered.map((s) => {
            const c = generateCandles(s.ticker, s.basePrice, 100)
            const t = analyzeTiming(c)
            return (
              <button
                key={s.ticker}
                type="button"
                className={`stock-item ${stock.ticker === s.ticker ? 'active' : ''}`}
                onClick={() => setSelectedTicker(s.ticker)}
              >
                <div className="row">
                  <strong>{s.name}</strong>
                  <span className={`price ${t.changePct >= 0 ? 'up' : 'down'}`}>
                    {t.changePct >= 0 ? '+' : ''}
                    {t.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="row" style={{ marginTop: 2 }}>
                  <span className="ticker">
                    {s.market} · {s.ticker}
                  </span>
                  <span className="price">{formatPrice(t.lastClose, s.currency)}</span>
                </div>
                <div className="score-bar">
                  <span>품질</span>
                  <div className="track">
                    <div className="fill" style={{ width: `${s.qualityScore}%` }} />
                  </div>
                  <span>{s.qualityScore}</span>
                </div>
                <div className="score-bar">
                  <span>성장</span>
                  <div className="track">
                    <div
                      className="fill"
                      style={{
                        width: `${s.growthScore}%`,
                        background: 'linear-gradient(90deg,#9a6b12,#f0b429)',
                      }}
                    />
                  </div>
                  <span>{s.growthScore}</span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="detail-grid">
          <div className="panel">
            <div className="row" style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div className="tech-meta">
                  <span className="chip brand">{stock.market === 'KR' ? '국내' : '해외'}</span>
                  <span className="chip">{stock.sector}</span>
                  {stock.tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.6rem',
                    letterSpacing: '-0.03em',
                    margin: '0.35rem 0 0.25rem',
                  }}
                >
                  {stock.name}
                </h3>
                <p style={{ color: 'var(--muted)' }}>{stock.thesis}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`bias ${biasClass}`}>{timing.bias}</div>
                <div style={{ marginTop: 8 }} className="price">
                  {formatPrice(timing.lastClose, stock.currency)}
                </div>
                <div style={{ color: 'var(--dim)', fontSize: '0.85rem' }}>
                  신뢰도 {timing.confidence}%
                </div>
              </div>
            </div>

            <div className="metrics" style={{ marginTop: '1rem' }}>
              <div className="metric">
                <label>RSI(14)</label>
                <strong>{timing.rsi?.toFixed(1) ?? '—'}</strong>
              </div>
              <div className="metric">
                <label>MA20</label>
                <strong>
                  {timing.ma20
                    ? formatPrice(timing.ma20, stock.currency)
                    : '—'}
                </strong>
              </div>
              <div className="metric">
                <label>MA60</label>
                <strong>
                  {timing.ma60
                    ? formatPrice(timing.ma60, stock.currency)
                    : '—'}
                </strong>
              </div>
              <div className="metric">
                <label>매집봉(최근)</label>
                <strong>
                  {timing.latestAccumulation
                    ? `${timing.latestAccumulation.score}점`
                    : '없음'}
                </strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <strong style={{ fontFamily: 'var(--font-display)' }}>가격 · 매집봉 차트</strong>
              <span className="chip signal">노란 점 = 매집봉 후보</span>
            </div>
            <CandleChart
              candles={candles}
              signals={signals.slice(0, 8)}
              currency={stock.currency}
            />
          </div>

          <div className="two-col">
            <div className="panel">
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                성장 동력
              </h4>
              <ul className="reason-list">
                {stock.growthDrivers.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
              <h4 style={{ fontFamily: 'var(--font-display)', margin: '1rem 0 8px' }}>
                주요 리스크
              </h4>
              <ul className="reason-list">
                {stock.risks.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="panel">
              <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>
                타이밍 코멘트
              </h4>
              <p style={{ color: 'var(--muted)', marginBottom: 10 }}>{timing.summary}</p>
              <ul className="reason-list">
                {timing.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {signals[0] && (
                <>
                  <h4 style={{ fontFamily: 'var(--font-display)', margin: '1rem 0 8px' }}>
                    최고 매집봉 점수 · {signals[0].date}
                  </h4>
                  <ul className="reason-list">
                    {signals[0].reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </>
              )}
              <div className="cta-row" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onPickForAlert?.(stock, timing.lastClose)}
                >
                  이 종목 알림 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
